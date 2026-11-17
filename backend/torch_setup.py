"""
Installs the right PyTorch build into the BeatAnalyzer environment (venv). Run by install_and_run.bat with the
Python of the venv: python backend/torch_setup.py

On Windows, `pip install torch` from PyPI gives the CPU build only; the CUDA builds come from download.pytorch.org.
This script:
- reads the CUDA version the NVIDIA driver supports from `nvidia-smi` ("CUDA Version: 12.8" or, in newer
  drivers, "CUDA UMD Version: 13.5"),
- picks the build: cu128 when the driver supports CUDA 12.8 or newer (needed by RTX 50 cards), cu126 for 12.6,
  otherwise cpu. BEATANALYZER_TORCH=cpu|cu126|cu128 overrides the choice,
- leaves a working CUDA build alone, replaces a CPU build when a CUDA build is wanted, and falls back to the CPU
  build when the CUDA install fails.

Only the venv of BeatAnalyzer is changed; other Python environments (e.g. Whisper) and the NVIDIA driver are not
touched. The PyTorch packages bring their own CUDA runtime; only the driver must be new enough.
Tested: torch 2.8.0+cu128 / torchaudio 2.8.0+cu128, RTX 5080, driver 621.24 (see docs/tested-environment.md).
"""

import os
import re
import subprocess
import sys

TORCH_VERSION = "2.8.0"   # tested combination; torch and torchaudio must have the same version
INDEX = "https://download.pytorch.org/whl/{build}"
BUILDS = {"cu128": (12, 8), "cu126": (12, 6)}   # newest first
CHOICES = ("cpu",) + tuple(BUILDS)


def parse_cuda_version(text):
    """CUDA version the driver supports, from the output of nvidia-smi; None when not found."""
    m = re.search(r"CUDA(?:\s+UMD)?\s+Version:\s*(\d+)\.(\d+)", text or "")
    return (int(m.group(1)), int(m.group(2))) if m else None


def driver_cuda_version():
    try:
        out = subprocess.run(["nvidia-smi"], capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.SubprocessError):
        return None   # no NVIDIA driver (or no NVIDIA card)
    return parse_cuda_version(out.stdout) if out.returncode == 0 else None


def choose_build(requested, cuda):
    """(build, reason) for the setting BEATANALYZER_TORCH and the CUDA version of the driver."""
    requested = (requested or "auto").strip().lower()
    if requested in CHOICES:
        return requested, f"set by BEATANALYZER_TORCH={requested}"
    if cuda is None:
        return "cpu", "no NVIDIA graphics card or driver found"
    for build, need in BUILDS.items():
        if cuda >= need:
            return build, f"NVIDIA driver supports CUDA {cuda[0]}.{cuda[1]}"
    return "cpu", f"the NVIDIA driver supports only CUDA {cuda[0]}.{cuda[1]} - update the driver for GPU speed"


def installed_build(python=sys.executable):
    """'cpu', 'cuXYZ' or None (no torch). Asked in a separate process: an imported torch would lock its files."""
    code = "import torch; v = torch.version.cuda; print('cu' + v.replace('.', '') if v else 'cpu')"
    try:
        out = subprocess.run([python, "-c", code], capture_output=True, text=True, timeout=120)
    except (OSError, subprocess.SubprocessError):
        return None
    return out.stdout.strip().splitlines()[-1] if out.returncode == 0 and out.stdout.strip() else None


def plan(build, current):
    """What to do: 'keep', 'install' or 'replace' (uninstall the CPU build first)."""
    if current is None:
        return "install"
    if current == "cpu" and build != "cpu":
        return "replace"
    return "keep"   # a CUDA build that works is never replaced; a wanted CPU build is never forced either


def _run(cmd, log):
    """Runs pip; its output goes to the log file (install_log.txt) when one is given."""
    if not log:
        return subprocess.run(cmd).returncode
    with open(log, "a", encoding="utf-8", errors="replace") as f:
        f.write("\n> " + " ".join(cmd) + "\n")
        f.flush()
        return subprocess.run(cmd, stdout=f, stderr=subprocess.STDOUT).returncode


def pip_install(build, log=None, run=None, python=sys.executable):
    """The tested version first; if the index has no such build (e.g. a newer Python), the newest one there."""
    run = run or _run   # looked up at call time (tests replace _run)
    index = ["--index-url", INDEX.format(build=build)]
    pinned = [python, "-m", "pip", "install", f"torch=={TORCH_VERSION}", f"torchaudio=={TORCH_VERSION}"] + index
    if run(pinned, log) == 0:
        return True
    return run([python, "-m", "pip", "install", "torch", "torchaudio"] + index, log) == 0


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    log = argv[argv.index("--log") + 1] if "--log" in argv and argv.index("--log") + 1 < len(argv) else None
    build, reason = choose_build(os.environ.get("BEATANALYZER_TORCH"), driver_cuda_version())
    current = installed_build()
    step = plan(build, current)
    print(f"  PyTorch: wanted {build} ({reason}), installed: {current or 'none'}")
    if step == "keep":
        print(f"  [OK] PyTorch {current} build kept.")
        return 0
    if step == "replace":
        print("  Replacing the CPU build of PyTorch with the CUDA build ...")
        _run([sys.executable, "-m", "pip", "uninstall", "-y", "torch", "torchaudio"], log)
    print(f"  Installing PyTorch {TORCH_VERSION} ({build}) ...")
    if pip_install(build, log):
        print(f"  [OK] PyTorch {TORCH_VERSION} ({build}) installed.")
        return 0
    if build != "cpu":
        print(f"  [WARNING] The {build} build could not be installed, installing the CPU build "
              "(analysis works, only slower).")
        if pip_install("cpu", log):
            return 0
    print("  [ERROR] PyTorch could not be installed, see install_log.txt.")
    return 1


if __name__ == "__main__":
    sys.exit(main())

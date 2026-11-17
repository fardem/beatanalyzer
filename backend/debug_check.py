"""
Diagnostic script of BeatAnalyzer (debug_system.bat)
Checks all Python modules and prints system information.
"""

import sys

print("--- System ---")
print(f"Python version:   {sys.version}")
print(f"Python path:      {sys.executable}")
print(f"Operating system: {sys.platform}")

modules_to_test = [
    ("Python HTTP server", "http.server"),
    ("NumPy", "numpy"),
    ("SciPy", "scipy"),
    ("SoundFile", "soundfile"),
    ("PyAV", "av"),
    ("librosa", "librosa"),
    ("PyTorch", "torch"),
    ("torchaudio", "torchaudio"),
    ("CPJKU beat_this", "beat_this"),
    ("md_beat_this (non-commercial)", "md_beat_this"),
]

print("\n--- Modules ---")
for name, mod in modules_to_test:
    try:
        m = __import__(mod)
        ver = getattr(m, "__version__", "OK")
        print(f"  [OK]      {name:30} (version {ver})")
    except Exception as e:
        print(f"  [MISSING] {name:30} ({e})")

try:
    import torch
    print("\n--- PyTorch hardware ---")
    build = f"CUDA {torch.version.cuda} build" if torch.version.cuda else "CPU build (no GPU acceleration)"
    print(f"PyTorch:          {torch.__version__} - {build}")
    print(f"CUDA available:   {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU name:         {torch.cuda.get_device_name(0)}")
    elif not torch.version.cuda:
        print("For GPU speed on an NVIDIA card run install_and_run.bat again: it installs the CUDA build.")
except Exception:
    pass

print("\nDiagnosis finished.")

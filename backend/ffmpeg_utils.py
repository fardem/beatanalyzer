"""
FFmpeg detection and an optional user-defined FFmpeg folder (settings.json).
If `ffmpeg` cannot be run from the system PATH, a folder can be given; it is put in front of the
system PATH, so calls of `ffmpeg` run the binary there.
"""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

_ORIGINAL_PATH = os.environ.get("PATH", "")


def _is_windows() -> bool:
    return os.name == "nt"


def _candidate_names() -> Tuple[str, ...]:
    return ("ffmpeg.exe", "ffmpeg") if _is_windows() else ("ffmpeg", "ffmpeg.exe")


def _clean_dir_input(raw: Any) -> str:
    if raw is None:
        return ""
    text = str(raw).strip()
    if len(text) >= 2 and ((text[0] == '"' and text[-1] == '"') or (text[0] == "'" and text[-1] == "'")):
        text = text[1:-1].strip()
    return text


def _is_executable_file(path: Path) -> bool:
    if not path.is_file():
        return False
    if _is_windows():
        return True
    return os.access(path, os.X_OK)


def find_ffmpeg_in_dir(raw_dir: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Looks for a runnable `ffmpeg` in the given folder (or its `bin` subfolder).
    Also accepts the direct path to `ffmpeg` / `ffmpeg.exe`.
    Returns `(exe_path, bin_dir)` or `(None, None)`.
    """
    cleaned = _clean_dir_input(raw_dir)
    if not cleaned:
        return None, None
    target = Path(os.path.expanduser(cleaned))
    if not target.exists():
        return None, None

    if target.is_file():
        if target.name.lower() in ("ffmpeg", "ffmpeg.exe") and _is_executable_file(target):
            return str(target), str(target.parent)
        return None, None

    if not target.is_dir():
        return None, None

    for base in (target, target / "bin"):
        if not base.is_dir():
            continue
        for name in _candidate_names():
            candidate = base / name
            if _is_executable_file(candidate):
                return str(candidate), str(base)
    return None, None


def verify_ffmpeg_executable(exe_path: str) -> Tuple[bool, str]:
    """Checks whether the ffmpeg file found can really be run (`ffmpeg -version`)."""
    try:
        proc = subprocess.run(
            [exe_path, "-version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
    except OSError as err:
        return False, f"ffmpeg cannot be run ({err})."
    except subprocess.TimeoutExpired:
        return False, "ffmpeg did not answer in time during the check."

    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "").strip().splitlines()
        msg = detail[-1] if detail else f"Exit-Code {proc.returncode}"
        return False, f"ffmpeg could not be run: {msg}"
    return True, ""


def apply_ffmpeg_dir(custom_dir: Optional[str]) -> Dict[str, Any]:
    """
    Updates `PATH` of the running process from `custom_dir` and
    returns the current FFmpeg status.
    """
    cleaned = _clean_dir_input(custom_dir)
    if cleaned:
        exe_path, bin_dir = find_ffmpeg_in_dir(cleaned)
        if exe_path and bin_dir:
            os.environ["PATH"] = f"{bin_dir}{os.pathsep}{_ORIGINAL_PATH}" if _ORIGINAL_PATH else bin_dir
            return {
                "available": True,
                "path": exe_path,
                "dir": bin_dir,
                "configuredDir": cleaned,
                "source": "custom",
            }
        os.environ["PATH"] = _ORIGINAL_PATH
    else:
        os.environ["PATH"] = _ORIGINAL_PATH

    system_exe = shutil.which("ffmpeg", path=_ORIGINAL_PATH)
    if system_exe:
        return {
            "available": True,
            "path": system_exe,
            "dir": str(Path(system_exe).parent),
            "configuredDir": cleaned,
            "source": "system",
        }
    return {
        "available": False,
        "path": None,
        "dir": None,
        "configuredDir": cleaned,
        "source": None,
    }


def validate_and_resolve_ffmpeg_dir(raw_dir: Any) -> Tuple[str, Dict[str, Any]]:
    """
    Validates a user input for `ffmpegDir`.
    An empty string resets to the system PATH.
    Raises `ValueError` when a path was given but there is no runnable `ffmpeg` in it.
    """
    cleaned = _clean_dir_input(raw_dir)
    if not cleaned:
        status = apply_ffmpeg_dir("")
        return "", status

    exe_path, bin_dir = find_ffmpeg_in_dir(cleaned)
    if not exe_path or not bin_dir:
        raise ValueError(
            f"No runnable ffmpeg found in the folder '{cleaned}' (neither directly nor in the subfolder 'bin')."
        )

    ok, err = verify_ffmpeg_executable(exe_path)
    if not ok:
        raise ValueError(f"The ffmpeg found ({exe_path}) cannot be run: {err}")

    status = apply_ffmpeg_dir(bin_dir)
    return bin_dir, status

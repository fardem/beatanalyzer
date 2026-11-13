"""
Analysis job started from the Resolve script (BeatAnalyzer_Markers.lua), without a server.

The script writes <job dir>/job.txt and starts:  pythonw.exe backend/resolve_job.py <job dir>
This program writes progress.txt at every step, markers.json (format of the marker JSON of the web app) and last
done.txt (state=ok|error|cancelled), done.txt via a temporary file and a rename so the script never reads half of it.
cancel.txt (written by the script) is checked between the steps.
"""

import os
import sys
import traceback
from typing import Callable, Dict, Optional

JOB_FORMAT = "beatanalyzer-resolve-job/1"
DEFAULT_PROTECT = 0.95   # "Glätten" 90 %


def _read_kv(path: str) -> Dict[str, str]:
    out: Dict[str, str] = {}
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            if "=" in line:
                key, value = line.split("=", 1)
                out[key.strip()] = value.strip()
    return out


def _write_atomic(path: str, text: str) -> None:
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    os.replace(tmp, path)


def _progress(job_dir: str, step: str) -> None:
    _write_atomic(os.path.join(job_dir, "progress.txt"), f"step={step}\n")


def _done(job_dir: str, state: str, message: str = "", markers: str = "") -> str:
    lines = [f"state={state}"]
    if markers:
        lines.append(f"markers={markers}")
    if message:
        lines.append("message=" + " ".join(str(message).split()))   # one line
    _write_atomic(os.path.join(job_dir, "done.txt"), "\n".join(lines) + "\n")
    return state


def _cancelled(job_dir: str) -> bool:
    return os.path.exists(os.path.join(job_dir, "cancel.txt"))


def run_job(job_dir: str, analyze: Optional[Callable] = None) -> str:
    """Run the job in job_dir; returns the state written to done.txt."""
    try:
        job = _read_kv(os.path.join(job_dir, "job.txt"))
        if job.get("format") != JOB_FORMAT or not job.get("audio"):
            return _done(job_dir, "error", "job.txt: format or audio missing")
        audio = job["audio"]
        if not os.path.isfile(audio):
            return _done(job_dir, "error", f"file not found: {audio}")
        smooth = job.get("smooth", "1") != "0"
        try:
            protect = float(job.get("protect", DEFAULT_PROTECT))
        except ValueError:
            protect = DEFAULT_PROTECT
        if _cancelled(job_dir):
            return _done(job_dir, "cancelled")

        _progress(job_dir, "model")
        from analyzer import analyze_audio_file, clamp_protect, resolve_marker_data
        analyze = analyze or analyze_audio_file
        if _cancelled(job_dir):
            return _done(job_dir, "cancelled")

        _progress(job_dir, "analyze")
        result = analyze(audio, os.path.basename(audio), smooth=smooth, protect=clamp_protect(protect))
        if _cancelled(job_dir):
            return _done(job_dir, "cancelled")

        _progress(job_dir, "write")
        import json
        _write_atomic(os.path.join(job_dir, "markers.json"),
                      json.dumps(resolve_marker_data(result), ensure_ascii=False, indent=1))
        return _done(job_dir, "ok", markers="markers.json")
    except Exception as e:   # every failure ends in done.txt, the script waits for it
        traceback.print_exc()
        return _done(job_dir, "error", str(e) or type(e).__name__)


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    if len(sys.argv) != 2:
        print("usage: resolve_job.py <job dir>")
        sys.exit(2)
    sys.exit(0 if run_job(sys.argv[1]) == "ok" else 1)

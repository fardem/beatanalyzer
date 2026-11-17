"""
CPJKU beat_this Python Integration Engine
Beat and downbeat tracking with PyTorch / beat_this, md_beat_this or the librosa fallback.
"""

import math
import hashlib
import os
import shutil
import tempfile
import numpy as np
import soundfile as sf
import librosa
from typing import Any, Dict, List, Optional, Tuple
import ffmpeg_utils
import mp3_offset
import settings

BEAT_THIS_AVAILABLE = False
MD_BEAT_THIS_AVAILABLE = False
predictor_instance = None
md_predictor_instance = None
MODEL_LOAD_FAILED = False        # the last attempt to load the beat_this model failed
MD_MODEL_LOAD_FAILED = False     # the last attempt to load the md_beat_this model failed
PREDICTOR_DEVICE = None          # "cuda" or "cpu" of the loaded beat_this model
MD_PREDICTOR_DEVICE = None       # "cuda" or "cpu" of the loaded md_beat_this model

ALLOWED_MODELS = ("beat_this", "md_beat_this")
ENGINE_LABELS = {
    "beat_this": "CPJKU beat_this Transformer",
    "md_beat_this": "Masked Diffusion md_beat_this (Non-Commercial)",
    "librosa": "Librosa MIR (Fallback)",
}

try:
    # official CPJKU beat_this
    # Audio2Beats instead of File2Beats: we pass the signal we have already decoded.
    # File2Beats loads with torchaudio.load, which needs TorchCodec + FFmpeg from torchaudio 2.9 on
    # (usually missing on Windows -> MP3/AAC fail).
    from beat_this.inference import Audio2Beats
    BEAT_THIS_AVAILABLE = True
    print("[BeatAnalyzer Backend] CPJKU beat_this loaded.")
except Exception as e:
    print(f"[BeatAnalyzer Backend] Note: CPJKU beat_this not available ({e}). Using the librosa fallback.")

try:
    # optional model (CC BY-NC 4.0, non-commercial use only): fosfrancesco/md_beat_this
    from md_beat_this.inference import Audio2Beats as MdAudio2Beats
    MD_BEAT_THIS_AVAILABLE = True
    print("[BeatAnalyzer Backend] Masked Diffusion md_beat_this (non-commercial) loaded.")
except Exception as e:
    print(f"[BeatAnalyzer Backend] Note: md_beat_this not installed ({e}).")


def normalize_model(value: Any) -> str:
    """Analysis model from query/CLI: 'beat_this' (default) or 'md_beat_this' (non-commercial)."""
    return "md_beat_this" if value == "md_beat_this" else "beat_this"


def get_predictor():
    global predictor_instance, MODEL_LOAD_FAILED, PREDICTOR_DEVICE
    if not BEAT_THIS_AVAILABLE:
        return None
    if predictor_instance is None:
        try:
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"[BeatAnalyzer Backend] Initialising CPJKU Audio2Beats on device: {device} ...")
            # 'final0' is the official standard checkpoint of CPJKU
            predictor_instance = Audio2Beats(checkpoint_path="final0", device=device)
            MODEL_LOAD_FAILED, PREDICTOR_DEVICE = False, device
            print("[BeatAnalyzer Backend] Model ready.")
        except Exception as err:
            try:   # beat_this hides the real reason of a failed download; never let this stop the fallback
                from model_check import cause_of
                cause = cause_of(err)
            except Exception:
                cause = "?"
            print(f"[BeatAnalyzer Backend] Error loading the model: {err} - cause: {cause}")
            predictor_instance = None
            MODEL_LOAD_FAILED = True
    return predictor_instance


MD_BEAT_THIS_ATTRIBUTION = (
    "Masked Diffusion (md_beat_this) by Francesco Foscarin, Filip Korzeniowski, Richard Vogl "
    "(https://github.com/fosfrancesco/md_beat_this) — Licensed under CC BY-NC 4.0 (Non-Commercial Use Only)."
)


def ffmpeg_available() -> bool:
    return bool(ffmpeg_utils.apply_ffmpeg_dir(settings.load().get("ffmpegDir"))["available"])


def get_md_predictor():
    global md_predictor_instance, MD_MODEL_LOAD_FAILED, MD_PREDICTOR_DEVICE
    if not MD_BEAT_THIS_AVAILABLE:
        return None
    if md_predictor_instance is None:
        try:
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"[BeatAnalyzer Backend] Initialising md_beat_this Audio2Beats (non-commercial) on device: {device} ...")
            md_predictor_instance = MdAudio2Beats(checkpoint_path="run1", device=device)
            MD_MODEL_LOAD_FAILED, MD_PREDICTOR_DEVICE = False, device
            print("[BeatAnalyzer Backend] md_beat_this model ready.")
        except Exception as err:
            print(f"[BeatAnalyzer Backend] Error loading md_beat_this: {err}")
            md_predictor_instance = None
            MD_MODEL_LOAD_FAILED = True
    return md_predictor_instance


def _gpu_name() -> Optional[str]:
    """Name of the graphics card, only once CUDA runs: get_device_name() would start CUDA, which can take
    longer than the web app waits for /api/health."""
    try:
        import torch
        if not torch.cuda.is_initialized():
            return None
        return str(torch.cuda.get_device_name(0))
    except Exception:
        return None


# Model and licence per engine, shown in the subtitles. beat_this: code and published weights under MIT (README of
# CPJKU/beat_this); librosa: ISC; md_beat_this (fosfrancesco/md_beat_this): CC BY-NC 4.0, non-commercial only.
MODELS = {
    "beat_this": {"name": "beat_this", "license": "MIT", "commercial": True},
    "md_beat_this": {"name": "md_beat_this", "license": "CC BY-NC 4.0", "commercial": False,
                     "url": "https://github.com/fosfrancesco/md_beat_this"},
    "librosa": {"name": "librosa", "license": "ISC", "commercial": True},
}


def engine_info(engine_id: str, fallback_reason: Optional[str] = None, device: Optional[str] = None) -> Dict[str, Any]:
    """What computed (or would compute) the beats: engine, device, graphics card, why librosa took over and the
    model with its licence."""
    return {
        "id": engine_id,
        "device": device,
        "gpu": _gpu_name() if device == "cuda" else None,
        "fallbackReason": fallback_reason,
        "model": dict(MODELS[engine_id]) if engine_id in MODELS else None,
    }


def engine_status(model: str = "beat_this") -> Dict[str, Any]:
    """What the next analysis would use for the given model, without loading the model."""
    model_id = normalize_model(model)
    available = MD_BEAT_THIS_AVAILABLE if model_id == "md_beat_this" else BEAT_THIS_AVAILABLE
    failed = MD_MODEL_LOAD_FAILED if model_id == "md_beat_this" else MODEL_LOAD_FAILED
    loaded_device = MD_PREDICTOR_DEVICE if model_id == "md_beat_this" else PREDICTOR_DEVICE
    if not available:
        return engine_info("librosa", "not_installed")
    if failed:
        return engine_info("librosa", "model_load_failed")
    if loaded_device:
        return engine_info(model_id, device=loaded_device)
    try:
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:
        device = "cpu"
    return engine_info(model_id, device=device)


def decode_with_av(file_path: str):
    """Decode any format FFmpeg knows (m4a/AAC, ALAC, Opus, WMA, ...) with PyAV, which brings its own FFmpeg
    libraries: no ffmpeg needs to be installed. Float samples at the file's own sample rate (no loss from a 16-bit
    step), mono; the original file is only read. FFmpeg drops the encoder delay (gapless info) like soundfile does."""
    import av   # optional: without it librosa.load (needs ffmpeg in PATH) is the last resort
    with av.open(file_path) as container:
        stream = next(s for s in container.streams if s.type == "audio")
        sr = stream.codec_context.sample_rate or stream.rate
        resampler = av.AudioResampler(format="flt", layout="mono", rate=sr)
        chunks = []
        for frame in container.decode(stream):
            for out in resampler.resample(frame):
                chunks.append(out.to_ndarray().reshape(-1))
        for out in resampler.resample(None):   # flush
            chunks.append(out.to_ndarray().reshape(-1))
    if not chunks:
        raise RuntimeError(f"no audio data in {os.path.basename(file_path)}")
    return np.concatenate(chunks).astype(np.float32), int(sr)


def decode_with_ffmpeg(file_path: str, target_sr: int):
    """Decode with an installed ffmpeg (the folder from settings.json or the system PATH), mono float at target_sr.
    Used when PyAV is missing; on Windows without a console window (the Resolve job runs under pythonw)."""
    import subprocess
    status = ffmpeg_utils.apply_ffmpeg_dir(settings.load().get("ffmpegDir"))
    if not status["available"]:
        raise RuntimeError("no ffmpeg found")
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    proc = subprocess.run([status["path"], "-v", "error", "-nostdin", "-i", file_path, "-map", "0:a:0",
                           "-f", "f32le", "-ac", "1", "-ar", str(target_sr), "-"],
                          capture_output=True, creationflags=flags)
    if proc.returncode != 0 or not proc.stdout:
        detail = proc.stderr.decode("utf-8", "replace").strip().splitlines()
        raise RuntimeError(f"ffmpeg: {detail[-1] if detail else 'no audio data'}")
    return np.frombuffer(proc.stdout, dtype=np.float32).copy(), target_sr


def load_audio_safely(file_path: str, target_sr: int = 44100):
    """WAV/FLAC/MP3/OGG with soundfile; other formats (m4a/AAC, ALAC, Opus, WMA, ...) with PyAV, without PyAV with an
    installed ffmpeg. All of them drop the encoder delay of MP3/AAC (gapless info). The original file is only read."""
    try:
        data, sr = sf.read(file_path, always_2d=True)
        mono = np.mean(data, axis=1)
    except Exception as sf_err:
        try:
            mono, sr = decode_with_av(file_path)
        except ImportError:
            try:
                return decode_with_ffmpeg(file_path, target_sr)
            except Exception as ff_err:
                raise RuntimeError(
                    f"Cannot read the format of {os.path.basename(file_path)} ({sf_err}; {ff_err}). "
                    "PyAV installieren (venv: pip install av) oder ffmpeg einrichten.") from ff_err
    if sr != target_sr:
        mono = librosa.resample(np.asarray(mono, dtype=np.float32), orig_sr=sr, target_sr=target_sr)
    return np.asarray(mono, dtype=np.float32), target_sr


FPS = 50   # frames per second of the framewise beat_this predictions


def _to_numpy(x) -> np.ndarray:
    if hasattr(x, "detach"):
        x = x.detach().float().cpu().numpy()
    return np.asarray(x, dtype=np.float64)


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.asarray(x, dtype=np.float64)))


def _to_prob(x) -> np.ndarray:
    arr = _to_numpy(x)
    if arr.size == 0:
        return arr
    if float(np.min(arr)) < 0.0 or float(np.max(arr)) > 1.0:
        return sigmoid(arr)
    return arr


def run_beat_this(predictor, y: np.ndarray, sr: int):
    """
    beat_this in its single steps (Audio2Beats = signal2spect + spect2frames + frames2beats): beats and downbeats
    in seconds plus the probability per frame (50 frames/s) for beat and downbeat, from one model run.
    """
    spect = predictor.signal2spect(y, sr)
    beat_logits, downbeat_logits = predictor.spect2frames(spect)
    beats, downbeats = predictor.frames2beats(beat_logits, downbeat_logits)
    return ([float(b) for b in beats], [float(d) for d in downbeats],
            sigmoid(_to_numpy(beat_logits)), sigmoid(_to_numpy(downbeat_logits)))


def run_md_beat_this(predictor, y: np.ndarray, sr: int):
    """
    md_beat_this (Masked Diffusion, CC BY-NC 4.0): uses framewise steps if exposed,
    otherwise falls back to predictor(y, sr).
    """
    if hasattr(predictor, "signal2spect") and hasattr(predictor, "spect2frames") and hasattr(predictor, "frames2beats"):
        spect = predictor.signal2spect(y, sr)
        beat_out, downbeat_out = predictor.spect2frames(spect)
        beats, downbeats = predictor.frames2beats(beat_out, downbeat_out)
        return ([float(b) for b in beats], [float(d) for d in downbeats],
                _to_prob(beat_out), _to_prob(downbeat_out))
    beats, downbeats = predictor(y, sr)
    return ([float(b) for b in beats], [float(d) for d in downbeats], None, None)


def beat_confidence(time: float, is_downbeat: bool, beat_prob: np.ndarray, downbeat_prob: np.ndarray,
                    fps: int = FPS) -> float:
    """Probability of the model at the beat; for a downbeat the highest downbeat probability within +-3 frames."""
    probs = downbeat_prob if is_downbeat else beat_prob
    f = min(max(int(round(time * fps)), 0), len(probs) - 1)
    value = float(np.max(probs[max(f - 3, 0): f + 4])) if is_downbeat else float(probs[f])
    return round(value, 3)


def activation_curve(beat_prob: np.ndarray, downbeat_prob: Optional[np.ndarray], fps: int = FPS,
                     points: int = 1000) -> List[Dict[str, Any]]:
    """Curve with at most `points` points; each point is the maximum of its block, so no peak gets lost."""
    n = len(beat_prob)
    size = max(1, int(math.ceil(n / points)))
    curve = []
    for start in range(0, n, size):
        curve.append({
            "time": round(start / fps, 3),
            "beatActivation": round(float(np.max(beat_prob[start:start + size])), 3),
            "downbeatActivation": (round(float(np.max(downbeat_prob[start:start + size])), 3)
                                   if downbeat_prob is not None else None),
        })
    return curve


def meter_from_beats(beats_sec: List[float], downbeats_sec: List[float]) -> Tuple[int, Optional[int]]:
    """Beats per bar (most frequent of 2, 3, 4, 6, else 4) and the share of bars with that count in percent."""
    counts = [sum(1 for b in beats_sec if d1 <= b < d2) for d1, d2 in zip(downbeats_sec, downbeats_sec[1:])]
    if not counts:
        return 4, None
    allowed = [c for c in counts if c in (2, 3, 4, 6)]
    numerator = max(set(allowed), key=allowed.count) if allowed else 4
    return numerator, int(round(100 * counts.count(numerator) / len(counts)))


REANCHOR_PENALTY = 9.0   # cost (nats) of starting the bar grid anew: about two bars of clear contrary evidence
PROTECT_CONF = 0.95      # default ("Glätten" 90 %): a downbeat the model hears this clearly stays a "1"; the grid never overrules it


def clamp_protect(value: Any) -> float:
    """Protection threshold from the user (slider, URL, command line): 0.5 ... 1.0; unreadable -> PROTECT_CONF."""
    try:
        v = float(value)
    except (TypeError, ValueError):
        return PROTECT_CONF
    if v != v:   # NaN
        return PROTECT_CONF
    return min(1.0, max(0.5, v))


def smooth_bars(downbeat_conf: List[float], meter: int, protect: float = PROTECT_CONF) -> Dict[str, Any]:
    """
    Even bar grid from beat_this: the most likely beat of the bar (1..meter) for every beat (Viterbi). Counting on
    (1, 2, ..., meter, 1) is free; starting anew costs REANCHOR_PENALTY, so the grid only moves where the model
    clearly hears the "1" elsewhere; a beat with downbeat_conf >= protect is always a "1" (protect 1.0: none).
    downbeat_conf[i] = downbeat probability at beat i.
    """
    off = {"applied": False, "positions": [], "reanchors": 0}
    n = len(downbeat_conf)
    if meter < 2 or n < 2 * meter:
        return off
    d = np.clip(np.asarray(downbeat_conf, dtype=np.float64), 1e-4, 1 - 1e-4)
    emit = np.empty((n, meter))
    emit[:, 0] = np.log(d)
    emit[:, 1:] = np.log(1 - d)[:, None]
    emit[d >= protect, 1:] = -1e9            # clear model downbeats: only beat 1 of the bar is allowed
    nxt = np.roll(np.arange(meter), -1)          # state p (0-based) counts on to nxt[p]
    score = emit[0].copy()                       # every beat of the bar is a possible start (pickup)
    back = np.zeros((n, meter), dtype=np.int64)
    for i in range(1, n):
        # best way into each state: count on from its predecessor, or jump from the best state with a penalty
        on = np.empty(meter)
        on[nxt] = score
        prev_on = np.empty(meter, dtype=np.int64)
        prev_on[nxt] = np.arange(meter)
        best = int(np.argmax(score))
        jump = score[best] - REANCHOR_PENALTY
        take_jump = jump > on
        back[i] = np.where(take_jump, best, prev_on)
        score = np.where(take_jump, jump, on) + emit[i]
    path = np.empty(n, dtype=np.int64)
    path[-1] = int(np.argmax(score))
    for i in range(n - 1, 0, -1):
        path[i - 1] = back[i, path[i]]
    reanchors = int(sum(1 for i in range(1, n) if path[i] != nxt[path[i - 1]]))
    return {"applied": True, "positions": [int(p) + 1 for p in path], "reanchors": reanchors}


# The last analysed file (key: SHA-256 of its content): audio and beat_this output, so that a new smoothing value
# does not decode the file and run the model again. A failed model run is not kept. One tuple
# (key, y, sr, model), replaced as a whole and read once per run: requests run in parallel threads.
_LAST: Tuple = ()


def _file_key(file_path: str) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def analyze_audio_file(file_path: str, original_filename: str, smooth: bool = True,
                       protect: float = PROTECT_CONF, model: str = "beat_this") -> Dict[str, Any]:
    """
    Analyses an audio file (MP3, WAV, AAC, FLAC ...) with CPJKU beat_this or
    md_beat_this (non-commercial only) and returns structured beats, downbeats,
    tempo, time signature and the BAF/DAF activation curves.
    """
    model_id = normalize_model(model)
    ffmpeg_utils.apply_ffmpeg_dir(settings.load().get("ffmpegDir"))
    if model_id == "md_beat_this":
        predictor = get_md_predictor()
        available = MD_BEAT_THIS_AVAILABLE
        device = MD_PREDICTOR_DEVICE
        runner = run_md_beat_this
    else:
        predictor = get_predictor()
        available = BEAT_THIS_AVAILABLE
        device = PREDICTOR_DEVICE
        runner = run_beat_this

    protect = clamp_protect(protect)
    global _LAST
    key = _file_key(file_path)
    last = _LAST
    cached_model = last[4] if last and last[0] == key and last[1] == model_id else None
    # load the audio with soundfile / PyAV / librosa (works with Python 3.9 to 3.13)
    if last and last[0] == key:
        y, sr = last[2], last[3]
    else:
        y, sr = load_audio_safely(file_path, target_sr=44100)
    model_cache = None
    duration = float(len(y) / sr)

    beats_sec: List[float] = []
    downbeats_sec: List[float] = []
    beat_prob: Optional[np.ndarray] = None
    downbeat_prob: Optional[np.ndarray] = None
    info = engine_info(model_id, device=device)

    if predictor is not None and cached_model is not None:
        model_cache = cached_model
        print(f"[BeatAnalyzer Backend] Result of {model_id} from memory (only smoothing recomputed): {original_filename}")
        beats_sec, downbeats_sec, beat_prob, downbeat_prob = list(model_cache[0]), list(model_cache[1]), model_cache[2], model_cache[3]
    elif predictor is not None:
        try:
            print(f"[BeatAnalyzer Backend] Running {model_id} on: {original_filename}")
            beats_sec, downbeats_sec, beat_prob, downbeat_prob = runner(predictor, y, sr)
            model_cache = (list(beats_sec), list(downbeats_sec), beat_prob, downbeat_prob)
        except Exception as e:
            beat_prob = downbeat_prob = None
            print(f"[BeatAnalyzer Backend] {model_id} failed, switching to the fallback: {e}")
            info = engine_info("librosa", "inference_failed")
            beats_sec, downbeats_sec = fallback_mir_track(y, sr)
    else:
        info = engine_info("librosa", "not_installed" if not available else "model_load_failed")
        beats_sec, downbeats_sec = fallback_mir_track(y, sr)

    _LAST = (key, model_id, y, sr, model_cache)

    # curves for the web app: probabilities of the model, otherwise the onset strength of librosa
    if beat_prob is not None:
        curve = activation_curve(beat_prob, downbeat_prob)
        activation_source = model_id
    else:
        hop_length = int(sr / 100)  # 10 ms Frames
        onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length, aggregate=np.median)
        if len(onset_env) > 0 and np.max(onset_env) > 0:
            onset_env = onset_env / np.max(onset_env)
        curve = activation_curve(onset_env, None, fps=sr / hop_length)
        activation_source = "onset"

    # statistics and structured beats
    intervals = []
    for i in range(1, len(beats_sec)):
        dt = beats_sec[i] - beats_sec[i - 1]
        if 0.15 < dt < 2.5:
            intervals.append(dt)

    if intervals:
        avg_interval = float(np.mean(intervals))
        global_bpm = round(60.0 / avg_interval, 1)
        instant_bpms = [round(60.0 / dt, 1) for dt in intervals]
        average_bpm = round(float(np.mean(instant_bpms)), 1)
        median_bpm = round(float(np.median(instant_bpms)), 1)
        min_bpm = round(float(np.min(instant_bpms)), 1)
        max_bpm = round(float(np.max(instant_bpms)), 1)
        std_bpm = float(np.std(instant_bpms))
        tempo_stability = max(0, min(100, int(100 - (std_bpm / (average_bpm or 1)) * 100)))
    else:
        global_bpm = 120.0
        average_bpm = 120.0
        median_bpm = 120.0
        min_bpm = 120.0
        max_bpm = 120.0
        tempo_stability = 90

    # time signature: most frequent number of beats between two downbeats and its share of all bars
    beats_per_bar, bar_share = meter_from_beats(beats_sec, downbeats_sec)
    if info["id"] == "librosa":
        bar_share = None   # librosa puts a downbeat on every 3rd/4th beat: a share of those bars says nothing

    # structured beat list with bar and beat of the bar
    downbeat_indices = set()
    for d in downbeats_sec:
        # next beat
        closest_idx = min(range(len(beats_sec)), key=lambda i: abs(beats_sec[i] - d), default=None)
        if closest_idx is not None and abs(beats_sec[closest_idx] - d) < 0.12:
            downbeat_indices.add(closest_idx)

    # smooth the bars (beat_this only): an even grid, restarted only where the model clearly hears another "1"
    smoothing = {"applied": False, "meter": beats_per_bar, "changedBeats": 0, "reanchors": 0, "protect": protect}
    positions = None
    if beat_prob is not None and smooth and len(downbeat_indices) >= 2:   # fewer: no bar the model heard
        conf = [beat_confidence(t, True, beat_prob, downbeat_prob) for t in beats_sec]
        smoothed = smooth_bars(conf, beats_per_bar, protect)
        if smoothed["applied"]:
            positions = smoothed["positions"]
            new_down = {i for i, pos in enumerate(positions) if pos == 1}
            smoothing.update(applied=True, changedBeats=len(new_down ^ downbeat_indices),
                             reanchors=smoothed["reanchors"])
            downbeat_indices = new_down

    structured_beats = []
    structured_downbeats = []
    current_bar = 1
    beat_in_bar = 1
    seen_downbeat = False

    for idx, b_time in enumerate(beats_sec):
        is_down = idx in downbeat_indices or (idx == 0 and len(downbeat_indices) == 0)

        if is_down and idx > 0:
            current_bar += 1
            beat_in_bar = 1
        if is_down:
            seen_downbeat = True

        delta_ms = int(round((b_time - beats_sec[idx - 1]) * 1000)) if idx > 0 else 0
        instant_bpm = round(60000.0 / delta_ms, 1) if delta_ms > 150 else global_bpm

        item = {
            "id": idx + 1,
            "time": round(b_time, 3),
            # smoothed: the pickup keeps its place in the grid (3, 4 | 1), after that the count since the last "1"
            "beatInBar": positions[idx] if positions and not seen_downbeat else beat_in_bar,
            "barIndex": current_bar,
            "isDownbeat": is_down,
            # a downbeat the model did not report (first beat when there are no downbeats) gets the beat value
            "confidence": (beat_confidence(b_time, is_down and idx in downbeat_indices, beat_prob, downbeat_prob)
                           if beat_prob is not None else None),
            "instantBpm": instant_bpm,
            "deltaMs": delta_ms
        }
        structured_beats.append(item)
        if is_down:
            structured_downbeats.append(item)

        beat_in_bar = beat_in_bar + 1 if positions else (beat_in_bar % beats_per_bar) + 1

    # waveform peaks for quick drawing in the canvas
    num_buckets = 2400
    bucket_size = max(1, len(y) // num_buckets)
    waveform_peaks = []
    for b in range(num_buckets):
        start = b * bucket_size
        end = min(start + bucket_size, len(y))
        if start < len(y):
            chunk = y[start:end]
            waveform_peaks.append(float(np.min(chunk)))
            waveform_peaks.append(float(np.max(chunk)))
        else:
            waveform_peaks.extend([0.0, 0.0])

    file_format = original_filename.split(".")[-1].upper() if "." in original_filename else "AUDIO"

    analysis_result = {
        "engine": ENGINE_LABELS[info["id"]],
        "engineInfo": info,
        "selectedModel": model_id,
        "metadata": {
            "fileName": original_filename,
            "fileSize": os.path.getsize(file_path),
            "duration": round(duration, 3),
            "sampleRate": sr,
            "channels": 1,
            "format": file_format
        },
        "beats": structured_beats,
        "downbeats": structured_downbeats,
        "globalBpm": global_bpm,
        "averageBpm": average_bpm,
        "medianBpm": median_bpm,
        "minBpm": min_bpm,
        "maxBpm": max_bpm,
        "tempoStability": tempo_stability,
        "barSmoothing": smoothing,
        "timeSignature": {
            "numerator": beats_per_bar,
            "denominator": 4,
            "name": f"{beats_per_bar}/4",
            "barShare": bar_share
        },
        "swingRatio": 50.0,
        "totalBeats": len(structured_beats),
        "totalBars": len(structured_downbeats),
        "activationCurve": curve,
        "activationSource": activation_source,
        "waveformPeaks": waveform_peaks,
        "waveformDuration": round(duration, 3)
    }
    # Resolve plays MP3 without dropping the Xing frame and the encoder delay: markers must move by this much
    if original_filename.lower().endswith(".mp3"):
        # always written for MP3, also 0 (no Xing/Info frame: Resolve plays it on time). Without the field the
        # script cannot tell a checked MP3 from an old JSON and warned wrongly (Resolve test 0.2.14).
        analysis_result["resolveOffset"] = round(mp3_offset.resolve_offset(file_path), 5)
    if info["id"] == "md_beat_this":
        analysis_result["license"] = "CC BY-NC 4.0"
        analysis_result["attribution"] = MD_BEAT_THIS_ATTRIBUTION
    return analysis_result


def fallback_mir_track(y: np.ndarray, sr: int):
    """
    Fallback with librosa (dynamic programming beat tracker; bars from harmonic similarity)
    """
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, hop_length=512, trim=False)
    beats_sec = [float(round(t, 3)) for t in librosa.frames_to_time(beat_frames, sr=sr, hop_length=512)]

    # librosa finds no downbeats: every 4th beat from the first (every 3rd when the sound repeats clearly more
    # similarly after 3 beats than after 4). Whether the "1" is right depends on the first detected beat.
    downbeats_sec = []
    if beats_sec:
        step = 4
        # 3/4 (waltz)?
        if len(beats_sec) >= 12:
            cqt = np.abs(librosa.cqt(y=y[:sr * 30], sr=sr, hop_length=512))
            sync_cqt = librosa.util.sync(cqt, beat_frames[:len(beats_sec)])
            # chroma correlation at lag 3 vs 4
            if sync_cqt.shape[1] >= 12:
                sim3 = float(np.mean(sync_cqt[:, :-3] * sync_cqt[:, 3:]))
                sim4 = float(np.mean(sync_cqt[:, :-4] * sync_cqt[:, 4:]))
                if sim3 > sim4 * 1.1:
                    step = 3

        for i in range(0, len(beats_sec), step):
            downbeats_sec.append(beats_sec[i])

    return beats_sec, downbeats_sec


RESOLVE_MARKER_FORMAT = "beatthis-resolve-markers/1"


def resolve_marker_data(result: Dict[str, Any], only_downbeats: bool = False) -> Dict[str, Any]:
    """
    Marker JSON for resolve/BeatAnalyzer_Markers.lua (same format as the export of the web app).
    Times in seconds from the start of the audio file.
    """
    beats = [b for b in result["beats"] if b["isDownbeat"]] if only_downbeats else result["beats"]
    data = {
        "format": RESOLVE_MARKER_FORMAT,
        "fileName": result["metadata"]["fileName"],
        "duration": result["metadata"]["duration"],
        "globalBpm": result["globalBpm"],
        "timeSignature": result["timeSignature"]["name"],
        "markers": [
            {
                "time": b["time"],
                "type": "downbeat" if b["isDownbeat"] else "beat",
                "bar": b["barIndex"],
                "beat": b["beatInBar"],
                "bpm": b["instantBpm"],
                "confidence": b["confidence"],
            }
            for b in beats
        ],
    }
    if result.get("engineInfo"):
        data["engine"] = dict(result["engineInfo"])
        if result.get("selectedModel") == "md_beat_this" and data["engine"].get("id") != "md_beat_this":
            data["engine"]["requestedModel"] = "md_beat_this"   # librosa stood in for md_beat_this
    if result.get("resolveOffset") is not None:
        data["resolveOffset"] = result["resolveOffset"]   # seconds (0 = checked, no shift); the script moves MP3 markers
    if (result.get("engineInfo") or {}).get("id") == "md_beat_this":
        data["license"] = result.get("license") or "CC BY-NC 4.0"
        data["attribution"] = result.get("attribution") or MD_BEAT_THIS_ATTRIBUTION
    return data

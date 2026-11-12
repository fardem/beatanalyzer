"""
CPJKU beat_this Python Integration Engine
Führt Beat & Downbeat Tracking mit PyTorch / beat_this oder Librosa-Fallback durch.
"""

import math
import os
import sys
import tempfile
import numpy as np
import soundfile as sf
import librosa
from typing import Dict, Any, List, Optional, Tuple

BEAT_THIS_AVAILABLE = False
predictor_instance = None
MODEL_LOAD_FAILED = False        # the last attempt to load the beat_this model failed
PREDICTOR_DEVICE = None          # "cuda" or "cpu" of the loaded model

ENGINE_LABELS = {"beat_this": "CPJKU beat_this Transformer", "librosa": "Librosa MIR (Fallback)"}

try:
    # Versuche offiziellen CPJKU beat_this Import
    # Audio2Beats statt File2Beats: Wir uebergeben das bereits dekodierte Signal.
    # File2Beats laedt per torchaudio.load, das ab torchaudio 2.9 TorchCodec + FFmpeg
    # voraussetzt (unter Windows meist nicht vorhanden -> MP3/AAC schlagen fehl).
    from beat_this.inference import Audio2Beats
    BEAT_THIS_AVAILABLE = True
    print("[BeatAnalyzer Backend] CPJKU beat_this Transformer-Bibliothek erfolgreich geladen!")
except Exception as e:
    print(f"[BeatAnalyzer Backend] Hinweis: CPJKU beat_this direkt nicht verfügbar ({e}). Verwende High-Performance MIR-Fallback.")


def get_predictor():
    global predictor_instance, MODEL_LOAD_FAILED, PREDICTOR_DEVICE
    if not BEAT_THIS_AVAILABLE:
        return None
    if predictor_instance is None:
        try:
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"[BeatAnalyzer Backend] Initialisiere CPJKU Audio2Beats auf Device: {device}...")
            # 'final0' ist das offizielle Standard-Checkpoint-Modell von CPJKU
            predictor_instance = Audio2Beats(checkpoint_path="final0", device=device)
            MODEL_LOAD_FAILED, PREDICTOR_DEVICE = False, device
            print("[BeatAnalyzer Backend] Modell bereit für Inferenz.")
        except Exception as err:
            print(f"[BeatAnalyzer Backend] Fehler beim Laden des Modells: {err}")
            predictor_instance = None
            MODEL_LOAD_FAILED = True
    return predictor_instance


def _gpu_name() -> Optional[str]:
    try:
        import torch
        return str(torch.cuda.get_device_name(0))
    except Exception:
        return None


def engine_info(engine_id: str, fallback_reason: Optional[str] = None, device: Optional[str] = None) -> Dict[str, Any]:
    """What computed (or would compute) the beats: engine, device, graphics card and why librosa took over."""
    return {
        "id": engine_id,
        "device": device,
        "gpu": _gpu_name() if device == "cuda" else None,
        "fallbackReason": fallback_reason,
    }


def engine_status() -> Dict[str, Any]:
    """What the next analysis would use, without loading the model."""
    if not BEAT_THIS_AVAILABLE:
        return engine_info("librosa", "not_installed")
    if MODEL_LOAD_FAILED:
        return engine_info("librosa", "model_load_failed")
    if PREDICTOR_DEVICE:
        return engine_info("beat_this", device=PREDICTOR_DEVICE)
    try:
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:
        device = "cpu"
    return engine_info("beat_this", device=device)


def load_audio_safely(file_path: str, target_sr: int = 44100):
    try:
        data, sr = sf.read(file_path, always_2d=True)
        mono = np.mean(data, axis=1)
        if sr != target_sr:
            mono = librosa.resample(mono.astype(np.float32), orig_sr=sr, target_sr=target_sr)
        return mono.astype(np.float32), target_sr
    except Exception:
        return librosa.load(file_path, sr=target_sr, mono=True)


FPS = 50   # frames per second of the framewise beat_this predictions


def _to_numpy(x) -> np.ndarray:
    if hasattr(x, "detach"):
        x = x.detach().float().cpu().numpy()
    return np.asarray(x, dtype=np.float64)


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.asarray(x, dtype=np.float64)))


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


def analyze_audio_file(file_path: str, original_filename: str) -> Dict[str, Any]:
    """
    Analysiert eine Audiodatei (MP3, WAV, AAC, FLAC) und liefert strukturierte
    Beats, Downbeats, Tempo, Taktart und BAF/DAF-Aktivierungskurven.
    """
    predictor = get_predictor()

    # Lade Audio sicher mit soundfile / librosa (kompatibel mit Python 3.9 bis 3.13)
    y, sr = load_audio_safely(file_path, target_sr=44100)
    duration = float(len(y) / sr)

    beats_sec: List[float] = []
    downbeats_sec: List[float] = []
    beat_prob: Optional[np.ndarray] = None
    downbeat_prob: Optional[np.ndarray] = None
    info = engine_info("beat_this", device=PREDICTOR_DEVICE)

    if predictor is not None:
        try:
            print(f"[BeatAnalyzer Backend] Starte CPJKU Transformer Inferenz für: {original_filename}")
            beats_sec, downbeats_sec, beat_prob, downbeat_prob = run_beat_this(predictor, y, sr)
        except Exception as e:
            beat_prob = downbeat_prob = None
            print(f"[BeatAnalyzer Backend] Fehler bei Transformer-Inferenz, wechsle auf Fallback: {e}")
            info = engine_info("librosa", "inference_failed")
            beats_sec, downbeats_sec = fallback_mir_track(y, sr)
    else:
        info = engine_info("librosa", "not_installed" if not BEAT_THIS_AVAILABLE else "model_load_failed")
        beats_sec, downbeats_sec = fallback_mir_track(y, sr)

    # Kurven fuer die Web-App: Wahrscheinlichkeiten von beat_this, sonst die Onset-Staerke von librosa
    if beat_prob is not None:
        curve = activation_curve(beat_prob, downbeat_prob)
        activation_source = "beat_this"
    else:
        hop_length = int(sr / 100)  # 10 ms Frames
        onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length, aggregate=np.median)
        if len(onset_env) > 0 and np.max(onset_env) > 0:
            onset_env = onset_env / np.max(onset_env)
        curve = activation_curve(onset_env, None, fps=sr / hop_length)
        activation_source = "onset"

    # Statistiken & Strukturierte Beats erzeugen
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

    # Taktart: haeufigste Beat-Anzahl zwischen zwei Downbeats und ihr Anteil an allen Takten
    beats_per_bar, bar_share = meter_from_beats(beats_sec, downbeats_sec)

    # Erzeuge strukturierte Beat-Liste mit Takt & Zählzeit
    downbeat_indices = set()
    for d in downbeats_sec:
        # Finde nächsten Beat
        closest_idx = min(range(len(beats_sec)), key=lambda i: abs(beats_sec[i] - d), default=None)
        if closest_idx is not None and abs(beats_sec[closest_idx] - d) < 0.12:
            downbeat_indices.add(closest_idx)

    structured_beats = []
    structured_downbeats = []
    current_bar = 1
    beat_in_bar = 1

    for idx, b_time in enumerate(beats_sec):
        is_down = idx in downbeat_indices or (idx == 0 and len(downbeat_indices) == 0)

        if is_down and idx > 0:
            current_bar += 1
            beat_in_bar = 1

        delta_ms = int(round((b_time - beats_sec[idx - 1]) * 1000)) if idx > 0 else 0
        instant_bpm = round(60000.0 / delta_ms, 1) if delta_ms > 150 else global_bpm

        item = {
            "id": idx + 1,
            "time": round(b_time, 3),
            "beatInBar": beat_in_bar,
            "barIndex": current_bar,
            "isDownbeat": is_down,
            "confidence": (beat_confidence(b_time, is_down, beat_prob, downbeat_prob)
                           if beat_prob is not None else None),
            "instantBpm": instant_bpm,
            "deltaMs": delta_ms
        }
        structured_beats.append(item)
        if is_down:
            structured_downbeats.append(item)

        beat_in_bar = (beat_in_bar % beats_per_bar) + 1

    # Wellenform-Peaks für schnelles Rendern im Canvas
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

    return {
        "engine": ENGINE_LABELS[info["id"]],
        "engineInfo": info,
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


def fallback_mir_track(y: np.ndarray, sr: int):
    """
    Präziser Fallback mit Librosa Dynamic Programming & Harmonischer Taktsegmentierung
    """
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, hop_length=512, trim=False)
    beats_sec = [float(round(t, 3)) for t in librosa.frames_to_time(beat_frames, sr=sr, hop_length=512)]

    # Downbeats über Bar-Grouping (jeder 4. oder 3. Beat basierend auf tiefem Bass-Gehalt)
    downbeats_sec = []
    if beats_sec:
        step = 4
        # Prüfe ob 3/4 (Walzer)
        if len(beats_sec) >= 12:
            cqt = np.abs(librosa.cqt(y=y[:sr * 30], sr=sr, hop_length=512))
            sync_cqt = librosa.util.sync(cqt, beat_frames[:len(beats_sec)])
            # Chroma Korrelation bei Lag 3 vs 4
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
    Marker-JSON fuer resolve/BeatAnalyzer_Markers.lua (gleiches Format wie der Export der Web-App).
    Zeiten in Sekunden ab Anfang der Audiodatei.
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
        data["engine"] = result["engineInfo"]
    return data

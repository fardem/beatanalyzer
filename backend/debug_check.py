"""
Diagnose-Skript für BeatThis
Prüft alle Python-Module und gibt Systeminformationen aus.
"""

import sys
import os

print("--- System-Info ---")
print(f"Python Version: {sys.version}")
print(f"Python Pfad:    {sys.executable}")
print(f"Betriebssystem: {sys.platform}")

modules_to_test = [
    ("Python HTTP Server", "http.server"),
    ("NumPy", "numpy"),
    ("SciPy", "scipy"),
    ("SoundFile", "soundfile"),
    ("Librosa", "librosa"),
    ("PyTorch", "torch"),
    ("Torchaudio", "torchaudio"),
    ("CPJKU beat_this", "beat_this"),
]

print("\n--- Modul-Status ---")
for name, mod in modules_to_test:
    try:
        m = __import__(mod)
        ver = getattr(m, "__version__", "OK")
        print(f"  [OK]       {name:18} (Version {ver})")
    except Exception as e:
        print(f"  [NICHT DA] {name:18} ({e})")

try:
    import torch
    print("\n--- PyTorch Hardware ---")
    print(f"CUDA verfügbar: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU Name:       {torch.cuda.get_device_name(0)}")
except Exception:
    pass

print("\nDiagnose abgeschlossen.")

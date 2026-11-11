"""
Kommandozeilen-Tool (CLI) für BeatThis
Erlaubt die direkte Analyse von MP3, WAV, AAC, FLAC im Terminal
Beispiel: python backend/analyze_cli.py meinsong.mp3
"""

import sys
import os
import json
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyzer import analyze_audio_file


def main():
    parser = argparse.ArgumentParser(description="BeatThis CLI - Beat & Downbeat Erkennung")
    parser.add_argument("audio_path", help="Pfad zur MP3-, WAV-, AAC- oder FLAC-Audiodatei")
    parser.add_argument("--export-json", help="Optionaler Pfad zum Speichern der JSON-Ergebnisse", default=None)
    parser.add_argument("--export-davinci", help="Optionaler Pfad für DaVinci Resolve EDL Marker (.edl)", default=None)
    parser.add_argument("--fps", help="Framerate für DaVinci Timecodes (Standard: 24)", type=float, default=24.0)
    parser.add_argument("--export-audacity", help="Optionaler Pfad für Audacity Label Track (.txt)", default=None)
    parser.add_argument("--export-csv", help="Optionaler Pfad für CSV-Datei", default=None)

    args = parser.parse_args()

    audio_path = args.audio_path
    if not os.path.exists(audio_path):
        print(f"Fehler: Datei nicht gefunden: {audio_path}")
        sys.exit(1)

    print(f"\n=======================================================")
    print(f" Analysiere: {os.path.basename(audio_path)}")
    print(f"=======================================================")

    result = analyze_audio_file(audio_path, os.path.basename(audio_path))

    print(f" Engine:           {result['engine']}")
    print(f" Dauer:            {result['metadata']['duration']} Sekunden")
    print(f" Globales Tempo:   {result['globalBpm']} BPM")
    print(f" Taktart (Meter):  {result['timeSignature']['name']}")
    print(f" Gesamt-Beats:     {result['totalBeats']}")
    print(f" Gesamt-Takte:     {result['totalBars']} (Downbeats)")
    print(f" Tempo-Stabilitat: {result['tempoStability']}%")
    print(f"=======================================================\n")

    base_name = os.path.splitext(audio_path)[0]

    # Standard JSON Export wenn nicht anders angegeben
    out_json = args.export_json or f"{base_name}_beat_this.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"[OK] JSON gespeichert: {out_json}")

    # DaVinci Resolve EDL Marker Export
    out_davinci = args.export_davinci or f"{base_name}_DaVinci_{int(args.fps)}fps.edl"
    fps = args.fps

    def sec_to_tc(sec: float, fps: float, start_hour: int = 1) -> str:
        total_frames = max(0, int(round(sec * fps)))
        f_per_hr = int(round(3600 * fps))
        f_per_min = int(round(60 * fps))
        h = int(total_frames // f_per_hr) + start_hour
        rem1 = total_frames % f_per_hr
        m = int(rem1 // f_per_min)
        rem2 = rem1 % f_per_min
        s = int(rem2 // fps)
        f = int(round(rem2 % fps))
        return f"{h:02d}:{m:02d}:{s:02d}:{f:02d}"

    with open(out_davinci, "w", encoding="utf-8") as f:
        f.write(f"TITLE: {os.path.basename(base_name)}_DaVinci_Markers\nFCM: NON-DROP FRAME\n\n")
        for idx, b in enumerate(result["beats"]):
            event_num = f"{idx + 1:03d}"
            in_tc = sec_to_tc(b["time"], fps)
            out_tc = sec_to_tc(b["time"] + 1.0 / fps, fps)
            color = "ResolveColorRed" if b["isDownbeat"] else "ResolveColorCyan"
            label = f"Takt {b['barIndex']} (Downbeat)" if b["isDownbeat"] else f"Takt {b['barIndex']}.{b['beatInBar']} ({b['instantBpm']:.0f} BPM)"
            f.write(f"{event_num}  001      V     C        {in_tc} {out_tc} {in_tc} {out_tc}\n")
            f.write(f" |C:{color} |M:{label} |D:1\n\n")

    print(f"[OK] DaVinci Resolve EDL Marker gespeichert: {out_davinci}")

    if args.export_audacity:
        with open(args.export_audacity, "w", encoding="utf-8") as f:
            for b in result["beats"]:
                label = f"[Bar {b['barIndex']}] {b['beatInBar']}" if b["isDownbeat"] else f"{b['barIndex']}.{b['beatInBar']}"
                f.write(f"{b['time']:.6f}\t{b['time']:.6f}\t{label}\n")
        print(f"[OK] Audacity Labels gespeichert: {args.export_audacity}")

    if args.export_csv:
        with open(args.export_csv, "w", encoding="utf-8") as f:
            f.write("ID,Time_Sec,Bar,Beat,Is_Downbeat,BPM,Delta_MS\n")
            for b in result["beats"]:
                f.write(f"{b['id']},{b['time']:.3f},{b['barIndex']},{b['beatInBar']},{1 if b['isDownbeat'] else 0},{b['instantBpm']},{b['deltaMs']}\n")
        print(f"[OK] CSV gespeichert: {args.export_csv}")


if __name__ == "__main__":
    main()

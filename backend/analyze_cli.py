"""
Kommandozeilen-Tool (CLI) für BeatAnalyzer
Erlaubt die direkte Analyse von MP3, WAV, AAC, FLAC im Terminal
Beispiel: python backend/analyze_cli.py meinsong.mp3
"""

import sys
import os
import json
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyzer import analyze_audio_file, resolve_marker_data


def main():
    parser = argparse.ArgumentParser(description="BeatAnalyzer CLI - Beat & Downbeat Erkennung")
    parser.add_argument("audio_path", help="Pfad zur MP3-, WAV-, AAC- oder FLAC-Audiodatei")
    parser.add_argument("--export-json", help="Optionaler Pfad zum Speichern der JSON-Ergebnisse", default=None)
    parser.add_argument("--export-resolve", help="Optionaler Pfad für die DaVinci Resolve Marker-JSON (BeatAnalyzer_Markers.lua)", default=None)
    parser.add_argument("--only-downbeats", help="Resolve-Marker nur auf Downbeats", action="store_true")
    parser.add_argument("--export-audacity", help="Optionaler Pfad für Audacity Label Track (.txt)", default=None)
    parser.add_argument("--export-csv", help="Optionaler Pfad für CSV-Datei", default=None)
    parser.add_argument("--no-smooth-bars", help="Takte nicht glätten (wie beat_this sie liefert)", action="store_true")
    parser.add_argument("--protect", type=float, default=0.85,
                        help="Schutz klarer 1: eine 1, die beat_this so sicher hört, bleibt (0.5 bis 1.0, 1.0 = kein Schutz)")

    args = parser.parse_args()

    audio_path = args.audio_path
    if not os.path.exists(audio_path):
        print(f"Fehler: Datei nicht gefunden: {audio_path}")
        sys.exit(1)

    print(f"\n=======================================================")
    print(f" Analysiere: {os.path.basename(audio_path)}")
    print(f"=======================================================")

    result = analyze_audio_file(audio_path, os.path.basename(audio_path), smooth=not args.no_smooth_bars,
                                protect=args.protect)

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

    # DaVinci Resolve Marker-JSON (fuer resolve/BeatAnalyzer_Markers.lua)
    out_resolve = args.export_resolve or f"{base_name}_resolve_markers.json"
    with open(out_resolve, "w", encoding="utf-8") as f:
        json.dump(resolve_marker_data(result, args.only_downbeats), f, indent=2, ensure_ascii=False)
    print(f"[OK] DaVinci Resolve Marker-JSON gespeichert: {out_resolve}")

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

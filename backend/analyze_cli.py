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
import ffmpeg_utils
import settings


def main():
    parser = argparse.ArgumentParser(description="BeatAnalyzer CLI - beat and downbeat detection")
    parser.add_argument("audio_path", help="Path to the audio file (MP3, WAV, AAC/M4A, FLAC, ...)")
    parser.add_argument("--export-json", help="Optional path to save the JSON results", default=None)
    parser.add_argument("--export-resolve", help="Optional path for the DaVinci Resolve marker JSON (BeatAnalyzer_Markers.lua)", default=None)
    parser.add_argument("--only-downbeats", help="Resolve markers on downbeats only", action="store_true")
    parser.add_argument("--export-audacity", help="Optional path for an Audacity label track (.txt)", default=None)
    parser.add_argument("--export-csv", help="Optional path for a CSV file", default=None)
    parser.add_argument("--no-smooth-bars", help="Do not smooth the bars (as beat_this gives them)", action="store_true")
    parser.add_argument("--protect", type=float, default=0.95,
                        help="Protection of clear 1s: a 1 that beat_this hears this surely stays (0.5 to 1.0, 1.0 = no protection)")
    parser.add_argument("--model", choices=["beat_this", "md_beat_this"], default="beat_this",
                        help="Analysis model: beat_this (default) or md_beat_this (CC BY-NC 4.0, non-commercial only)")
    parser.add_argument("--ffmpeg-dir", default=None,
                        help="Optional folder with a runnable ffmpeg (if ffmpeg is not in the system PATH)")

    args = parser.parse_args()

    if args.ffmpeg_dir is not None:
        try:
            ffmpeg_utils.validate_and_resolve_ffmpeg_dir(args.ffmpeg_dir)
        except ValueError as err:
            print(f"Error in --ffmpeg-dir: {err}")
            sys.exit(1)
    else:
        ffmpeg_utils.apply_ffmpeg_dir(settings.load().get("ffmpegDir"))

    audio_path = args.audio_path
    if not os.path.exists(audio_path):
        print(f"Error: file not found: {audio_path}")
        sys.exit(1)

    if args.model == "md_beat_this":
        print("Note: md_beat_this is licensed under CC BY-NC 4.0 (non-commercial use only).")

    print(f"\n=======================================================")
    print(f" Analysing: {os.path.basename(audio_path)}")
    print(f"=======================================================")

    result = analyze_audio_file(audio_path, os.path.basename(audio_path), smooth=not args.no_smooth_bars,
                                protect=args.protect, model=args.model)

    print(f" Engine:           {result['engine']}")
    print(f" Duration:         {result['metadata']['duration']} seconds")
    print(f" Tempo:            {result['globalBpm']} BPM")
    print(f" Time signature:   {result['timeSignature']['name']}")
    print(f" Beats:            {result['totalBeats']}")
    print(f" Bars:             {result['totalBars']} (Downbeats)")
    print(f" Tempo stability:  {result['tempoStability']}%")
    print(f"=======================================================\n")

    base_name = os.path.splitext(audio_path)[0]

    # Standard JSON Export wenn nicht anders angegeben
    out_json = args.export_json or f"{base_name}_beat_this.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"[OK] JSON saved: {out_json}")

    # DaVinci Resolve Marker-JSON (fuer resolve/BeatAnalyzer_Markers.lua)
    out_resolve = args.export_resolve or f"{base_name}_resolve_markers.json"
    with open(out_resolve, "w", encoding="utf-8") as f:
        json.dump(resolve_marker_data(result, args.only_downbeats), f, indent=2, ensure_ascii=False)
    print(f"[OK] DaVinci Resolve marker JSON saved: {out_resolve}")

    if args.export_audacity:
        with open(args.export_audacity, "w", encoding="utf-8") as f:
            for b in result["beats"]:
                label = f"[Bar {b['barIndex']}] {b['beatInBar']}" if b["isDownbeat"] else f"{b['barIndex']}.{b['beatInBar']}"
                f.write(f"{b['time']:.6f}\t{b['time']:.6f}\t{label}\n")
        print(f"[OK] Audacity labels saved: {args.export_audacity}")

    if args.export_csv:
        with open(args.export_csv, "w", encoding="utf-8") as f:
            f.write("ID,Time_Sec,Bar,Beat,Is_Downbeat,BPM,Delta_MS\n")
            for b in result["beats"]:
                f.write(f"{b['id']},{b['time']:.3f},{b['barIndex']},{b['beatInBar']},{1 if b['isDownbeat'] else 0},{b['instantBpm']},{b['deltaMs']}\n")
        print(f"[OK] CSV saved: {args.export_csv}")


if __name__ == "__main__":
    main()

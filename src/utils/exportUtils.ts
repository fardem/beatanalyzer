import { AnalysisResult } from '../types/analyzer';

/**
 * Export utilities for Beat & Downbeat tracking results:
 * - Audacity Label Track (.txt)
 * - CPJKU beat_this compatible JSON
 * - CSV Table
 * - Standard MIDI Click Track (.mid)
 */

export function generateAudacityLabels(result: AnalysisResult, options: ResolveMarkerOptions = {}): string {
  const lines: string[] = [];
  result.beats.forEach((b) => {
    const label = b.isDownbeat ? `[Bar ${b.barIndex}] ${b.beatInBar}` : `${b.barIndex}.${b.beatInBar}`;
    lines.push(`${b.time.toFixed(6)}\t${b.time.toFixed(6)}\t${label}`);
  });
  // cue marks and section changes as own labels at the same time
  (options.cues ?? []).forEach((time, k) => lines.push(`${time.toFixed(6)}\t${time.toFixed(6)}\tCue ${k + 1}`));
  for (const s of options.sections ?? []) {
    const arrow = s.kind === 'up' ? '▲' : s.kind === 'down' ? '▼' : '◆';
    const name = s.label ? `Section ${s.label}` : 'Section';
    lines.push(`${s.time.toFixed(6)}\t${s.time.toFixed(6)}\t${name} ${arrow} ${s.delta > 0 ? '+' : ''}${s.delta.toFixed(0)} dB`);
  }
  return lines.join('\n');
}

export const MD_BEAT_THIS_ATTRIBUTION =
  'Masked Diffusion (md_beat_this) by Francesco Foscarin, Filip Korzeniowski, Richard Vogl (https://github.com/fosfrancesco/md_beat_this) — Licensed under CC BY-NC 4.0 (Non-Commercial Use Only).';

export function generateBeatThisJson(result: AnalysisResult): string {
  const isMdBeatThis = result.engineInfo?.id === 'md_beat_this';
  const exportData = {
    generator: isMdBeatThis
      ? 'BeatAnalyzer (fosfrancesco/md_beat_this · CC BY-NC 4.0)'
      : 'CPJKU/beat_this Web Analyzer',
    ...(isMdBeatThis
      ? {
          license: result.license ?? 'CC BY-NC 4.0',
          attribution: result.attribution ?? MD_BEAT_THIS_ATTRIBUTION,
        }
      : {}),
    metadata: {
      file_name: result.metadata.fileName,
      format: result.metadata.format,
      duration_seconds: result.metadata.duration,
      sample_rate: result.metadata.sampleRate,
    },
    tempo: {
      global_bpm: result.globalBpm,
      average_bpm: result.averageBpm,
      median_bpm: result.medianBpm,
      min_bpm: result.minBpm,
      max_bpm: result.maxBpm,
      stability_percent: result.tempoStability,
    },
    meter: {
      time_signature: result.timeSignature.name,
      numerator: result.timeSignature.numerator,
      denominator: result.timeSignature.denominator,
      bar_share_percent: result.timeSignature.barShare,
    },
    counts: {
      total_beats: result.totalBeats,
      total_bars: result.totalBars,
    },
    beats: result.beats.map((b) => b.time),
    downbeats: result.downbeats.map((b) => b.time),
    beat_details: result.beats.map((b) => ({
      id: b.id,
      time: b.time,
      bar: b.barIndex,
      beat_in_bar: b.beatInBar,
      is_downbeat: b.isDownbeat,
      confidence: b.confidence,
      instant_bpm: b.instantBpm,
      delta_ms: b.deltaMs,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function generateCsv(result: AnalysisResult): string {
  const headers = ['ID', 'Timestamp_Sec', 'Bar', 'Beat_In_Bar', 'Is_Downbeat', 'BPM', 'Interval_MS', 'Confidence'];
  const rows = result.beats.map((b) => [
    b.id,
    b.time.toFixed(3),
    b.barIndex,
    b.beatInBar,
    b.isDownbeat ? 1 : 0,
    b.instantBpm.toFixed(1),
    b.deltaMs,
    b.confidence === null ? '' : b.confidence.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Creates a standard Type 0 MIDI file with high/low woodblock clicks for beats
 */
export function generateMidiClickBlob(result: AnalysisResult): Blob {
  const bytes = generateMidiBytes(result);
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/midi' });
}

const PPQ = 480;

function tempoEvent(events: number[], usPerQuarter: number) {
  const us = Math.max(1, Math.min(0xffffff, Math.round(usPerQuarter)));
  events.push(0xff, 0x51, 0x03, (us >> 16) & 0xff, (us >> 8) & 0xff, us & 0xff);
}

/**
 * MIDI click track (format 0, 480 ticks per quarter) with a tempo map: every beat sits on a whole quarter, and a
 * tempo event before each beat gives the length of the gap to the next one – so in a DAW the clicks lie exactly on
 * the song's beats (< 1 ms) and its bars follow the song, also when the tempo wobbles or changes. The stretch from 0
 * to the first beat becomes a lead-in of whole quarters, as many that the first "1" falls on a bar line and the
 * lead-in tempo is as close as possible to the song's tempo.
 */
export function generateMidiBytes(result: AnalysisResult): Uint8Array {
  const beats = [...result.beats].sort((a, b) => a.time - b.time);
  const meter = Math.max(1, result.timeSignature.numerator || 4);
  const events: number[] = [];
  let tick = 0;
  const at = (target: number) => {
    writeVarLength(events, Math.max(0, target - tick));
    tick = Math.max(tick, target);
  };

  // lead-in: n quarters with n ≡ meter − pickup (mod meter), tempo nearest to the song's
  const t0 = beats.length ? Math.max(0, beats[0].time) : 0;
  const pickup = Math.max(0, beats.findIndex((b) => b.isDownbeat));
  const base = (meter - (pickup % meter)) % meter;
  let lead = base;
  if (t0 > 0.001) {
    const target = result.globalBpm > 0 ? result.globalBpm : 120;
    let best = Infinity;
    for (let j = 0; j < 64; j++) {
      const n = base + j * meter;
      if (n < 1) continue;
      const diff = Math.abs((60 * n) / t0 - target);
      if (diff < best) {
        best = diff;
        lead = n;
      }
    }
  }
  at(0);
  if (lead > 0) tempoEvent(events, (t0 * 1e6) / lead);
  else tempoEvent(events, 60e6 / (result.globalBpm > 0 ? result.globalBpm : 120));
  const denPow = Math.round(Math.log2(result.timeSignature.denominator || 4));
  at(0);
  events.push(0xff, 0x58, 0x04, meter, denPow, 24, 8);

  beats.forEach((b, k) => {
    const beatTick = (lead + k) * PPQ;
    const next = beats[k + 1] ?? null;
    const prev = beats[k - 1] ?? null;
    const gap = next ? next.time - b.time : prev ? b.time - prev.time : 60 / (result.globalBpm || 120);
    at(beatTick);
    tempoEvent(events, gap * 1e6);
    const pitch = b.isDownbeat ? 76 : 77;   // woodblock high / low (GM percussion, channel 10)
    at(beatTick);
    events.push(0x99, pitch, b.isDownbeat ? 120 : 90);
    at(beatTick + 30);
    events.push(0x89, pitch, 0);
  });

  at(tick);
  events.push(0xff, 0x2f, 0x00);

  const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (PPQ >> 8) & 0xff, PPQ & 0xff];
  const len = events.length;
  const trackHeader = [0x4d, 0x54, 0x72, 0x6b, (len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff];
  return new Uint8Array([...header, ...trackHeader, ...events]);
}

export const RESOLVE_MARKER_FORMAT = 'beatthis-resolve-markers/1';

export interface ResolveMarkerOptions {
  onlyDownbeats?: boolean;
  /** cue marks set while listening (times of the beats they sit on) */
  cues?: number[];
  /** section changes of the song structure (on their "1"), without the start of the song */
  sections?: { time: number; kind: 'up' | 'down' | 'change'; delta: number; label?: string }[];
}

/** index of the beat at `time` (within 1 ms), or -1 */
function beatIndexAt(beats: { time: number }[], time: number): number {
  let best = -1;
  let bestD = 0.001;
  beats.forEach((b, i) => {
    const d = Math.abs(b.time - time);
    if (d <= bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/**
 * Marker JSON for resolve/BeatAnalyzer_Markers.lua.
 * Times in seconds from the start of the audio file; the script converts them to frames with the frame rate of the clip.
 */
export function generateResolveMarkerJson(
  result: AnalysisResult,
  options: ResolveMarkerOptions = {}
): string {
  const isMdBeatThis = result.engineInfo?.id === 'md_beat_this';
  // cue marks and section changes go onto the marker of their beat (Resolve keeps one marker per frame)
  const cueAt = new Map<number, number>();
  (options.cues ?? []).forEach((time, k) => {
    const i = beatIndexAt(result.beats, time);
    if (i >= 0 && !cueAt.has(i)) cueAt.set(i, k + 1);
  });
  const sectionAt = new Map<number, { kind: string; delta: number; label?: string }>();
  for (const s of options.sections ?? []) {
    const i = beatIndexAt(result.beats, s.time);
    if (i >= 0) sectionAt.set(i, s);
  }
  const indexed = result.beats.map((b, i) => ({ b, i }));
  const beats = options.onlyDownbeats
    ? indexed.filter(({ b, i }) => b.isDownbeat || cueAt.has(i) || sectionAt.has(i))
    : indexed;
  const data = {
    format: RESOLVE_MARKER_FORMAT,
    fileName: result.metadata.fileName,
    duration: result.metadata.duration,
    globalBpm: result.globalBpm,
    timeSignature: result.timeSignature.name,
    markers: beats.map(({ b, i }) => ({
      time: b.time,
      type: b.isDownbeat ? 'downbeat' : 'beat',
      bar: b.barIndex,
      beat: b.beatInBar,
      bpm: b.instantBpm,
      confidence: b.confidence,
      ...(cueAt.has(i) ? { cue: cueAt.get(i) } : {}),
      ...(sectionAt.has(i)
        ? {
            section: sectionAt.get(i)!.kind,
            sectionDelta: Math.round(sectionAt.get(i)!.delta * 10) / 10,
            ...(sectionAt.get(i)!.label ? { sectionLabel: sectionAt.get(i)!.label } : {}),
          }
        : {}),
    })),
    ...(result.engineInfo ? { engine: result.engineInfo } : {}),
    // seconds Resolve plays this MP3 later (Xing frame + encoder delay); the script moves the markers
    // also 0: the server checked the MP3 and Resolve plays it on time (without the field the script warns)
    ...(result.resolveOffset !== undefined && result.resolveOffset !== null ? { resolveOffset: result.resolveOffset } : {}),
    ...(isMdBeatThis
      ? {
          license: result.license ?? 'CC BY-NC 4.0',
          attribution: result.attribution ?? MD_BEAT_THIS_ATTRIBUTION,
        }
      : {}),
  };
  return JSON.stringify(data, null, 2);
}

function writeVarLength(arr: number[], value: number) {
  let buffer = value & 0x7f;
  const bytes: number[] = [];
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  while (true) {
    arr.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
}

export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

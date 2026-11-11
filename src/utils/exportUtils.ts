import { AnalysisResult } from '../types/analyzer';

/**
 * Export utilities for Beat & Downbeat tracking results:
 * - Audacity Label Track (.txt)
 * - CPJKU beat_this compatible JSON
 * - CSV Table
 * - Standard MIDI Click Track (.mid)
 */

export function generateAudacityLabels(result: AnalysisResult): string {
  const lines: string[] = [];
  result.beats.forEach((b) => {
    const label = b.isDownbeat ? `[Bar ${b.barIndex}] ${b.beatInBar}` : `${b.barIndex}.${b.beatInBar}`;
    lines.push(`${b.time.toFixed(6)}\t${b.time.toFixed(6)}\t${label}`);
  });
  return lines.join('\n');
}

export function generateBeatThisJson(result: AnalysisResult): string {
  const exportData = {
    generator: 'CPJKU/beat_this Web Analyzer',
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
      swing_ratio_percent: result.swingRatio,
    },
    meter: {
      time_signature: result.timeSignature.name,
      numerator: result.timeSignature.numerator,
      denominator: result.timeSignature.denominator,
      confidence_percent: result.timeSignature.confidence,
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
    b.confidence.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Creates a standard Type 0 MIDI file with high/low woodblock clicks for beats
 */
export function generateMidiClickBlob(result: AnalysisResult): Blob {
  const ticksPerQuarter = 480;
  const bpm = Math.round(result.globalBpm);
  const microsecondsPerQuarter = Math.round(60000000 / bpm);

  const trackEvents: number[] = [];

  // Set Tempo Meta Event (delta 0, FF 51 03 tt tt tt)
  trackEvents.push(0x00, 0xff, 0x51, 0x03);
  trackEvents.push((microsecondsPerQuarter >> 16) & 0xff);
  trackEvents.push((microsecondsPerQuarter >> 8) & 0xff);
  trackEvents.push(microsecondsPerQuarter & 0xff);

  // Time Signature Meta Event (delta 0, FF 58 04 nn dd cc bb)
  const num = result.timeSignature.numerator;
  const denPow = Math.log2(result.timeSignature.denominator);
  trackEvents.push(0x00, 0xff, 0x58, 0x04, num, denPow, 24, 8);

  let lastTick = 0;

  result.beats.forEach((b) => {
    // Calculate tick from timestamp
    const currentTick = Math.round(b.time * (bpm / 60) * ticksPerQuarter);
    const deltaTicks = Math.max(0, currentTick - lastTick);
    lastTick = currentTick;

    // Woodblock pitch: 76 for Downbeat, 77 for other beats (General MIDI Percussion channel 10 or standard note)
    const pitch = b.isDownbeat ? 76 : 77;
    const velocity = b.isDownbeat ? 120 : 90;

    // Delta time encoded as variable length quantity
    writeVarLength(trackEvents, deltaTicks);
    // Note On channel 9 (percussion 0x99) or channel 0 (0x90)
    trackEvents.push(0x99, pitch, velocity);

    // Note Off 30 ticks later
    writeVarLength(trackEvents, 30);
    trackEvents.push(0x89, pitch, 0);

    lastTick += 30;
  });

  // End of Track Meta Event (delta 0, FF 2F 00)
  trackEvents.push(0x00, 0xff, 0x2f, 0x00);

  // Header chunk (MThd, 6 bytes, format 0, 1 track, ticksPerQuarter)
  const header = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // length 6
    0x00, 0x00,             // format 0
    0x00, 0x01,             // 1 track
    (ticksPerQuarter >> 8) & 0xff,
    ticksPerQuarter & 0xff,
  ];

  // Track chunk (MTrk, length, data)
  const trackLength = trackEvents.length;
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff,
  ];

  const fullMidi = new Uint8Array([...header, ...trackHeader, ...trackEvents]);
  return new Blob([fullMidi], { type: 'audio/midi' });
}

export const RESOLVE_MARKER_FORMAT = 'beatthis-resolve-markers/1';

export interface ResolveMarkerOptions {
  onlyDownbeats?: boolean;
}

/**
 * Marker-JSON für resolve/BeatThis_Markers.lua.
 * Zeiten in Sekunden ab Anfang der Audiodatei; das Skript rechnet sie mit der Bildrate des Clips in Frames um.
 */
export function generateResolveMarkerJson(
  result: AnalysisResult,
  options: ResolveMarkerOptions = {}
): string {
  const beats = options.onlyDownbeats ? result.beats.filter((b) => b.isDownbeat) : result.beats;
  const data = {
    format: RESOLVE_MARKER_FORMAT,
    fileName: result.metadata.fileName,
    duration: result.metadata.duration,
    globalBpm: result.globalBpm,
    timeSignature: result.timeSignature.name,
    markers: beats.map((b) => ({
      time: b.time,
      type: b.isDownbeat ? 'downbeat' : 'beat',
      bar: b.barIndex,
      beat: b.beatInBar,
      bpm: b.instantBpm,
    })),
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

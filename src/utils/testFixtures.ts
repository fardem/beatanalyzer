// Test data for the unit tests of the web app (not used by the app itself).
import { AnalysisResult, BeatItem } from '../types/analyzer';
import { FoldCurves } from './fixSuggestion';
import { recomputeBeatStats } from './beatTransforms';

/** A steady song: `count` beats every `step` s from 0.5 s, a "1" every `meter` beats from `firstDown`. */
export function song(count = 32, meter = 4, firstDown = 0, step = 0.5): AnalysisResult {
  const beats: BeatItem[] = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    time: Math.round((0.5 + i * step) * 1000) / 1000,
    beatInBar: 1,
    barIndex: 1,
    isDownbeat: i >= firstDown && (i - firstDown) % meter === 0,
    confidence: 0.9,
    instantBpm: 60 / step,
    deltaMs: step * 1000,
  }));
  const duration = 0.5 + count * step;
  const raw: AnalysisResult = {
    metadata: { fileName: 'song.wav', fileSize: 1, duration, sampleRate: 44100, channels: 2, format: 'WAV' },
    beats,
    downbeats: beats.filter((b) => b.isDownbeat),
    globalBpm: 60 / step,
    averageBpm: 60 / step,
    medianBpm: 60 / step,
    minBpm: 60 / step,
    maxBpm: 60 / step,
    tempoStability: 100,
    timeSignature: { numerator: meter, denominator: 4, name: `${meter}/4`, barShare: 100 },
    swingRatio: 50,
    totalBeats: count,
    totalBars: beats.filter((b) => b.isDownbeat).length,
    activationCurve: [],
    waveformPeaks: new Float32Array(0),
    waveformDuration: duration,
  };
  return recomputeBeatStats(raw, beats);   // bar numbers as the app counts them
}

/** Band curves with a short hit (decaying over 40 ms) at the given times: kicks in the low band, snares in the mid. */
export function curves(duration: number, kicks: number[], snares: number[], hats: number[] = []): FoldCurves {
  const frameRate = 100;
  const n = Math.ceil(duration * frameRate) + 1;
  const make = (times: number[]) => {
    const a = new Float32Array(n);
    for (const t of times) {
      const f = Math.round(t * frameRate);
      for (let d = 0; d < 4 && f + d < n; d++) a[f + d] = Math.max(a[f + d], 1 - d * 0.25);
    }
    return a;
  };
  return { frameRate, foldLow: make(kicks), foldMid: make(snares), foldHigh: make(hats) };
}

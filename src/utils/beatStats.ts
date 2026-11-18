import { BeatItem } from '../types/analyzer';

/**
 * How much the beat intervals wobble: standard deviation of the intervals in ms. Intervals more than 25 % away from
 * the median (a missing beat, a real tempo change) are left out – they say nothing about the evenness of the grid.
 * Below ~10 ms the markers sit frame-exact in a 25/30 fps timeline. null with fewer than 8 intervals.
 */
export function intervalJitterMs(beats: BeatItem[]): number | null {
  const times = beats.map((b) => b.time).sort((a, b) => a - b);
  const iv: number[] = [];
  for (let i = 1; i < times.length; i++) iv.push(times[i] - times[i - 1]);
  if (iv.length < 8) return null;
  const sorted = [...iv].sort((a, b) => a - b);
  const median = sorted[sorted.length >> 1];
  const kept = iv.filter((d) => Math.abs(d - median) <= 0.25 * median);
  if (kept.length < 8) return null;
  const mean = kept.reduce((a, b) => a + b, 0) / kept.length;
  const variance = kept.reduce((a, d) => a + (d - mean) * (d - mean), 0) / kept.length;
  return Math.round(Math.sqrt(variance) * 10000) / 10;   // ms, one decimal
}

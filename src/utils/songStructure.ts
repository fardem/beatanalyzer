import { BeatItem } from '../types/analyzer';

/**
 * Song structure for cutters: where does the song change (intro, verse, chorus, drop, break)? Computed from the
 * band levels (low / mid / high) per bar; a section change always lies on a "1", because a cut on a section change
 * sits on a downbeat.
 *
 * Method: level of each band per bar in dB; at every bar start the bars before and after are compared (mean of up to
 * PHRASE bars each side). Big differences are section changes; the strongest are kept with at least MIN_BARS bars
 * between them. Bar starts on the 4-bar phrase grid of the song get a small bonus (most pop and dance music changes
 * every 4, 8 or 16 bars).
 */

export type SectionKind = 'start' | 'up' | 'down' | 'change';

export interface SongSection {
  /** bar number (BeatItem.barIndex) of the first bar */
  bar: number;
  /** time of its "1" in seconds */
  time: number;
  end: number;
  bars: number;
  /** mean level in dB relative to the loudest section (0 = loudest, negative = quieter) */
  level: number;
  /** level difference to the section before in dB */
  delta: number;
  kind: SectionKind;
}

export interface SongStructure {
  /** one entry per bar: start time, bar number, level relative to the loudest bar (dB) */
  bars: { time: number; end: number; bar: number; level: number; low: number; mid: number; high: number }[];
  sections: SongSection[];
}

const PHRASE = 4;      // bars compared on each side of a candidate
const MIN_BARS = 4;    // shortest section
const MIN_NOVELTY = 2.5; // dB: smaller differences are no section change
const UP_DOWN_DB = 3;  // level step that counts as "energy up / down"
const FLOOR_DB = -60;

const toDb = (v: number) => Math.max(FLOOR_DB, 20 * Math.log10(Math.max(1e-6, v)));

function meanRms(curve: Float32Array, frameRate: number, t0: number, t1: number): number {
  const a = Math.max(0, Math.floor(t0 * frameRate));
  const b = Math.min(curve.length, Math.max(a + 1, Math.floor(t1 * frameRate)));
  if (b <= a) return 0;
  let sum = 0;
  for (let i = a; i < b; i++) sum += curve[i] * curve[i];
  return Math.sqrt(sum / (b - a));
}

export function computeSongStructure(
  beats: BeatItem[],
  duration: number,
  frameRate: number,
  low: Float32Array,
  mid: Float32Array,
  high: Float32Array
): SongStructure | null {
  const downs = beats.filter((b) => b.isDownbeat);
  if (downs.length < MIN_BARS * 2) return null;

  // bar levels per band in dB, and the overall level (power sum of the bands)
  const raw = downs.map((d, i) => {
    const end = i + 1 < downs.length ? downs[i + 1].time : Math.min(duration, d.time + (d.time - downs[i - 1].time));
    const l = meanRms(low, frameRate, d.time, end);
    const m = meanRms(mid, frameRate, d.time, end);
    const h = meanRms(high, frameRate, d.time, end);
    return { time: d.time, end, bar: d.barIndex, low: toDb(l), mid: toDb(m), high: toDb(h), total: toDb(Math.sqrt(l * l + m * m + h * h)) };
  });
  const loudest = Math.max(...raw.map((r) => r.total));
  const bars = raw.map((r) => ({ time: r.time, end: r.end, bar: r.bar, level: r.total - loudest, low: r.low, mid: r.mid, high: r.high }));

  // novelty at each bar start: distance of the band levels before and after (dB, all bands)
  const n = raw.length;
  const novelty = new Float32Array(n);
  for (let i = 2; i <= n - 2; i++) {
    const w = Math.min(PHRASE, i, n - i);
    let dl = 0, dm = 0, dh = 0;
    for (let k = 0; k < w; k++) {
      dl += raw[i + k].low - raw[i - 1 - k].low;
      dm += raw[i + k].mid - raw[i - 1 - k].mid;
      dh += raw[i + k].high - raw[i - 1 - k].high;
    }
    // fewer bars on one side (song start / end): less trust
    const trust = w / PHRASE;
    novelty[i] = (Math.sqrt(dl * dl + dm * dm + dh * dh) / w / Math.sqrt(3)) * (0.6 + 0.4 * trust);
  }

  // the song's 4-bar phrase grid: the residue (bar index mod 4) where the changes are strongest
  const phaseScore = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) phaseScore[i % 4] += novelty[i];
  const phase = phaseScore.indexOf(Math.max(...phaseScore));
  const score = (i: number) => novelty[i] * (i % 4 === phase ? 1.15 : 1);

  // strongest changes first, at least MIN_BARS apart; at most about one per 12 s
  const maxSections = Math.max(1, Math.round(duration / 12));
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => score(b) - score(a));
  const cuts: number[] = [];
  for (const i of order) {
    if (novelty[i] < MIN_NOVELTY || cuts.length >= maxSections) break;
    if (i < MIN_BARS / 2 || n - i < MIN_BARS / 2) continue;
    if (cuts.some((c) => Math.abs(c - i) < MIN_BARS)) continue;
    cuts.push(i);
  }
  cuts.sort((a, b) => a - b);

  const starts = [0, ...cuts];
  const sections: SongSection[] = starts.map((s, k) => {
    const e = k + 1 < starts.length ? starts[k + 1] : n;
    let p = 0;
    for (let i = s; i < e; i++) p += Math.pow(10, bars[i].level / 10);
    const level = 10 * Math.log10(p / (e - s));
    return { bar: bars[s].bar, time: bars[s].time, end: bars[e - 1].end, bars: e - s, level, delta: 0, kind: 'start' as SectionKind };
  });
  for (let k = 1; k < sections.length; k++) {
    const d = sections[k].level - sections[k - 1].level;
    sections[k].delta = d;
    sections[k].kind = d >= UP_DOWN_DB ? 'up' : d <= -UP_DOWN_DB ? 'down' : 'change';
  }
  return { bars, sections };
}

/** Index of the beat nearest to `time`; with `downbeatsOnly` the nearest "1". -1 when there is none. */
export function nearestBeatIndex(beats: BeatItem[], time: number, downbeatsOnly = false): number {
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < beats.length; i++) {
    if (downbeatsOnly && !beats[i].isDownbeat) continue;
    const d = Math.abs(beats[i].time - time);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

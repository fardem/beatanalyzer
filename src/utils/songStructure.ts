import { BeatItem } from '../types/analyzer';
import { bandEvidence, getMonoSamples } from './beatEvidence';
import { FrameFeatures, frameFeatures, TIMBRE_COEFFS } from './dsp';

/**
 * Song structure for cutters: where does the song change (intro, verse, chorus, drop, break), and which parts come
 * back? A section change always lies on a "1", because a cut on a change sits on a downbeat.
 *
 * Method (standard in music information retrieval, applied to bars):
 * 1. Per bar three descriptions: chroma (which notes sound – chords, key), timbre (sound colour – instruments) and
 *    level (loudness of low / mid / high).
 * 2. Self-similarity of all bars with each other.
 * 3. Novelty along the diagonal with a checkerboard kernel (Foote): high where the bars before differ from the bars
 *    after. Peaks are section changes, at least MIN_BARS apart. The 4-bar phrase grid gets a small bonus only when
 *    the song clearly changes on it (else a 6-bar pre-chorus would be pushed off its place).
 * 4. Sections that resemble each other get the same letter (A, B, A …): "the chorus comes back".
 * The kind (▲ louder, ▼ quieter, ◆ different) still comes from the level step.
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
  /** letter of its material: the same letter = this part comes again (A, B, C …) */
  label: string;
}

export interface SongStructure {
  /** one entry per bar: start time, bar number, level relative to the loudest bar (dB) */
  bars: { time: number; end: number; bar: number; level: number; low: number; mid: number; high: number }[];
  sections: SongSection[];
}

export interface BarFeatures {
  times: number[];
  ends: number[];
  bars: number[];
  /** L2-normalised 12 pitch classes per bar */
  chroma: Float32Array[];
  /** timbre per bar, z-normalised over the song */
  timbre: Float32Array[];
  /** dB of low / mid / high per bar */
  level: Float32Array[];
}

const MIN_BARS = 4;          // shortest section; also the half width of the novelty kernel
const MIN_NOVELTY = 0.07;    // smaller changes are no section change
const UP_DOWN_DB = 3;        // level step that counts as "louder / quieter"
const SAME_PART = 0.9;       // similarity (relative to the parts' own coherence) for the same letter
const W_CHROMA = 0.45;
const W_TIMBRE = 0.35;
const W_LEVEL = 0.2;
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

const frameCache = new WeakMap<AudioBuffer, FrameFeatures>();

function framesOf(buffer: AudioBuffer): FrameFeatures {
  const cached = frameCache.get(buffer);
  if (cached) return cached;
  const f = frameFeatures(getMonoSamples(buffer), buffer.sampleRate);   // the mono copy of the band curves
  frameCache.set(buffer, f);
  return f;
}

/**
 * The three descriptions per bar (bar = downbeat to the next downbeat). The frame features are computed once per
 * audio file; a grid correction only changes the averaging over the bars. null with fewer than 8 bars.
 */
export function barFeatures(buffer: AudioBuffer, beats: BeatItem[]): BarFeatures | null {
  const downs = beats.filter((b) => b.isDownbeat).sort((a, b) => a.time - b.time);
  if (downs.length < MIN_BARS * 2) return null;
  const bands = bandEvidence(buffer);
  const frames = framesOf(buffer);
  // frame k spans two hops; its centre lies at (k + 1) · hop
  const firstFrame = (t: number) => Math.ceil(t / frames.hop - 1);

  const out: BarFeatures = { times: [], ends: [], bars: [], chroma: [], timbre: [], level: [] };
  downs.forEach((d, i) => {
    const end = i + 1 < downs.length ? downs[i + 1].time : Math.min(buffer.duration, d.time + (d.time - downs[i - 1].time));
    out.times.push(d.time);
    out.ends.push(end);
    out.bars.push(d.barIndex);
    out.level.push(
      Float32Array.from([
        toDb(meanRms(bands.lowBand, bands.frameRate, d.time, end)),
        toDb(meanRms(bands.midBand, bands.frameRate, d.time, end)),
        toDb(meanRms(bands.highBand, bands.frameRate, d.time, end)),
      ])
    );
    // frames whose centre lies in the bar
    const a = Math.max(0, firstFrame(d.time));
    const b = Math.min(frames.chroma.length, Math.max(a + 1, firstFrame(end)));
    const c = new Float32Array(12);
    const t = new Float32Array(TIMBRE_COEFFS);
    for (let k = a; k < b; k++) {
      for (let q = 0; q < 12; q++) c[q] += frames.chroma[k]?.[q] ?? 0;
      for (let q = 0; q < TIMBRE_COEFFS; q++) t[q] += (frames.timbre[k]?.[q] ?? 0) / (b - a);
    }
    const norm = Math.hypot(...c) || 1;
    out.chroma.push(c.map((v) => v / norm));
    out.timbre.push(t);
  });
  // timbre: z-normalise each coefficient over the song, so every coefficient counts the same
  for (let q = 0; q < TIMBRE_COEFFS; q++) {
    const vals = out.timbre.map((t) => t[q]);
    const mean = vals.reduce((x, y) => x + y, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((x, y) => x + (y - mean) ** 2, 0) / vals.length);
    for (const t of out.timbre) t[q] = sd > 1e-6 ? (t[q] - mean) / sd : 0;
  }
  return out;
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na < 1e-12 && nb < 1e-12) return 1;   // both without content: the same
  if (na < 1e-12 || nb < 1e-12) return 0;
  return dot / Math.sqrt(na * nb);
}

/** similarity of two bars, 0 … 1 */
function similarity(f: BarFeatures, i: number, j: number): number {
  const chroma = cosine(f.chroma[i], f.chroma[j]);
  const timbre = (cosine(f.timbre[i], f.timbre[j]) + 1) / 2;
  let d = 0;
  for (let q = 0; q < 3; q++) d += (f.level[i][q] - f.level[j][q]) ** 2;
  const level = Math.exp(-Math.sqrt(d) / 6);
  return W_CHROMA * chroma + W_TIMBRE * timbre + W_LEVEL * level;
}

export function computeSongStructure(f: BarFeatures, duration: number): SongStructure | null {
  const n = f.times.length;
  if (n < MIN_BARS * 2) return null;

  const total = f.level.map((l) => toDb(Math.sqrt(l.reduce((s, db) => s + 10 ** (db / 10), 0))));
  const loudest = Math.max(...total);
  const bars = f.times.map((time, i) => ({
    time,
    end: f.ends[i],
    bar: f.bars[i],
    level: total[i] - loudest,
    low: f.level[i][0],
    mid: f.level[i][1],
    high: f.level[i][2],
  }));

  const S: Float32Array[] = Array.from({ length: n }, () => new Float32Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const v = similarity(f, i, j);
      S[i][j] = v;
      S[j][i] = v;
    }
  }

  // novelty at the start of bar i: checkerboard kernel, gaussian taper, half width MIN_BARS
  const L = MIN_BARS;
  const w = (k: number) => Math.exp(-0.5 * ((k + 0.5) / (L * 0.6)) ** 2);
  const novelty = new Float32Array(n);
  for (let i = 2; i <= n - 2; i++) {
    // weighted mean similarity within each side minus across the boundary (the kernel would otherwise weigh the
    // cross pairs more, because the diagonal of each side is left out)
    let within = 0;
    let wWithin = 0;
    let cross = 0;
    let wCross = 0;
    for (let a = -L; a < L; a++) {
      for (let b = -L; b < L; b++) {
        const x = i + a;
        const y = i + b;
        if (x < 0 || y < 0 || x >= n || y >= n || a === b) continue;
        const wt = w(a < 0 ? -a - 1 : a) * w(b < 0 ? -b - 1 : b);
        if ((a < 0) === (b < 0)) {
          within += wt * S[x][y];
          wWithin += wt;
        } else {
          cross += wt * S[x][y];
          wCross += wt;
        }
      }
    }
    novelty[i] = wWithin > 0 && wCross > 0 ? within / wWithin - cross / wCross : 0;
  }

  // phrase grid bonus only when the strongest changes clearly prefer one position in 4 bars
  const phaseScore = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) if (novelty[i] >= MIN_NOVELTY) phaseScore[i % 4] += novelty[i];
  const phaseTotal = phaseScore.reduce((a, b) => a + b, 0);
  const phase = phaseScore.indexOf(Math.max(...phaseScore));
  const usePhase = phaseTotal > 0 && phaseScore[phase] / phaseTotal > 0.6;
  const score = (i: number) => novelty[i] * (usePhase && i % 4 === phase ? 1.15 : 1);

  // threshold relative to the song: a busy song changes a little everywhere, only clear peaks count
  let mean = 0;
  for (let i = 2; i <= n - 2; i++) mean += novelty[i];
  mean /= Math.max(1, n - 3);
  let sd = 0;
  for (let i = 2; i <= n - 2; i++) sd += (novelty[i] - mean) ** 2;
  sd = Math.sqrt(sd / Math.max(1, n - 3));
  const threshold = Math.max(MIN_NOVELTY, mean + sd);

  // strongest changes first (local maxima), at least MIN_BARS apart; at most about one per 20 s
  const maxSections = Math.max(1, Math.round(duration / 20));
  const isPeak = (i: number) => novelty[i] >= novelty[i - 1] && novelty[i] >= (i + 1 < n ? novelty[i + 1] : 0);
  const order = Array.from({ length: n }, (_, i) => i)
    .filter((i) => i >= 2 && i <= n - 2 && isPeak(i))
    .sort((a, b) => score(b) - score(a));
  const cuts: number[] = [];
  for (const i of order) {
    if (novelty[i] < threshold || cuts.length >= maxSections) break;
    if (cuts.some((c) => Math.abs(c - i) < MIN_BARS)) continue;
    cuts.push(i);
  }
  cuts.sort((a, b) => a - b);

  const starts = [0, ...cuts];
  const ranges = starts.map((s, k) => [s, k + 1 < starts.length ? starts[k + 1] : n] as const);
  const sections: SongSection[] = ranges.map(([s, e]) => {
    let p = 0;
    for (let i = s; i < e; i++) p += 10 ** (bars[i].level / 10);
    const level = 10 * Math.log10(p / (e - s));
    return { bar: bars[s].bar, time: bars[s].time, end: bars[e - 1].end, bars: e - s, level, delta: 0, kind: 'start', label: '' };
  });
  for (let k = 1; k < sections.length; k++) {
    const d = sections[k].level - sections[k - 1].level;
    sections[k].delta = d;
    sections[k].kind = d >= UP_DOWN_DB ? 'up' : d <= -UP_DOWN_DB ? 'down' : 'change';
  }

  // letters: a section takes the letter of the most similar earlier part, if it is similar enough
  const block = (a: readonly [number, number], b: readonly [number, number]) => {
    let s = 0;
    let c = 0;
    for (let i = a[0]; i < a[1]; i++) for (let j = b[0]; j < b[1]; j++) {
      s += S[i][j];
      c++;
    }
    return c ? s / c : 0;
  };
  const self = ranges.map((r) => block(r, r));
  let next = 0;
  sections.forEach((sec, k) => {
    let best = -1;
    let bestSim = 0;
    for (let m = 0; m < k; m++) {
      const rel = block(ranges[k], ranges[m]) / Math.sqrt(self[k] * self[m] || 1);
      if (rel > bestSim) {
        bestSim = rel;
        best = m;
      }
    }
    sec.label = best >= 0 && bestSim >= SAME_PART ? sections[best].label : String.fromCharCode(65 + (next++ % 26));
  });

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

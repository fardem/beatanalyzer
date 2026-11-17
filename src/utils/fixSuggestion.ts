import { AnalysisResult } from '../types/analyzer';
import { computeFoldedBar, FoldedBarData } from './beatEvidence';
import { applyGridOps, GridOp, TimeRange } from './beatTransforms';

/** Band curves the folded bar is built from (see bandEvidence in beatEvidence.ts). */
export interface FoldCurves {
  frameRate: number;
  foldLow: Float32Array;
  foldMid: Float32Array;
  foldHigh: Float32Array;
}

export interface FixSuggestion {
  /** steps to apply (empty: the grid already looks right) */
  ops: GridOp[];
  score: number;
  baseScore: number;
  /** folded bar after the steps – drawn as a dashed preview */
  preview: FoldedBarData;
}

const MIN_BARS = 4;
const STEP_COST = 0.04;      // each extra step must earn its place: simple fixes win a tie
const MIN_GAIN = 0.12;       // suggest only when clearly better than now
const MIN_SCORE = 0.15;
const PHASE_WEIGHT = 1.2;   // beats on the attacks matter more than where the kick falls in the bar

/**
 * How well a folded bar fits a "normal" groove: the beats on the attacks (all bands), the kick (low band) on the
 * "1", in 4/4 the snare (mid band) on 2 and 4. null when there is too little to judge (few bars, no kick pattern).
 */
export function scoreFold(fb: FoldedBarData): number | null {
  if (fb.barCount < MIN_BARS) return null;
  const low = fb.beatLowAvg;
  const mid = fb.beatMidAvg;
  const n = low.length;
  const maxLow = Math.max(...low);
  if (n < 2 || maxLow < 0.05) return null;
  // kick on every beat (four on the floor) or no kick: the folded bar cannot tell where the "1" is
  if ((maxLow - Math.min(...low)) / maxLow < 0.15) return null;
  const restLow = low.slice(1).reduce((a, v) => a + v, 0) / (n - 1);
  const kickOnOne = (low[0] - restLow) / maxLow;

  // phase: are the beats on the attacks or between them? All three bands, in a small window around the beat and
  // around the off-beat (a grid 10–15 ms behind the attack would miss a single bin). The kick band alone cannot tell:
  // in many songs the bass plays strongly on the "and" ("Mensch": the half-beat grid looked better by the kick).
  const bins = fb.binsPerBeat;
  const total = n * bins;
  const half = Math.floor(bins / 2);
  const around = (arr: Float32Array, c: number) =>
    Math.max(arr[(c - 1 + total) % total], arr[c % total], arr[(c + 1) % total]);
  let on = 0;
  let off = 0;
  for (const arr of [fb.low, fb.mid, fb.high]) {
    for (let k = 0; k < n; k++) {
      on += around(arr, k * bins);
      off += around(arr, k * bins + half);
    }
  }
  const phase = (on - off) / Math.max(on, off, 1e-6);

  let backbeat = 0;
  if (n === 4) {
    const maxMid = Math.max(...mid, 1e-6);
    backbeat = (mid[1] + mid[3] - mid[0] - mid[2]) / (2 * maxMid);
  }
  return kickOnOne + 0.35 * backbeat + PHASE_WEIGHT * phase;
}

function fold(result: AnalysisResult, curves: FoldCurves, range: TimeRange | null): FoldedBarData {
  return computeFoldedBar(
    result.beats,
    result.timeSignature.numerator || 4,
    curves.frameRate,
    curves.foldLow,
    curves.foldMid,
    curves.foldHigh,
    range
  );
}

/** Analysis without a model (librosa or the browser): onset strength instead of model probabilities. */
function isFallback(result: AnalysisResult): boolean {
  return result.activationSource === 'onset' || result.engineInfo?.id === 'librosa' || !result.engineInfo;
}

const COMMON_BPM: [number, number] = [70, 150];
const COMMON_BONUS = 0.15;
const inCommon = (bpm: number) => bpm >= COMMON_BPM[0] && bpm <= COMMON_BPM[1];

/** Candidate step lists: tempo (only where plausible), beats per bar, half beat, bar start. */
export function candidateOps(result: AnalysisResult, range: TimeRange | null): GridOp[][] {
  const withRange = <T extends GridOp>(op: T): T => (range ? { ...op, range } : op);
  const bpm = result.globalBpm || 120;
  const fallback = isFallback(result);
  // tempo steps only where a tempo error is likely: librosa / browser analyses often count double or half; with
  // beat_this only extreme values (the folded bar cannot tell double from normal tempo reliably)
  const tempos: (0.5 | 2 | null)[] = [null];
  if ((fallback && bpm >= 120) || bpm > 160) tempos.push(0.5);
  if ((fallback && bpm <= 80) || bpm < 60) tempos.push(2);
  const current = result.timeSignature.numerator || 4;
  const meters = Array.from(new Set([current, 4, 3]));
  const out: GridOp[][] = [];
  for (const tempo of tempos) {
    for (const meter of meters) {
      for (const halfShift of [0, 1, -1] as const) {
        for (let k = 0; k < meter; k++) {
          const ops: GridOp[] = [];
          if (tempo) ops.push(withRange({ kind: 'tempo', factor: tempo }));
          if (meter !== current) ops.push(withRange({ kind: 'meter', beats: meter }));
          if (halfShift) ops.push(withRange({ kind: 'half', dir: halfShift }));
          // bar start: k beats later, or (n − k) earlier when that is fewer steps
          const later = k <= meter / 2;
          for (let i = 0; i < (later ? k : meter - k); i++) ops.push(withRange({ kind: 'downbeat', dir: later ? 1 : -1 }));
          out.push(ops);
        }
      }
    }
  }
  return out;
}

/**
 * Tries the candidate fixes on the folded bar and returns the best one when it is clearly better than the grid as it
 * is; `ops` is empty when the grid already looks right. null when the song gives no clear kick pattern (four on the
 * floor, ballads, few bars) – then the user decides by ear.
 */
export function suggestFix(result: AnalysisResult, curves: FoldCurves, range: TimeRange | null): FixSuggestion | null {
  const baseFold = fold(result, curves, range);
  // an unclear fold can come from the grid itself (e.g. a 4/4 song in a 3/4 grid smears the kick over all beats):
  // then only a candidate with a clear pattern can be suggested
  const baseRaw = scoreFold(baseFold);
  const baseScore = baseRaw ?? 0;
  let best: FixSuggestion = { ops: [], score: baseScore, baseScore, preview: baseFold };
  let anyClear = baseRaw !== null;
  for (const ops of candidateOps(result, range)) {
    if (ops.length === 0) continue;
    const fixed = applyGridOps(result, ops);
    const preview = fold(fixed, curves, range);
    const raw = scoreFold(preview);
    if (raw === null) continue;
    anyClear = true;
    // librosa / browser: a tempo in the common range is more likely than double or half of it
    const bonus = isFallback(result) && !inCommon(result.globalBpm) && inCommon(fixed.globalBpm) ? COMMON_BONUS : 0;
    const score = raw + bonus - STEP_COST * ops.length;
    if (score > best.score) best = { ops, score, baseScore, preview };
  }
  if (!anyClear) return null;
  if (best.ops.length > 0 && (best.score - baseScore < MIN_GAIN || best.score < MIN_SCORE)) {
    if (baseRaw === null) return null;   // nothing clear now and no clear improvement: decide by ear
    return { ops: [], score: baseScore, baseScore, preview: baseFold };
  }
  return best;
}

import { AnalysisResult, BeatItem } from '../types/analyzer';

/**
 * Recomputes derived beat/bar/tempo metadata after any manual or 1-click grid edit,
 * keeping Waveform, MetricsCards, Folded Bar, BeatTable, Metronome, and Exports consistent.
 */
export function recomputeBeatStats(
  result: AnalysisResult,
  rawBeats: BeatItem[],
  options: { updateGlobalBpm?: boolean } = {}
): AnalysisResult {
  const meter = Math.max(2, result.timeSignature.numerator || 4);
  const sorted = [...rawBeats]
    .sort((a, b) => a.time - b.time)
    .map((b) => ({ ...b, time: Math.round(Math.max(0, b.time) * 1000) / 1000 }));

  const firstDownIdx = sorted.findIndex((b) => b.isDownbeat);
  let currentBar = 1;
  let posInBar = 1;

  const updatedBeats: BeatItem[] = sorted.map((b, i) => {
    if (b.isDownbeat && i > 0) {
      currentBar++;
    }

    let beatInBar: number;
    if (firstDownIdx > 0 && i < firstDownIdx) {
      beatInBar = Math.max(1, meter - (firstDownIdx - i) + 1);
    } else if (b.isDownbeat) {
      posInBar = 1;
      beatInBar = 1;
    } else {
      posInBar++;
      beatInBar = posInBar;
    }

    let deltaMs = 0;
    let instantBpm = b.instantBpm || result.globalBpm || 120;
    if (i > 0) {
      const dt = b.time - sorted[i - 1].time;
      deltaMs = Math.round(dt * 1000);
      if (dt > 0.14 && dt < 2.2) {
        instantBpm = Math.round((60 / dt) * 10) / 10;
      }
    } else if (sorted.length > 1) {
      const dt0 = sorted[1].time - b.time;
      if (dt0 > 0.14 && dt0 < 2.2) {
        instantBpm = Math.round((60 / dt0) * 10) / 10;
      }
    }

    return {
      ...b,
      id: i + 1,
      barIndex: currentBar,
      beatInBar,
      deltaMs,
      instantBpm,
    };
  });

  const downbeats = updatedBeats.filter((b) => b.isDownbeat);
  const validBpms = updatedBeats
    .slice(1)
    .map((b) => b.instantBpm)
    .filter((v) => Number.isFinite(v) && v >= 35 && v <= 260);

  const fallbackBpm = result.globalBpm || 120;
  const averageBpm =
    validBpms.length > 0
      ? Math.round((validBpms.reduce((acc, v) => acc + v, 0) / validBpms.length) * 10) / 10
      : fallbackBpm;
  const sortedBpms = [...validBpms].sort((a, b) => a - b);
  const medianBpm =
    sortedBpms.length > 0 ? sortedBpms[Math.floor(sortedBpms.length / 2)] : fallbackBpm;
  const minBpm = sortedBpms.length > 0 ? sortedBpms[0] : fallbackBpm;
  const maxBpm = sortedBpms.length > 0 ? sortedBpms[sortedBpms.length - 1] : fallbackBpm;

  const variance =
    validBpms.length > 0
      ? validBpms.reduce((acc, v) => acc + Math.pow(v - averageBpm, 2), 0) / validBpms.length
      : 0;
  const stdDev = Math.sqrt(variance);
  const tempoStability = Math.max(
    0,
    Math.min(100, Math.round(100 - (stdDev / (averageBpm || 1)) * 100))
  );

  // Recompute barShare (% of bars matching timeSignature.numerator)
  let barShare: number | null = null;
  if (downbeats.length >= 2) {
    const barCounts = new Map<number, number>();
    for (const b of updatedBeats) {
      barCounts.set(b.barIndex, (barCounts.get(b.barIndex) ?? 0) + 1);
    }
    const barKeys = Array.from(barCounts.keys()).sort((a, b) => a - b);
    // Exclude trailing/leading incomplete pickup bars if >2 bars exist
    const fullCandidates = barKeys.filter((barIdx, idx) => {
      if (idx === 0 && updatedBeats[0] && !updatedBeats[0].isDownbeat) return false;
      if (idx === barKeys.length - 1 && (barCounts.get(barIdx) ?? 0) < meter) return false;
      return true;
    });
    if (fullCandidates.length >= 1) {
      const matching = fullCandidates.filter((k) => barCounts.get(k) === meter).length;
      barShare = Math.round((matching / fullCandidates.length) * 100);
    }
  }

  return {
    ...result,
    beats: updatedBeats,
    downbeats,
    totalBeats: updatedBeats.length,
    totalBars: downbeats.length,
    globalBpm: options.updateGlobalBpm ? Math.round(medianBpm * 10) / 10 : result.globalBpm,
    averageBpm,
    medianBpm,
    minBpm,
    maxBpm,
    tempoStability,
    timeSignature: {
      ...result.timeSignature,
      barShare,
    },
  };
}

/**
 * Rotates the "1" (downbeat) by -1 beat (backward/earlier) or +1 beat (forward/later)
 * cyclically modulo meter, acting as exact inverses across bar lengths.
 */
export function shiftDownbeat(result: AnalysisResult, direction: -1 | 1): AnalysisResult {
  if (result.beats.length < 2) return result;
  const meter = Math.max(2, result.timeSignature.numerator || 4);
  const sorted = [...result.beats].sort((a, b) => a.time - b.time);

  if (direction === 1) {
    const firstDownIdx = sorted.findIndex((b) => b.isDownbeat);
    const nextDownFlags = sorted.map((_, i) => (i > 0 ? sorted[i - 1].isDownbeat : false));
    if (firstDownIdx < 0 || firstDownIdx + 1 >= meter || nextDownFlags.every((v) => !v)) {
      nextDownFlags[0] = true;
    }
    const nextBeats = sorted.map((b, i) => ({
      ...b,
      isDownbeat: nextDownFlags[i],
    }));
    return recomputeBeatStats(result, nextBeats);
  }

  // direction === -1: shift downbeat flags left by 1 beat
  const nextDownFlags = sorted.map((_, i) => (i + 1 < sorted.length ? sorted[i + 1].isDownbeat : false));
  let lastDownIdx = -1;
  for (let i = nextDownFlags.length - 1; i >= 0; i--) {
    if (nextDownFlags[i]) {
      lastDownIdx = i;
      break;
    }
  }
  if (lastDownIdx < 0) {
    nextDownFlags[Math.min(meter - 1, sorted.length - 1)] = true;
  } else if (lastDownIdx + meter < sorted.length) {
    nextDownFlags[lastDownIdx + meter] = true;
  }

  const nextBeats = sorted.map((b, i) => ({
    ...b,
    isDownbeat: nextDownFlags[i],
  }));

  return recomputeBeatStats(result, nextBeats);
}

/**
 * Shifts the entire beat grid by -0.5 or +0.5 beat interval (for tracks locked onto the off-beat "&").
 */
export function shiftGridHalfBeat(result: AnalysisResult, direction: -1 | 1 = 1): AnalysisResult {
  if (result.beats.length < 2) return result;
  const sorted = [...result.beats].sort((a, b) => a.time - b.time);
  const duration = result.metadata.duration || Infinity;
  const shifted: BeatItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    let nextTime: number;
    if (direction === 1) {
      if (i + 1 < sorted.length) {
        nextTime = (curr.time + sorted[i + 1].time) / 2;
      } else {
        const prevDt = curr.time - sorted[i - 1].time;
        nextTime = curr.time + prevDt * 0.5;
      }
      if (nextTime <= duration - 0.01) {
        shifted.push({
          ...curr,
          time: Math.round(nextTime * 1000) / 1000,
        });
      }
    } else {
      if (i > 0) {
        nextTime = (sorted[i - 1].time + curr.time) / 2;
      } else {
        const nextDt = sorted[1].time - curr.time;
        nextTime = curr.time - nextDt * 0.5;
      }
      if (nextTime >= 0) {
        shifted.push({
          ...curr,
          time: Math.round(nextTime * 1000) / 1000,
        });
      }
    }
  }

  if (shifted.length < 2) return result;
  return recomputeBeatStats(result, shifted);
}

/**
 * Converts beat grid to half-time (0.5x BPM) or double-time (2x BPM).
 */
export function scaleGridTempo(result: AnalysisResult, factor: 0.5 | 2): AnalysisResult {
  if (result.beats.length < 3) return result;
  const meter = Math.max(2, result.timeSignature.numerator || 4);
  const sorted = [...result.beats].sort((a, b) => a.time - b.time);
  const firstDownIdx = Math.max(0, sorted.findIndex((b) => b.isDownbeat));

  if (factor === 0.5) {
    const parity = firstDownIdx % 2;
    const kept = sorted.filter((_, i) => i % 2 === parity);
    if (kept.length < 2) return result;
    const firstKeptDown = Math.max(0, kept.findIndex((b) => b.isDownbeat));
    const remapped = kept.map((b, idx) => ({
      ...b,
      isDownbeat: idx >= firstKeptDown && (idx - firstKeptDown) % meter === 0,
    }));
    return recomputeBeatStats(result, remapped, { updateGlobalBpm: true });
  }

  // factor === 2: insert midpoints between all consecutive beats
  const doubled: BeatItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    doubled.push({ ...curr });
    if (i + 1 < sorted.length) {
      const next = sorted[i + 1];
      const midTime = Math.round(((curr.time + next.time) / 2) * 1000) / 1000;
      doubled.push({
        ...curr,
        time: midTime,
        isDownbeat: false,
      });
    }
  }

  const firstNewDown = Math.max(0, doubled.findIndex((b) => b.isDownbeat));
  const remapped = doubled.map((b, idx) => ({
    ...b,
    isDownbeat: idx >= firstNewDown && (idx - firstNewDown) % meter === 0,
  }));
  return recomputeBeatStats(result, remapped, { updateGlobalBpm: true });
}

/**
 * Sets the number of beats per bar (time signature correction). The first downbeat stays; from it every
 * `beatsPerBar`-th beat becomes a "1", also backwards into a pickup. Smoothing restarts are given up – the
 * user decides the bar length here.
 */
export function setBeatsPerBar(result: AnalysisResult, beatsPerBar: number): AnalysisResult {
  const n = Math.max(2, Math.min(12, Math.round(beatsPerBar)));
  if (result.beats.length < 2) return result;
  const sorted = [...result.beats].sort((a, b) => a.time - b.time);
  const first = Math.max(0, sorted.findIndex((b) => b.isDownbeat));
  const den = result.timeSignature.denominator || 4;
  const withMeter: AnalysisResult = {
    ...result,
    timeSignature: { ...result.timeSignature, numerator: n, denominator: den, name: `${n}/${den}` },
  };
  const beats = sorted.map((b, i) => ({ ...b, isDownbeat: (((i - first) % n) + n) % n === 0 }));
  return recomputeBeatStats(withMeter, beats);
}

/**
 * One step of a grid correction. The web app keeps the steps instead of results: after a re-analysis with other
 * smoothing (same beats, other bars) the same steps are applied to the new result, so no correction is lost; undo
 * drops the last step. Beat-table edits are steps too ("nudge", "toggle"); they find their beat by time.
 */
export interface TimeRange {
  start: number;
  end: number;
}

/** `range`: the step works only on the beats in this section (e.g. ½× only where the model counted double). */
export type GridOp =
  | { kind: 'downbeat'; dir: -1 | 1; range?: TimeRange }
  | { kind: 'half'; dir: -1 | 1; range?: TimeRange }
  | { kind: 'tempo'; factor: 0.5 | 2; range?: TimeRange }
  | { kind: 'meter'; beats: number; range?: TimeRange }
  | { kind: 'nudge'; time: number; to: number }
  | { kind: 'toggle'; time: number; downbeat: boolean }
  | { kind: 'insert'; time: number }
  | { kind: 'delete'; time: number };

const SAME_BEAT_S = 0.0015;   // beat times are rounded to 1 ms

function findBeat(beats: BeatItem[], time: number): number {
  let best = -1;
  let bestDt = SAME_BEAT_S;
  for (let i = 0; i < beats.length; i++) {
    const dt = Math.abs(beats[i].time - time);
    if (dt <= bestDt) {
      best = i;
      bestDt = dt;
    }
  }
  return best;
}

const RANGE_EPS = 0.001;
const MIN_GAP_S = 0.08;   // a beat moved or added at the edge of a section keeps this distance to the beats outside

/**
 * Applies a step only to the beats inside `range`: the inside beats are corrected as a song of their own and put
 * back between the untouched beats before and after; bars are counted again over the whole song.
 */
function applyInRange(result: AnalysisResult, op: GridOp & { range: TimeRange }): AnalysisResult {
  const { start, end } = op.range;
  const sorted = [...result.beats].sort((a, b) => a.time - b.time);
  const before = sorted.filter((b) => b.time < start - RANGE_EPS);
  const inside = sorted.filter((b) => b.time >= start - RANGE_EPS && b.time <= end + RANGE_EPS);
  const after = sorted.filter((b) => b.time > end + RANGE_EPS);
  if (inside.length < 2) return result;
  const section = recomputeBeatStats(result, inside);
  const whole = { ...op } as GridOp & { range?: TimeRange };
  delete whole.range;
  const fixed = applyGridOp(section, whole);
  const lo = before.length ? before[before.length - 1].time + MIN_GAP_S : -Infinity;
  const hi = after.length ? after[0].time - MIN_GAP_S : Infinity;
  const kept = fixed.beats.filter((b) => b.time >= lo && b.time <= hi);
  return recomputeBeatStats(result, [...before, ...kept, ...after]);
}

export function applyGridOp(result: AnalysisResult, op: GridOp): AnalysisResult {
  if (op.kind !== 'nudge' && op.kind !== 'toggle' && op.kind !== 'insert' && op.kind !== 'delete' && op.range) {
    return applyInRange(result, op as GridOp & { range: TimeRange });
  }
  switch (op.kind) {
    case 'downbeat':
      return shiftDownbeat(result, op.dir);
    case 'half':
      return shiftGridHalfBeat(result, op.dir);
    case 'tempo':
      return scaleGridTempo(result, op.factor);
    case 'meter':
      return setBeatsPerBar(result, op.beats);
    case 'insert':
      return insertBeat(result, op.time);
    case 'delete':
      return deleteBeat(result, op.time);
    case 'nudge':
    case 'toggle': {
      const idx = findBeat(result.beats, op.time);
      if (idx < 0) return result;   // the beat is gone (e.g. after ½× tempo): nothing to do
      const beats = result.beats.map((b, i) =>
        i !== idx
          ? b
          : op.kind === 'nudge'
          ? { ...b, time: Math.max(0, Math.round(op.to * 1000) / 1000) }
          : { ...b, isDownbeat: op.downbeat }
      );
      return recomputeBeatStats(result, beats);
    }
  }
}

const INSERT_MIN_GAP_S = 0.03;   // a new beat closer than this to an existing one is a double click, not a missing beat

/**
 * Adds a beat the model missed (e.g. in a break) at `time`: not a downbeat, no confidence; bars and tempo are
 * counted again, so the bar it lands in gets one beat more. Nothing happens next to an existing beat (< 30 ms).
 */
export function insertBeat(result: AnalysisResult, time: number): AnalysisResult {
  const t = Math.max(0, Math.round(time * 1000) / 1000);
  if (result.beats.some((b) => Math.abs(b.time - t) < INSERT_MIN_GAP_S)) return result;
  const beat: BeatItem = {
    id: 0,
    time: t,
    beatInBar: 1,
    barIndex: 1,
    isDownbeat: false,
    confidence: null,
    instantBpm: 0,
    deltaMs: 0,
  };
  return recomputeBeatStats(result, [...result.beats, beat].sort((a, b) => a.time - b.time));
}

/** Removes the beat at `time` (a beat set too much); at least 2 beats stay. Unknown time: unchanged. */
export function deleteBeat(result: AnalysisResult, time: number): AnalysisResult {
  if (result.beats.length <= 2) return result;
  const idx = findBeat(result.beats, time);
  if (idx < 0) return result;
  return recomputeBeatStats(result, result.beats.filter((_, i) => i !== idx));
}

export function applyGridOps(base: AnalysisResult, ops: GridOp[]): AnalysisResult {
  return ops.reduce(applyGridOp, base);
}

/** Steps for an edit of the beat table (same beats in the same order; changed time or downbeat flag). */
export function opsFromBeatEdit(prev: BeatItem[], next: BeatItem[]): GridOp[] {
  if (prev.length !== next.length) return [];
  const ops: GridOp[] = [];
  for (let i = 0; i < prev.length; i++) {
    if (next[i].time !== prev[i].time) ops.push({ kind: 'nudge', time: prev[i].time, to: next[i].time });
    if (next[i].isDownbeat !== prev[i].isDownbeat) {
      ops.push({ kind: 'toggle', time: next[i].time, downbeat: next[i].isDownbeat });
    }
  }
  return ops;
}

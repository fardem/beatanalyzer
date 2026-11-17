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

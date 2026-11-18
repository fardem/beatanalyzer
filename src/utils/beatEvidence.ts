import { AnalysisResult, BeatItem } from '../types/analyzer';
import { lowAndHigh } from './dsp';

export interface FoldedBarData {
  numerator: number;
  binsPerBeat: number;
  barCount: number;
  isWindowScoped: boolean;
  low: Float32Array;
  mid: Float32Array;
  high: Float32Array;
  beatLowAvg: number[];
  beatMidAvg: number[];
  verdict: 'ok' | 'shifted_backbeat' | 'shifted_offbeat' | 'flat' | 'insufficient';
  dominantBeat: number;
}

export interface TempoBin {
  bpm: number;
  count: number;
  smoothed: number;
}

export interface TempoHistogramData {
  minBpm: number;
  maxBpm: number;
  binWidth: number;
  bins: TempoBin[];
  primaryBpm: number;
  primarySharePct: number;
  secondaryBpm: number | null;
  secondarySharePct: number | null;
  halfTimeBpm: number;
  doubleTimeBpm: number;
  totalIntervals: number;
}

export interface BeatEvidenceData {
  duration: number;
  frameRate: number;
  lowBand: Float32Array;
  midBand: Float32Array;
  highBand: Float32Array;
  lowOnset: Float32Array;
  midOnset: Float32Array;
  highOnset: Float32Array;
  /** curves the folded bar is built from (72 % onset + 28 % energy), see bandEvidence() */
  foldLow: Float32Array;
  foldMid: Float32Array;
  foldHigh: Float32Array;
  foldedBar: FoldedBarData;
  tempoHistogram: TempoHistogramData;
}

const monoCache = new WeakMap<AudioBuffer, Float32Array>();

export function getMonoSamples(buffer: AudioBuffer): Float32Array {
  const cached = monoCache.get(buffer);
  if (cached) return cached;

  const len = buffer.length;
  const numChannels = buffer.numberOfChannels;
  const mono = new Float32Array(len);

  if (numChannels === 1) {
    mono.set(buffer.getChannelData(0));
  } else {
    for (let c = 0; c < numChannels; c++) {
      const ch = buffer.getChannelData(c);
      for (let i = 0; i < len; i++) {
        mono[i] += ch[i] / numChannels;
      }
    }
  }

  monoCache.set(buffer, mono);
  return mono;
}

function normalizePercentile(arr: Float32Array, percentile = 0.99): Float32Array {
  const n = arr.length;
  if (n === 0) return arr;
  const step = Math.max(1, Math.floor(n / 4096));
  const sample: number[] = [];
  for (let i = 0; i < n; i += step) {
    sample.push(arr[i]);
  }
  sample.sort((a, b) => a - b);
  const idx = Math.min(sample.length - 1, Math.floor(sample.length * percentile));
  const ref = Math.max(1e-6, sample[idx] || 1e-6);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = Math.max(0, Math.min(1, arr[i] / ref));
  }
  return out;
}

/**
 * Half-wave-rectified compressed onset flux (log1p spectral energy rise over decaying local floor).
 * Suppresses sustained bass/pad tones and isolates percussive attacks (kick, snare, hi-hat).
 */
function computeHalfWaveOnset(raw: Float32Array): Float32Array {
  const n = raw.length;
  const flux = new Float32Array(n);
  if (n === 0) return flux;

  let floor = Math.log1p(14 * raw[0]);
  for (let i = 0; i < n; i++) {
    const logE = Math.log1p(14 * raw[i]);
    const diff = logE - floor;
    flux[i] = diff > 0 ? diff : 0;
    // Fast attack tracking on rise, smooth decay on release so sustained notes settle into floor
    floor = logE > floor ? floor * 0.55 + logE * 0.45 : floor * 0.88 + logE * 0.12;
  }

  return normalizePercentile(flux, 0.99);
}

function computeBandCurves(buffer: AudioBuffer): {
  frameRate: number;
  lowBand: Float32Array;
  midBand: Float32Array;
  highBand: Float32Array;
  lowOnset: Float32Array;
  midOnset: Float32Array;
  highOnset: Float32Array;
} {
  const frameRate = 100;
  const duration = buffer.duration;
  const numFrames = Math.max(1, Math.floor(duration * frameRate));
  const sr = buffer.sampleRate;
  const mono = getMonoSamples(buffer);

  // zero-phase band filters on the full sample rate (see dsp.ts), then the RMS of each 10 ms frame
  const { low, high } = lowAndHigh(mono, sr);   // mid = mono − low − high, per sample below (no third copy)
  const rawLow = new Float32Array(numFrames);
  const rawMid = new Float32Array(numFrames);
  const rawHigh = new Float32Array(numFrames);

  for (let f = 0; f < numFrames; f++) {
    const startSample = Math.floor((f / frameRate) * sr);
    const endSample = Math.min(mono.length, Math.floor(((f + 1) / frameRate) * sr));
    let sumLow = 0;
    let sumMid = 0;
    let sumHigh = 0;
    for (let i = startSample; i < endSample; i++) {
      const m = mono[i] - low[i] - high[i];
      sumLow += low[i] * low[i];
      sumMid += m * m;
      sumHigh += high[i] * high[i];
    }
    const count = endSample - startSample;
    if (count > 0) {
      rawLow[f] = Math.sqrt(sumLow / count);
      rawMid[f] = Math.sqrt(sumMid / count);
      rawHigh[f] = Math.sqrt(sumHigh / count);
    }
  }

  const lowBand = normalizePercentile(rawLow, 0.99);
  const midBand = normalizePercentile(rawMid, 0.99);
  const highBand = normalizePercentile(rawHigh, 0.99);

  return {
    frameRate,
    lowBand,
    midBand,
    highBand,
    lowOnset: computeHalfWaveOnset(lowBand),
    midOnset: computeHalfWaveOnset(midBand),
    highOnset: computeHalfWaveOnset(highBand),
  };
}

export function computeFoldedBar(
  beats: BeatItem[],
  numerator: number,
  frameRate: number,
  lowBand: Float32Array,
  midBand: Float32Array,
  highBand: Float32Array,
  range?: { start: number; end: number } | null
): FoldedBarData {
  const safeNum = Math.max(2, Math.min(12, numerator || 4));
  const binsPerBeat = 8;
  const totalBins = safeNum * binsPerBeat;

  const lowAcc = new Float32Array(totalBins);
  const midAcc = new Float32Array(totalBins);
  const highAcc = new Float32Array(totalBins);
  const counts = new Float32Array(totalBins);

  const sorted = [...beats].sort((a, b) => a.time - b.time);
  const bars = new Map<number, BeatItem[]>();
  for (const b of sorted) {
    const arr = bars.get(b.barIndex);
    if (arr) arr.push(b);
    else bars.set(b.barIndex, [b]);
  }

  let completeBars = 0;
  const barIndices = Array.from(bars.keys()).sort((a, b) => a - b);
  const isWindowScoped = Boolean(range);

  for (let bi = 0; bi < barIndices.length; bi++) {
    const barBeats = bars.get(barIndices[bi])!;
    if (barBeats.length < safeNum) continue;
    if (range) {
      const barStart = barBeats[0].time;
      if (barStart < range.start - 0.05 || barStart > range.end + 0.05) continue;
    }
    const nextBarFirst = bi + 1 < barIndices.length ? bars.get(barIndices[bi + 1])?.[0] : undefined;

    completeBars++;
    for (let k = 0; k < safeNum; k++) {
      const bCurr = barBeats[k];
      if (!bCurr) continue;
      const tStart = bCurr.time;
      const tEnd =
        k + 1 < barBeats.length
          ? barBeats[k + 1].time
          : nextBarFirst
          ? nextBarFirst.time
          : tStart + (bCurr.deltaMs > 0 ? bCurr.deltaMs / 1000 : 0.5);
      const beatDur = tEnd - tStart;
      if (beatDur <= 0.08 || beatDur > 3.0) continue;

      for (let sub = 0; sub < binsPerBeat; sub++) {
        const binIdx = k * binsPerBeat + sub;
        const subStart = tStart + (sub / binsPerBeat) * beatDur;
        const subEnd = tStart + ((sub + 1) / binsPerBeat) * beatDur;
        const f0 = Math.max(0, Math.floor(subStart * frameRate));
        const f1 = Math.min(lowBand.length - 1, Math.ceil(subEnd * frameRate));
        if (f1 < f0) continue;

        let lMax = 0;
        let mMax = 0;
        let hMax = 0;
        for (let f = f0; f <= f1; f++) {
          if (lowBand[f] > lMax) lMax = lowBand[f];
          if (midBand[f] > mMax) mMax = midBand[f];
          if (highBand[f] > hMax) hMax = highBand[f];
        }
        lowAcc[binIdx] += lMax;
        midAcc[binIdx] += mMax;
        highAcc[binIdx] += hMax;
        counts[binIdx] += 1;
      }
    }
  }

  const low = new Float32Array(totalBins);
  const mid = new Float32Array(totalBins);
  const high = new Float32Array(totalBins);
  for (let i = 0; i < totalBins; i++) {
    const c = counts[i] || 1;
    low[i] = lowAcc[i] / c;
    mid[i] = midAcc[i] / c;
    high[i] = highAcc[i] / c;
  }

  const beatLowAvg: number[] = [];
  const beatMidAvg: number[] = [];
  const offbeatLowAvg: number[] = [];
  const halfOffset = Math.floor(binsPerBeat / 2);

  for (let k = 0; k < safeNum; k++) {
    const b0 = k * binsPerBeat;
    const bPrev = (b0 - 1 + totalBins) % totalBins;
    const bNext = (b0 + 1) % totalBins;
    beatLowAvg.push((low[bPrev] * 0.5 + low[b0] + low[bNext] * 0.8) / 2.3);
    beatMidAvg.push((mid[bPrev] * 0.5 + mid[b0] + mid[bNext] * 0.8) / 2.3);

    const off0 = (b0 + halfOffset) % totalBins;
    const offPrev = (off0 - 1 + totalBins) % totalBins;
    const offNext = (off0 + 1) % totalBins;
    offbeatLowAvg.push((low[offPrev] * 0.6 + low[off0] + low[offNext] * 0.6) / 2.2);
  }

  let dominantBeat = 1;
  let maxLow = -1;
  let minLow = Infinity;
  let sumOnLow = 0;
  for (let k = 0; k < beatLowAvg.length; k++) {
    sumOnLow += beatLowAvg[k];
    if (beatLowAvg[k] > maxLow) {
      maxLow = beatLowAvg[k];
      dominantBeat = k + 1;
    }
    if (beatLowAvg[k] < minLow) {
      minLow = beatLowAvg[k];
    }
  }
  const meanOnLow = sumOnLow / Math.max(1, beatLowAvg.length);

  let maxOffLow = -1;
  let sumOffLow = 0;
  for (let k = 0; k < offbeatLowAvg.length; k++) {
    sumOffLow += offbeatLowAvg[k];
    if (offbeatLowAvg[k] > maxOffLow) maxOffLow = offbeatLowAvg[k];
  }
  const meanOffLow = sumOffLow / Math.max(1, offbeatLowAvg.length);

  let verdict: FoldedBarData['verdict'] = 'insufficient';
  if (completeBars >= 2) {
    const contrast = maxLow > 1e-4 ? (maxLow - minLow) / maxLow : 0;

    if (maxOffLow > 0.1 && meanOffLow > meanOnLow * 1.22 && maxOffLow > maxLow * 1.12) {
      // Clear off-beat (+0.5) grid misalignment
      verdict = 'shifted_offbeat';
    } else if (safeNum === 4) {
      const oddMean = (beatLowAvg[0] + beatLowAvg[2]) / 2;
      const evenMean = (beatLowAvg[1] + beatLowAvg[3]) / 2;
      const maxEven = Math.max(beatLowAvg[1], beatLowAvg[3]);

      if (maxLow > 0.12 && evenMean > oddMean * 1.25 && maxEven > beatLowAvg[0] * 1.2) {
        // Classic backbeat swap (2 & 4 significantly stronger than 1 & 3)
        verdict = 'shifted_backbeat';
      } else if (
        maxLow > 0.12 &&
        contrast >= 0.16 &&
        (dominantBeat === 1 || (beatLowAvg[0] >= maxLow * 0.88 && oddMean >= evenMean * 1.08))
      ) {
        verdict = 'ok';
      } else {
        // Four-on-the-floor (1-4 uniform) or weak/non-percussive tracks -> neutral, no false alarm
        verdict = 'flat';
      }
    } else {
      if (maxLow > 0.12 && dominantBeat !== 1 && maxLow > beatLowAvg[0] * 1.28) {
        verdict = 'shifted_backbeat';
      } else if (maxLow > 0.12 && contrast >= 0.16 && dominantBeat === 1) {
        verdict = 'ok';
      } else {
        verdict = 'flat';
      }
    }
  }

  return {
    numerator: safeNum,
    binsPerBeat,
    barCount: completeBars,
    isWindowScoped,
    low,
    mid,
    high,
    beatLowAvg,
    beatMidAvg,
    verdict,
    dominantBeat,
  };
}

export function computeTempoHistogram(beats: BeatItem[], globalBpm: number): TempoHistogramData {
  const minBpm = 40;
  const maxBpm = 220;
  const binWidth = 2;
  const numBins = Math.floor((maxBpm - minBpm) / binWidth);
  const rawCounts = new Float32Array(numBins);
  let totalIntervals = 0;

  for (let i = 1; i < beats.length; i++) {
    const dt = beats[i].time - beats[i - 1].time;
    const bpm = dt > 0.2 ? 60 / dt : beats[i].instantBpm;
    if (!Number.isFinite(bpm) || bpm < minBpm || bpm >= maxBpm) continue;
    const idx = Math.min(numBins - 1, Math.max(0, Math.floor((bpm - minBpm) / binWidth)));
    rawCounts[idx] += 1;
    totalIntervals++;
  }

  const bins: TempoBin[] = [];
  for (let i = 0; i < numBins; i++) {
    const prev = i > 0 ? rawCounts[i - 1] : 0;
    const curr = rawCounts[i];
    const next = i + 1 < numBins ? rawCounts[i + 1] : 0;
    bins.push({
      bpm: minBpm + i * binWidth + binWidth / 2,
      count: curr,
      smoothed: 0.2 * prev + 0.6 * curr + 0.2 * next,
    });
  }

  let primaryIdx = 0;
  for (let i = 1; i < bins.length; i++) {
    if (bins[i].smoothed > bins[primaryIdx].smoothed) primaryIdx = i;
  }

  const primaryBpm = totalIntervals > 0 ? bins[primaryIdx].bpm : globalBpm;
  const clusterCount = (centerIdx: number) => {
    let sum = 0;
    for (let j = Math.max(0, centerIdx - 2); j <= Math.min(bins.length - 1, centerIdx + 2); j++) {
      sum += bins[j].count;
    }
    return sum;
  };

  const primaryCluster = clusterCount(primaryIdx);
  const primarySharePct = totalIntervals > 0 ? Math.round((primaryCluster / totalIntervals) * 100) : 100;

  let secondaryIdx = -1;
  for (let i = 0; i < bins.length; i++) {
    if (Math.abs(bins[i].bpm - primaryBpm) < 12) continue;
    const prev = i > 0 ? bins[i - 1].smoothed : 0;
    const next = i + 1 < bins.length ? bins[i + 1].smoothed : 0;
    if (bins[i].smoothed >= prev && bins[i].smoothed >= next && bins[i].smoothed >= bins[primaryIdx].smoothed * 0.18) {
      if (secondaryIdx === -1 || bins[i].smoothed > bins[secondaryIdx].smoothed) {
        secondaryIdx = i;
      }
    }
  }

  const secondaryBpm = secondaryIdx !== -1 ? bins[secondaryIdx].bpm : null;
  const secondarySharePct =
    secondaryIdx !== -1 && totalIntervals > 0 ? Math.round((clusterCount(secondaryIdx) / totalIntervals) * 100) : null;

  return {
    minBpm,
    maxBpm,
    binWidth,
    bins,
    primaryBpm,
    primarySharePct,
    secondaryBpm,
    secondarySharePct,
    halfTimeBpm: Math.round((primaryBpm / 2) * 10) / 10,
    doubleTimeBpm: Math.round(primaryBpm * 2 * 10) / 10,
    totalIntervals,
  };
}

type BandEvidence = ReturnType<typeof computeBandCurves> & {
  foldLow: Float32Array;
  foldMid: Float32Array;
  foldHigh: Float32Array;
};

const bandCache = new WeakMap<AudioBuffer, BandEvidence>();

/**
 * Band curves of a song, computed once per audio buffer. Filtering the whole song takes a noticeable moment, and a
 * grid correction changes only the beats, not the audio (before, every 1-click fix filtered the song again).
 */
export function bandEvidence(buffer: AudioBuffer): BandEvidence {
  const cached = bandCache.get(buffer);
  if (cached) return cached;
  const bands = computeBandCurves(buffer);
  const { lowBand, midBand, highBand, lowOnset, midOnset, highOnset } = bands;
  // Folded Bar blends 72% transient onset + 28% RMS energy so sustained basslines don't obscure kick attacks
  const foldLow = new Float32Array(lowBand.length);
  const foldMid = new Float32Array(midBand.length);
  const foldHigh = new Float32Array(highBand.length);
  for (let i = 0; i < lowBand.length; i++) {
    foldLow[i] = 0.72 * lowOnset[i] + 0.28 * lowBand[i];
    foldMid[i] = 0.72 * midOnset[i] + 0.28 * midBand[i];
    foldHigh[i] = 0.72 * highOnset[i] + 0.28 * highBand[i];
  }
  const out = { ...bands, foldLow, foldMid, foldHigh };
  bandCache.set(buffer, out);
  return out;
}

export function computeBeatEvidence(buffer: AudioBuffer, result: AnalysisResult): BeatEvidenceData {
  const { frameRate, lowBand, midBand, highBand, lowOnset, midOnset, highOnset, foldLow, foldMid, foldHigh } =
    bandEvidence(buffer);

  const foldedBar = computeFoldedBar(
    result.beats,
    result.timeSignature.numerator || 4,
    frameRate,
    foldLow,
    foldMid,
    foldHigh
  );
  const tempoHistogram = computeTempoHistogram(result.beats, result.globalBpm);

  return {
    duration: buffer.duration,
    frameRate,
    lowBand,
    midBand,
    highBand,
    lowOnset,
    midOnset,
    highOnset,
    foldLow,
    foldMid,
    foldHigh,
    foldedBar,
    tempoHistogram,
  };
}

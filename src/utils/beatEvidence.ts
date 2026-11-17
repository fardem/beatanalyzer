import { AnalysisResult, BeatItem } from '../types/analyzer';

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
  foldedBar: FoldedBarData;
  tempoHistogram: TempoHistogramData;
}

export type BeatSpectrumZone = 'kick' | 'snare' | 'hihat';

export interface WindowBeatSpectrumData {
  windowStart: number;
  windowEnd: number;
  numBands: number;
  downbeatCount: number;
  beatCount: number;
  offbeatCount: number;
  /** Averaged normalized [0..1] dB profile over [minDb, maxDb] */
  downbeatProfile: Float32Array;
  beatProfile: Float32Array;
  offbeatProfile: Float32Array;
  downbeatDb: Float32Array;
  beatDb: Float32Array;
  offbeatDb: Float32Array;
  downbeatPeakBand: number;
  downbeatPeakFreqHz: number;
  downbeatZone: BeatSpectrumZone;
  beatPeakBand: number;
  beatPeakFreqHz: number;
  beatZone: BeatSpectrumZone;
}

export interface WindowSpectrogramData {
  windowStart: number;
  windowEnd: number;
  cols: number;
  rows: number;
  fMin: number;
  fMax: number;
  /** Column-major normalized energy [0..1], index = col * rows + row (row 0 = lowest freq) */
  data: Float32Array;
}

const monoCache = new WeakMap<AudioBuffer, Float32Array>();

function getMonoSamples(buffer: AudioBuffer): Float32Array {
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

  // Subsample by stride=2 when sampleRate >= 32kHz -> effective rate >= 16kHz (Nyquist >= 8kHz)
  const stride = sr >= 32000 ? 2 : 1;
  const effSr = sr / stride;

  // 2-stage cascaded IIR filters for Low (<150Hz), Mid (150-2500Hz), High (>2500Hz)
  const alphaLow = Math.exp((-2 * Math.PI * 150) / effSr);
  const alphaHigh = Math.exp((-2 * Math.PI * 2500) / effSr);

  let lp1a = 0;
  let lp1b = 0;
  let lp2a = 0;
  let lp2b = 0;

  const rawLow = new Float32Array(numFrames);
  const rawMid = new Float32Array(numFrames);
  const rawHigh = new Float32Array(numFrames);

  for (let f = 0; f < numFrames; f++) {
    const startSample = Math.floor((f / frameRate) * sr);
    const endSample = Math.min(mono.length, Math.floor(((f + 1) / frameRate) * sr));
    let sumLow = 0;
    let sumMid = 0;
    let sumHigh = 0;
    let count = 0;

    for (let i = startSample; i < endSample; i += stride) {
      const s = mono[i];

      lp1a = alphaLow * lp1a + (1 - alphaLow) * s;
      lp1b = alphaLow * lp1b + (1 - alphaLow) * lp1a;
      const low = lp1b;

      lp2a = alphaHigh * lp2a + (1 - alphaHigh) * s;
      lp2b = alphaHigh * lp2b + (1 - alphaHigh) * lp2a;
      const mid = lp2b - low;
      const high = s - lp2b;

      sumLow += low * low;
      sumMid += mid * mid;
      sumHigh += high * high;
      count++;
    }

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

export function computeBeatEvidence(buffer: AudioBuffer, result: AnalysisResult): BeatEvidenceData {
  const { frameRate, lowBand, midBand, highBand, lowOnset, midOnset, highOnset } = computeBandCurves(buffer);
  // Folded Bar blends 72% transient onset + 28% RMS energy so sustained basslines don't obscure kick attacks
  const foldLow = new Float32Array(lowBand.length);
  const foldMid = new Float32Array(midBand.length);
  const foldHigh = new Float32Array(highBand.length);
  for (let i = 0; i < lowBand.length; i++) {
    foldLow[i] = 0.72 * lowOnset[i] + 0.28 * lowBand[i];
    foldMid[i] = 0.72 * midOnset[i] + 0.28 * midBand[i];
    foldHigh[i] = 0.72 * highOnset[i] + 0.28 * highBand[i];
  }

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
    foldedBar,
    tempoHistogram,
  };
}

// --- Cooley-Tukey Radix-2 FFT (N = 2048) ---

const FFT_N = 2048;
const FFT_BINS = FFT_N / 2;
const HANN_WINDOW = new Float32Array(FFT_N);
const BIT_REV = new Uint16Array(FFT_N);
const COS_TBL = new Float32Array(FFT_N / 2);
const SIN_TBL = new Float32Array(FFT_N / 2);

(() => {
  for (let i = 0; i < FFT_N; i++) {
    HANN_WINDOW[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_N - 1)));
    let rev = 0;
    let x = i;
    for (let b = 0; b < 11; b++) {
      rev = (rev << 1) | (x & 1);
      x >>= 1;
    }
    BIT_REV[i] = rev;
  }
  for (let i = 0; i < FFT_N / 2; i++) {
    const angle = (-2 * Math.PI * i) / FFT_N;
    COS_TBL[i] = Math.cos(angle);
    SIN_TBL[i] = Math.sin(angle);
  }
})();

const fftRe = new Float32Array(FFT_N);
const fftIm = new Float32Array(FFT_N);
const fftMagDb = new Float32Array(FFT_BINS);

function computeFrameDbSpectrum(mono: Float32Array, startSample: number, minDb: number) {
  for (let i = 0; i < FFT_N; i++) {
    const idx = startSample + i;
    const s = idx >= 0 && idx < mono.length ? mono[idx] : 0;
    const j = BIT_REV[i];
    fftRe[j] = s * HANN_WINDOW[i];
    fftIm[j] = 0;
  }

  for (let size = 2; size <= FFT_N; size <<= 1) {
    const half = size >> 1;
    const step = FFT_N / size;
    for (let start = 0; start < FFT_N; start += size) {
      for (let k = 0; k < half; k++) {
        const twIdx = k * step;
        const c = COS_TBL[twIdx];
        const s = SIN_TBL[twIdx];
        const oddIdx = start + k + half;
        const evenIdx = start + k;
        const tRe = c * fftRe[oddIdx] - s * fftIm[oddIdx];
        const tIm = s * fftRe[oddIdx] + c * fftIm[oddIdx];
        fftRe[oddIdx] = fftRe[evenIdx] - tRe;
        fftIm[oddIdx] = fftIm[evenIdx] - tIm;
        fftRe[evenIdx] += tRe;
        fftIm[evenIdx] += tIm;
      }
    }
  }

  const scale = 4 / FFT_N;
  for (let k = 0; k < FFT_BINS; k++) {
    const mag = Math.hypot(fftRe[k], fftIm[k]) * scale;
    const db = 20 * Math.log10(mag + 1e-6);
    fftMagDb[k] = Math.max(minDb, db);
  }
}

function sampleRepresentativeTimes(list: number[], maxSamples = 48): number[] {
  if (list.length <= maxSamples) return list;
  const out: number[] = [];
  const step = list.length / maxSamples;
  for (let i = 0; i < maxSamples; i++) {
    out.push(list[Math.floor(i * step)]);
  }
  return out;
}

function zoneFromFreq(freqHz: number): BeatSpectrumZone {
  if (freqHz < 150) return 'kick';
  if (freqHz < 4000) return 'snare';
  return 'hihat';
}

function extractBandDbInto(
  numBands: number,
  fMin: number,
  fMax: number,
  binHz: number,
  minDb: number,
  out: Float32Array
) {
  const ratioToFreq = (r: number) => fMin * Math.pow(fMax / fMin, Math.max(0, Math.min(1, r)));
  for (let i = 0; i < numBands; i++) {
    const fLow = ratioToFreq(i / numBands);
    const fHigh = ratioToFreq((i + 1) / numBands);
    const fCenter = Math.sqrt(fLow * fHigh);
    const kLow = fLow / binHz;
    const kHigh = fHigh / binHz;

    if (Math.floor(kHigh) <= Math.floor(kLow)) {
      const kExact = Math.max(0, Math.min(FFT_BINS - 1, fCenter / binHz));
      const k0 = Math.floor(kExact);
      const k1 = Math.min(FFT_BINS - 1, k0 + 1);
      const frac = kExact - k0;
      out[i] = fftMagDb[k0] + (fftMagDb[k1] - fftMagDb[k0]) * frac;
    } else {
      const s0 = Math.max(0, Math.floor(kLow));
      const s1 = Math.min(FFT_BINS - 1, Math.ceil(kHigh));
      let peak = minDb;
      let sum = 0;
      let cnt = 0;
      for (let k = s0; k <= s1; k++) {
        const v = fftMagDb[k];
        if (v > peak) peak = v;
        sum += v;
        cnt++;
      }
      const avg = cnt > 0 ? sum / cnt : minDb;
      out[i] = 0.72 * peak + 0.28 * avg;
    }
  }
}

export function computeWindowBeatSpectrum(
  buffer: AudioBuffer,
  beats: BeatItem[],
  range: { start: number; end: number } | null,
  options: {
    numBands?: number;
    fMin?: number;
    fMax?: number;
    minDb?: number;
    maxDb?: number;
  } = {}
): WindowBeatSpectrumData | null {
  if (!buffer || beats.length === 0) return null;

  const numBands = options.numBands ?? 40;
  const fMin = options.fMin ?? 25;
  const fMax = options.fMax ?? 16000;
  const minDb = options.minDb ?? -85;
  const maxDb = options.maxDb ?? -10;
  const dbSpan = maxDb - minDb || 75;

  const windowStart = range ? Math.max(0, range.start) : 0;
  const windowEnd = range ? Math.min(buffer.duration, Math.max(windowStart + 0.05, range.end)) : buffer.duration;

  const sortedBeats = [...beats].sort((a, b) => a.time - b.time);
  const inWindowIndices: number[] = [];
  for (let i = 0; i < sortedBeats.length; i++) {
    const t = sortedBeats[i].time;
    if (t >= windowStart - 0.02 && t <= windowEnd + 0.02) {
      inWindowIndices.push(i);
    }
  }
  if (inWindowIndices.length === 0) return null;

  const downbeatTimesAll: number[] = [];
  const regularTimesAll: number[] = [];
  const offbeatTimesAll: number[] = [];

  for (const idx of inWindowIndices) {
    const b = sortedBeats[idx];
    if (b.isDownbeat) downbeatTimesAll.push(b.time);
    else regularTimesAll.push(b.time);

    const next = idx + 1 < sortedBeats.length ? sortedBeats[idx + 1] : null;
    const prev = idx > 0 ? sortedBeats[idx - 1] : null;
    const dt = next ? next.time - b.time : prev ? b.time - prev.time : b.deltaMs > 0 ? b.deltaMs / 1000 : 0.5;
    if (dt >= 0.14 && dt <= 2.5) {
      const midTime = b.time + dt * 0.5;
      if (midTime <= buffer.duration - 0.02) {
        offbeatTimesAll.push(midTime);
      }
    }
  }

  const downTimes = sampleRepresentativeTimes(downbeatTimesAll, 40);
  const regTimes = sampleRepresentativeTimes(regularTimesAll, 48);
  const offTimes = sampleRepresentativeTimes(offbeatTimesAll, 48);

  const mono = getMonoSamples(buffer);
  const sr = buffer.sampleRate;
  const binHz = sr / FFT_N;
  const ratioToFreq = (r: number) => fMin * Math.pow(fMax / fMin, Math.max(0, Math.min(1, r)));
  const tempBands = new Float32Array(numBands);

  const aggregateTimes = (times: number[]): Float32Array => {
    const bandDbOut = new Float32Array(numBands).fill(minDb);
    if (times.length === 0) return bandDbOut;

    const sumDb = new Float32Array(numBands);
    // Attack-aligned pre-offset (~12 ms before beat -> Hann window centered ~11 ms post-beat, keeping t well inside main lobe)
    const preOffset = Math.round(0.012 * sr);

    for (const t of times) {
      const startSample = Math.max(0, Math.round(t * sr) - preOffset);
      computeFrameDbSpectrum(mono, startSample, minDb);
      extractBandDbInto(numBands, fMin, fMax, binHz, minDb, tempBands);
      for (let i = 0; i < numBands; i++) {
        sumDb[i] += tempBands[i];
      }
    }

    for (let i = 0; i < numBands; i++) {
      bandDbOut[i] = sumDb[i] / times.length;
    }
    return bandDbOut;
  };

  const downbeatDb = aggregateTimes(downTimes);
  const beatDb = aggregateTimes(regTimes);
  const offbeatDb = aggregateTimes(offTimes);

  const downbeatProfile = new Float32Array(numBands);
  const beatProfile = new Float32Array(numBands);
  const offbeatProfile = new Float32Array(numBands);

  let downPeakBand = -1;
  let downPeakVal = -Infinity;
  let beatPeakBand = -1;
  let beatPeakVal = -Infinity;

  for (let i = 0; i < numBands; i++) {
    const dNorm = Math.max(0, Math.min(1, (downbeatDb[i] - minDb) / dbSpan));
    const bNorm = Math.max(0, Math.min(1, (beatDb[i] - minDb) / dbSpan));
    const oNorm = Math.max(0, Math.min(1, (offbeatDb[i] - minDb) / dbSpan));
    downbeatProfile[i] = dNorm;
    beatProfile[i] = bNorm;
    offbeatProfile[i] = oNorm;

    if (downbeatTimesAll.length > 0 && dNorm > downPeakVal) {
      downPeakVal = dNorm;
      downPeakBand = i;
    }
    if (regularTimesAll.length > 0 && bNorm > beatPeakVal) {
      beatPeakVal = bNorm;
      beatPeakBand = i;
    }
  }

  const downbeatPeakFreqHz = downPeakBand >= 0 ? ratioToFreq((downPeakBand + 0.5) / numBands) : 0;
  const beatPeakFreqHz = beatPeakBand >= 0 ? ratioToFreq((beatPeakBand + 0.5) / numBands) : 0;

  return {
    windowStart,
    windowEnd,
    numBands,
    downbeatCount: downbeatTimesAll.length,
    beatCount: regularTimesAll.length,
    offbeatCount: offbeatTimesAll.length,
    downbeatProfile,
    beatProfile,
    offbeatProfile,
    downbeatDb,
    beatDb,
    offbeatDb,
    downbeatPeakBand: downPeakBand,
    downbeatPeakFreqHz,
    downbeatZone: zoneFromFreq(downbeatPeakFreqHz || 60),
    beatPeakBand,
    beatPeakFreqHz,
    beatZone: zoneFromFreq(beatPeakFreqHz || 200),
  };
}

export function computeWindowSpectrogram(
  buffer: AudioBuffer,
  range: { start: number; end: number } | null,
  options: {
    cols?: number;
    rows?: number;
    fMin?: number;
    fMax?: number;
    minDb?: number;
    maxDb?: number;
  } = {}
): WindowSpectrogramData | null {
  if (!buffer) return null;

  const cols = options.cols ?? 220;
  const rows = options.rows ?? 48;
  const fMin = options.fMin ?? 25;
  const fMax = options.fMax ?? 16000;
  const minDb = options.minDb ?? -80;
  const maxDb = options.maxDb ?? -8;
  const dbSpan = maxDb - minDb || 72;

  const windowStart = range ? Math.max(0, range.start) : 0;
  const windowEnd = range ? Math.min(buffer.duration, Math.max(windowStart + 0.1, range.end)) : buffer.duration;
  const span = Math.max(0.1, windowEnd - windowStart);

  const mono = getMonoSamples(buffer);
  const sr = buffer.sampleRate;
  const binHz = sr / FFT_N;
  const data = new Float32Array(cols * rows);
  const colSpanSec = span / cols;
  const subHops = colSpanSec > 0.08 ? 2 : 1;
  const tempBands = new Float32Array(rows);
  const maxBands = new Float32Array(rows);

  for (let c = 0; c < cols; c++) {
    maxBands.fill(minDb);
    for (let h = 0; h < subHops; h++) {
      const frac = subHops === 1 ? (c + 0.5) / cols : (c + (h + 0.5) / subHops) / cols;
      const t = windowStart + frac * span;
      const centerSample = Math.round(t * sr);
      const startSample = Math.max(0, centerSample - (FFT_N >> 1));
      computeFrameDbSpectrum(mono, startSample, minDb);
      extractBandDbInto(rows, fMin, fMax, binHz, minDb, tempBands);
      for (let r = 0; r < rows; r++) {
        if (tempBands[r] > maxBands[r]) maxBands[r] = tempBands[r];
      }
    }

    const base = c * rows;
    for (let r = 0; r < rows; r++) {
      const norm = Math.max(0, Math.min(1, (maxBands[r] - minDb) / dbSpan));
      // Mild perceptual gamma compression so mid/upper percussion stands out next to loud sub-bass
      data[base + r] = Math.pow(norm, 0.85);
    }
  }

  return {
    windowStart,
    windowEnd,
    cols,
    rows,
    fMin,
    fMax,
    data,
  };
}

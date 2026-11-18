/**
 * Signal processing for the web app: band filters (and, for the song structure, FFT features).
 *
 * The songs lie complete in memory, so the filters run forwards and backwards (zero phase): no group delay that
 * would move a kick attack later in the band curves and the folded bar. All filters work on the full sample rate –
 * no sample is skipped before a low-pass (that folded hi-hats and cymbals into the low and mid bands).
 */

export interface Biquad {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

const BUTTERWORTH_Q = Math.SQRT1_2;

function design(kind: 'low' | 'high', fc: number, sr: number): Biquad {
  // RBJ Audio EQ Cookbook, normalised by a0
  const w0 = (2 * Math.PI * Math.min(fc, sr * 0.49)) / sr;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * BUTTERWORTH_Q);
  const a0 = 1 + alpha;
  const b0 = kind === 'low' ? (1 - cos) / 2 : (1 + cos) / 2;
  const b1 = kind === 'low' ? 1 - cos : -(1 + cos);
  return { b0: b0 / a0, b1: b1 / a0, b2: b0 / a0, a1: (-2 * cos) / a0, a2: (1 - alpha) / a0 };
}

export const biquadLowpass = (fc: number, sr: number) => design('low', fc, sr);
export const biquadHighpass = (fc: number, sr: number) => design('high', fc, sr);

/** one pass of a biquad over x (direct form II transposed), in place; backwards when `reverse` */
function run(x: Float32Array, f: Biquad, reverse: boolean) {
  let z1 = 0;
  let z2 = 0;
  const n = x.length;
  for (let k = 0; k < n; k++) {
    const i = reverse ? n - 1 - k : k;
    const v = x[i];
    const y = f.b0 * v + z1;
    z1 = f.b1 * v - f.a1 * y + z2;
    z2 = f.b2 * v - f.a2 * y;
    x[i] = y;
  }
}

/** zero-phase filtering: all stages forwards, then all stages backwards (squared magnitude, no delay) */
export function filtfilt(x: Float32Array, stages: Biquad[]): Float32Array {
  const y = new Float32Array(x);
  for (const s of stages) run(y, s, false);
  for (const s of stages) run(y, s, true);
  return y;
}

export const LOW_MID_HZ = 150;
export const MID_HIGH_HZ = 2500;

/**
 * Three bands: low < 150 Hz (kick, bass), mid 150 Hz – 2.5 kHz (snare body, voice), high > 2.5 kHz (hi-hats).
 * Low and high are 4th-order Butterworth (Linkwitz-Riley) run zero-phase; mid is the rest, so the three bands add
 * up to the signal exactly.
 */
export function lowAndHigh(mono: Float32Array, sr: number): { low: Float32Array; high: Float32Array } {
  const lp = biquadLowpass(LOW_MID_HZ, sr);
  const hp = biquadHighpass(MID_HIGH_HZ, sr);
  return { low: filtfilt(mono, [lp, lp]), high: filtfilt(mono, [hp, hp]) };
}

export function splitBands(mono: Float32Array, sr: number): { low: Float32Array; mid: Float32Array; high: Float32Array } {
  const { low, high } = lowAndHigh(mono, sr);
  const mid = new Float32Array(mono.length);
  for (let i = 0; i < mono.length; i++) mid[i] = mono[i] - low[i] - high[i];
  return { low, mid, high };
}

// ─── Spectral features for the song structure ────────────────────────────────

/** in-place radix-2 FFT (re/im of length n = power of 2) */
export function fft(re: Float32Array, im: Float32Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }
}

export const FEATURE_FFT = 2048;
export const MEL_BANDS = 20;
export const TIMBRE_COEFFS = 12;

export interface FrameFeatures {
  /** seconds between frames */
  hop: number;
  /** per frame: 12 pitch classes (C … B), power */
  chroma: Float32Array[];
  /** per frame: cepstral coefficients 1 … TIMBRE_COEFFS of 20 log-mel bands (the sound colour, loudness removed) */
  timbre: Float32Array[];
}

/**
 * Chroma (which notes sound: chords, key) and timbre (sound colour: which instruments) per frame. The signal is
 * first brought down to ~11 kHz (zero-phase low-pass, then every 2nd/4th sample) – enough for notes up to 2 kHz and
 * the colour up to 5 kHz, and four times faster.
 */
export function frameFeatures(mono: Float32Array, sr: number): FrameFeatures {
  const factor = sr >= 40000 ? 4 : sr >= 20000 ? 2 : 1;
  const fs = sr / factor;
  let x = mono;
  if (factor > 1) {
    const lp = biquadLowpass(fs * 0.4, sr);
    const filtered = filtfilt(mono, [lp, lp]);
    x = new Float32Array(Math.floor(mono.length / factor));
    for (let i = 0; i < x.length; i++) x[i] = filtered[i * factor];
  }
  const N = FEATURE_FFT;
  const hopN = N / 2;
  const win = new Float32Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N);
  const binHz = fs / N;

  // pitch class per bin (110 Hz … 2 kHz), mel weights (60 Hz … 5 kHz)
  const pc = new Int8Array(N / 2).fill(-1);
  for (let k = 1; k < N / 2; k++) {
    const f = k * binHz;
    if (f >= 110 && f <= 2000) pc[k] = (((Math.round(12 * Math.log2(f / 440)) + 9) % 12) + 12) % 12;   // 0 = C
  }
  const mel = (f: number) => 2595 * Math.log10(1 + f / 700);
  const imel = (m: number) => 700 * (10 ** (m / 2595) - 1);
  const fMax = Math.min(5000, fs * 0.45);
  const edges = Array.from({ length: MEL_BANDS + 2 }, (_, i) => imel(mel(60) + ((mel(fMax) - mel(60)) * i) / (MEL_BANDS + 1)));

  const chroma: Float32Array[] = [];
  const timbre: Float32Array[] = [];
  const re = new Float32Array(N);
  const im = new Float32Array(N);
  const bands = new Float32Array(MEL_BANDS);
  for (let start = 0; start + N <= x.length; start += hopN) {
    for (let i = 0; i < N; i++) {
      re[i] = x[start + i] * win[i];
      im[i] = 0;
    }
    fft(re, im);
    const c = new Float32Array(12);
    bands.fill(0);
    for (let k = 1; k < N / 2; k++) {
      const p = re[k] * re[k] + im[k] * im[k];
      if (pc[k] >= 0) c[pc[k]] += p;
      const f = k * binHz;
      for (let m = 0; m < MEL_BANDS; m++) {
        const lo = edges[m];
        const mid = edges[m + 1];
        const hi = edges[m + 2];
        if (f <= lo || f >= hi) continue;
        bands[m] += p * (f < mid ? (f - lo) / (mid - lo) : (hi - f) / (hi - mid));
      }
    }
    chroma.push(c);
    // DCT-II of the log-mel bands; coefficient 0 (overall loudness) is left out
    const t = new Float32Array(TIMBRE_COEFFS);
    for (let q = 1; q <= TIMBRE_COEFFS; q++) {
      let s = 0;
      for (let m = 0; m < MEL_BANDS; m++) s += Math.log(bands[m] + 1e-10) * Math.cos((Math.PI * q * (m + 0.5)) / MEL_BANDS);
      t[q - 1] = s;
    }
    timbre.push(t);
  }
  return { hop: hopN / fs, chroma, timbre };
}

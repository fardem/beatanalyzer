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
export function splitBands(mono: Float32Array, sr: number): { low: Float32Array; mid: Float32Array; high: Float32Array } {
  const lp = biquadLowpass(LOW_MID_HZ, sr);
  const hp = biquadHighpass(MID_HIGH_HZ, sr);
  const low = filtfilt(mono, [lp, lp]);
  const high = filtfilt(mono, [hp, hp]);
  const mid = new Float32Array(mono.length);
  for (let i = 0; i < mono.length; i++) mid[i] = mono[i] - low[i] - high[i];
  return { low, mid, high };
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitBands } from './dsp';

const SR = 44100;
const sine = (hz: number, seconds = 1) => {
  const x = new Float32Array(Math.round(SR * seconds));
  for (let i = 0; i < x.length; i++) x[i] = Math.sin((2 * Math.PI * hz * i) / SR);
  return x;
};
/** energy share of each band, ignoring 0.1 s at both ends (filter start-up) */
const shares = (x: Float32Array) => {
  const { low, mid, high } = splitBands(x, SR);
  const e = (a: Float32Array) => {
    let s = 0;
    for (let i = 4410; i < a.length - 4410; i++) s += a[i] * a[i];
    return s;
  };
  const el = e(low), em = e(mid), eh = e(high);
  const sum = el + em + eh;
  return { low: el / sum, mid: em / sum, high: eh / sum };
};

test('60 Hz goes to low, 1 kHz to mid, 8 kHz to high', () => {
  assert.ok(shares(sine(60)).low > 0.95);
  assert.ok(shares(sine(1000)).mid > 0.95);
  assert.ok(shares(sine(8000)).high > 0.95);
});

test('no aliasing: 19 kHz does not leak into low or mid', () => {
  const s = shares(sine(19000));
  assert.ok(s.low < 0.01, `low ${s.low}`);
  assert.ok(s.mid < 0.01, `mid ${s.mid}`);
});

test('zero phase: an impulse stays where it is (no delay of the kick attack)', () => {
  const x = new Float32Array(SR);
  x[10000] = 1;
  const { low } = splitBands(x, SR);
  let at = 0;
  for (let i = 0; i < low.length; i++) if (Math.abs(low[i]) > Math.abs(low[at])) at = i;
  assert.ok(Math.abs(at - 10000) <= SR * 0.001, `peak at ${at}`);
});

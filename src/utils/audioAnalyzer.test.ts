import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateTempoFromActivation } from './audioAnalyzer';

test('browser tempo estimate sees the whole song, also after a long quiet intro', () => {
  const fr = 100;
  const a = new Float32Array(fr * 120);   // 70 s nothing, then 50 s of pulses at 120 BPM
  for (let t = 70; t < 120; t += 0.5) a[Math.round(t * fr)] = 1;
  assert.ok(Math.abs(estimateTempoFromActivation(a, fr) - 120) < 2);
});

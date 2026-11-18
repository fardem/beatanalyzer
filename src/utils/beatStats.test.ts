import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BeatItem } from '../types/analyzer';
import { intervalJitterMs } from './beatStats';

const beats = (times: number[]): BeatItem[] =>
  times.map((time, i) => ({ id: i + 1, time, beatInBar: 1, barIndex: 1, isDownbeat: false, confidence: null, instantBpm: 120, deltaMs: 0 }));
const grid = (n: number, step: number, wobble = 0) =>
  Array.from({ length: n }, (_, i) => 0.5 + i * step + (i % 2 ? wobble : 0));

test('an even grid does not wobble', () => {
  assert.equal(intervalJitterMs(beats(grid(20, 0.5))), 0);
});

test('every 2nd beat 5 ms late: intervals swing by ±5 ms', () => {
  const j = intervalJitterMs(beats(grid(21, 0.5, 0.005)))!;
  assert.ok(Math.abs(j - 5) < 0.5, `jitter ${j}`);
});

test('a gap (missing beat) or tempo jump does not count', () => {
  const t = grid(20, 0.5);
  t.splice(10, 1);   // one interval of 1.0 s
  assert.equal(intervalJitterMs(beats(t)), 0);
});

test('too few beats: no value', () => {
  assert.equal(intervalJitterMs(beats(grid(5, 0.5))), null);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyGridOps } from './beatTransforms';
import { suggestFix } from './fixSuggestion';
import { curves, song } from './testFixtures';

/** times of the beats whose index modulo m is in `which` */
const at = (count: number, step: number, m: number, which: number[]) =>
  Array.from({ length: count }, (_, i) => i).filter((i) => which.includes(i % m)).map((i) => 0.5 + i * step);

test('grid right (kick on 1, snare on 2 and 4): no steps suggested', () => {
  const r = song(64);
  const c = curves(r.metadata.duration, at(64, 0.5, 4, [0]), at(64, 0.5, 4, [1, 3]));
  const s = suggestFix(r, c, null);
  assert.ok(s);
  assert.deepEqual(s.ops, []);
});

test('"1" one beat too early: suggests +1 beat', () => {
  const r = song(64);   // model "1" at index 0, the real "1" (kick) is at index 1
  const c = curves(r.metadata.duration, at(64, 0.5, 4, [1]), at(64, 0.5, 4, [2, 0]));
  const s = suggestFix(r, c, null);
  assert.ok(s);
  assert.deepEqual(s.ops, [{ kind: 'downbeat', dir: 1 }]);
  assert.ok(s.score > s.baseScore);
});

test('"1" one beat too late: suggests -1 beat (fewer steps than +3)', () => {
  const r = song(64);
  const c = curves(r.metadata.duration, at(64, 0.5, 4, [3]), at(64, 0.5, 4, [0, 2]));
  assert.deepEqual(suggestFix(r, c, null)?.ops, [{ kind: 'downbeat', dir: -1 }]);
});

test('double tempo (grid 120 BPM, song 60 BPM 4/4): suggests tempo ½×', () => {
  const r = song(128, 4, 0, 0.5);   // 120 BPM grid
  // real beats every 1 s: kick on the real "1" (every 8 grid beats), snare on real 2 and 4
  const c = curves(r.metadata.duration, at(128, 0.5, 8, [0]), at(128, 0.5, 8, [2, 6]));
  const s = suggestFix(r, c, null);
  assert.ok(s);
  assert.ok(s.ops.some((o) => o.kind === 'tempo' && o.factor === 0.5), JSON.stringify(s.ops));
  const fixed = applyGridOps(r, s.ops);
  assert.equal(fixed.globalBpm, 60);
});

test('3/4 grid on a 4/4 song: suggests 4 beats per bar', () => {
  const r = song(96, 3, 0, 0.5);
  const c = curves(r.metadata.duration, at(96, 0.5, 4, [0]), at(96, 0.5, 4, [1, 3]));
  const s = suggestFix(r, c, null);
  assert.ok(s);
  assert.ok(s.ops.some((o) => o.kind === 'meter' && o.beats === 4), JSON.stringify(s.ops));
});

test('four on the floor (kick on every beat): no suggestion, decide by ear', () => {
  const r = song(64);
  const c = curves(r.metadata.duration, at(64, 0.5, 1, [0]), at(64, 0.5, 4, [1, 3]));
  assert.equal(suggestFix(r, c, null), null);
});

test('section: the suggestion carries the range of the section', () => {
  const r = song(128);
  const c = curves(r.metadata.duration, at(128, 0.5, 4, [1]), at(128, 0.5, 4, [2, 0]));
  const s = suggestFix(r, c, { start: 10, end: 40 });
  assert.ok(s && s.ops.length > 0);
  assert.ok(s.ops.every((o) => 'range' in o && o.range?.start === 10 && o.range?.end === 40));
});

test('"Mensch" case: librosa 174 BPM in 3/4, song 87 BPM 4/4 -> tempo ½× and 4 beats per bar', () => {
  const step = 60 / 174;
  const r = song(384, 3, 0, step);
  // real beats every 2 grid beats: kick on the real "1" (every 8 grid beats), snare on real 2 and 4
  const c = curves(r.metadata.duration, at(384, step, 8, [0]), at(384, step, 8, [2, 6]));
  const s = suggestFix(r, c, null);
  assert.ok(s, 'a suggestion');
  assert.ok(s.ops.some((o) => o.kind === 'tempo' && o.factor === 0.5), JSON.stringify(s.ops));
  assert.ok(s.ops.some((o) => o.kind === 'meter' && o.beats === 4), JSON.stringify(s.ops));
  const fixed = applyGridOps(r, s.ops);
  assert.equal(fixed.timeSignature.name, '4/4');
  assert.ok(Math.abs(fixed.globalBpm - 87) < 1);
});

test('grid on the off-beats (all attacks between the beats): suggests a half-beat step', () => {
  const r = song(64);
  // attacks (kick on the real "1", snare on 2 and 4, hats on every beat) half a beat after the grid
  const shiftT = (ts: number[]) => ts.map((t) => t + 0.25);
  const c = curves(r.metadata.duration, shiftT(at(64, 0.5, 4, [0])), shiftT(at(64, 0.5, 4, [1, 3])), shiftT(at(64, 0.5, 1, [0])));
  const s = suggestFix(r, c, null);
  assert.ok(s);
  assert.ok(s.ops.some((o) => o.kind === 'half'), JSON.stringify(s.ops));
});

test('beat_this result at 120 BPM: no tempo step (only librosa/browser analyses get one in this range)', () => {
  const r = { ...song(128, 4, 0, 0.5), engineInfo: { id: 'beat_this' as const, device: 'cpu' as const, gpu: null, fallbackReason: null }, activationSource: 'beat_this' as const };
  const c = curves(r.metadata.duration, at(128, 0.5, 8, [0]), at(128, 0.5, 8, [2, 6]));
  const s = suggestFix(r, c, null);
  assert.ok(!s?.ops.some((o) => o.kind === 'tempo'), JSON.stringify(s?.ops));
});

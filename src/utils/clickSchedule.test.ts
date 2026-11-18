import { test } from 'node:test';
import assert from 'node:assert/strict';
import { song } from './testFixtures';
import { planClicks } from './clickSchedule';

// beats at 0.5, 1.0, 1.5 … (every 0.5 s), a "1" at 0.5, 2.5, 4.5 …
const b = song(16, 4, 0, 0.5).beats;

test('clicks in the window, start inclusive, end exclusive', () => {
  assert.deepEqual(planClicks(b, 0.9, 1.6, null), [
    { songTime: 1.0, downbeat: false, at: 1.0 },
    { songTime: 1.5, downbeat: false, at: 1.5 },
  ]);
  assert.deepEqual(planClicks(b, 2.4, 2.6, null), [{ songTime: 2.5, downbeat: true, at: 2.5 }]);
  assert.deepEqual(planClicks(b, 1.0, 1.0, null), []);
  assert.deepEqual(planClicks(b, 1.0, 1.01, null), [{ songTime: 1.0, downbeat: false, at: 1.0 }]);
});

test('a loop continues at its start; positions keep counting past the loop end', () => {
  // loop 1.0–2.0: 2.0 is outside, after the jump 1.0 follows at position 2.0
  assert.deepEqual(planClicks(b, 1.8, 2.3, { start: 1.0, end: 2.0 }), [{ songTime: 1.0, downbeat: false, at: 2.0 }]);
  // second round: position 3.0 = song 1.0 again
  const two = planClicks(b, 1.9, 3.6, { start: 1.0, end: 2.0 }).map((c) => [c.songTime, c.at]);
  assert.deepEqual(two, [[1.0, 2.0], [1.5, 2.5], [1.0, 3.0], [1.5, 3.5]]);
});

test('no beats, empty or backwards window: nothing', () => {
  assert.deepEqual(planClicks([], 0, 10, null), []);
  assert.deepEqual(planClicks(b, 3, 2, null), []);
});

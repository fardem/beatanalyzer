import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDragMove, releaseSeekTime } from './waveView';

test('frame drag released: playhead goes to the time under the mouse', () => {
  assert.equal(releaseSeekTime(150, 100, 200, 180), 45);
});

test('frame drag released left / right of the overview: start / end of the song', () => {
  assert.equal(releaseSeekTime(20, 100, 200, 180), 0);
  assert.equal(releaseSeekTime(900, 100, 200, 180), 180);
});

test('overview without width: start', () => {
  assert.equal(releaseSeekTime(150, 100, 0, 180), 0);
});

test('a click on the frame without moving is no drag', () => {
  assert.equal(isDragMove(10, 13), false);
  assert.equal(isDragMove(10, 14), true);
  assert.equal(isDragMove(10, 6), true);
});

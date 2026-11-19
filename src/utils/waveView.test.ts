import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialZoomFor, isDragMove, parseDefaultWindow, releaseSeekTime, seekInFrame, toggleDefaultWindow, quickWindowClick } from './waveView';

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

const WINDOWS = [5, 15, 30, 60] as const;

test('stored default window: only one of the quick windows counts', () => {
  assert.equal(parseDefaultWindow('15', WINDOWS), 15);
  assert.equal(parseDefaultWindow('abc', WINDOWS), null);
  assert.equal(parseDefaultWindow('7', WINDOWS), null);
  assert.equal(parseDefaultWindow(null, WINDOWS), null);
});

test('double-click on a quick window sets it as default, on the default clears it', () => {
  assert.equal(toggleDefaultWindow(null, 15), 15);
  assert.equal(toggleDefaultWindow(15, 15), null);
  assert.equal(toggleDefaultWindow(15, 30), 30);
});

test('zoom when a song loads: the default window, or the whole song if it is too short', () => {
  assert.equal(initialZoomFor(180, 15, 36), 12);
  assert.equal(initialZoomFor(40, 60, 16), 1);
  assert.equal(initialZoomFor(180, null, 36), 1);
  assert.equal(initialZoomFor(1000, 5, 100), 100);
});

test('drag released past the right edge while playing: the last window from its start, not a restart at 0', () => {
  // 16 s song, 5 s frame pushed to the end (11 … 16 s); the mouse is past the right edge (time 16)
  assert.equal(seekInFrame(16, 11, 5, 16), 11);
});

test('drag released past the left edge: the start of the song', () => {
  assert.equal(seekInFrame(0, 0, 5, 16), 0);
});

test('drag released with the mouse inside the frame: the time under the mouse', () => {
  assert.equal(seekInFrame(66, 60, 15, 180), 66);
});

test('drag released in the grab margin beside the frame: the start of the frame', () => {
  assert.equal(seekInFrame(59.8, 60, 15, 180), 60);
  assert.equal(seekInFrame(75.2, 60, 15, 180), 60);
});

test('click on a quick window that is not shown: shown at once', () => {
  assert.equal(quickWindowClick(15, null, null, 1000), 'show');
  assert.equal(quickWindowClick(60, 15, { sec: 15, at: 900 }, 1000), 'show');
});

test('click on the quick window already shown: wait for a second click before going back to the whole file', () => {
  assert.equal(quickWindowClick(15, 15, null, 1000), 'wait');
  assert.equal(quickWindowClick(15, 15, { sec: 15, at: 400 }, 1000), 'wait');   // first click 600 ms ago
});

test('second click on the same quick window within 500 ms: double-click, it becomes the default', () => {
  assert.equal(quickWindowClick(15, 15, { sec: 15, at: 600 }, 1000), 'default');
  assert.equal(quickWindowClick(15, null, { sec: 15, at: 600 }, 1000), 'default');
  assert.equal(quickWindowClick(30, 15, { sec: 15, at: 900 }, 1000), 'show');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialZoomFor, isDragMove, parseDefaultWindow, releaseSeekTime, toggleDefaultWindow } from './waveView';

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

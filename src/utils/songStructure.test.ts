import { test } from 'node:test';
import assert from 'node:assert/strict';
import { song } from './testFixtures';
import { computeSongStructure, nearestBeatIndex } from './songStructure';

/** band curves with a constant level per section: [fromSecond, low, mid, high] */
function levels(duration: number, parts: [number, number, number, number][]) {
  const frameRate = 100;
  const n = Math.ceil(duration * frameRate) + 1;
  const low = new Float32Array(n);
  const mid = new Float32Array(n);
  const high = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / frameRate;
    const p = [...parts].reverse().find((x) => t >= x[0]) ?? parts[0];
    low[i] = p[1];
    mid[i] = p[2];
    high[i] = p[3];
  }
  return { frameRate, low, mid, high };
}

// 64 beats of 0.5 s, 4/4: bars every 2 s from 0.5 s; bar 9 starts at 16.5 s, bar 13 at 24.5 s
const s = song(64, 4, 0, 0.5);
const dur = s.metadata.duration;

test('a quiet intro, a loud part and a break give sections on their first "1"', () => {
  const c = levels(dur, [[0, 0.1, 0.1, 0.05], [16.5, 0.8, 0.6, 0.4], [24.5, 0.1, 0.3, 0.05]]);
  const st = computeSongStructure(s.beats, dur, c.frameRate, c.low, c.mid, c.high);
  assert.ok(st);
  assert.deepEqual(st.sections.map((x) => x.bar), [1, 9, 13]);
  assert.deepEqual(st.sections.map((x) => x.kind), ['start', 'up', 'down']);
  assert.equal(st.sections[1].time, 16.5);
  assert.ok(Math.abs(st.sections[1].level) < 0.5, 'the loud part is the loudest section');
  assert.equal(st.bars.length, 16);
});

test('a steady song has one section', () => {
  const c = levels(dur, [[0, 0.5, 0.5, 0.3]]);
  const st = computeSongStructure(s.beats, dur, c.frameRate, c.low, c.mid, c.high);
  assert.ok(st);
  assert.equal(st.sections.length, 1);
});

test('too few bars: no structure', () => {
  const short = song(20, 4, 0, 0.5);
  const c = levels(short.metadata.duration, [[0, 0.5, 0.5, 0.3]]);
  assert.equal(computeSongStructure(short.beats, short.metadata.duration, c.frameRate, c.low, c.mid, c.high), null);
});

test('nearest beat and nearest "1"', () => {
  assert.equal(s.beats[nearestBeatIndex(s.beats, 1.2)].time, 1.0);
  assert.equal(s.beats[nearestBeatIndex(s.beats, 1.2, true)].time, 0.5);
  assert.equal(s.beats[nearestBeatIndex(s.beats, 2.1, true)].time, 2.5);
});

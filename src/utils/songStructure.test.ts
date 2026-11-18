import { test } from 'node:test';
import assert from 'node:assert/strict';
import { song } from './testFixtures';
import { barFeatures, computeSongStructure, nearestBeatIndex } from './songStructure';

const SR = 22050;
const C_MAJOR = [261.63, 329.63, 392.0];
const A_MINOR = [220.0, 261.63, 329.63];

type Part = { bars: number; chord: number[]; amp?: number; square?: boolean };

/**
 * A synthetic song at 120 BPM in 4/4: a bar is 2 s, the first "1" at 0.5 s. Each part holds a chord (sine or square
 * tones) for some bars, with a short click on every beat so it sounds like music with a pulse.
 */
function synth(parts: Part[]) {
  const totalBars = parts.reduce((a, p) => a + p.bars, 0);
  const s = song(totalBars * 4, 4, 0, 0.5);
  const n = Math.ceil(s.metadata.duration * SR);
  const x = new Float32Array(n);
  let bar0 = 0;
  for (const p of parts) {
    const from = Math.floor((0.5 + bar0 * 2) * SR);
    const to = Math.min(n, Math.floor((0.5 + (bar0 + p.bars) * 2) * SR));
    const amp = (p.amp ?? 0.2) / p.chord.length;
    for (let i = from; i < to; i++) {
      let v = 0;
      for (const f of p.chord) {
        const ph = (2 * Math.PI * f * i) / SR;
        v += p.square ? Math.sign(Math.sin(ph)) * 0.6 : Math.sin(ph);
      }
      x[i] = v * amp;
    }
    bar0 += p.bars;
  }
  for (const b of s.beats) {   // beat clicks
    const at = Math.floor(b.time * SR);
    for (let k = 0; k < 200 && at + k < n; k++) x[at + k] += 0.3 * Math.exp(-k / 40) * Math.sin(k * 0.9);
  }
  const buffer = {
    sampleRate: SR,
    length: n,
    duration: n / SR,
    numberOfChannels: 1,
    getChannelData: () => x,
  } as unknown as AudioBuffer;
  return { buffer, beats: s.beats, duration: s.metadata.duration };
}

const structure = (parts: Part[]) => {
  const { buffer, beats, duration } = synth(parts);
  const f = barFeatures(buffer, beats);
  assert.ok(f);
  return computeSongStructure(f, duration);
};

test('a chord change at the same loudness is a section change (harmony)', () => {
  const st = structure([{ bars: 16, chord: C_MAJOR }, { bars: 16, chord: A_MINOR }]);
  assert.ok(st);
  assert.deepEqual(st.sections.map((x) => x.bar), [1, 17]);
  assert.equal(st.sections[1].kind, 'change');
});

test('a sound change on the same chord is a section change (timbre)', () => {
  const st = structure([{ bars: 16, chord: C_MAJOR }, { bars: 16, chord: C_MAJOR, square: true, amp: 0.12 }]);
  assert.ok(st);
  assert.deepEqual(st.sections.map((x) => x.bar), [1, 17]);
});

test('form A–B–A: the part that comes back gets the same letter', () => {
  const st = structure([{ bars: 8, chord: C_MAJOR }, { bars: 8, chord: A_MINOR }, { bars: 8, chord: C_MAJOR }]);
  assert.ok(st);
  assert.deepEqual(st.sections.map((x) => x.bar), [1, 9, 17]);
  assert.deepEqual(st.sections.map((x) => x.label), ['A', 'B', 'A']);
});

test('a steady song has one section', () => {
  const st = structure([{ bars: 32, chord: C_MAJOR }]);
  assert.ok(st);
  assert.equal(st.sections.length, 1);
  assert.equal(st.sections[0].label, 'A');
});

test('loudness still counts: quiet intro, loud part, break', () => {
  const st = structure([
    { bars: 8, chord: C_MAJOR, amp: 0.03 },
    { bars: 8, chord: C_MAJOR, amp: 0.4 },
    { bars: 8, chord: C_MAJOR, amp: 0.03 },
  ]);
  assert.ok(st);
  assert.deepEqual(st.sections.map((x) => x.bar), [1, 9, 17]);
  assert.deepEqual(st.sections.map((x) => x.kind), ['start', 'up', 'down']);
  assert.ok(Math.abs(st.sections[1].level) < 0.5, 'the loud part is the loudest section');
  assert.equal(st.bars.length, 24);
});

test('too few bars: no structure', () => {
  const { buffer, beats, duration } = synth([{ bars: 5, chord: C_MAJOR }]);
  const f = barFeatures(buffer, beats);
  assert.equal(f ? computeSongStructure(f, duration) : null, null);
});

test('nearest beat and nearest "1"', () => {
  const s = song(64, 4, 0, 0.5);
  assert.equal(s.beats[nearestBeatIndex(s.beats, 1.2)].time, 1.0);
  assert.equal(s.beats[nearestBeatIndex(s.beats, 1.2, true)].time, 0.5);
  assert.equal(s.beats[nearestBeatIndex(s.beats, 2.1, true)].time, 2.5);
});

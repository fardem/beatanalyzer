import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AnalysisResult, BeatItem } from '../types/analyzer';
import {
  applyGridOps,
  GridOp,
  opsFromBeatEdit,
  scaleGridTempo,
  setBeatsPerBar,
  shiftDownbeat,
  shiftGridHalfBeat,
} from './beatTransforms';

/** A steady song: `count` beats every 0.5 s (120 BPM) from 0.5 s, a "1" every `meter` beats from `firstDown`. */
function song(count = 32, meter = 4, firstDown = 0): AnalysisResult {
  const beats: BeatItem[] = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    time: 0.5 + i * 0.5,
    beatInBar: 1,
    barIndex: 1,
    isDownbeat: i >= firstDown && (i - firstDown) % meter === 0,
    confidence: 0.9,
    instantBpm: 120,
    deltaMs: 500,
  }));
  return {
    metadata: { fileName: 'song.wav', fileSize: 1, duration: 0.5 + count * 0.5, sampleRate: 44100, channels: 2, format: 'WAV' },
    beats,
    downbeats: beats.filter((b) => b.isDownbeat),
    globalBpm: 120,
    averageBpm: 120,
    medianBpm: 120,
    minBpm: 120,
    maxBpm: 120,
    tempoStability: 100,
    timeSignature: { numerator: meter, denominator: 4, name: `${meter}/4`, barShare: 100 },
    swingRatio: 50,
    totalBeats: count,
    totalBars: beats.filter((b) => b.isDownbeat).length,
    activationCurve: [],
    waveformPeaks: new Float32Array(0),
    waveformDuration: 0.5 + count * 0.5,
  };
}

const downIdx = (r: AnalysisResult) => r.beats.flatMap((b, i) => (b.isDownbeat ? [i] : []));

test('downbeat +1 and -1 are inverse', () => {
  const r = song();
  const later = shiftDownbeat(r, 1);
  assert.deepEqual(downIdx(later).slice(0, 3), [1, 5, 9]);
  assert.deepEqual(downIdx(shiftDownbeat(later, -1)), downIdx(r));
});

test('half beat moves every beat to the middle between two beats', () => {
  const r = shiftGridHalfBeat(song(), 1);
  assert.equal(r.beats[0].time, 0.75);
  assert.equal(r.beats[1].time, 1.25);
});

test('tempo ½× keeps every second beat and halves the tempo', () => {
  const r = scaleGridTempo(song(32), 0.5);
  assert.equal(r.beats.length, 16);
  assert.equal(r.globalBpm, 60);
  assert.equal(r.beats[1].time - r.beats[0].time, 1);
});

test('tempo 2× doubles the beats', () => {
  const r = scaleGridTempo(song(8), 2);
  assert.equal(r.beats.length, 15);
  assert.equal(r.globalBpm, 240);
});

test('beats per bar: 3/4 song corrected to 4/4 from the first "1"', () => {
  const r = setBeatsPerBar(song(24, 3, 1), 4);
  assert.equal(r.timeSignature.numerator, 4);
  assert.equal(r.timeSignature.name, '4/4');
  assert.deepEqual(downIdx(r).slice(0, 3), [1, 5, 9]);
  assert.equal(r.beats[0].beatInBar, 4);          // pickup before the first "1"
  assert.equal(r.totalBars, downIdx(r).length);
});

test('"Mensch" case: librosa 174 BPM in 3/4 -> ½× and 4/4 gives 87 BPM in 4/4', () => {
  const fast = { ...song(48, 3), globalBpm: 174 };
  const r = applyGridOps(fast, [{ kind: 'tempo', factor: 0.5 }, { kind: 'meter', beats: 4 }]);
  assert.equal(r.timeSignature.name, '4/4');
  assert.equal(r.globalBpm, 60);                   // 120 BPM grid of the fixture halved
  assert.equal(r.beats.length, 24);
  assert.deepEqual(downIdx(r).slice(0, 2), [0, 4]);
});

test('steps replay on a new result with other bars (smoothing) – beats stay where the user put them', () => {
  const ops: GridOp[] = [{ kind: 'downbeat', dir: 1 }, { kind: 'nudge', time: 3.5, to: 3.51 }];
  const before = applyGridOps(song(16, 4, 0), ops);
  const afterSmoothing = applyGridOps(song(16, 4, 0), ops);   // same beats as the server returns them
  assert.deepEqual(afterSmoothing.beats.map((b) => b.time), before.beats.map((b) => b.time));
  assert.ok(afterSmoothing.beats.some((b) => b.time === 3.51));
  assert.deepEqual(downIdx(afterSmoothing), downIdx(before));
});

test('undo = the same steps without the last one', () => {
  const base = song();
  const ops: GridOp[] = [{ kind: 'downbeat', dir: 1 }, { kind: 'meter', beats: 3 }];
  assert.deepEqual(downIdx(applyGridOps(base, ops.slice(0, 1))), downIdx(shiftDownbeat(base, 1)));
  assert.deepEqual(downIdx(applyGridOps(base, [])), downIdx(base));
});

test('beat table edits become steps (nudge, downbeat toggle)', () => {
  const r = song(8);
  const edited = r.beats.map((b, i) => (i === 2 ? { ...b, time: 1.51, isDownbeat: true } : b));
  const ops = opsFromBeatEdit(r.beats, edited);
  assert.deepEqual(ops, [
    { kind: 'nudge', time: 1.5, to: 1.51 },
    { kind: 'toggle', time: 1.51, downbeat: true },
  ]);
  const out = applyGridOps(r, ops);
  assert.ok(out.beats.find((b) => b.time === 1.51)?.isDownbeat);
});

test('a step whose beat is gone does nothing', () => {
  const r = song(8);
  assert.deepEqual(applyGridOps(r, [{ kind: 'nudge', time: 99, to: 100 }]).beats.map((b) => b.time), r.beats.map((b) => b.time));
});

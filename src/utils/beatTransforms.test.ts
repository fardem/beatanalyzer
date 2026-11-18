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

test('section: tempo ½× only inside the range, beats outside untouched', () => {
  const r = song(40);   // beats 0.5 ... 20.0 s
  const out = applyGridOps(r, [{ kind: 'tempo', factor: 0.5, range: { start: 5, end: 10 } }]);
  const times = out.beats.map((b) => b.time);
  assert.deepEqual(times.filter((t) => t < 5), r.beats.map((b) => b.time).filter((t) => t < 5));
  assert.deepEqual(times.filter((t) => t > 10), r.beats.map((b) => b.time).filter((t) => t > 10));
  // 11 beats in 5 ... 10 s; every second one stays, in step with the first "1" in the section (6.5 s)
  assert.deepEqual(times.filter((t) => t >= 5 && t <= 10), [5.5, 6.5, 7.5, 8.5, 9.5]);
  assert.ok(out.beats.find((b) => b.time === 6.5)?.isDownbeat);
  assert.equal(out.globalBpm, r.globalBpm);                          // the song tempo stays
});

test('section: bar start +1 only inside the range', () => {
  const r = song(40);
  const out = applyGridOps(r, [{ kind: 'downbeat', dir: 1, range: { start: 8.4, end: 12.6 } }]);
  const downTimes = out.beats.filter((b) => b.isDownbeat).map((b) => b.time);
  assert.ok(downTimes.includes(0.5) && downTimes.includes(16.5));   // outside unchanged
  assert.ok(downTimes.includes(9) && !downTimes.includes(8.5));     // inside one beat later
});

test('section: half beat keeps a gap to the beats after the section', () => {
  const r = song(40);
  const out = applyGridOps(r, [{ kind: 'half', dir: 1, range: { start: 5, end: 10 } }]);
  const t = out.beats.map((b) => b.time);
  for (let i = 1; i < t.length; i++) assert.ok(t[i] - t[i - 1] >= 0.08, `${t[i - 1]} -> ${t[i]}`);
});

// --- insert / delete single beats (a beat the model missed or set too much) ---
import { deleteBeat, insertBeat } from './beatTransforms';

/** a 4/4 song whose 3rd bar lost its 3rd beat (time 5.5) */
function withGap(): AnalysisResult {
  const s = song(32, 4, 0);
  return applyGridOps({ ...s, beats: s.beats.filter((b) => b.time !== 5.5) }, []);
}

test('insert fills a missing beat: the bar has 4 beats again, bar count unchanged', () => {
  const broken = applyGridOps(withGap(), [{ kind: 'toggle', time: 0.5, downbeat: true }]);
  const fixed = insertBeat(broken, 5.5);
  const bar3 = fixed.beats.filter((b) => b.barIndex === 3);
  assert.equal(bar3.length, 4);
  assert.equal(fixed.totalBars, broken.totalBars);
  const inserted = fixed.beats.find((b) => b.time === 5.5)!;
  assert.equal(inserted.isDownbeat, false);
  assert.equal(inserted.confidence, null);
  assert.equal(Math.round(inserted.instantBpm), 120);
});

test('insert next to an existing beat (< 30 ms) changes nothing', () => {
  const s = song(16);
  assert.equal(insertBeat(s, 1.01), s);
});

test('delete a downbeat: the bar before gets longer, numbering stays without gaps', () => {
  const s = song(16);   // downbeats at 0.5, 2.5, 4.5, 6.5
  const d = deleteBeat(s, 2.5);
  assert.equal(d.beats.length, 15);
  assert.equal(d.beats.filter((b) => b.barIndex === 1).length, 7);
  assert.deepEqual([...new Set(d.beats.map((b) => b.barIndex))], [1, 2, 3]);
});

test('delete keeps at least 2 beats; unknown time changes nothing', () => {
  const two = song(2);
  assert.equal(deleteBeat(two, 0.5), two);
  const s = song(8);
  assert.equal(deleteBeat(s, 9.99), s);
});

test('insert and delete are replayable steps (re-analysis with other smoothing)', () => {
  const ops: GridOp[] = [{ kind: 'insert', time: 3.25 }, { kind: 'delete', time: 6.0 }, { kind: 'meter', beats: 3 }];
  const a = applyGridOps(song(24), ops);
  const b = applyGridOps(song(24), ops);
  assert.deepEqual(a.beats.map((x) => [x.time, x.barIndex, x.beatInBar]), b.beats.map((x) => [x.time, x.barIndex, x.beatInBar]));
  assert.ok(a.beats.some((x) => x.time === 3.25));
  assert.ok(!a.beats.some((x) => x.time === 6.0));
});

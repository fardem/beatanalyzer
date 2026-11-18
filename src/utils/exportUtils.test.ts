import { test } from 'node:test';
import assert from 'node:assert/strict';
import { song } from './testFixtures';
import { generateAudacityLabels, generateMidiBytes, generateResolveMarkerJson } from './exportUtils';

const s = song(32, 4, 0, 0.5);   // beats at 0.5, 1.0, ...; a "1" every 4 beats

test('cue marks and section changes go onto the marker of their beat', () => {
  const data = JSON.parse(
    generateResolveMarkerJson(s, { cues: [1.5, 3.0], sections: [{ time: 4.5, kind: 'up', delta: 6.43 }] })
  );
  const at = (t: number) => data.markers.find((m: { time: number }) => m.time === t);
  assert.equal(data.markers.length, 32);
  assert.equal(at(1.5).cue, 1);
  assert.equal(at(3.0).cue, 2);
  assert.equal(at(4.5).section, 'up');
  assert.equal(at(4.5).sectionDelta, 6.4);
  assert.equal(at(1.0).cue, undefined);
});

test('only downbeats keeps cue beats', () => {
  const data = JSON.parse(generateResolveMarkerJson(s, { onlyDownbeats: true, cues: [1.5] }));
  assert.equal(data.markers.length, 8 + 1);
  assert.ok(data.markers.some((m: { time: number; cue?: number }) => m.time === 1.5 && m.cue === 1));
});

test('Audacity labels get cue and section labels', () => {
  const txt = generateAudacityLabels(s, { cues: [1.5], sections: [{ time: 4.5, kind: 'down', delta: -4 }] });
  assert.match(txt, /1\.500000\t1\.500000\tCue 1/);
  assert.match(txt, /4\.500000\t4\.500000\tSection ▼ -4 dB/);
});

/** reads a format-0 MIDI file: seconds of every Note-On (tempo events honoured), PPQ, time signature, note ticks */
function readMidi(bytes: Uint8Array) {
  const ppq = (bytes[12] << 8) | bytes[13];
  const format = (bytes[8] << 8) | bytes[9];
  let i = 22;   // after MThd (14) + MTrk header (8)
  const vlq = () => {
    let v = 0;
    let b;
    do {
      b = bytes[i++];
      v = (v << 7) | (b & 0x7f);
    } while (b & 0x80);
    return v;
  };
  let tick = 0;
  let sec = 0;
  let usPerQ = 500000;
  const notes: { sec: number; tick: number; pitch: number }[] = [];
  let timeSig: number[] = [];
  while (i < bytes.length) {
    const d = vlq();
    tick += d;
    sec += (d / ppq) * (usPerQ / 1e6);
    const st = bytes[i++];
    if (st === 0xff) {
      const type = bytes[i++];
      const len = vlq();
      const data = bytes.slice(i, i + len);
      i += len;
      if (type === 0x51) usPerQ = (data[0] << 16) | (data[1] << 8) | data[2];
      if (type === 0x58) timeSig = [...data];
      if (type === 0x2f) break;
    } else {
      const a = bytes[i++];
      const v = bytes[i++];
      if ((st & 0xf0) === 0x90 && v > 0) notes.push({ sec, tick, pitch: a });
    }
  }
  return { ppq, format, notes, timeSig };
}

test('MIDI: tempo map puts every click on its beat, also with a wobbling tempo', () => {
  const w = song(32, 4, 0, 0.5);
  const step = [0.5, 0.52, 0.48, 0.51, 0.49];
  let t = 0.5;
  const beats = w.beats.map((b, i) => {
    const out = { ...b, time: Math.round(t * 1000) / 1000 };
    t += step[i % step.length];
    return out;
  });
  const m = readMidi(generateMidiBytes({ ...w, beats }));
  assert.equal(m.format, 0);
  assert.equal(m.ppq, 480);
  assert.equal(m.notes.length, beats.length);
  m.notes.forEach((n, i) => assert.ok(Math.abs(n.sec - beats[i].time) < 0.001, `beat ${i}: ${n.sec} vs ${beats[i].time}`));
  assert.deepEqual(m.timeSig.slice(0, 2), [4, 2]);   // 4/4: denominator as power of 2
});

test('MIDI: pickup and a short lead-in – the first "1" lands on a bar line', () => {
  const p = song(33, 4, 1, 0.5);   // one beat before the first "1"
  const beats = p.beats.map((b) => ({ ...b, time: Math.round((b.time - 0.45) * 1000) / 1000 }));   // first beat 0.05 s
  const m = readMidi(generateMidiBytes({ ...p, beats }));
  m.notes.forEach((n, i) => assert.ok(Math.abs(n.sec - beats[i].time) < 0.001, `beat ${i}`));
  const firstOne = beats.findIndex((b) => b.isDownbeat);
  assert.equal(m.notes[firstOne].tick % (4 * 480), 0);
  assert.equal(m.notes[firstOne].pitch, 76);
});

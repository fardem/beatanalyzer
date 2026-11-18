import { test } from 'node:test';
import assert from 'node:assert/strict';
import { song } from './testFixtures';
import { generateAudacityLabels, generateResolveMarkerJson } from './exportUtils';

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

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ORDER, isDefaultLayout, movePanel, movePanelBy, sanitizeLayout } from './panelLayout';

test('default order: structure right below the player', () => {
  assert.deepEqual(DEFAULT_ORDER.slice(0, 3), ['waveform', 'player', 'structure']);
});

test('move a panel before / after another', () => {
  assert.deepEqual(movePanel(DEFAULT_ORDER, 'table', 'player', 'before'), ['waveform', 'table', 'player', 'structure', 'evidence', 'tempo']);
  assert.deepEqual(movePanel(DEFAULT_ORDER, 'waveform', 'tempo', 'after'), ['player', 'structure', 'evidence', 'tempo', 'waveform', 'table']);
  assert.deepEqual(movePanel(DEFAULT_ORDER, 'player', 'player', 'after'), DEFAULT_ORDER);
});

test('arrow keys move one place and stop at the ends', () => {
  assert.deepEqual(movePanelBy(DEFAULT_ORDER, 'player', -1).slice(0, 2), ['player', 'waveform']);
  assert.deepEqual(movePanelBy(DEFAULT_ORDER, 'waveform', -1), DEFAULT_ORDER);
  assert.deepEqual(movePanelBy(DEFAULT_ORDER, 'table', 1), DEFAULT_ORDER);
});

test('a stored layout is cleaned: unknown ids dropped, new panels inserted at their default place', () => {
  const l = sanitizeLayout({ order: ['table', 'expert', 'player', 'waveform', 'table'], collapsed: { player: true, x: true, table: 'no' } });
  assert.deepEqual(l.order, ['table', 'player', 'structure', 'evidence', 'tempo', 'waveform']);
  assert.deepEqual(l.collapsed, { player: true });
  assert.ok(isDefaultLayout(sanitizeLayout(null)));
  assert.ok(isDefaultLayout(sanitizeLayout('garbage')));
});

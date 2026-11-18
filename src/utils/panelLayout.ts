/**
 * Order and folded state of the panels below the six number tiles. Every user can build an own view: panels are
 * moved by dragging their grip (or with the arrow keys on it) and folded by their title; the layout is kept in the
 * browser. The number tiles stay on top and are not part of it.
 */

export type PanelId = 'waveform' | 'player' | 'structure' | 'evidence' | 'tempo' | 'table';

/** default view of a cutter: song, player, song structure with the live view, then the grid checks */
export const DEFAULT_ORDER: PanelId[] = ['waveform', 'player', 'structure', 'evidence', 'tempo', 'table'];

export interface PanelLayout {
  order: PanelId[];
  /** folded per panel; missing = the default of the panel (tempo: folded while the tempo is steady) */
  collapsed: Partial<Record<PanelId, boolean>>;
}

export const STORAGE_LAYOUT_KEY = 'beatanalyzer.layout';

export function defaultLayout(): PanelLayout {
  return { order: [...DEFAULT_ORDER], collapsed: {} };
}

const isPanelId = (v: unknown): v is PanelId => typeof v === 'string' && (DEFAULT_ORDER as string[]).includes(v);

/** A stored layout as far as it is usable: unknown ids dropped, missing panels appended at their default place. */
export function sanitizeLayout(raw: unknown): PanelLayout {
  const out = defaultLayout();
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as { order?: unknown; collapsed?: unknown };
  if (Array.isArray(r.order)) {
    const seen: PanelId[] = [];
    for (const id of r.order) if (isPanelId(id) && !seen.includes(id)) seen.push(id);
    // a panel the stored order does not know yet (new version) goes behind its default predecessor
    for (const id of DEFAULT_ORDER) {
      if (seen.includes(id)) continue;
      const before = DEFAULT_ORDER.slice(0, DEFAULT_ORDER.indexOf(id)).reverse().find((p) => seen.includes(p));
      seen.splice(before ? seen.indexOf(before) + 1 : 0, 0, id);
    }
    out.order = seen;
  }
  if (r.collapsed && typeof r.collapsed === 'object') {
    for (const [k, v] of Object.entries(r.collapsed as Record<string, unknown>)) {
      if (isPanelId(k) && typeof v === 'boolean') out.collapsed[k] = v;
    }
  }
  return out;
}

/** Moves `id` before or after `target`. */
export function movePanel(order: PanelId[], id: PanelId, target: PanelId, place: 'before' | 'after'): PanelId[] {
  if (id === target) return order;
  const rest = order.filter((p) => p !== id);
  const i = rest.indexOf(target);
  if (i < 0) return order;
  rest.splice(place === 'before' ? i : i + 1, 0, id);
  return rest;
}

/** Moves `id` one place up (-1) or down (+1); for the arrow keys on the grip. */
export function movePanelBy(order: PanelId[], id: PanelId, delta: -1 | 1): PanelId[] {
  const i = order.indexOf(id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= order.length) return order;
  const next = [...order];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function isDefaultLayout(layout: PanelLayout): boolean {
  return layout.order.every((id, i) => id === DEFAULT_ORDER[i]) && Object.keys(layout.collapsed).length === 0;
}

export function loadLayout(): PanelLayout {
  try {
    const s = localStorage.getItem(STORAGE_LAYOUT_KEY);
    return s ? sanitizeLayout(JSON.parse(s)) : defaultLayout();
  } catch {
    return defaultLayout();
  }
}

export function saveLayout(layout: PanelLayout): void {
  try {
    if (isDefaultLayout(layout)) localStorage.removeItem(STORAGE_LAYOUT_KEY);
    else localStorage.setItem(STORAGE_LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    // Ignore storage errors
  }
}

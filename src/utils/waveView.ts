// Small pure helpers of the waveform view (overview frame, quick windows).

/** below this many pixels a press on the blue frame is a click, not a drag */
const DRAG_MIN_PX = 4;

/** Time under the mouse in the overview, clamped to the song (left of it = start, right of it = end). */
export function releaseSeekTime(clientX: number, rectLeft: number, rectWidth: number, duration: number): number {
  if (!(rectWidth > 0)) return 0;
  const frac = Math.max(0, Math.min(1, (clientX - rectLeft) / rectWidth));
  return frac * duration;
}

/** true when the mouse moved far enough between press and release to count as a drag */
export function isDragMove(startX: number, endX: number): boolean {
  return Math.abs(endX - startX) >= DRAG_MIN_PX;
}

/** localStorage key of the default quick window (seconds) applied when a song loads */
export const DEFAULT_WINDOW_KEY = 'beatanalyzer.waveDefaultWindow';

/** stored default window; anything that is not one of the quick windows counts as none */
export function parseDefaultWindow(raw: string | null, allowed: readonly number[]): number | null {
  if (raw === null) return null;
  const v = Number(raw);
  return allowed.includes(v) ? v : null;
}

/** double-click on a quick window: it becomes the default, or the default is cleared when it already was */
export function toggleDefaultWindow(current: number | null, sec: number): number | null {
  return current === sec ? null : sec;
}

/** zoom when a song loads: the default window, or the whole song when there is none or the song is too short */
export function initialZoomFor(duration: number, defaultSec: number | null, maxZoom: number): number {
  if (defaultSec === null || !(duration > defaultSec)) return 1;
  return Math.min(maxZoom, duration / defaultSec);
}

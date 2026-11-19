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

/** a release this close to the end of the song counts as "past the end" (the song would stop at once) */
const END_MARGIN_SEC = 0.05;

/**
 * Time to play from after a drag of the blue frame: the time under the mouse when it is inside the frame; the start
 * of the frame when the mouse is beside it (grab margin, past the right edge) or at the very end of the song – a seek
 * to the end would stop the song at once and show the start again.
 */
export function seekInFrame(time: number, frameStart: number, frameLength: number, duration: number): number {
  const frameEnd = Math.min(frameStart + frameLength, duration - END_MARGIN_SEC);
  return time >= frameStart && time < frameEnd ? time : frameStart;
}

/** two clicks on the same quick window within this time are a double-click */
export const QUICK_DOUBLE_CLICK_MS = 500;

/**
 * What a click on a quick window does (wish of the user, test 0.6.2 G2):
 * - 'default': the second click on the same window within 500 ms – it becomes (or stops being) the default;
 * - 'wait': a click on the window already shown – back to the whole file only if no second click follows in 500 ms,
 *   so a double-click does not flash the whole file in between;
 * - 'show': any other window – shown at once.
 */
export function quickWindowClick(
  sec: number,
  activeSec: number | null,
  last: { sec: number; at: number } | null,
  now: number
): 'default' | 'wait' | 'show' {
  if (last && last.sec === sec && now - last.at < QUICK_DOUBLE_CLICK_MS) return 'default';
  return activeSec === sec ? 'wait' : 'show';
}

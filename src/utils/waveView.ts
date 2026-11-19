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

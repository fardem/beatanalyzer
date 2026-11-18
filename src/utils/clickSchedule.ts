import { BeatItem } from '../types/analyzer';

export interface PlannedClick {
  /** time of the beat in the song (s) */
  songTime: number;
  downbeat: boolean;
  /** playback position of the click: song time while the loop has not wrapped, then it keeps counting on
   *  (loop end + time since the loop start), so the AudioContext time is startTime + at / playbackRate */
  at: number;
}

/** index of the first beat with time >= t (beats sorted) */
function firstAtOrAfter(beats: BeatItem[], t: number): number {
  let lo = 0;
  let hi = beats.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (beats[mid].time < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Metronome clicks for the playback positions [from, to) – planned ahead and started on the exact AudioContext
 * time (a click triggered from the drawing loop lands up to ~25 ms late and wobbles). With a loop the source
 * jumps from loop.end back to loop.start; positions keep counting, so each round gets its own clicks.
 */
export function planClicks(
  beats: BeatItem[],
  from: number,
  to: number,
  loop: { start: number; end: number } | null
): PlannedClick[] {
  const out: PlannedClick[] = [];
  if (!(to > from) || beats.length === 0) return out;
  const take = (a: number, b: number, shift: number) => {
    for (let i = firstAtOrAfter(beats, a); i < beats.length && beats[i].time < b; i++) {
      out.push({ songTime: beats[i].time, downbeat: beats[i].isDownbeat, at: beats[i].time + shift });
    }
  };
  const len = loop ? loop.end - loop.start : 0;
  if (!loop || len <= 0 || to <= loop.end) {
    take(from, to, 0);
    return out;
  }
  // first part up to the loop end, then the rounds of the loop
  if (from < loop.end) take(from, loop.end, 0);
  let roundStart = loop.end;   // position where the current round begins (song time loop.start)
  if (from > roundStart) roundStart += Math.floor((from - loop.end) / len) * len;
  for (; roundStart < to; roundStart += len) {
    const shift = roundStart - loop.start;
    take(Math.max(from, roundStart) - shift, Math.min(to, roundStart + len) - shift, shift);
  }
  return out;
}

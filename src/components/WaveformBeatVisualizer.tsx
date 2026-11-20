import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { AnalysisResult, BeatItem } from '../types/analyzer';
import { ZoomIn, ZoomOut, Maximize2, Search } from 'lucide-react';
import {
  DEFAULT_WINDOW_KEY,
  initialZoomFor,
  QUICK_DOUBLE_CLICK_MS,
  quickWindowClick,
  frameDragSeek,
  parseDefaultWindow,
  toggleDefaultWindow,
} from '../utils/waveView';
import { useI18n } from '../i18n';

interface WaveformBeatVisualizerProps {
  result: AnalysisResult;
  audioBuffer?: AudioBuffer | null;
  /** looped range in seconds, marked in the waveform */
  loopRange?: { start: number; end: number } | null;
  /** the section the waveform shows (for the loop "section") */
  onViewChange?: (start: number, end: number) => void;
  /** false while the loop follows the blue frame: the view must not jump back to the playhead */
  followPlayhead?: boolean;
  currentTime: number;
  onSeek: (time: number) => void;
  activeBeat: BeatItem | null;
  /** Shift+click adds a beat, Alt+click removes the nearest one (only when ≤ EDIT_MAX_VISIBLE_SEC are shown) */
  onEditBeat?: (op: { kind: 'insert'; time: number } | { kind: 'delete'; time: number }) => void;
  /** double-click on the blue frame of the overview: play the section it shows from its start */
  onPlayFrom?: (time: number) => void;
}

const EDIT_MAX_VISIBLE_SEC = 30;   // wider views are too coarse to place a beat by hand
const DELETE_HIT_PX = 8;

const LOUPE_MIN_VISIBLE_SEC = 45;
const LOUPE_TARGET_OPTICAL_GAIN = 5.0;
const LOUPE_MIN_WINDOW_SEC = 3.0;
const LOUPE_MAX_WINDOW_SEC = 12.0;
const LOUPE_WIDTH_PX = 264;
const LOUPE_CANVAS_HEIGHT_PX = 82;
const LOUPE_TOTAL_HEIGHT_PX = 108;
const QUICK_WINDOWS_SEC = [5, 15, 30, 60] as const; // quick selection of the visible window around the playhead

const TIME_STEPS = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
const MIN_TIME_LABEL_PX = 64;   // "1:07.25" plus a gap
const MIN_BAR_LABEL_PX = 64;    // "Takt 124" flag plus a gap
const MIN_BEAT_LABEL_PX = 14;   // beat numbers 2, 3, 4

// typical length of a bar in seconds (median of the downbeat intervals); 2 s if there are no two downbeats
function medianBarSeconds(beats: BeatItem[]): number {
  const downs = beats.filter((b) => b.isDownbeat).map((b) => b.time);
  const gaps = downs.slice(1).map((t, i) => t - downs[i]).filter((g) => g > 0).sort((a, b) => a - b);
  return gaps.length ? gaps[Math.floor(gaps.length / 2)] : 2;
}

// Detailed peaks of the decoded audio: min, max and RMS per block of DETAIL_BLOCK samples (≈ 6 ms at 44.1 kHz).
// The 2400 peaks of the analysis cover a whole song (≈ 90 ms each for 3:30): too coarse to see a beat when zoomed in.
const DETAIL_BLOCK = 256;
interface DetailPeaks {
  min: Float32Array;
  max: Float32Array;
  rms: Float32Array;
  blockSec: number;
}

function buildDetailPeaks(buffer: AudioBuffer): DetailPeaks {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  const n = Math.ceil(buffer.length / DETAIL_BLOCK);
  const min = new Float32Array(n);
  const max = new Float32Array(n);
  const rms = new Float32Array(n);
  let peak = 1e-9;
  for (let b = 0; b < n; b++) {
    const start = b * DETAIL_BLOCK;
    const end = Math.min(buffer.length, start + DETAIL_BLOCK);
    let lo = 0;
    let hi = 0;
    let sq = 0;
    for (let i = start; i < end; i++) {
      let v = 0;
      for (const ch of channels) v += ch[i];
      v /= channels.length;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
      sq += v * v;
    }
    min[b] = lo;
    max[b] = hi;
    rms[b] = Math.sqrt(sq / Math.max(1, end - start));
    peak = Math.max(peak, hi, -lo);
  }
  for (let b = 0; b < n; b++) {   // normalised like the peaks of the analysis
    min[b] /= peak;
    max[b] /= peak;
    rms[b] /= peak;
  }
  return { min, max, rms, blockSec: DETAIL_BLOCK / buffer.sampleRate };
}

// One column per canvas pixel from min to max (as in DaVinci), with the RMS as a brighter core: attacks stand out.
function drawDetailWave(
  ctx: CanvasRenderingContext2D, d: DetailPeaks, t0: number, span: number, width: number, midY: number, amp: number
) {
  const blocks = d.min.length;
  for (let x = 0; x < width; x++) {
    const a = Math.max(0, Math.floor(((t0 + (x / width) * span) / d.blockSec)));
    const e = Math.min(blocks, Math.max(a + 1, Math.floor(((t0 + ((x + 1) / width) * span) / d.blockSec))));
    if (a >= blocks) break;
    let lo = 0;
    let hi = 0;
    let r = 0;
    for (let b = a; b < e; b++) {
      if (d.min[b] < lo) lo = d.min[b];
      if (d.max[b] > hi) hi = d.max[b];
      if (d.rms[b] > r) r = d.rms[b];
    }
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(x, midY - hi * amp, 1, Math.max(1, (hi - lo) * amp));
    ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
    ctx.fillRect(x, midY - r * amp, 1, Math.max(1, 2 * r * amp));
  }
}

function formatSongLength(seconds: number): string {
  const total = Math.round(Math.max(0, seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function formatLoupeTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = (safe % 60).toFixed(3).padStart(6, '0');
  return `${mins}:${secs}`;
}

export const WaveformBeatVisualizer: React.FC<WaveformBeatVisualizerProps> = ({
  result,
  audioBuffer,
  loopRange,
  onViewChange,
  followPlayhead = true,
  currentTime,
  onSeek,
  activeBeat,
  onEditBeat,
  onPlayFrom,
}) => {
  // the detailed waveform of the current view, drawn once and reused while only the playhead moves
  const waveCacheRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  const { t, num } = useI18n();
  const detail = useMemo(() => {
    waveCacheRef.current = null;   // a new song: draw anew
    return audioBuffer ? buildDetailPeaks(audioBuffer) : null;
  }, [audioBuffer]);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom & View state
  const [zoom, setZoom] = useState<number>(1.0); // 1.0 = fit whole song
  const [scrollOffsetSec, setScrollOffsetSec] = useState<number>(0);
  const [showBaf, setShowBaf] = useState<boolean>(true);
  const [showDaf, setShowDaf] = useState<boolean>(true);
  const [showBeats, setShowBeats] = useState<boolean>(true);
  const [isLoupeEnabled, setIsLoupeEnabled] = useState<boolean>(false);
  // quick window applied when a song loads; set by double-click on 5 s / 15 s / ... (wish of the user, test 0.6.1)
  // last click on a quick window and the pending "back to the whole file" (double-click detection, test 0.6.2 G2)
  const quickLastClickRef = useRef<{ sec: number; at: number } | null>(null);
  const quickResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (quickResetTimerRef.current) clearTimeout(quickResetTimerRef.current);
  }, []);
  const [defaultWindow, setDefaultWindow] = useState<number | null>(() => {
    try {
      return parseDefaultWindow(localStorage.getItem(DEFAULT_WINDOW_KEY), QUICK_WINDOWS_SEC);
    } catch {
      return null;
    }
  });

  // Mouse drag / interaction state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [minimapDragMode, setMinimapDragMode] = useState<'none' | 'pan' | 'seek'>('none');
  const [isHoveringViewportBox, setIsHoveringViewportBox] = useState<boolean>(false);
  const minimapDragStartRef = useRef<{ startX: number; startOffsetSec: number } | null>(null);
  // the frame was dragged (moved 4 px) since it was grabbed: from then on the playhead follows the mouse
  const frameDraggedRef = useRef<boolean>(false);
  const prevCurrentTimeRef = useRef<number>(currentTime);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    time: number;
    beat: BeatItem | null;
  } | null>(null);

  const onViewChangeRef = useRef(onViewChange);
  onViewChangeRef.current = onViewChange;
  const lastReportedViewRef = useRef<{ start: number; end: number } | null>(null);

  const duration = result.metadata.duration || 1;
  // the smallest quick window (5 s) must stay reachable on long songs
  const maxZoom = Math.max(16.0, duration / QUICK_WINDOWS_SEC[0]);
  const visibleDuration = duration / zoom;
  useEffect(() => {
    const start = scrollOffsetSec;
    const end = Math.min(duration, scrollOffsetSec + visibleDuration);
    const prev = lastReportedViewRef.current;
    if (prev && Math.abs(prev.start - start) < 1e-6 && Math.abs(prev.end - end) < 1e-6) {
      return;
    }
    lastReportedViewRef.current = { start, end };
    onViewChangeRef.current?.(start, end);
  }, [scrollOffsetSec, visibleDuration, duration]);
  const activeQuickWindow =
    QUICK_WINDOWS_SEC.find((sec) => duration > sec && Math.abs(visibleDuration - sec) < 0.25) ?? null;

  const hasDafCurve = result.activationCurve.some((pt) => pt.downbeatActivation !== null);
  const isMdModel = result.engineInfo?.id === 'md_beat_this' || result.selectedModel === 'md_beat_this';
  const dafTooltip = hasDafCurve
    ? t('web.wave.daf_tip')
    : isMdModel
    ? t('web.wave.daf_md')
    : t('web.wave.daf_none');
  const bafTooltip =
    result.activationSource === 'onset'
      ? t('web.wave.baf_onset')
      : t('web.wave.baf_tip');

  // Loupe is only useful when overview shows >= 45s; below that, main view already provides detail resolution
  const isLoupeApplicable = visibleDuration >= LOUPE_MIN_VISIBLE_SEC;
  const isLoupeActive = isLoupeEnabled && isLoupeApplicable;

  // Adaptive loupe window targeting ~5x true pixel-per-second density over current main canvas
  const safeMainWidth = Math.max(320, containerWidth);
  const rawLoupeWindow =
    (visibleDuration * (LOUPE_WIDTH_PX / safeMainWidth)) / LOUPE_TARGET_OPTICAL_GAIN;
  const loupeSpan = Math.min(
    duration,
    Math.round(Math.max(LOUPE_MIN_WINDOW_SEC, Math.min(LOUPE_MAX_WINDOW_SEC, rawLoupeWindow)) * 2) / 2
  );
  const opticalMagnification =
    (LOUPE_WIDTH_PX / Math.max(0.5, loupeSpan)) / (safeMainWidth / Math.max(0.5, visibleDuration));

  // a new song: start with the default quick window, if one is set
  useEffect(() => {
    if (!audioBuffer || defaultWindow === null) return;
    const songDur = audioBuffer.duration || duration;
    const songMaxZoom = Math.max(16.0, songDur / QUICK_WINDOWS_SEC[0]);
    setZoom(initialZoomFor(songDur, defaultWindow, songMaxZoom));
    setScrollOffsetSec(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when a new song is loaded
  }, [audioBuffer]);

  // Auto-scroll only when playhead itself moves beyond the visible viewport (so user panning isn't overwritten)
  useEffect(() => {
    const playheadMoved = Math.abs(currentTime - prevCurrentTimeRef.current) > 0.0001;
    prevCurrentTimeRef.current = currentTime;
    if (!playheadMoved || minimapDragMode === 'pan' || !followPlayhead) return;

    if (currentTime < scrollOffsetSec || currentTime > scrollOffsetSec + visibleDuration) {
      const newOffset = Math.max(0, Math.min(currentTime - visibleDuration * 0.35, duration - visibleDuration));
      if (Math.abs(newOffset - scrollOffsetSec) > 1e-4) {
        setScrollOffsetSec(newOffset);
      }
    }
  }, [currentTime, visibleDuration, duration, scrollOffsetSec, minimapDragMode, followPlayhead]);

  // Main Canvas Rendering
  const drawMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0b1120');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid lines (seconds)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    // time axis: the smallest "nice" step whose labels do not overlap (they did with many bars, test 0.2.1)
    const pxPerSec = width / visibleDuration;
    const secStep = TIME_STEPS.find((st) => st * pxPerSec >= MIN_TIME_LABEL_PX) ?? TIME_STEPS[TIME_STEPS.length - 1];
    const firstSec = Math.floor(scrollOffsetSec / secStep) * secStep;

    ctx.font = '10px Inter, monospace';
    ctx.fillStyle = '#64748b';

    for (let s = firstSec; s <= scrollOffsetSec + visibleDuration; s += secStep) {
      const x = ((s - scrollOffsetSec) / visibleDuration) * width;
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const t = Math.round(s * 100) / 100;
        const mins = Math.floor(t / 60);
        const decimals = secStep < 1 ? (secStep < 0.5 ? 2 : 1) : 0;
        const secs = (t % 60).toFixed(decimals);
        ctx.fillText(`${mins}:${secs.padStart(decimals ? 3 + decimals : 2, '0')}`, x + 4, height - 6);
      }
    }

    // 1. Draw Waveform
    const peaks = result.waveformPeaks;
    const numBuckets = detail ? 0 : peaks.length / 2;   // detailed waveform from the audio when it is there
    const midY = height * 0.45;
    const waveAmp = height * 0.35;
    if (detail) {
      const key = `${scrollOffsetSec}|${visibleDuration}|${width}|${height}`;
      let cache = waveCacheRef.current;
      if (!cache || cache.key !== key) {
        const off = cache?.canvas ?? document.createElement('canvas');
        off.width = width;
        off.height = height;
        const octx = off.getContext('2d');
        if (octx) {
          octx.clearRect(0, 0, width, height);
          drawDetailWave(octx, detail, scrollOffsetSec, visibleDuration, width, midY, waveAmp);
        }
        cache = { key, canvas: off };
        waveCacheRef.current = cache;
      }
      ctx.drawImage(cache.canvas, 0, 0);
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const startBucket = Math.floor((scrollOffsetSec / duration) * numBuckets);
    const endBucket = Math.ceil(((scrollOffsetSec + visibleDuration) / duration) * numBuckets);

    // Top envelope
    let firstPoint = true;
    for (let b = Math.max(0, startBucket); b < Math.min(numBuckets, endBucket); b++) {
      const bTime = (b / numBuckets) * duration;
      const x = ((bTime - scrollOffsetSec) / visibleDuration) * width;
      const maxVal = peaks[b * 2 + 1];
      const y = midY - maxVal * waveAmp;

      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Bottom envelope (reverse)
    for (let b = Math.min(numBuckets - 1, endBucket - 1); b >= Math.max(0, startBucket); b--) {
      const bTime = (b / numBuckets) * duration;
      const x = ((bTime - scrollOffsetSec) / visibleDuration) * width;
      const minVal = peaks[b * 2];
      const y = midY - minVal * waveAmp;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    if (!detail) {
      ctx.fill();
      ctx.stroke();
    }

    // 2. Draw Activation Functions (BAF / DAF) overlay
    const actCurve = result.activationCurve;
    const actBaseY = height * 0.88;
    const actHeight = height * 0.28;

    if (showBaf && actCurve.length > 0) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)'; // Cyan
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let first = true;

      for (let i = 0; i < actCurve.length; i++) {
        const pt = actCurve[i];
        if (pt.time < scrollOffsetSec - 0.5) continue;
        if (pt.time > scrollOffsetSec + visibleDuration + 0.5) break;

        const x = ((pt.time - scrollOffsetSec) / visibleDuration) * width;
        const y = actBaseY - pt.beatActivation * actHeight;

        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    if (showDaf && actCurve.length > 0) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)'; // Crimson/Rose
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let first = true;

      for (let i = 0; i < actCurve.length; i++) {
        const pt = actCurve[i];
        if (pt.downbeatActivation === null) continue; // no downbeat curve (librosa, browser)
        if (pt.time < scrollOffsetSec - 0.5) continue;
        if (pt.time > scrollOffsetSec + visibleDuration + 0.5) break;

        const x = ((pt.time - scrollOffsetSec) / visibleDuration) * width;
        const y = actBaseY - pt.downbeatActivation * actHeight;

        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // 3. Draw Beat & Downbeat Markers
    if (showBeats) {
      // label only every n-th bar (1, 2, 4, 8 ...) so the flags do not overlap; all bar lines stay
      const barSec = medianBarSeconds(result.beats);
      let labelEvery = 1;
      while (labelEvery * barSec * pxPerSec < MIN_BAR_LABEL_PX && labelEvery < 1024) labelEvery *= 2;
      const beatPx = (barSec / Math.max(1, result.timeSignature.numerator || 4)) * pxPerSec;
      const barPx = barSec * pxPerSec;
      const flags: { x: number; bar: number }[] = [];
      result.beats.forEach((b) => {
        if (b.time < scrollOffsetSec - 0.2 || b.time > scrollOffsetSec + visibleDuration + 0.2) return;
        const x = ((b.time - scrollOffsetSec) / visibleDuration) * width;
        const isLowConf = b.confidence !== null && b.confidence < 0.6;

        if (b.isDownbeat) {
          // Downbeat (Bar marker): bold magenta/rose line (amber dashed when low confidence)
          ctx.save();
          if (isLowConf) {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
            ctx.setLineDash([4, 3]);
          } else {
            ctx.strokeStyle = barPx >= 24 ? '#f43f5e' : 'rgba(244, 63, 94, 0.55)';
          }
          ctx.lineWidth = barPx >= 24 ? 2.5 : 1;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
          ctx.restore();
          // Bar Flag (only every labelEvery-th bar, counted from bar 1), drawn after all lines
          if ((b.barIndex - 1) % labelEvery === 0) flags.push({ x, bar: b.barIndex });
        } else {
          // Regular Beat: cyan line (amber dashed when low confidence)
          ctx.save();
          if (isLowConf) {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.72)';
            ctx.setLineDash([3, 3]);
          } else {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          }
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 22);
          ctx.lineTo(x, height - 16);
          ctx.stroke();
          ctx.restore();

          if (beatPx >= MIN_BEAT_LABEL_PX) {
            ctx.fillStyle = isLowConf ? '#fbbf24' : '#94a3b8';
            ctx.font = '9px Inter, monospace';
            ctx.fillText(`${b.beatInBar}`, x + 3, 34);
          }
        }
      });
      ctx.font = 'bold 10px Inter, sans-serif';
      for (const f of flags) {
        const label = t('output.marker_downbeat', { bar: f.bar });
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(f.x - 1, 0, Math.ceil(ctx.measureText(label).width) + 9, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, f.x + 4, 13);
      }
    }

    // 4. Loupe inspection bracket on main canvas when Loupe is active
    if (isLoupeActive && hoverInfo) {
      const span = Math.min(loupeSpan, duration);
      const winStart = Math.max(0, Math.min(hoverInfo.time - span / 2, duration - span));
      const winEnd = winStart + span;
      const x1 = Math.max(0, ((winStart - scrollOffsetSec) / visibleDuration) * width);
      const x2 = Math.min(width, ((winEnd - scrollOffsetSec) / visibleDuration) * width);
      const cx = ((hoverInfo.time - scrollOffsetSec) / visibleDuration) * width;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.10)';
      ctx.fillRect(x1, 0, Math.max(2, x2 - x1), height);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, 1, Math.max(2, x2 - x1), height - 2);

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4b. Loop: dim outside the looped range, amber edges
    if (loopRange) {
      const lx = ((loopRange.start - scrollOffsetSec) / visibleDuration) * width;
      const rx = ((loopRange.end - scrollOffsetSec) / visibleDuration) * width;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
      if (lx > 0) ctx.fillRect(0, 0, Math.min(width, lx), height);
      if (rx < width) ctx.fillRect(Math.max(0, rx), 0, width - Math.max(0, rx), height);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.lineWidth = 2;
      for (const x of [lx, rx]) {
        if (x >= 0 && x <= width) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
      }
    }

    // 5. Playhead Cursor
    if (currentTime >= scrollOffsetSec && currentTime <= scrollOffsetSec + visibleDuration) {
      const playX = ((currentTime - scrollOffsetSec) / visibleDuration) * width;

      // Glow
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();

      // Sharp line
      ctx.strokeStyle = '#fbbf24'; // Amber-400
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();

      // Top triangle badge
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(playX - 6, 0);
      ctx.lineTo(playX + 6, 0);
      ctx.lineTo(playX, 10);
      ctx.closePath();
      ctx.fill();
    }
  }, [
    result,
    detail,
    t,
    loopRange,
    currentTime,
    zoom,
    scrollOffsetSec,
    visibleDuration,
    duration,
    showBaf,
    showDaf,
    showBeats,
    isLoupeActive,
    loupeSpan,
    hoverInfo,
  ]);

  // Mini-map Overview Rendering
  const drawMinimap = useCallback(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Mini waveform
    const peaks = result.waveformPeaks;
    const numBuckets = peaks.length / 2;
    const midY = height / 2;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    for (let i = 0; i < numBuckets; i++) {
      const x = (i / numBuckets) * width;
      const minVal = peaks[i * 2];
      const maxVal = peaks[i * 2 + 1];
      const h = Math.max(1, (maxVal - minVal) * (height * 0.45));
      ctx.fillRect(x, midY - h / 2, Math.max(1, width / numBuckets), h);
    }

    // Mini Downbeats
    ctx.fillStyle = '#f43f5e';
    result.downbeats.forEach((d) => {
      const x = (d.time / duration) * width;
      ctx.fillRect(x, 0, 1.5, height);
    });

    // Loop range in the overview
    if (loopRange) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
      ctx.fillRect((loopRange.start / duration) * width, 0, ((loopRange.end - loopRange.start) / duration) * width, height);
    }

    // Viewport window overlay
    const viewLeft = (scrollOffsetSec / duration) * width;
    const viewWidth = (visibleDuration / duration) * width;
    const isFrameHighlighted = zoom > 1.01 && (isHoveringViewportBox || minimapDragMode === 'pan');

    ctx.fillStyle = isFrameHighlighted ? 'rgba(56, 189, 248, 0.24)' : 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(viewLeft, 0, viewWidth, height);
    ctx.strokeStyle = isFrameHighlighted ? '#7dd3fc' : '#38bdf8';
    ctx.lineWidth = isFrameHighlighted ? 2 : 1.5;
    ctx.strokeRect(viewLeft, 0, viewWidth, height);

    if (zoom > 1.01 && viewWidth >= 12) {
      const gripH = height * 0.45;
      const gripY = (height - gripH) / 2;
      ctx.fillStyle = isFrameHighlighted ? 'rgba(186, 230, 253, 0.85)' : 'rgba(56, 189, 248, 0.65)';
      ctx.fillRect(viewLeft + 3, gripY, 2, gripH);
      ctx.fillRect(viewLeft + viewWidth - 5, gripY, 2, gripH);
    }

    // Playhead in minimap
    const playX = (currentTime / duration) * width;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(playX - 1, 0, 2, height);
  }, [result, duration, scrollOffsetSec, visibleDuration, currentTime, zoom, isHoveringViewportBox, minimapDragMode, loopRange]);

  // Floating HiDPI Loupe Canvas Rendering
  const drawLoupeCanvas = useCallback(() => {
    if (!isLoupeActive || !hoverInfo) return;
    const canvas = loupeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = LOUPE_WIDTH_PX;
    const h = LOUPE_CANVAS_HEIGHT_PX;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0b1120');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const span = Math.min(loupeSpan, duration);
    const winStart = Math.max(0, Math.min(hoverInfo.time - span / 2, duration - span));
    const winEnd = winStart + span;

    // Adaptive grid lines depending on loupe window width
    const step = span <= 4 ? 0.25 : span <= 8 ? 0.5 : 1.0;
    const majorMod = span <= 8 ? 1.0 : 2.0;
    const firstTick = Math.ceil(winStart / step) * step;
    for (let s = firstTick; s <= winEnd; s += step) {
      const x = ((s - winStart) / span) * w;
      const rem = Math.abs(s % majorMod);
      const isMajor = rem < 0.001 || Math.abs(rem - majorMod) < 0.001;
      ctx.strokeStyle = isMajor ? 'rgba(51, 65, 85, 0.9)' : 'rgba(30, 41, 59, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Center axis baseline
    const midY = h * 0.46;
    const waveAmp = h * 0.38;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // Waveform in loupe window: detailed from the audio, else the envelope of the analysis peaks
    const peaks = result.waveformPeaks;
    const numBuckets = detail ? 0 : peaks.length / 2;
    if (detail) drawDetailWave(ctx, detail, winStart, span, w, midY, waveAmp);
    if (numBuckets > 0) {
      const startBucket = Math.max(0, Math.floor((winStart / duration) * numBuckets) - 1);
      const endBucket = Math.min(numBuckets, Math.ceil((winEnd / duration) * numBuckets) + 1);

      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();

      let started = false;
      for (let b = startBucket; b < endBucket; b++) {
        const bTime = (b / numBuckets) * duration;
        const x = ((bTime - winStart) / span) * w;
        const y = midY - peaks[b * 2 + 1] * waveAmp;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      for (let b = endBucket - 1; b >= startBucket; b--) {
        const bTime = (b / numBuckets) * duration;
        const x = ((bTime - winStart) / span) * w;
        const y = midY - peaks[b * 2] * waveAmp;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Activation curves in loupe
    const actCurve = result.activationCurve;
    const actBaseY = h * 0.92;
    const actHeight = h * 0.30;

    if (showBaf && actCurve.length > 0) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < actCurve.length; i++) {
        const pt = actCurve[i];
        if (pt.time < winStart - 0.1) continue;
        if (pt.time > winEnd + 0.1) break;
        const x = ((pt.time - winStart) / span) * w;
        const y = actBaseY - pt.beatActivation * actHeight;
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    if (showDaf && actCurve.length > 0) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.9)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < actCurve.length; i++) {
        const pt = actCurve[i];
        if (pt.downbeatActivation === null) continue;
        if (pt.time < winStart - 0.1) continue;
        if (pt.time > winEnd + 0.1) break;
        const x = ((pt.time - winStart) / span) * w;
        const y = actBaseY - pt.downbeatActivation * actHeight;
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Beats & Downbeats in loupe
    if (showBeats) {
      result.beats.forEach((b) => {
        if (b.time < winStart - 0.05 || b.time > winEnd + 0.05) return;
        const x = ((b.time - winStart) / span) * w;
        const isLowConf = b.confidence !== null && b.confidence < 0.6;
        if (b.isDownbeat) {
          ctx.save();
          ctx.strokeStyle = isLowConf ? '#f59e0b' : '#f43f5e';
          if (isLowConf) ctx.setLineDash([4, 3]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = isLowConf ? '#d97706' : '#f43f5e';
          ctx.fillRect(x, 0, 38, 13);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.fillText(`T${b.barIndex}`, x + 3, 10);
        } else {
          ctx.save();
          ctx.strokeStyle = isLowConf ? 'rgba(245, 158, 11, 0.78)' : 'rgba(56, 189, 248, 0.55)';
          if (isLowConf) ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 10);
          ctx.lineTo(x, h);
          ctx.stroke();
          ctx.restore();

          if (span <= 8) {
            ctx.fillStyle = isLowConf ? '#fbbf24' : '#94a3b8';
            ctx.font = '9px Inter, monospace';
            ctx.fillText(`${b.beatInBar}`, x + 2, 19);
          }
        }
      });
    }

    // Playhead inside loupe window
    if (currentTime >= winStart && currentTime <= winEnd) {
      const playX = ((currentTime - winStart) / span) * w;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, h);
      ctx.stroke();
    }

    // Exact hovered cursor reticle
    const cursorX = ((hoverInfo.time - winStart) / span) * w;
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, h);
    ctx.stroke();
  }, [isLoupeActive, loupeSpan, hoverInfo, duration, result, detail, showBaf, showDaf, showBeats, currentTime]);

  const drawRefs = useRef({ drawMainCanvas, drawMinimap });
  drawRefs.current = { drawMainCanvas, drawMinimap };

  // Resize listener (decoupled from per-frame draw callbacks so setContainerWidth never loops)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const cssWidth = Math.round(container.clientWidth);
      if (cssWidth <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(cssWidth * dpr);
      const targetMainH = Math.round(240 * dpr);
      if (canvas.width !== targetW || canvas.height !== targetMainH) {
        canvas.width = targetW;
        canvas.height = targetMainH;
      }

      if (minimapCanvasRef.current) {
        const targetMiniH = Math.round(36 * dpr);
        if (minimapCanvasRef.current.width !== targetW || minimapCanvasRef.current.height !== targetMiniH) {
          minimapCanvasRef.current.width = targetW;
          minimapCanvasRef.current.height = targetMiniH;
        }
      }

      setContainerWidth((prev) => (prev === cssWidth ? prev : cssWidth));
      drawRefs.current.drawMainCanvas();
      drawRefs.current.drawMinimap();
    };

    updateSize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    ro?.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    drawMainCanvas();
    drawMinimap();
    drawLoupeCanvas();
  }, [drawMainCanvas, drawMinimap, drawLoupeCanvas]);

  // Mouse seeking & dragging
  const canEditBeats = Boolean(onEditBeat) && visibleDuration <= EDIT_MAX_VISIBLE_SEC + 0.01;

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Shift+click: add a beat the model missed; Alt+click: remove the beat under the pointer
    if (canEditBeats && onEditBeat && (e.shiftKey || e.altKey)) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      e.preventDefault();
      const x = e.clientX - rect.left;
      const time = scrollOffsetSec + Math.max(0, Math.min(1, x / rect.width)) * visibleDuration;
      if (e.shiftKey) {
        onEditBeat({ kind: 'insert', time });
      } else {
        const tolerance = (DELETE_HIT_PX / rect.width) * visibleDuration;
        let best: BeatItem | null = null;
        for (const b of result.beats) {
          if (Math.abs(b.time - time) <= tolerance && (!best || Math.abs(b.time - time) < Math.abs(best.time - time))) best = b;
        }
        if (best) onEditBeat({ kind: 'delete', time: best.time });
      }
      return;
    }
    setIsDragging(true);
    handleSeekFromEvent(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, x / rect.width));
    const targetTime = scrollOffsetSec + frac * visibleDuration;

    if (isDragging) {
      onSeek(targetTime);
    }

    // Find nearest beat
    let nearest: BeatItem | null = null;
    let minDiff = 0.25;
    for (const b of result.beats) {
      const diff = Math.abs(b.time - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = b;
      }
    }

    setHoverInfo({
      x,
      y: e.clientY - rect.top,
      time: targetTime,
      beat: nearest,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
    setHoverInfo(null);
  };

  const handleSeekFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, x / rect.width));
    const targetTime = scrollOffsetSec + frac * visibleDuration;
    onSeek(targetTime);
  };

  const isInsideViewportHitArea = useCallback(
    (clientX: number): boolean => {
      if (zoom <= 1.01) return false;
      const rect = minimapCanvasRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return false;
      const x = clientX - rect.left;
      const boxLeft = (scrollOffsetSec / duration) * rect.width;
      const boxWidth = (visibleDuration / duration) * rect.width;
      const boxCenter = boxLeft + boxWidth / 2;
      const hitHalf = Math.max(10, boxWidth / 2 + 4);
      return Math.abs(x - boxCenter) <= hitHalf;
    },
    [zoom, scrollOffsetSec, duration, visibleDuration]
  );

  const handleMinimapMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const rect = minimapCanvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;

    if (isInsideViewportHitArea(e.clientX)) {
      minimapDragStartRef.current = { startX: e.clientX, startOffsetSec: scrollOffsetSec };
      frameDraggedRef.current = false;
      setMinimapDragMode('pan');
      return;
    }

    const x = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, x / rect.width));
    const centerTime = frac * duration;
    const newOffset = Math.max(0, Math.min(centerTime - visibleDuration / 2, duration - visibleDuration));
    setScrollOffsetSec(newOffset);
    onSeek(centerTime);
    setMinimapDragMode('seek');
  };

  const handleMinimapHoverMove = (e: React.MouseEvent<HTMLElement>) => {
    if (minimapDragMode !== 'none') return;
    setIsHoveringViewportBox(isInsideViewportHitArea(e.clientX));
  };

  useEffect(() => {
    if (minimapDragMode === 'none') return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const rect = minimapCanvasRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;

      if (minimapDragMode === 'pan' && minimapDragStartRef.current) {
        const deltaPx = e.clientX - minimapDragStartRef.current.startX;
        const deltaSec = (deltaPx / rect.width) * duration;
        const maxOffset = Math.max(0, duration - visibleDuration);
        const clampedOffset = Math.max(
          0,
          Math.min(minimapDragStartRef.current.startOffsetSec + deltaSec, maxOffset)
        );
        setScrollOffsetSec(clampedOffset);
        // the playhead follows the mouse inside the frame – scrubbing, as in a drag in the free overview
        // (test 0.6.3 B1); not with the loop "section": there the left edge of the frame is the start of the loop
        if (followPlayhead) {
          const t = frameDragSeek(
            minimapDragStartRef.current, e.clientX, rect.left, rect.width, duration, visibleDuration, frameDraggedRef.current
          );
          if (t !== null) {
            frameDraggedRef.current = true;
            onSeek(t);
          }
        }
      } else if (minimapDragMode === 'seek') {
        const x = e.clientX - rect.left;
        const frac = Math.max(0, Math.min(1, x / rect.width));
        const centerTime = frac * duration;
        const newOffset = Math.max(
          0,
          Math.min(centerTime - visibleDuration / 2, Math.max(0, duration - visibleDuration))
        );
        setScrollOffsetSec(newOffset);
        onSeek(centerTime);
      }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      // a drag of the blue frame plays on from where the mouse is released (test 0.6.1 F5);
      // not with the loop "section": there the left edge of the frame is the start of the loop
      const start = minimapDragStartRef.current;
      const rect = minimapCanvasRef.current?.getBoundingClientRect();
      if (minimapDragMode === 'pan' && start && rect && followPlayhead) {
        const t = frameDragSeek(start, e.clientX, rect.left, rect.width, duration, visibleDuration, frameDraggedRef.current);
        if (t !== null) onSeek(t);
      }
      frameDraggedRef.current = false;
      minimapDragStartRef.current = null;
      setMinimapDragMode('none');
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [minimapDragMode, duration, visibleDuration, onSeek, followPlayhead]);

  const handleZoom = (factor: number) => {
    cancelQuickReset();
    const nextZoom = Math.max(1.0, Math.min(maxZoom, zoom * factor));
    const centerTime = scrollOffsetSec + visibleDuration / 2;
    const nextVisibleDur = duration / nextZoom;
    const nextOffset = Math.max(0, Math.min(centerTime - nextVisibleDur / 2, duration - nextVisibleDur));
    setZoom(nextZoom);
    setScrollOffsetSec(nextOffset);
  };

  // click on a quick window (test 0.6.2 G2): another window at once; the window already shown goes back to the whole
  // file only when no second click follows within 500 ms; two clicks within 500 ms make it the default. So a
  // double-click no longer flashes the whole file in between.
  const handleQuickWindow = (windowSec: number) => {
    if (duration <= windowSec) return;
    const now = performance.now();
    const action = quickWindowClick(windowSec, activeQuickWindow, quickLastClickRef.current, now);
    cancelQuickReset();
    if (action === 'default') {
      quickLastClickRef.current = null;
      toggleDefault(windowSec);
      if (activeQuickWindow !== windowSec) showQuickWindow(windowSec);
      return;
    }
    quickLastClickRef.current = { sec: windowSec, at: now };
    if (action === 'wait') {
      quickResetTimerRef.current = setTimeout(() => {
        quickResetTimerRef.current = null;
        showWholeFile();
      }, QUICK_DOUBLE_CLICK_MS);
    } else {
      showQuickWindow(windowSec);
    }
  };

  const showQuickWindow = (windowSec: number) => {
    const targetZoom = Math.min(maxZoom, duration / windowSec);
    const nextVisibleDur = duration / targetZoom;
    const nextOffset = Math.max(0, Math.min(currentTime - nextVisibleDur / 2, duration - nextVisibleDur));
    setZoom(targetZoom);
    setScrollOffsetSec(nextOffset);
  };

  // this window becomes the default when a song loads, or the default is cleared
  const toggleDefault = (windowSec: number) => {
    const next = toggleDefaultWindow(defaultWindow, windowSec);
    setDefaultWindow(next);
    try {
      if (next === null) localStorage.removeItem(DEFAULT_WINDOW_KEY);
      else localStorage.setItem(DEFAULT_WINDOW_KEY, String(next));
    } catch {
      /* without storage the default holds until the page is reloaded */
    }
  };

  const cancelQuickReset = () => {
    if (quickResetTimerRef.current) clearTimeout(quickResetTimerRef.current);
    quickResetTimerRef.current = null;
  };

  const showWholeFile = () => {
    setZoom(1.0);
    setScrollOffsetSec(0);
  };

  // the whole-file button acts at once and ends a pending click on a quick window
  const handleResetZoom = () => {
    cancelQuickReset();
    quickLastClickRef.current = null;
    showWholeFile();
  };

  // Compute clamped floating loupe coordinates inside 240px container
  const loupeLeftPx = hoverInfo
    ? Math.max(8, Math.min(hoverInfo.x - LOUPE_WIDTH_PX / 2, Math.max(8, containerWidth - LOUPE_WIDTH_PX - 8)))
    : 8;
  const loupeTopPx = hoverInfo
    ? hoverInfo.y >= 120
      ? Math.max(8, hoverInfo.y - LOUPE_TOTAL_HEIGHT_PX - 12)
      : Math.min(240 - LOUPE_TOTAL_HEIGHT_PX - 8, hoverInfo.y + 14)
    : 8;

  return (
    <div className="space-y-3">
      {/* Visualizer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          {/* the analysed song: long names are cut, the full name is in the tooltip */}
          <span
            className="text-xs text-slate-400 truncate min-w-0 max-w-[48ch]"
            title={`${result.metadata.fileName} · ${formatSongLength(duration)}`}
          >
            <span className="text-slate-200 font-medium">{result.metadata.fileName}</span>
            <span className="text-slate-500 tabular-nums"> · {formatSongLength(duration)}</span>
          </span>
          {/* same size for "Beat 2" and "Downbeat" and also without a beat (test 0.2.2: the row wrapped on and off
              in a narrow window and the waveform box changed its height while playing) */}
          <span
            className={`inline-flex justify-center w-[9.5rem] shrink-0 whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
              !activeBeat
                ? 'invisible border-transparent'
                : activeBeat.isDownbeat
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/50'
                : 'bg-cyan-950 text-cyan-300 border-cyan-800'
            }`}
            aria-hidden={!activeBeat}
          >
            {!activeBeat
              ? t('web.wave.bar_downbeat', { bar: '000' })
              : activeBeat.isDownbeat
              ? t('web.wave.bar_downbeat', { bar: activeBeat.barIndex })
              : t('web.wave.bar_beat', { bar: activeBeat.barIndex, beat: activeBeat.beatInBar })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Curve Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setShowBeats(!showBeats)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                showBeats ? 'bg-cyan-900/60 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={t('web.wave.beats_tip')}
            >
              <span>Beats</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBaf(!showBaf)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                showBaf ? 'bg-cyan-900/60 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={bafTooltip}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>BAF</span>
            </button>
            <span title={dafTooltip} className="inline-flex">
              <button
                type="button"
                onClick={() => setShowDaf(!showDaf)}
                disabled={!hasDafCurve}
                aria-pressed={hasDafCurve && showDaf}
                className={`px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                  !hasDafCurve
                    ? 'text-slate-600 opacity-50 cursor-not-allowed'
                    : showDaf
                    ? 'bg-rose-900/60 text-rose-300 cursor-pointer'
                    : 'text-slate-500 hover:text-slate-300 cursor-pointer'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasDafCurve ? 'bg-rose-500' : 'bg-slate-600'
                  }`}
                ></span>
                <span>DAF</span>
              </button>
            </span>
          </div>

          {/* Loupe Toggle */}
          <button
            type="button"
            onClick={() => setIsLoupeEnabled((prev) => !prev)}
            disabled={!isLoupeApplicable && !isLoupeEnabled}
            aria-pressed={isLoupeActive}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
              isLoupeActive
                ? 'bg-cyan-950/90 border-cyan-600/80 text-cyan-200 shadow-sm shadow-cyan-500/20'
                : isLoupeEnabled && !isLoupeApplicable
                ? 'bg-slate-900/70 border-slate-700 text-slate-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title={
              !isLoupeApplicable
                ? isLoupeEnabled
                  ? t('web.wave.loupe_paused', { sec: LOUPE_MIN_VISIBLE_SEC })
                  : t('web.wave.loupe_only_overview', { sec: LOUPE_MIN_VISIBLE_SEC })
                : t('web.wave.loupe_tip', { zoom: num(opticalMagnification, 0), span: num(loupeSpan, 1) })
            }
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('web.wave.loupe')}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleZoom(0.7)}
              disabled={zoom <= 1.0}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer shrink-0"
              title={t('web.wave.zoom_out')}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono tabular-nums text-slate-400 px-1 min-w-[38px] text-center whitespace-nowrap shrink-0">
              {zoom.toFixed(1)}x
            </span>
            <button
              type="button"
              onClick={() => handleZoom(1.4)}
              disabled={zoom >= maxZoom}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer shrink-0"
              title={t('web.wave.zoom_in')}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-slate-800 mx-0.5 shrink-0" aria-hidden="true" />
            {QUICK_WINDOWS_SEC.map((sec) => {
              const active = activeQuickWindow === sec;
              const isDefault = defaultWindow === sec;
              const tooShort = duration <= sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleQuickWindow(sec)}
                  disabled={tooShort}
                  aria-pressed={active}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums whitespace-nowrap ${
                    isDefault ? 'font-bold underline underline-offset-2' : 'font-medium'
                  } shrink-0 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    active
                      ? 'bg-cyan-900/70 text-cyan-200 border border-cyan-700/70'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={
                    tooShort
                      ? t('web.wave.quick_too_short', { sec })
                      : `${active ? t('web.wave.quick_back') : t('web.wave.quick_tip', { sec })} · ${
                          isDefault ? t('web.wave.quick_is_default') : t('web.wave.quick_default_tip', { sec })
                        }`
                  }
                >
                  {sec}s
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
              title={t('web.wave.whole_file')}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Waveform Canvas Container */}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950 cursor-crosshair select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
          className="block w-full h-[240px]"
        />

        {/* Floating HiDPI Waveform Loupe */}
        {isLoupeActive && hoverInfo && (
          <div
            className="absolute pointer-events-none z-30 rounded-lg border border-cyan-500/60 bg-slate-950/95 shadow-2xl shadow-black/70 backdrop-blur-md overflow-hidden"
            style={{
              left: `${loupeLeftPx}px`,
              top: `${loupeTopPx}px`,
              width: `${LOUPE_WIDTH_PX}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 px-2 py-1 bg-slate-900/95 border-b border-slate-800 text-[10px]">
              <span className="font-mono tabular-nums font-semibold text-cyan-300 whitespace-nowrap">
                {formatLoupeTime(hoverInfo.time)}
              </span>
              {hoverInfo.beat ? (
                <span
                  className={`truncate font-medium ${
                    hoverInfo.beat.isDownbeat ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  {hoverInfo.beat.isDownbeat
                    ? t('web.wave.bar_downbeat', { bar: hoverInfo.beat.barIndex })
                    : t('web.wave.bar_beat', { bar: hoverInfo.beat.barIndex, beat: hoverInfo.beat.beatInBar })}
                </span>
              ) : (
                <span className="text-slate-400 truncate">{t('web.wave.loupe')}</span>
              )}
              <span className="font-mono tabular-nums text-cyan-400/90 whitespace-nowrap shrink-0">
                {num(opticalMagnification, 1)}× · {num(loupeSpan, 1)} s
              </span>
            </div>
            <canvas ref={loupeCanvasRef} className="block" />
          </div>
        )}

        {/* Standard Hover Tooltip (shown when loupe is off or paused in detail view) */}
        {!isLoupeActive && hoverInfo && (
          <div
            className="absolute pointer-events-none z-30 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl text-xs text-white backdrop-blur-md -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: `${hoverInfo.x}px`, top: `${Math.max(30, hoverInfo.y)}px` }}
          >
            <div className="font-mono tabular-nums font-semibold text-cyan-300">
              {num(hoverInfo.time, 3)} s
            </div>
            {hoverInfo.beat && (
              <div className="text-[11px] text-slate-300 mt-0.5">
                {hoverInfo.beat.isDownbeat ? (
                  <span className="text-rose-400 font-bold">
                    {t('web.wave.bar_downbeat', { bar: hoverInfo.beat.barIndex })}
                  </span>
                ) : (
                  <span>
                    {t('web.wave.bar_beat', { bar: hoverInfo.beat.barIndex, beat: hoverInfo.beat.beatInBar })}
                  </span>
                )}
                <span className="ml-1.5 text-slate-400 font-mono tabular-nums">
                  ({hoverInfo.beat.instantBpm.toFixed(0)} BPM)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mini-map Scrubber */}
      <div className="space-y-1">
        {/* one short line: the name, and on the right the editing keys of the waveform above; what the frame does is
            the tooltip of the overview (test 0.6.4: the texts wrapped into each other, "too much text") */}
        <div className="flex items-baseline justify-between gap-3 text-[10px] text-slate-500 font-mono px-0.5 whitespace-nowrap">
          <span className="font-semibold text-slate-400">{t('web.wave.overview')}</span>
          {canEditBeats && (
            <span className="min-w-0 truncate text-slate-400" title={t('web.wave.edit_hint')}>
              {t('web.wave.edit_hint')}
            </span>
          )}
        </div>
        <div
          className={`relative rounded-lg border border-slate-800 overflow-hidden bg-slate-950 h-9 shadow-inner select-none ${
            minimapDragMode === 'pan'
              ? 'cursor-grabbing'
              : isHoveringViewportBox
              ? 'cursor-grab'
              : 'cursor-pointer'
          }`}
          onMouseDown={handleMinimapMouseDown}
          onDoubleClick={(e) => {
            if (onPlayFrom && zoom > 1.01 && isInsideViewportHitArea(e.clientX)) onPlayFrom(scrollOffsetSec);
          }}
          title={zoom > 1.01 ? t('web.wave.overview_drag') : t('web.wave.overview_click')}
          onMouseMove={handleMinimapHoverMove}
          onMouseLeave={() => setIsHoveringViewportBox(false)}
        >
          <canvas ref={minimapCanvasRef} className="block w-full h-9" />
        </div>
      </div>
    </div>
  );
};

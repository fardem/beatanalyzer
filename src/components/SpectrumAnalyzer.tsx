import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { AnalysisResult } from '../types/analyzer';
import {
  computeWindowBeatSpectrum,
  computeWindowSpectrogram,
  WindowBeatSpectrumData,
  WindowSpectrogramData,
} from '../utils/beatEvidence';
import { useI18n } from '../i18n';
import { DiagramHelpContent, DiagramInfoTooltip, ValueTooltip } from './DiagramInfoTooltip';
import { LiveSpectrum, LiveSpectrumSource } from './LiveSpectrum';

interface SpectrumAnalyzerProps {
  result: AnalysisResult;
  audioBuffer: AudioBuffer | null;
  viewRange: { start: number; end: number } | null;
  currentTime: number;
  onSeek: (time: number) => void;
  /** live spectrum of the player (mode "Live"); without it the mode is not offered */
  liveSource?: LiveSpectrumSource;
  isPlaying?: boolean;
}

type BeatZoneId = 'kick' | 'snare' | 'hihat';
type SpectrumViewMode = 'spectrogram' | 'spectrum' | 'live';

interface HoverProbe {
  xRatio: number;
  yRatio: number;
  freqHz: number;
  timeSec: number | null;
  downbeatDb: number | null;
  beatDb: number | null;
  zone: BeatZoneId;
}

const STORAGE_VIEW_MODE_KEY = 'beatanalyzer.expertSpectrumMode';

const F_MIN = 25;
const F_MAX = 16000;
const KICK_MAX_HZ = 150;
const SNARE_MAX_HZ = 4000;
const NUM_BANDS = 40;
const MIN_DB = -85;
const MAX_DB = -10;
const DB_SPAN = MAX_DB - MIN_DB;

const AXIS_TICKS = [40, 100, 250, 1000, 4000, 12000];
const SPECTROGRAM_HZ_TICKS = [60, 150, 500, 2000, 8000];
const DB_LINES = [-18, -36, -54];

const PAD_LEFT = 10;
const PAD_RIGHT = 40;
const PAD_TOP = 20;
const PAD_BOTTOM = 20;

// 256-entry perceptual colormap LUT (RGBA): deep obsidian -> slate -> cyan -> amber -> bright ivory
const COLORMAP_LUT = (() => {
  const stops: [number, number, number, number][] = [
    [0.0, 2, 6, 23],
    [0.18, 15, 23, 42],
    [0.42, 14, 116, 144],
    [0.68, 34, 211, 238],
    [0.86, 245, 158, 11],
    [1.0, 254, 243, 199],
  ];
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let s0 = stops[0];
    let s1 = stops[stops.length - 1];
    for (let k = 0; k < stops.length - 1; k++) {
      if (t >= stops[k][0] && t <= stops[k + 1][0]) {
        s0 = stops[k];
        s1 = stops[k + 1];
        break;
      }
    }
    const span = s1[0] - s0[0] || 1;
    const f = Math.max(0, Math.min(1, (t - s0[0]) / span));
    lut[i * 4] = Math.round(s0[1] + (s1[1] - s0[1]) * f);
    lut[i * 4 + 1] = Math.round(s0[2] + (s1[2] - s0[2]) * f);
    lut[i * 4 + 2] = Math.round(s0[3] + (s1[3] - s0[3]) * f);
    lut[i * 4 + 3] = 255;
  }
  return lut;
})();

function readViewMode(): SpectrumViewMode {
  try {
    const saved = localStorage.getItem(STORAGE_VIEW_MODE_KEY);
    return saved === 'spectrum' || saved === 'live' ? saved : 'spectrogram';
  } catch {
    return 'spectrogram';
  }
}

function freqToRatio(freq: number): number {
  const clamped = Math.max(F_MIN, Math.min(F_MAX, freq));
  return Math.log(clamped / F_MIN) / Math.log(F_MAX / F_MIN);
}

function ratioToFreq(ratio: number): number {
  const clamped = Math.max(0, Math.min(1, ratio));
  return F_MIN * Math.pow(F_MAX / F_MIN, clamped);
}

function zoneForFreq(freq: number): BeatZoneId {
  if (freq < KICK_MAX_HZ) return 'kick';
  if (freq < SNARE_MAX_HZ) return 'snare';
  return 'hihat';
}

function formatFreq(freq: number): string {
  if (freq <= 0) return '–';
  if (freq >= 1000) {
    const khz = freq / 1000;
    return `${khz >= 10 ? Math.round(khz) : khz.toFixed(1)} kHz`;
  }
  return `${Math.round(freq)} Hz`;
}

function formatClock(sec: number, showTenths = false): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (showTenths) {
    return `${m}:${rem.toFixed(1).padStart(4, '0')}`;
  }
  return `${m}:${String(Math.floor(rem)).padStart(2, '0')}`;
}

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  result,
  audioBuffer,
  viewRange,
  currentTime,
  onSeek,
  liveSource,
  isPlaying = false,
}) => {
  const { t, num } = useI18n();
  const [savedMode, setViewMode] = useState<SpectrumViewMode>(readViewMode);
  const viewMode: SpectrumViewMode = savedMode === 'live' && !liveSource ? 'spectrogram' : savedMode;
  const [hoverProbe, setHoverProbe] = useState<HoverProbe | null>(null);

  const windowDist: WindowBeatSpectrumData | null = useMemo(() => {
    if (!audioBuffer || viewMode !== 'spectrum') return null;
    return computeWindowBeatSpectrum(audioBuffer, result.beats, viewRange, {
      numBands: NUM_BANDS,
      fMin: F_MIN,
      fMax: F_MAX,
      minDb: MIN_DB,
      maxDb: MAX_DB,
    });
  }, [audioBuffer, result.beats, viewRange, viewMode]);

  const spectrogramData: WindowSpectrogramData | null = useMemo(() => {
    if (!audioBuffer || viewMode !== 'spectrogram') return null;
    return computeWindowSpectrogram(audioBuffer, viewRange, {
      cols: 220,
      rows: 48,
      fMin: F_MIN,
      fMax: F_MAX,
    });
  }, [audioBuffer, viewRange, viewMode]);

  const spectrogramImageCanvas = useMemo(() => {
    if (!spectrogramData || typeof document === 'undefined') return null;
    const { cols, rows, data } = spectrogramData;
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const octx = off.getContext('2d');
    if (!octx) return null;
    const img = octx.createImageData(cols, rows);
    const px = img.data;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const val = data[c * rows + r];
        const lutIdx = Math.max(0, Math.min(255, Math.round(val * 255))) * 4;
        const y = rows - 1 - r;
        const dst = (y * cols + c) * 4;
        px[dst] = COLORMAP_LUT[lutIdx];
        px[dst + 1] = COLORMAP_LUT[lutIdx + 1];
        px[dst + 2] = COLORMAP_LUT[lutIdx + 2];
        px[dst + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    return off;
  }, [spectrogramData]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const viewModeRef = useRef<SpectrumViewMode>(viewMode);
  viewModeRef.current = viewMode;
  const windowDistRef = useRef<WindowBeatSpectrumData | null>(windowDist);
  windowDistRef.current = windowDist;
  const spectrogramDataRef = useRef<WindowSpectrogramData | null>(spectrogramData);
  spectrogramDataRef.current = spectrogramData;
  const spectrogramImageRef = useRef<HTMLCanvasElement | null>(spectrogramImageCanvas);
  spectrogramImageRef.current = spectrogramImageCanvas;
  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;
  const beatsRef = useRef(result.beats);
  beatsRef.current = result.beats;
  const hoverCoordsRef = useRef<{ xRatio: number; yRatio: number } | null>(null);

  const selectViewMode = useCallback((mode: SpectrumViewMode) => {
    setViewMode(mode);
    setHoverProbe(null);
    hoverCoordsRef.current = null;
    try {
      localStorage.setItem(STORAGE_VIEW_MODE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const drawStaticPeakPins = (
    ctx: CanvasRenderingContext2D,
    pins: Array<{ bandIdx: number; yPx: number; label: string; accentRgb: string }>,
    plotW: number,
    plotBottom: number
  ) => {
    const valid = pins.filter((p) => p.bandIdx >= 0);
    if (valid.length === 0) return;

    const slotW = plotW / NUM_BANDS;
    const boxH = 15;
    ctx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

    const layout = valid.map((p) => {
      const pinX = PAD_LEFT + (p.bandIdx + 0.5) * slotW;
      const clampedY = Math.max(PAD_TOP + 10, Math.min(plotBottom - 4, p.yPx));
      const boxW = ctx.measureText(p.label).width + 8;
      const boxX = Math.max(PAD_LEFT + 2, Math.min(PAD_LEFT + plotW - boxW - 2, pinX - boxW / 2));
      return { ...p, pinX, clampedY, boxW, boxX, boxY: PAD_TOP + 3 };
    });

    if (layout.length === 2) {
      const [a, b] = layout;
      const horizOverlap = !(a.boxX + a.boxW + 6 <= b.boxX || b.boxX + b.boxW + 6 <= a.boxX);
      if (horizOverlap) {
        b.boxY = PAD_TOP + 3 + boxH + 4;
      }
    }

    for (const p of layout) {
      ctx.strokeStyle = `rgba(${p.accentRgb}, 0.72)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(p.pinX) + 0.5, p.boxY + boxH);
      ctx.lineTo(Math.round(p.pinX) + 0.5, plotBottom);
      ctx.stroke();

      const r = 3.5;
      ctx.fillStyle = `rgba(${p.accentRgb}, 0.96)`;
      ctx.beginPath();
      ctx.moveTo(p.pinX, p.clampedY - r);
      ctx.lineTo(p.pinX + r, p.clampedY);
      ctx.lineTo(p.pinX, p.clampedY + r);
      ctx.lineTo(p.pinX - r, p.clampedY);
      ctx.closePath();
      ctx.fill();
    }

    for (const p of layout) {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
      ctx.fillRect(p.boxX, p.boxY, p.boxW, boxH);
      ctx.strokeStyle = `rgba(${p.accentRgb}, 0.72)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(p.boxX + 0.5, p.boxY + 0.5, p.boxW - 1, boxH - 1);

      ctx.fillStyle = `rgba(${p.accentRgb}, 0.98)`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.label, p.boxX + 4, p.boxY + boxH / 2 + 0.5);
    }
  };

  const drawEnergySpectrum = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      dist: WindowBeatSpectrumData | null,
      plotW: number,
      plotH: number,
      plotRight: number,
      plotBottom: number
    ) => {
      const kickX = PAD_LEFT + freqToRatio(KICK_MAX_HZ) * plotW;
      const snareX = PAD_LEFT + freqToRatio(SNARE_MAX_HZ) * plotW;

      ctx.fillStyle = 'rgba(244, 63, 94, 0.06)';
      ctx.fillRect(PAD_LEFT, PAD_TOP, Math.max(0, kickX - PAD_LEFT), plotH);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.04)';
      ctx.fillRect(kickX, PAD_TOP, Math.max(0, snareX - kickX), plotH);
      ctx.fillStyle = 'rgba(129, 140, 248, 0.05)';
      ctx.fillRect(snareX, PAD_TOP, Math.max(0, plotRight - snareX), plotH);

      // Horizontal dB lines
      ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      for (const dbTick of DB_LINES) {
        const yNorm = Math.max(0, Math.min(1, (dbTick - MIN_DB) / DB_SPAN));
        const y = Math.round(plotBottom - yNorm * plotH) + 0.5;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD_LEFT, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
        ctx.fillText(`${dbTick}`, plotRight + 4, y);
      }

      // Zone dividers & captions
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (const xPos of [kickX, snareX]) {
        const x = Math.round(xPos) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, PAD_TOP);
        ctx.lineTo(x, plotBottom);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.font = '600 10px ui-sans-serif, system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(251, 113, 133, 0.85)';
      ctx.fillText(t('web.spectrum.zone_kick'), PAD_LEFT + 4, 4);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.85)';
      ctx.fillText(t('web.spectrum.zone_snare'), kickX + 6, 4);
      ctx.fillStyle = 'rgba(165, 180, 252, 0.85)';
      ctx.fillText(t('web.spectrum.zone_hihat'), snareX + 6, 4);

      if (dist) {
        const slotW = plotW / NUM_BANDS;
        const gap = Math.max(1.5, Math.min(3, slotW * 0.22));
        const groupW = Math.max(3, slotW - gap);
        const subW = Math.max(1, (groupW - 1) / 2);

        for (let i = 0; i < NUM_BANDS; i++) {
          const x = PAD_LEFT + i * slotW + gap * 0.5;
          const dH = dist.downbeatProfile[i] * plotH;
          const bH = dist.beatProfile[i] * plotH;

          if (dist.downbeatCount > 0 && dH > 0.5) {
            ctx.fillStyle = 'rgba(251, 113, 133, 0.72)';
            ctx.fillRect(x, plotBottom - dH, subW, dH);
            ctx.fillStyle = 'rgba(254, 205, 211, 0.95)';
            ctx.fillRect(x, plotBottom - dH, subW, 1.5);
          }
          if (dist.beatCount > 0 && bH > 0.5) {
            ctx.fillStyle = 'rgba(34, 211, 238, 0.65)';
            ctx.fillRect(x + subW + 1, plotBottom - bH, subW, bH);
            ctx.fillStyle = 'rgba(165, 243, 252, 0.95)';
            ctx.fillRect(x + subW + 1, plotBottom - bH, subW, 1.5);
          }
        }

        const drawCurve = (profile: Float32Array, stroke: string, dash: number[]) => {
          ctx.save();
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1.45;
          if (dash.length) ctx.setLineDash(dash);
          ctx.beginPath();
          for (let i = 0; i < NUM_BANDS; i++) {
            const x = PAD_LEFT + (i + 0.5) * slotW;
            const y = plotBottom - profile[i] * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        };

        if (dist.offbeatCount > 0) {
          drawCurve(dist.offbeatProfile, 'rgba(245, 158, 11, 0.65)', [2, 3]);
        }
        if (dist.beatCount > 0) {
          drawCurve(dist.beatProfile, 'rgba(34, 211, 238, 0.85)', [4, 3]);
        }
        if (dist.downbeatCount > 0) {
          drawCurve(dist.downbeatProfile, 'rgba(251, 113, 133, 0.95)', []);
        }

        const absPins: Array<{ bandIdx: number; yPx: number; label: string; accentRgb: string }> = [];
        if (dist.downbeatCount > 0 && dist.downbeatPeakBand >= 0) {
          absPins.push({
            bandIdx: dist.downbeatPeakBand,
            yPx: plotBottom - (dist.downbeatProfile[dist.downbeatPeakBand] ?? 0) * plotH,
            label: `1 · ${formatFreq(dist.downbeatPeakFreqHz)}`,
            accentRgb: '251, 113, 133',
          });
        }
        if (dist.beatCount > 0 && dist.beatPeakBand >= 0) {
          absPins.push({
            bandIdx: dist.beatPeakBand,
            yPx: plotBottom - (dist.beatProfile[dist.beatPeakBand] ?? 0) * plotH,
            label: `2–4 · ${formatFreq(dist.beatPeakFreqHz)}`,
            accentRgb: '34, 211, 238',
          });
        }
        drawStaticPeakPins(ctx, absPins, plotW, plotBottom);
      }

      // Baseline & logarithmic Hz ticks
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, plotBottom + 0.5);
      ctx.lineTo(plotRight, plotBottom + 0.5);
      ctx.stroke();

      ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.78)';
      for (const hz of AXIS_TICKS) {
        const x = PAD_LEFT + freqToRatio(hz) * plotW;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, plotBottom);
        ctx.lineTo(Math.round(x) + 0.5, plotBottom + 3);
        ctx.stroke();

        const label = hz >= 1000 ? `${hz / 1000} kHz` : `${hz} Hz`;
        ctx.fillText(label, x, plotBottom + 5);
      }

      if (hoverCoordsRef.current !== null && dist) {
        const xr = hoverCoordsRef.current.xRatio;
        const hx = Math.round(PAD_LEFT + xr * plotW) + 0.5;
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx, PAD_TOP);
        ctx.lineTo(hx, plotBottom);
        ctx.stroke();

        const bandIdx = Math.max(0, Math.min(NUM_BANDS - 1, Math.floor(xr * NUM_BANDS)));
        const yVal = Math.max(dist.downbeatProfile[bandIdx], dist.beatProfile[bandIdx]);
        const hy = plotBottom - yVal * plotH;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(hx - 2, hy - 2, 4, 4);
      }
    },
    [t]
  );

  const drawSpectrogramView = (
    ctx: CanvasRenderingContext2D,
    spec: WindowSpectrogramData,
    imgCanvas: HTMLCanvasElement | null,
    plotW: number,
    plotH: number,
    plotRight: number,
    plotBottom: number
  ) => {
    if (imgCanvas) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(imgCanvas, PAD_LEFT, PAD_TOP, plotW, plotH);
      ctx.restore();
    }

    const span = Math.max(0.1, spec.windowEnd - spec.windowStart);

    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    for (const hz of SPECTROGRAM_HZ_TICKS) {
      const yRatio = freqToRatio(hz);
      const y = Math.round(plotBottom - yRatio * plotH) + 0.5;
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.16)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, y);
      ctx.lineTo(plotRight, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      const lbl = hz >= 1000 ? `${hz / 1000}k` : `${hz}`;
      ctx.fillText(lbl, plotRight + 4, y);
    }

    ctx.font = '700 9px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    let lastLabelX = -100;

    for (const b of beatsRef.current) {
      if (b.time < spec.windowStart || b.time > spec.windowEnd) continue;
      const x = PAD_LEFT + ((b.time - spec.windowStart) / span) * plotW;
      if (b.isDownbeat) {
        ctx.strokeStyle = 'rgba(251, 113, 133, 0.78)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, PAD_TOP);
        ctx.lineTo(x, plotBottom);
        ctx.stroke();

        const barLbl = `T${b.barIndex}`;
        const barLblW = ctx.measureText(barLbl).width;
        if (x - lastLabelX >= 36 && x + 2 + barLblW <= plotRight) {
          ctx.fillStyle = '#fda4af';
          ctx.fillText(barLbl, x + 2, 4);
          lastLabelX = x;
        }
      } else {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.34)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, PAD_TOP);
        ctx.lineTo(x, plotBottom);
        ctx.stroke();
      }
    }

    const playT = currentTimeRef.current;
    if (playT >= spec.windowStart && playT <= spec.windowEnd) {
      const px = PAD_LEFT + ((playT - spec.windowStart) / span) * plotW;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.moveTo(px, PAD_TOP - 2);
      ctx.lineTo(px, plotBottom + 2);
      ctx.stroke();
    }

    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.78)';
    const numTicks = 6;
    for (let i = 0; i <= numTicks; i++) {
      const frac = i / numTicks;
      const x = PAD_LEFT + frac * plotW;
      const tVal = spec.windowStart + frac * span;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, plotBottom);
      ctx.lineTo(Math.round(x) + 0.5, plotBottom + 3);
      ctx.stroke();

      const alignX = i === 0 ? PAD_LEFT + 14 : i === numTicks ? plotRight - 14 : x;
      ctx.fillText(formatClock(tVal, span < 20), alignX, plotBottom + 5);
    }

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_LEFT, plotBottom + 0.5);
    ctx.lineTo(plotRight, plotBottom + 0.5);
    ctx.stroke();

    if (hoverCoordsRef.current) {
      const { xRatio, yRatio } = hoverCoordsRef.current;
      const hx = Math.round(PAD_LEFT + xRatio * plotW) + 0.5;
      const hy = Math.round(PAD_TOP + (1 - yRatio) * plotH) + 0.5;
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, PAD_TOP);
      ctx.lineTo(hx, plotBottom);
      ctx.moveTo(PAD_LEFT, hy);
      ctx.lineTo(plotRight, hy);
      ctx.stroke();
    }
  };

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const { width, height } = sizeRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(width * dpr);
    const targetH = Math.round(height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const plotW = Math.max(10, width - PAD_LEFT - PAD_RIGHT);
    const plotH = Math.max(10, height - PAD_TOP - PAD_BOTTOM);
    const plotRight = PAD_LEFT + plotW;
    const plotBottom = PAD_TOP + plotH;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (viewModeRef.current === 'spectrogram' && spectrogramDataRef.current) {
      drawSpectrogramView(
        ctx,
        spectrogramDataRef.current,
        spectrogramImageRef.current,
        plotW,
        plotH,
        plotRight,
        plotBottom
      );
    } else {
      drawEnergySpectrum(ctx, windowDistRef.current, plotW, plotH, plotRight, plotBottom);
    }

    ctx.restore();
  }, [drawEnergySpectrum]);

  const drawFrameRef = useRef(drawFrame);
  drawFrameRef.current = drawFrame;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const nextW = Math.round(rect.width);
      const nextH = Math.round(rect.height);
      if (sizeRef.current.width === nextW && sizeRef.current.height === nextH) return;
      sizeRef.current = { width: nextW, height: nextH };
      drawFrameRef.current();
    };

    const initRect = el.getBoundingClientRect();
    sizeRef.current = { width: Math.round(initRect.width), height: Math.round(initRect.height) };
    drawFrameRef.current();

    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    drawFrameRef.current();
  }, [viewMode, windowDist, spectrogramData, currentTime, result.beats]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { width, height } = sizeRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const plotW = Math.max(10, width - PAD_LEFT - PAD_RIGHT);
    const plotH = Math.max(10, height - PAD_TOP - PAD_BOTTOM);
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const xRatio = Math.max(0, Math.min(1, (localX - PAD_LEFT) / plotW));
    const yRatio = Math.max(0, Math.min(1, 1 - (localY - PAD_TOP) / plotH));
    hoverCoordsRef.current = { xRatio, yRatio };

    const spec = spectrogramDataRef.current;
    if (viewModeRef.current === 'spectrogram' && spec) {
      const freqHz = ratioToFreq(yRatio);
      const timeSec = spec.windowStart + xRatio * (spec.windowEnd - spec.windowStart);
      setHoverProbe({
        xRatio,
        yRatio,
        freqHz,
        timeSec,
        downbeatDb: null,
        beatDb: null,
        zone: zoneForFreq(freqHz),
      });
      drawFrameRef.current();
      return;
    }

    const freqHz = ratioToFreq(xRatio);
    const bandIdx = Math.max(0, Math.min(NUM_BANDS - 1, Math.floor(xRatio * NUM_BANDS)));
    const dist = windowDistRef.current;
    setHoverProbe({
      xRatio,
      yRatio,
      freqHz,
      timeSec: null,
      downbeatDb: dist && dist.downbeatCount > 0 ? dist.downbeatDb[bandIdx] : null,
      beatDb: dist && dist.beatCount > 0 ? dist.beatDb[bandIdx] : null,
      zone: zoneForFreq(freqHz),
    });
    drawFrameRef.current();
  }, []);

  const handlePointerLeave = useCallback(() => {
    hoverCoordsRef.current = null;
    setHoverProbe(null);
    drawFrameRef.current();
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const spec = spectrogramDataRef.current;
      if (viewModeRef.current !== 'spectrogram' || !spec) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const plotW = Math.max(10, rect.width - PAD_LEFT - PAD_RIGHT);
      const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left - PAD_LEFT) / plotW));
      onSeek(spec.windowStart + xRatio * (spec.windowEnd - spec.windowStart));
    },
    [onSeek]
  );

  const spectrumHelp = useMemo<DiagramHelpContent>(() => {
    if (viewMode === 'live') {
      return {
        title: `${t('web.spectrum.title')} · ${t('web.spectrum.mode_live')}`,
        summary: t('web.spectrum.help_live_summary'),
        items: [
          { color: 'rose', text: t('web.spectrum.help_live_1') },
          { color: 'cyan', text: t('web.spectrum.help_live_2') },
        ],
        actionTip: t('web.spectrum.help_live_tip'),
      };
    }
    if (viewMode === 'spectrogram') {
      return {
        title: `${t('web.spectrum.title')} · ${t('web.spectrum.mode_spectrogram')}`,
        summary: t('web.spectrum.help_spec_summary'),
        items: [
          { color: 'cyan', text: t('web.spectrum.help_spec_1') },
          { color: 'slate', text: t('web.spectrum.help_spec_2') },
        ],
        actionTip: t('web.spectrum.help_spec_tip'),
      };
    }
    return {
      title: `${t('web.spectrum.title')} · ${t('web.spectrum.mode_spectrum')}`,
      summary: t('web.spectrum.help_abs_summary'),
      items: [
        { color: 'rose', text: t('web.spectrum.help_abs_1') },
        { color: 'amber', text: t('web.spectrum.help_abs_2') },
      ],
      actionTip: t('web.spectrum.help_abs_tip'),
    };
  }, [t, viewMode]);

  if (!audioBuffer) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{t('web.spectrum.title')}</span>
            <DiagramInfoTooltip buttonLabel={t('web.spectrum.help_label')} help={spectrumHelp} />
          </div>

          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-950/90 border border-slate-800">
            <button
              type="button"
              onClick={() => selectViewMode('spectrogram')}
              aria-pressed={viewMode === 'spectrogram'}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                viewMode === 'spectrogram' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('web.spectrum.mode_spectrogram')}
            </button>
            <button
              type="button"
              onClick={() => selectViewMode('spectrum')}
              aria-pressed={viewMode === 'spectrum'}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                viewMode === 'spectrum' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('web.spectrum.mode_spectrum')}
            </button>
            {liveSource && (
              <button
                type="button"
                onClick={() => selectViewMode('live')}
                aria-pressed={viewMode === 'live'}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  viewMode === 'live' ? 'bg-slate-800 text-rose-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('web.spectrum.mode_live')}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          {viewMode === 'live' ? (
            <span className="whitespace-nowrap">{t('web.spectrum.legend_live')}</span>
          ) : viewMode === 'spectrogram' && spectrogramData ? (
            <span className="whitespace-nowrap">{t('web.spectrum.legend_spectrogram')}</span>
          ) : windowDist ? (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <ValueTooltip
                title={t('web.spectrum.legend_downbeats', { n: windowDist.downbeatCount })}
                body={t('web.spectrum.tip_peak_downbeat')}
                className="inline-flex items-center gap-1.5 text-rose-300 font-medium"
              >
                <span className="w-2 h-2 bg-rose-400 inline-block" aria-hidden="true" />
                <span>{t('web.spectrum.legend_downbeats', { n: windowDist.downbeatCount })}</span>
              </ValueTooltip>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <ValueTooltip
                title={t('web.spectrum.legend_beats', { n: windowDist.beatCount })}
                body={t('web.spectrum.tip_peak_beats')}
                className="inline-flex items-center gap-1.5 text-cyan-300 font-medium"
              >
                <span className="w-2 h-2 bg-cyan-400 inline-block" aria-hidden="true" />
                <span>{t('web.spectrum.legend_beats', { n: windowDist.beatCount })}</span>
              </ValueTooltip>
              {windowDist.offbeatCount > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1.5 text-amber-300/90 font-medium">
                    <span className="w-2.5 h-0.5 bg-amber-400 inline-block" aria-hidden="true" />
                    <span>{t('web.spectrum.legend_offbeat', { n: windowDist.offbeatCount })}</span>
                  </span>
                </>
              )}
            </div>
          ) : null}

          <span aria-hidden="true" className="text-slate-700 hidden md:inline">|</span>

          <div className="w-[19rem] max-w-full shrink-0 h-5 flex items-center justify-start font-mono tabular-nums overflow-hidden">
            {hoverProbe ? (
              viewMode === 'spectrogram' && hoverProbe.timeSec !== null ? (
                <div className="grid grid-cols-[5.25rem_5.25rem_5rem] items-center gap-1.5 text-slate-200 w-full">
                  <span className="text-left truncate text-amber-300">{formatClock(hoverProbe.timeSec, true)}</span>
                  <span className="text-left truncate">{formatFreq(hoverProbe.freqHz)}</span>
                  <span className="text-left truncate text-slate-400">{t(`web.spectrum.zone_${hoverProbe.zone}`)}</span>
                </div>
              ) : (
                <div className="grid grid-cols-[4.25rem_3.75rem_5.25rem_5.25rem] items-center gap-1 text-slate-200 w-full">
                  <span className="text-left truncate">{formatFreq(hoverProbe.freqHz)}</span>
                  <span className="text-left truncate text-slate-400">{t(`web.spectrum.zone_${hoverProbe.zone}`)}</span>
                  <span className="text-left truncate text-rose-300">
                    1: {hoverProbe.downbeatDb !== null ? num(hoverProbe.downbeatDb, 0) : '–'} dB
                  </span>
                  <span className="text-left truncate text-cyan-300">
                    2–4: {hoverProbe.beatDb !== null ? num(hoverProbe.beatDb, 0) : '–'} dB
                  </span>
                </div>
              )
            ) : viewMode === 'spectrogram' && spectrogramData ? (
              <div className="grid grid-cols-[7.25rem_11rem] items-center gap-2 w-full">
                <span className="text-left truncate text-slate-300">
                  {formatClock(spectrogramData.windowStart)}–{formatClock(spectrogramData.windowEnd)}
                </span>
                <span className="text-left truncate text-slate-400">25 Hz – 16 kHz (Log)</span>
              </div>
            ) : windowDist ? (
              <div className="grid grid-cols-[6.25rem_6.25rem_6.5rem] items-center gap-1 w-full">
                <span className="text-left truncate text-slate-400">
                  {formatClock(windowDist.windowStart)}–{formatClock(windowDist.windowEnd)}
                </span>
                <ValueTooltip
                  title={`1: ${formatFreq(windowDist.downbeatPeakFreqHz)}`}
                  body={t('web.spectrum.tip_peak_downbeat')}
                  className="text-left truncate text-rose-300 font-semibold block min-w-0"
                >
                  1: {formatFreq(windowDist.downbeatPeakFreqHz)}
                </ValueTooltip>
                <ValueTooltip
                  title={`2–4: ${formatFreq(windowDist.beatPeakFreqHz)}`}
                  body={t('web.spectrum.tip_peak_beats')}
                  className="text-left truncate text-cyan-300 font-semibold block min-w-0"
                >
                  2–4: {formatFreq(windowDist.beatPeakFreqHz)}
                </ValueTooltip>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {viewMode === 'live' && liveSource && (
        <LiveSpectrum source={liveSource} isPlaying={isPlaying} result={result} currentTime={currentTime} />
      )}
      <div
        ref={containerRef}
        className={`relative h-36 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden ${
          viewMode === 'live' ? 'hidden' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className={`w-full h-full block ${viewMode === 'spectrogram' ? 'cursor-pointer' : 'cursor-crosshair'}`}
        />
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Layers, RotateCcw, Undo2, ArrowLeft, ArrowRight } from 'lucide-react';
import { AnalysisResult } from '../types/analyzer';
import { BeatEvidenceData, computeBeatEvidence, computeFoldedBar, FoldedBarData } from '../utils/beatEvidence';
import { useI18n } from '../i18n';
import { DiagramInfoTooltip, ValueTooltip } from './DiagramInfoTooltip';

interface BeatEvidenceLabProps {
  result: AnalysisResult;
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  viewRange: { start: number; end: number } | null;
  onSeek: (time: number) => void;
  onShiftDownbeat: (direction: -1 | 1) => void;
  onShiftHalfBeat: (direction: -1 | 1) => void;
  onScaleTempo: (factor: 0.5 | 2) => void;
  /** time signature correction: beats per bar */
  onSetMeter: (beatsPerBar: number) => void;
  onUndoGrid: () => void;
  onResetGrid: () => void;
  canUndoGrid: boolean;
  canResetGrid: boolean;
  /** number of active correction steps (shown next to the title) */
  correctionCount: number;
}

const METER_CHOICES = [2, 3, 4, 5, 6, 7];

const STORAGE_EXPANDED_KEY = 'beatanalyzer.evidenceExpanded';
const STORAGE_LANES_VISIBLE_KEY = 'beatanalyzer.lanesVisible';
const STORAGE_FOLDED_SCOPE_KEY = 'beatanalyzer.foldedScope';
const STORAGE_LANES_HEIGHT_KEY = 'beatanalyzer.lanesHeight';
// height of the band lanes: drag the grip below them, up to twice the normal height (wish of the user)
const LANES_MIN_H = 108;
const LANES_MAX_H = LANES_MIN_H * 2;

function readLanesHeight(): number {
  try {
    const v = Number(localStorage.getItem(STORAGE_LANES_HEIGHT_KEY));
    return Number.isFinite(v) && v >= LANES_MIN_H && v <= LANES_MAX_H ? v : LANES_MIN_H;
  } catch {
    return LANES_MIN_H;
  }
}

function readExpanded(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_EXPANDED_KEY);
    return v === null ? true : v === '1';
  } catch {
    return true;
  }
}

function readLanesVisible(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_LANES_VISIBLE_KEY);
    return v === null ? true : v === '1';
  } catch {
    return true;
  }
}

function readFoldedScope(): 'window' | 'all' {
  try {
    return localStorage.getItem(STORAGE_FOLDED_SCOPE_KEY) === 'all' ? 'all' : 'window';
  } catch {
    return 'window';
  }
}

function formatClock(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export const BeatEvidenceLab: React.FC<BeatEvidenceLabProps> = ({
  result,
  audioBuffer,
  currentTime,
  viewRange,
  onSeek,
  onShiftDownbeat,
  onShiftHalfBeat,
  onScaleTempo,
  onSetMeter,
  onUndoGrid,
  onResetGrid,
  canUndoGrid,
  canResetGrid,
  correctionCount,
}) => {
  const { t, meter } = useI18n();
  const [isExpanded, setIsExpanded] = useState<boolean>(readExpanded);
  const [lanesVisible, setLanesVisible] = useState<boolean>(readLanesVisible);
  const [foldedScope, setFoldedScope] = useState<'window' | 'all'>(readFoldedScope);
  const [lanesHeight, setLanesHeight] = useState<number>(readLanesHeight);
  const lanesDrag = useRef<{ y: number; h: number } | null>(null);

  const storeLanesHeight = useCallback((h: number) => {
    try {
      localStorage.setItem(STORAGE_LANES_HEIGHT_KEY, String(Math.round(h)));
    } catch {
      // Ignore storage errors
    }
  }, []);
  const onGripDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      lanesDrag.current = { y: e.clientY, h: lanesHeight };
    },
    [lanesHeight]
  );
  const onGripMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = lanesDrag.current;
    if (!d) return;
    setLanesHeight(Math.max(LANES_MIN_H, Math.min(LANES_MAX_H, d.h + e.clientY - d.y)));
  }, []);
  const onGripUp = useCallback(() => {
    if (!lanesDrag.current) return;
    lanesDrag.current = null;
    setLanesHeight((h) => {
      storeLanesHeight(h);
      return h;
    });
  }, [storeLanesHeight]);
  const onGripReset = useCallback(() => {
    setLanesHeight(LANES_MIN_H);
    storeLanesHeight(LANES_MIN_H);
  }, [storeLanesHeight]);

  const lanesWrapRef = useRef<HTMLDivElement>(null);
  const lanesCanvasRef = useRef<HTMLCanvasElement>(null);
  const foldedWrapRef = useRef<HTMLDivElement>(null);
  const foldedCanvasRef = useRef<HTMLCanvasElement>(null);

  const evidence: BeatEvidenceData | null = useMemo(() => {
    if (!audioBuffer) return null;
    return computeBeatEvidence(audioBuffer, result);
  }, [audioBuffer, result]);

  const winStart = viewRange ? Math.max(0, viewRange.start) : 0;
  const winEnd = viewRange ? Math.min(result.metadata.duration || 1, viewRange.end) : result.metadata.duration || 1;
  const isZoomed = Boolean(
    viewRange && (viewRange.start > 0.25 || viewRange.end < (result.metadata.duration || 1) - 0.25)
  );

  const activeFoldedBar: FoldedBarData | null = useMemo(() => {
    if (!evidence) return null;
    if (foldedScope === 'window' && isZoomed) {
      const winFolded = computeFoldedBar(
        result.beats,
        result.timeSignature.numerator || 4,
        evidence.frameRate,
        evidence.foldLow,
        evidence.foldMid,
        evidence.foldHigh,
        { start: winStart, end: winEnd }
      );
      if (winFolded.barCount >= 2) return winFolded;
    }
    return evidence.foldedBar;
  }, [evidence, foldedScope, isZoomed, result.beats, result.timeSignature.numerator, winStart, winEnd]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_EXPANDED_KEY, next ? '1' : '0');
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const toggleLanesVisible = useCallback(() => {
    setLanesVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_LANES_VISIBLE_KEY, next ? '1' : '0');
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const toggleFoldedScope = useCallback(() => {
    setFoldedScope((prev) => {
      const next = prev === 'window' ? 'all' : 'window';
      try {
        localStorage.setItem(STORAGE_FOLDED_SCOPE_KEY, next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  // 1: Draw Compact Band-Onset-Lanes (Low / Mid / High)
  const drawLanes = useCallback(() => {
    const canvas = lanesCanvasRef.current;
    const wrap = lanesWrapRef.current;
    if (!canvas || !wrap || !evidence) return;

    const rect = wrap.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const plotX = 114;
    const plotW = Math.max(20, width - plotX - 10);
    const topPad = 14;
    const botPad = 4;
    const laneGap = 3;
    const laneH = Math.max(18, (height - topPad - botPad - laneGap * 2) / 3);
    const span = Math.max(0.1, winEnd - winStart);

    const lanes = [
      {
        title: t('web.evidence.lane_low'),
        range: t('web.evidence.lane_low_range'),
        onset: evidence.lowOnset,
        rms: evidence.lowBand,
        stroke: 'rgba(251, 113, 133, 0.95)',
        fill: 'rgba(244, 63, 94, 0.3)',
        rmsFill: 'rgba(244, 63, 94, 0.11)',
        labelColor: '#fda4af',
      },
      {
        title: t('web.evidence.lane_mid'),
        range: t('web.evidence.lane_mid_range'),
        onset: evidence.midOnset,
        rms: evidence.midBand,
        stroke: 'rgba(34, 211, 238, 0.95)',
        fill: 'rgba(6, 182, 212, 0.3)',
        rmsFill: 'rgba(6, 182, 212, 0.11)',
        labelColor: '#67e8f9',
      },
      {
        title: t('web.evidence.lane_high'),
        range: t('web.evidence.lane_high_range'),
        onset: evidence.highOnset,
        rms: evidence.highBand,
        stroke: 'rgba(129, 140, 248, 0.95)',
        fill: 'rgba(99, 102, 241, 0.3)',
        rmsFill: 'rgba(99, 102, 241, 0.11)',
        labelColor: '#a5b4fc',
      },
    ];

    lanes.forEach((lane, idx) => {
      const y0 = topPad + idx * (laneH + laneGap);
      const yBase = y0 + laneH;
      const yMid = y0 + laneH / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.fillRect(plotX, y0, plotW, laneH);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.lineWidth = 1;
      ctx.strokeRect(plotX + 0.5, y0 + 0.5, plotW - 1, laneH - 1);

      // Two-line honest band caption on the left
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '600 9.5px ui-sans-serif, system-ui, -apple-system, sans-serif';
      ctx.fillStyle = lane.labelColor;
      ctx.fillText(lane.title, 8, yMid - 5);
      ctx.font = '500 8.5px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.fillText(lane.range, 8, yMid + 5.5);

      const fr = evidence.frameRate;
      const maxIdx = lane.onset.length - 1;
      const pxCount = Math.max(2, Math.floor(plotW));

      // Subtle RMS silhouette behind sharp transient onset curve
      ctx.beginPath();
      ctx.moveTo(plotX, yBase);
      for (let px = 0; px <= pxCount; px++) {
        const t0 = winStart + (px / pxCount) * span;
        const t1 = winStart + ((px + 1) / pxCount) * span;
        const f0 = Math.max(0, Math.min(maxIdx, Math.floor(t0 * fr)));
        const f1 = Math.max(f0, Math.min(maxIdx, Math.ceil(t1 * fr)));
        let val = 0;
        for (let f = f0; f <= f1; f++) {
          if (lane.rms[f] > val) val = lane.rms[f];
        }
        const x = plotX + (px / pxCount) * plotW;
        const y = yBase - val * (laneH - 2);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(plotX + plotW, yBase);
      ctx.closePath();
      ctx.fillStyle = lane.rmsFill;
      ctx.fill();

      // Primary Half-Wave Onset-Flux transient area + stroke
      ctx.beginPath();
      ctx.moveTo(plotX, yBase);
      for (let px = 0; px <= pxCount; px++) {
        const t0 = winStart + (px / pxCount) * span;
        const t1 = winStart + ((px + 1) / pxCount) * span;
        const f0 = Math.max(0, Math.min(maxIdx, Math.floor(t0 * fr)));
        const f1 = Math.max(f0, Math.min(maxIdx, Math.ceil(t1 * fr)));
        let val = 0;
        for (let f = f0; f <= f1; f++) {
          if (lane.onset[f] > val) val = lane.onset[f];
        }
        const x = plotX + (px / pxCount) * plotW;
        const y = yBase - val * (laneH - 2);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(plotX + plotW, yBase);
      ctx.closePath();
      ctx.fillStyle = lane.fill;
      ctx.fill();

      ctx.beginPath();
      for (let px = 0; px <= pxCount; px++) {
        const t0 = winStart + (px / pxCount) * span;
        const t1 = winStart + ((px + 1) / pxCount) * span;
        const f0 = Math.max(0, Math.min(maxIdx, Math.floor(t0 * fr)));
        const f1 = Math.max(f0, Math.min(maxIdx, Math.ceil(t1 * fr)));
        let val = 0;
        for (let f = f0; f <= f1; f++) {
          if (lane.onset[f] > val) val = lane.onset[f];
        }
        const x = plotX + (px / pxCount) * plotW;
        const y = yBase - val * (laneH - 2);
        if (px === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = lane.stroke;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    ctx.font = '700 9px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    let lastLabelX = -100;
    for (const b of result.beats) {
      if (b.time < winStart || b.time > winEnd) continue;
      const x = plotX + ((b.time - winStart) / span) * plotW;

      if (b.isDownbeat) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.72)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, topPad - 2);
        ctx.lineTo(x, height - 3);
        ctx.stroke();

        const barLbl = `T${b.barIndex}`;
        const barLblW = ctx.measureText(barLbl).width;
        if (x - lastLabelX >= 36 && x + 2 + barLblW <= width - 4) {
          ctx.fillStyle = '#fda4af';
          ctx.fillText(barLbl, x + 2, 2);
          lastLabelX = x;
        }
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, topPad);
        ctx.lineTo(x, height - 3);
        ctx.stroke();
      }
    }

    if (currentTime >= winStart && currentTime <= winEnd) {
      const px = plotX + ((currentTime - winStart) / span) * plotW;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.moveTo(px, topPad - 3);
      ctx.lineTo(px, height - 2);
      ctx.stroke();
    }

    ctx.restore();
  }, [evidence, result.beats, winStart, winEnd, currentTime, t]);

  // 2: Draw Folded Bar Phase Profile
  const drawFolded = useCallback(() => {
    const canvas = foldedCanvasRef.current;
    const wrap = foldedWrapRef.current;
    if (!canvas || !wrap || !activeFoldedBar) return;

    const rect = wrap.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const fb = activeFoldedBar;
    const padL = 14;
    const padR = 14;
    const padT = 14;
    const padB = 22;
    const plotW = Math.max(20, width - padL - padR);
    const plotH = Math.max(20, height - padT - padB);
    const totalBins = fb.low.length;

    let maxVal = 0.05;
    for (let i = 0; i < totalBins; i++) {
      if (fb.low[i] > maxVal) maxVal = fb.low[i];
      if (fb.mid[i] > maxVal) maxVal = fb.mid[i];
      if (fb.high[i] > maxVal) maxVal = fb.high[i];
    }

    ctx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    for (let b = 0; b <= fb.numerator; b++) {
      const x = padL + (b / fb.numerator) * plotW;
      const isBeat1 = b === 0;
      const isWrapBeat1 = b === fb.numerator;
      ctx.strokeStyle = isBeat1
        ? 'rgba(244, 63, 94, 0.5)'
        : isWrapBeat1
        ? 'rgba(244, 63, 94, 0.28)'
        : 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = isBeat1 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      if (b < fb.numerator) {
        ctx.fillStyle = b === 0 ? '#fda4af' : '#94a3b8';
        ctx.fillText(`${b + 1}`, x + 10, padT + plotH + 6);

        const xHalf = padL + ((b + 0.5) / fb.numerator) * plotW;
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.24)';
        ctx.setLineDash([2, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xHalf, padT);
        ctx.lineTo(xHalf, padT + plotH);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = 'rgba(253, 164, 175, 0.55)';
        ctx.fillText('(1)', x - 2, padT + plotH + 6);
      }
    }

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH * 0.5);
    ctx.lineTo(padL + plotW, padT + plotH * 0.5);
    ctx.stroke();

    const drawSeries = (arr: Float32Array, stroke: string, fill: string | null) => {
      if (totalBins < 2) return;
      if (fill) {
        ctx.beginPath();
        ctx.moveTo(padL, padT + plotH);
        for (let i = 0; i < totalBins; i++) {
          const x = padL + (i / totalBins) * plotW;
          const y = padT + plotH - (arr[i] / maxVal) * plotH;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(padL + plotW, padT + plotH);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.beginPath();
      for (let i = 0; i < totalBins; i++) {
        const x = padL + (i / totalBins) * plotW;
        const y = padT + plotH - (arr[i] / maxVal) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const yEnd = padT + plotH - (arr[0] / maxVal) * plotH;
      ctx.lineTo(padL + plotW, yEnd);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.75;
      ctx.stroke();
    };

    drawSeries(fb.high, 'rgba(129, 140, 248, 0.85)', null);
    drawSeries(fb.mid, 'rgba(34, 211, 238, 0.9)', null);
    drawSeries(fb.low, 'rgba(251, 113, 133, 0.98)', 'rgba(244, 63, 94, 0.2)');

    ctx.restore();
  }, [activeFoldedBar]);

  const drawLanesRef = useRef(drawLanes);
  drawLanesRef.current = drawLanes;
  const drawFoldedRef = useRef(drawFolded);
  drawFoldedRef.current = drawFolded;

  useEffect(() => {
    if (!isExpanded) return;
    if (lanesVisible) drawLanesRef.current();
  }, [isExpanded, lanesVisible, evidence, winStart, winEnd, currentTime, result.beats]);

  useEffect(() => {
    if (!isExpanded) return;
    drawFoldedRef.current();
  }, [isExpanded, activeFoldedBar]);

  useEffect(() => {
    if (!isExpanded) return;
    const ro = new ResizeObserver(() => {
      if (lanesVisible) drawLanesRef.current();
      drawFoldedRef.current();
    });
    if (lanesVisible && lanesWrapRef.current) ro.observe(lanesWrapRef.current);
    if (foldedWrapRef.current) ro.observe(foldedWrapRef.current);
    return () => ro.disconnect();
  }, [isExpanded, lanesVisible]);

  const handleLanesClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const plotX = 114;
      const plotW = Math.max(20, rect.width - plotX - 10);
      const frac = Math.max(0, Math.min(1, (e.clientX - rect.left - plotX) / plotW));
      onSeek(winStart + frac * (winEnd - winStart));
    },
    [winStart, winEnd, onSeek]
  );

  if (!audioBuffer || !evidence || !activeFoldedBar) return null;

  const fb = activeFoldedBar;
  const meterStr = meter(`${result.timeSignature.numerator}/${result.timeSignature.denominator}`);

  const verdictText =
    fb.verdict === 'ok'
      ? t('web.evidence.verdict_ok', { beat: fb.dominantBeat })
      : fb.verdict === 'shifted_backbeat'
      ? t('web.evidence.verdict_shifted_backbeat', { beat: fb.dominantBeat })
      : fb.verdict === 'shifted_offbeat'
      ? t('web.evidence.verdict_shifted_offbeat')
      : fb.verdict === 'flat'
      ? t('web.evidence.verdict_flat')
      : t('web.evidence.verdict_insufficient');

  const isWarning = fb.verdict === 'shifted_backbeat' || fb.verdict === 'shifted_offbeat';

  return (
    <section
      aria-label={t('web.evidence.title')}
      className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden"
    >
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            title={isExpanded ? t('web.evidence.toggle_hide') : t('web.evidence.toggle_show')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg py-1 pr-2 whitespace-nowrap shrink-0"
          >
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t('web.evidence.title')}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>

          <span className="text-[11px] text-slate-500 hidden md:inline whitespace-nowrap">
            {t('web.evidence.subtitle')}
          </span>
        </div>

        <span className="text-[11px] font-mono tabular-nums text-slate-500">
          {formatClock(winStart)} – {formatClock(winEnd)}
        </span>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-4">
          {/* 1: Compact Toggleable Band-Onset-Lanes */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-300">{t('web.evidence.lanes_title')}</span>
                <DiagramInfoTooltip
                  buttonLabel={t('web.evidence.help_lanes_label')}
                  help={{
                    title: t('web.evidence.lanes_title'),
                    summary: t('web.evidence.help_lanes_summary'),
                    items: [
                      { color: 'rose', text: t('web.evidence.help_lanes_1') },
                      { color: 'slate', text: t('web.evidence.help_lanes_2') },
                    ],
                    actionTip: t('web.evidence.help_lanes_tip'),
                  }}
                />
                <button
                  type="button"
                  onClick={toggleLanesVisible}
                  aria-expanded={lanesVisible}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700/90 bg-slate-950/75 text-[10px] font-medium text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {lanesVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{lanesVisible ? t('web.evidence.lanes_hide') : t('web.evidence.lanes_show')}</span>
                </button>
              </div>
              {lanesVisible && (
                <span className="font-mono tabular-nums text-slate-500">
                  {formatClock(winStart)} – {formatClock(winEnd)} · {t('web.evidence.click_seek')}
                </span>
              )}
            </div>
            {lanesVisible && (
              <>
                <div
                  ref={lanesWrapRef}
                  style={{ height: lanesHeight }}
                  className="relative w-full rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden"
                >
                  <canvas
                    ref={lanesCanvasRef}
                    onClick={handleLanesClick}
                    className="w-full h-full block cursor-pointer"
                  />
                </div>
                {/* grip: drag to make the lanes up to twice as high; double-click = normal height */}
                <div
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label={t('web.evidence.lanes_resize')}
                  title={t('web.evidence.lanes_resize')}
                  onPointerDown={onGripDown}
                  onPointerMove={onGripMove}
                  onPointerUp={onGripUp}
                  onPointerCancel={onGripUp}
                  onDoubleClick={onGripReset}
                  className="group -mt-1 h-3 w-full flex items-center justify-center cursor-ns-resize touch-none select-none"
                >
                  <span className="h-1 w-12 rounded-full bg-slate-700 group-hover:bg-slate-500 transition-colors" />
                </div>
              </>
            )}
          </div>

          {/* 2: Folded Bar + Direct 1-Click Correction Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18.5rem] gap-4 items-stretch">
            <div className="space-y-1.5 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-300">
                    {t('web.evidence.folded_title', { bars: fb.barCount, meter: meterStr })}
                  </span>
                  <DiagramInfoTooltip
                    buttonLabel={t('web.evidence.help_folded_label')}
                    help={{
                      title: t('web.evidence.folded_title', { bars: fb.barCount, meter: meterStr }),
                      summary: t('web.evidence.help_folded_summary'),
                      items: [
                        { color: 'rose', text: t('web.evidence.help_folded_1') },
                        { color: 'cyan', text: t('web.evidence.help_folded_2') },
                      ],
                      actionTip: t('web.evidence.help_folded_tip'),
                    }}
                  />
                  {isZoomed && (
                    <button
                      type="button"
                      onClick={toggleFoldedScope}
                      className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-950/80 text-[10px] font-medium text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {fb.isWindowScoped ? t('web.evidence.scope_window') : t('web.evidence.scope_all')}
                    </button>
                  )}
                </div>
                <span
                  className={`font-medium ${
                    fb.verdict === 'ok'
                      ? 'text-emerald-300'
                      : isWarning
                      ? 'text-amber-300'
                      : 'text-slate-400'
                  }`}
                >
                  {verdictText}
                </span>
              </div>
              <div
                ref={foldedWrapRef}
                className="relative h-36 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden"
              >
                <canvas ref={foldedCanvasRef} className="w-full h-full block" />
              </div>
            </div>

            {/* 1-Click Grid Correction Actions */}
            <div className="rounded-xl bg-slate-950/75 border border-slate-800/90 p-3 flex flex-col justify-between gap-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <ValueTooltip
                  title={t('web.evidence.fix_title')}
                  body={t('web.evidence.fix_help')}
                  className="text-[11px] font-semibold text-slate-200 whitespace-nowrap"
                >
                  {t('web.evidence.fix_title')}
                </ValueTooltip>
                {correctionCount > 0 && (
                  <span
                    className="text-[10px] font-medium text-amber-300 whitespace-nowrap"
                    title={t('web.evidence.fix_count_tip')}
                  >
                    {t('web.evidence.fix_count', { n: correctionCount })}
                  </span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={onResetGrid}
                    disabled={!canResetGrid}
                    aria-label={t('web.evidence.fix_reset')}
                    title={t('web.evidence.fix_reset_tip')}
                    className={`inline-flex items-center justify-center p-1 rounded border transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      canResetGrid
                        ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500 cursor-pointer'
                        : 'border-slate-800/70 bg-slate-950/50 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={onUndoGrid}
                    disabled={!canUndoGrid}
                    title={t('web.evidence.fix_undo_tip')}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      canUndoGrid
                        ? 'border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-500 cursor-pointer'
                        : 'border-slate-800/70 bg-slate-950/50 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Undo2 className="w-2.5 h-2.5" />
                    <span>{t('web.evidence.fix_undo')}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {/* Downbeat -1 / +1 Beat */}
                <div className="space-y-1">
                  <div className="text-[10px] font-medium text-slate-400">
                    {t('web.evidence.fix_downbeat_group')}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onShiftDownbeat(-1)}
                      title={t('web.evidence.fix_downbeat_prev_tip')}
                      className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        fb.verdict === 'shifted_backbeat'
                          ? 'bg-amber-950/45 border-amber-600/80 text-amber-200 hover:bg-amber-900/50'
                          : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <ArrowLeft className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="font-mono">{t('web.evidence.fix_downbeat_prev')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onShiftDownbeat(1)}
                      title={t('web.evidence.fix_downbeat_next_tip')}
                      className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        fb.verdict === 'shifted_backbeat'
                          ? 'bg-amber-950/45 border-amber-600/80 text-amber-200 hover:bg-amber-900/50'
                          : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono">{t('web.evidence.fix_downbeat_next')}</span>
                      <ArrowRight className="w-3 h-3 text-rose-400 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Half-Beat Grid -1/2 / +1/2 */}
                <div className="space-y-1">
                  <div className="text-[10px] font-medium text-slate-400">
                    {t('web.evidence.fix_half_beat_group')}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onShiftHalfBeat(-1)}
                      title={t('web.evidence.fix_half_beat_prev_tip')}
                      className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        fb.verdict === 'shifted_offbeat'
                          ? 'bg-amber-950/45 border-amber-600/80 text-amber-200 hover:bg-amber-900/50'
                          : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <ArrowLeft className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="font-mono">{t('web.evidence.fix_half_beat_prev')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onShiftHalfBeat(1)}
                      title={t('web.evidence.fix_half_beat_next_tip')}
                      className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        fb.verdict === 'shifted_offbeat'
                          ? 'bg-amber-950/45 border-amber-600/80 text-amber-200 hover:bg-amber-900/50'
                          : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono">{t('web.evidence.fix_half_beat_next')}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => onScaleTempo(0.5)}
                  title={t('web.evidence.fix_tempo_tip')}
                  className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900/80 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  {t('web.evidence.fix_halftime')}
                </button>
                <button
                  type="button"
                  onClick={() => onScaleTempo(2)}
                  title={t('web.evidence.fix_tempo_tip')}
                  className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900/80 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  {t('web.evidence.fix_doubletime')}
                </button>
              </div>
              {/* time signature: beats per bar, from the first "1" on */}
              <div className="space-y-1">
                <div className="text-[10px] font-medium text-slate-400">{t('web.evidence.fix_meter_group')}</div>
                <div className="grid grid-cols-6 gap-1" role="group" aria-label={t('web.evidence.fix_meter_group')}>
                  {METER_CHOICES.map((n) => {
                    const active = result.timeSignature.numerator === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => !active && onSetMeter(n)}
                        aria-pressed={active}
                        title={t('web.evidence.fix_meter_tip', { n })}
                        className={`px-1 py-1 rounded-lg border text-[11px] font-mono font-medium transition-colors ${
                          active
                            ? 'bg-cyan-950/60 border-cyan-700/80 text-cyan-200 cursor-default'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

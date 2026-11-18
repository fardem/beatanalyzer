import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronsDown, ChevronsUp, Eye, EyeOff, RotateCcw, Undo2, ArrowLeft, ArrowRight } from 'lucide-react';
import { AnalysisResult } from '../types/analyzer';
import { BeatEvidenceData, computeBeatEvidence, computeFoldedBar, FoldedBarData } from '../utils/beatEvidence';
import { GridOp, TimeRange } from '../utils/beatTransforms';
import { FixSuggestion, suggestFix } from '../utils/fixSuggestion';
import { useI18n } from '../i18n';
import { DiagramInfoTooltip, ValueTooltip } from './DiagramInfoTooltip';

interface BeatEvidenceLabProps {
  result: AnalysisResult;
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  viewRange: { start: number; end: number } | null;
  onSeek: (time: number) => void;
  /** adds correction steps (bar start, half beat, tempo, beats per bar – whole song or a section) */
  onApplyOps: (ops: GridOp[]) => void;
  onUndoGrid: () => void;
  onResetGrid: () => void;
  canUndoGrid: boolean;
  canResetGrid: boolean;
  /** number of active correction steps (shown next to the title) */
  correctionCount: number;
}

const METER_CHOICES = [2, 3, 4, 5, 6, 7];

const STORAGE_LANES_VISIBLE_KEY = 'beatanalyzer.lanesVisible';
const STORAGE_FOLDED_SCOPE_KEY = 'beatanalyzer.foldedScope';
const STORAGE_LANES_HEIGHT_KEY = 'beatanalyzer.lanesHeight';
// height of the band lanes: normal or twice as high (button next to the title)
const LANES_MIN_H = 108;
const LANES_MAX_H = LANES_MIN_H * 2;

function readLanesHeight(): number {
  try {
    const v = Number(localStorage.getItem(STORAGE_LANES_HEIGHT_KEY));
    return Number.isFinite(v) && v > LANES_MIN_H ? LANES_MAX_H : LANES_MIN_H;   // an old in-between height: double
  } catch {
    return LANES_MIN_H;
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

/** Short text for a list of steps, e.g. "Tempo ½× · 4 beats per bar · +1 beat". */
function describeOps(ops: GridOp[], t: (key: string, params?: Record<string, string | number>) => string): string {
  const parts: string[] = [];
  let shift = 0;
  for (const op of ops) {
    if (op.kind === 'tempo') parts.push(t(op.factor === 0.5 ? 'web.evidence.fix_halftime' : 'web.evidence.fix_doubletime'));
    else if (op.kind === 'meter') parts.push(t('web.evidence.suggest_meter', { n: op.beats }));
    else if (op.kind === 'half') parts.push(t(op.dir > 0 ? 'web.evidence.fix_half_beat_next' : 'web.evidence.fix_half_beat_prev'));
    else if (op.kind === 'downbeat') shift += op.dir;
  }
  if (shift !== 0) parts.push(t('web.evidence.suggest_shift', { n: `${shift > 0 ? '+' : '−'}${Math.abs(shift)}` }));
  return parts.join(' · ');
}

export const BeatEvidenceLab: React.FC<BeatEvidenceLabProps> = ({
  result,
  audioBuffer,
  currentTime,
  viewRange,
  onSeek,
  onApplyOps,
  onUndoGrid,
  onResetGrid,
  canUndoGrid,
  canResetGrid,
  correctionCount,
}) => {
  const { t, meter } = useI18n();
  const [lanesVisible, setLanesVisible] = useState<boolean>(readLanesVisible);
  const [foldedScope, setFoldedScope] = useState<'window' | 'all'>(readFoldedScope);
  const [lanesHeight, setLanesHeight] = useState<number>(readLanesHeight);

  const storeLanesHeight = useCallback((h: number) => {
    try {
      localStorage.setItem(STORAGE_LANES_HEIGHT_KEY, String(Math.round(h)));
    } catch {
      // Ignore storage errors
    }
  }, []);
  // height of the lanes: normal or double – one button with an arrow (test 0.6.0: a free grip between the two
  // heights brought nothing)
  const lanesTall = lanesHeight > LANES_MIN_H;
  const toggleLanesTall = useCallback(() => {
    const h = lanesTall ? LANES_MIN_H : LANES_MAX_H;
    setLanesHeight(h);
    storeLanesHeight(h);
  }, [lanesTall, storeLanesHeight]);

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

  // where the fixes apply: the whole song, or only the section in the blue frame (needs a zoomed view)
  const [fixScope, setFixScope] = useState<'song' | 'section'>('song');
  const sectionActive = fixScope === 'section' && isZoomed;
  const fixRange: TimeRange | null = useMemo(
    () => (sectionActive ? { start: winStart, end: winEnd } : null),
    [sectionActive, winStart, winEnd]
  );
  const apply = useCallback(
    (op: GridOp) =>
      onApplyOps([
        fixRange && op.kind !== 'nudge' && op.kind !== 'toggle' && op.kind !== 'insert' && op.kind !== 'delete'
          ? { ...op, range: fixRange }
          : op,
      ]),
    [onApplyOps, fixRange]
  );

  // suggestion: tries the fixes on the folded bar; computed a moment after the view rests (cheap, but the frame
  // can be dragged)
  const [suggestion, setSuggestion] = useState<FixSuggestion | null | undefined>(undefined);
  useEffect(() => {
    if (!evidence) return;
    const timer = setTimeout(() => setSuggestion(suggestFix(result, evidence, fixRange)), 120);
    return () => clearTimeout(timer);
  }, [evidence, result, fixRange]);
  const preview = suggestion && suggestion.ops.length > 0 ? suggestion.preview : null;

  const activeFoldedBar: FoldedBarData | null = useMemo(() => {
    if (!evidence) return null;
    if ((foldedScope === 'window' || sectionActive) && isZoomed) {
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
  }, [evidence, foldedScope, sectionActive, isZoomed, result.beats, result.timeSignature.numerator, winStart, winEnd]);

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
    if (preview) for (let i = 0; i < preview.low.length; i++) maxVal = Math.max(maxVal, preview.low[i]);

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

    // preview of the suggestion: the kick (low band) as it would fold after the suggested steps
    if (preview && preview.low.length > 1) {
      const pb = preview.low.length;
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < pb; i++) {
        const x = padL + (i / pb) * plotW;
        const y = padT + plotH - (preview.low[i] / maxVal) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(padL + plotW, padT + plotH - (preview.low[0] / maxVal) * plotH);
      ctx.stroke();
      // other beats per bar in the preview: its own beat marks at the top, so the dashed peaks can be read
      if (preview.numerator !== fb.numerator) {
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.6)';
        ctx.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        for (let b = 0; b < preview.numerator; b++) {
          const x = padL + (b / preview.numerator) * plotW;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 6);
          ctx.stroke();
          ctx.fillText(`${b + 1}`, x + 3, 0);
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }, [activeFoldedBar, preview]);

  const drawLanesRef = useRef(drawLanes);
  drawLanesRef.current = drawLanes;
  const drawFoldedRef = useRef(drawFolded);
  drawFoldedRef.current = drawFolded;

  useEffect(() => {
    if (lanesVisible) drawLanesRef.current();
  }, [lanesVisible, evidence, winStart, winEnd, currentTime, result.beats]);

  useEffect(() => {
    drawFoldedRef.current();
  }, [activeFoldedBar, preview]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (lanesVisible) drawLanesRef.current();
      drawFoldedRef.current();
    });
    if (lanesVisible && lanesWrapRef.current) ro.observe(lanesWrapRef.current);
    if (foldedWrapRef.current) ro.observe(foldedWrapRef.current);
    return () => ro.disconnect();
  }, [lanesVisible]);

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
    <div className="space-y-4">

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
                      { color: 'cyan', text: t('web.evidence.help_lanes_2') },
                      { color: 'indigo', text: t('web.evidence.help_lanes_3') },
                      { color: 'slate', text: t('web.evidence.help_lanes_4') },
                      { color: 'sky', text: t('web.evidence.help_lanes_5') },
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
                {lanesVisible && (
                  <button
                    type="button"
                    onClick={toggleLanesTall}
                    aria-pressed={lanesTall}
                    title={lanesTall ? t('web.evidence.lanes_lower') : t('web.evidence.lanes_taller')}
                    aria-label={lanesTall ? t('web.evidence.lanes_lower') : t('web.evidence.lanes_taller')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700/90 bg-slate-950/75 text-[10px] font-medium text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {lanesTall ? <ChevronsUp className="w-3 h-3" /> : <ChevronsDown className="w-3 h-3" />}
                    <span>{lanesTall ? '1×' : '2×'}</span>
                  </button>
                )}
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
                        { color: 'indigo', text: t('web.evidence.help_folded_3') },
                        { color: 'amber', text: t('web.evidence.help_folded_4') },
                        { color: 'white', text: t('web.evidence.help_folded_5') },
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
                className="relative flex-1 min-h-36 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden"
              >
                <canvas ref={foldedCanvasRef} className="absolute inset-0 w-full h-full block" />
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

              {/* where the fixes apply: whole song or only the section in the blue frame */}
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-400 shrink-0">{t('web.evidence.scope_fix_label')}</span>
                <div className="inline-flex p-0.5 rounded-md bg-slate-900 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFixScope('song')}
                    aria-pressed={!sectionActive}
                    className={`px-1.5 py-0.5 rounded font-medium cursor-pointer whitespace-nowrap ${
                      !sectionActive ? 'bg-cyan-950/70 text-cyan-200' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t('web.evidence.scope_fix_song')}
                  </button>
                  <button
                    type="button"
                    onClick={() => isZoomed && setFixScope('section')}
                    aria-pressed={sectionActive}
                    disabled={!isZoomed}
                    title={isZoomed ? t('web.evidence.scope_fix_section_tip') : t('web.evidence.scope_fix_need_zoom')}
                    className={`px-1.5 py-0.5 rounded font-medium whitespace-nowrap font-mono tabular-nums ${
                      sectionActive
                        ? 'bg-cyan-950/70 text-cyan-200 cursor-pointer'
                        : isZoomed
                        ? 'text-slate-400 hover:text-slate-200 cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isZoomed
                      ? t('web.evidence.scope_fix_section', { range: `${formatClock(winStart)}–${formatClock(winEnd)}` })
                      : t('web.evidence.scope_fix_section_plain')}
                  </button>
                </div>
              </div>

              {/* suggestion: the best fix found on the folded bar, with a dashed preview there */}
              {suggestion !== undefined && (
                <div
                  className={`rounded-lg border px-2 py-1.5 text-[11px] ${
                    suggestion && suggestion.ops.length > 0
                      ? 'border-cyan-800/70 bg-cyan-950/40 text-cyan-100'
                      : suggestion
                      ? 'border-emerald-800/50 bg-emerald-950/30 text-emerald-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                  title={t('web.evidence.suggest_tip')}
                >
                  {suggestion && suggestion.ops.length > 0 ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold">{t('web.evidence.suggest_title')}</div>
                        <div className="truncate">{describeOps(suggestion.ops, t)}</div>
                        <div className="text-[10px] text-cyan-300/70">{t('web.evidence.suggest_preview')}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onApplyOps(suggestion.ops)}
                        className="shrink-0 px-2.5 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold cursor-pointer"
                      >
                        {t('web.evidence.suggest_apply')}
                      </button>
                    </div>
                  ) : suggestion ? (
                    t('web.evidence.suggest_none')
                  ) : (
                    t('web.evidence.suggest_unclear')
                  )}
                </div>
              )}

              <div className="space-y-2">
                {/* Downbeat -1 / +1 Beat */}
                <div className="space-y-1">
                  <div className="text-[10px] font-medium text-slate-400">
                    {t('web.evidence.fix_downbeat_group')}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => apply({ kind: 'downbeat', dir: -1 })}
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
                      onClick={() => apply({ kind: 'downbeat', dir: 1 })}
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
                      onClick={() => apply({ kind: 'half', dir: -1 })}
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
                      onClick={() => apply({ kind: 'half', dir: 1 })}
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
                  onClick={() => apply({ kind: 'tempo', factor: 0.5 })}
                  title={t('web.evidence.fix_tempo_tip')}
                  className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900/80 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  {t('web.evidence.fix_halftime')}
                </button>
                <button
                  type="button"
                  onClick={() => apply({ kind: 'tempo', factor: 2 })}
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
                    const active = !sectionActive && result.timeSignature.numerator === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => (!active || sectionActive) && apply({ kind: 'meter', beats: n })}
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
  );
};

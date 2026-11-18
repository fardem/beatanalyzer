import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { AnalysisResult, BeatItem } from '../types/analyzer';
import { computeTempoHistogram } from '../utils/beatEvidence';
import { DiagramInfoTooltip, ValueTooltip } from './DiagramInfoTooltip';

interface TempoPanelProps {
  result: AnalysisResult;
  currentTime: number;
  onSeek: (time: number) => void;
}

/** true when the tempo moves noticeably (live band, rubato, tempo change): then the panel is unfolded by default */
export function hasTempoDrift(result: AnalysisResult): boolean {
  const validBpms = result.beats
    .slice(1)
    .map((b) => b.instantBpm)
    .filter((v) => Number.isFinite(v) && v > 35 && v < 260);
  if (validBpms.length < 4) return false;
  const refBpm = result.medianBpm || result.averageBpm || result.globalBpm || 120;
  if (refBpm <= 0) return false;
  const relativeSpan = (result.maxBpm - result.minBpm) / refBpm;
  const hasOutlier = validBpms.some((bpm) => Math.abs(bpm - refBpm) / refBpm > 0.15);
  return relativeSpan > 0.04 || hasOutlier;
}

/** short tempo info for the title bar of the panel (also visible when folded) */
export const TempoRangeLabel: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const { t, num } = useI18n();
  return (
    <ValueTooltip
      title={`${t('web.tempo.range')} ${num(result.minBpm, 1)} – ${num(result.maxBpm, 1)} BPM`}
      body={t('web.tempo.tip_range')}
      className="text-[11px] text-slate-400 font-mono tabular-nums truncate"
    >
      {t('web.tempo.range')} <span className="text-white font-semibold">{num(result.minBpm, 1)}</span> –{' '}
      <span className="text-white font-semibold">{num(result.maxBpm, 1)} BPM</span> · Ø{' '}
      <span className="text-cyan-400 font-bold">{num(result.averageBpm, 1)} BPM</span>
    </ValueTooltip>
  );
};

const SVG_W = 800;
const SVG_H = 120;
const PAD_X = 20;
const PAD_T = 14;
const PAD_B = 18;

/**
 * Tempo panel: the tempo curve over the song (left) and how often each tempo occurs (right), side by side.
 * For a cutter: does the grid run steady (one line, one bar) – or does the tempo drift, so markers far from the
 * start need a check?
 */
export const TempoPanel: React.FC<TempoPanelProps> = ({ result, currentTime, onSeek }) => {
  const { t, num, pctValue } = useI18n();
  const [hoveredBeat, setHoveredBeat] = useState<BeatItem | null>(null);
  const [histHover, setHistHover] = useState<{ bpm: number; count: number } | null>(null);
  const histWrapRef = useRef<HTMLDivElement>(null);
  const histCanvasRef = useRef<HTMLCanvasElement>(null);

  const beats = useMemo(() => result.beats.filter((b) => b.instantBpm > 40 && b.instantBpm < 260), [result.beats]);
  const hist = useMemo(
    () => (result.beats.length >= 2 ? computeTempoHistogram(result.beats, result.globalBpm) : null),
    [result.beats, result.globalBpm]
  );

  const drawHist = useCallback(() => {
    const canvas = histCanvasRef.current;
    const wrap = histWrapRef.current;
    if (!canvas || !wrap || !hist) return;
    const { width, height } = wrap.getBoundingClientRect();
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
    const padL = 8;
    const padR = 8;
    const padT = 16;
    const padB = 18;
    const plotW = Math.max(20, width - padL - padR);
    const plotH = Math.max(20, height - padT - padB);
    const span = hist.maxBpm - hist.minBpm;
    let maxS = 1;
    for (const b of hist.bins) maxS = Math.max(maxS, b.smoothed);
    const xFor = (bpm: number) => padL + ((bpm - hist.minBpm) / span) * plotW;

    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    for (const tick of [60, 90, 120, 150, 180, 210]) {
      const x = xFor(tick);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.fillText(`${tick}`, x, padT + plotH + 4);
    }
    const refLine = (bpm: number, label: string) => {
      if (bpm < hist.minBpm || bpm > hist.maxBpm) return;
      const x = xFor(bpm);
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillText(label, x, 3);
    };
    refLine(hist.halfTimeBpm, t('web.evidence.tempo_halftime', { bpm: Math.round(hist.halfTimeBpm) }));
    refLine(hist.doubleTimeBpm, t('web.evidence.tempo_doubletime', { bpm: Math.round(hist.doubleTimeBpm) }));
    const barW = Math.max(1.5, (hist.binWidth / span) * plotW - 1);
    for (const b of hist.bins) {
      const h = (b.smoothed / maxS) * plotH;
      if (h < 0.5) continue;
      const primary = Math.abs(b.bpm - hist.primaryBpm) <= 4;
      const secondary = hist.secondaryBpm !== null && Math.abs(b.bpm - hist.secondaryBpm) <= 4;
      ctx.fillStyle = primary
        ? 'rgba(34, 211, 238, 0.88)'
        : secondary
        ? 'rgba(244, 63, 94, 0.78)'
        : 'rgba(129, 140, 248, 0.45)';
      ctx.fillRect(xFor(b.bpm - hist.binWidth / 2), padT + plotH - h, barW, h);
    }
    ctx.restore();
  }, [hist, t]);

  const drawRef = useRef(drawHist);
  drawRef.current = drawHist;
  useEffect(() => drawRef.current(), [hist]);
  useEffect(() => {
    const wrap = histWrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => drawRef.current());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  if (beats.length < 2) return null;

  const duration = result.metadata.duration || 1;
  const minBpm = Math.max(40, Math.floor(result.minBpm - 8));
  const maxBpm = Math.min(260, Math.ceil(result.maxBpm + 8));
  const bpmRange = maxBpm - minBpm || 1;
  const plotW = SVG_W - PAD_X * 2;
  const plotH = SVG_H - PAD_T - PAD_B;
  const getX = (time: number) => PAD_X + (time / duration) * plotW;
  const getY = (bpm: number) => PAD_T + plotH - ((bpm - minBpm) / bpmRange) * plotH;
  const pathD = `M ${beats.map((b) => `${getX(b.time).toFixed(1)},${getY(b.instantBpm).toFixed(1)}`).join(' L ')}`;
  const areaD = `${pathD} L ${getX(beats[beats.length - 1].time).toFixed(1)},${SVG_H - PAD_B} L ${getX(beats[0].time).toFixed(1)},${SVG_H - PAD_B} Z`;
  const avgY = getY(result.averageBpm);
  const playheadX = getX(currentTime);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left - (PAD_X / SVG_W) * rect.width) / ((plotW / SVG_W) * rect.width)));
    onSeek(frac * duration);
  };

  const handleHistMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hist) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left - 8) / Math.max(20, rect.width - 16)));
    const bpm = hist.minBpm + frac * (hist.maxBpm - hist.minBpm);
    const idx = Math.min(hist.bins.length - 1, Math.max(0, Math.floor((bpm - hist.minBpm) / hist.binWidth)));
    const bin = hist.bins[idx];
    if (bin) setHistHover({ bpm: Math.round(bin.bpm), count: Math.round(bin.count) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
      {/* tempo over the song */}
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="font-medium text-slate-300">{t('web.tempo.curve_title')}</span>
          <DiagramInfoTooltip
            buttonLabel={t('web.tempo.help_label')}
            help={{
              title: t('web.tempo.curve_title'),
              summary: t('web.tempo.help_summary'),
              items: [
                { color: 'cyan', text: t('web.tempo.help_item1') },
                { color: 'rose', text: t('web.tempo.help_item2') },
              ],
              actionTip: t('web.tempo.help_tip'),
            }}
          />
          {hoveredBeat && (
            <span className="ml-auto font-mono text-cyan-300 tabular-nums">
              {t('output.marker_downbeat', { bar: hoveredBeat.barIndex })} ({num(hoveredBeat.time, 2)} s):{' '}
              {num(hoveredBeat.instantBpm, 1)} BPM
            </span>
          )}
        </div>
        <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-auto cursor-pointer block"
            onClick={handleSvgClick}
          >
            <defs>
              <linearGradient id="tempoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1={PAD_X} y1={PAD_T} x2={SVG_W - PAD_X} y2={PAD_T} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={PAD_X} y1={SVG_H - PAD_B} x2={SVG_W - PAD_X} y2={SVG_H - PAD_B} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={PAD_X} y1={avgY} x2={SVG_W - PAD_X} y2={avgY} stroke="#38bdf8" strokeDasharray="4 4" strokeWidth="1.2" opacity="0.6" vectorEffect="non-scaling-stroke" />
            <path d={areaD} fill="url(#tempoGradient)" />
            <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {beats
              .filter((b) => b.isDownbeat)
              .map((b) => (
                <circle
                  key={b.id}
                  cx={getX(b.time)}
                  cy={getY(b.instantBpm)}
                  r="2.6"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredBeat(b)}
                  onMouseLeave={() => setHoveredBeat(null)}
                />
              ))}
            {playheadX >= PAD_X && playheadX <= SVG_W - PAD_X && (
              <line x1={playheadX} y1={PAD_T - 5} x2={playheadX} y2={SVG_H - PAD_B + 5} stroke="#fbbf24" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            )}
          </svg>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-500 tabular-nums px-1">
          <span>{minBpm}–{maxBpm} BPM</span>
          <span className="text-sky-400/80">Ø {num(result.averageBpm, 1)}</span>
        </div>
      </div>

      {/* how often each tempo occurs */}
      {hist && (
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-medium text-slate-300">{t('web.evidence.tempo_title')}</span>
            <DiagramInfoTooltip
              buttonLabel={t('web.evidence.help_tempo_label')}
              help={{
                title: t('web.evidence.tempo_title'),
                summary: t('web.evidence.help_tempo_summary'),
                items: [
                  { color: 'cyan', text: t('web.evidence.help_tempo_1') },
                  { color: 'amber', text: t('web.evidence.help_tempo_2') },
                ],
                actionTip: t('web.evidence.help_tempo_tip'),
              }}
            />
          </div>
          <div ref={histWrapRef} className="relative flex-1 min-h-28 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden">
            <canvas
              ref={histCanvasRef}
              onMouseMove={handleHistMove}
              onMouseLeave={() => setHistHover(null)}
              className="absolute inset-0 w-full h-full block cursor-crosshair"
            />
          </div>
          <div className="flex flex-wrap gap-x-2 text-[10px] font-mono tabular-nums text-slate-400 px-1">
            <ValueTooltip
              title={t('web.evidence.tempo_primary', { bpm: num(hist.primaryBpm, 0), pct: pctValue(hist.primarySharePct) })}
              body={t('web.evidence.tip_tempo_primary')}
              className="text-cyan-300"
            >
              {t('web.evidence.tempo_primary', { bpm: num(hist.primaryBpm, 0), pct: pctValue(hist.primarySharePct) })}
            </ValueTooltip>
            {hist.secondaryBpm !== null && hist.secondarySharePct !== null && (
              <ValueTooltip
                title={t('web.evidence.tempo_bimodal', { bpm: num(hist.secondaryBpm, 0), pct: pctValue(hist.secondarySharePct) })}
                body={t('web.evidence.tip_tempo_bimodal')}
                className="text-rose-300"
              >
                {t('web.evidence.tempo_bimodal', { bpm: num(hist.secondaryBpm, 0), pct: pctValue(hist.secondarySharePct) })}
              </ValueTooltip>
            )}
            {histHover && (
              <span className="text-slate-200">
                {histHover.bpm} BPM ({histHover.count})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

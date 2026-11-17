import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Microscope } from 'lucide-react';
import { AnalysisResult } from '../types/analyzer';
import { computeTempoHistogram, TempoHistogramData } from '../utils/beatEvidence';
import { useI18n } from '../i18n';
import { DiagramInfoTooltip, ValueTooltip } from './DiagramInfoTooltip';
import { SpectrumAnalyzer } from './SpectrumAnalyzer';

interface ExpertDiagnosticsPanelProps {
  result: AnalysisResult;
  audioBuffer: AudioBuffer | null;
  viewRange: { start: number; end: number } | null;
  currentTime: number;
  onSeek: (time: number) => void;
}

const STORAGE_EXPERT_EXPANDED_KEY = 'beatanalyzer.expertExpanded';

function readExpertExpanded(): boolean {
  try {
    return localStorage.getItem(STORAGE_EXPERT_EXPANDED_KEY) === '1';
  } catch {
    return false;
  }
}

export const ExpertDiagnosticsPanel: React.FC<ExpertDiagnosticsPanelProps> = ({
  result,
  audioBuffer,
  viewRange,
  currentTime,
  onSeek,
}) => {
  const { t, num, pctValue } = useI18n();
  const [isExpanded, setIsExpanded] = useState<boolean>(readExpertExpanded);
  const [tempoHover, setTempoHover] = useState<{ bpm: number; count: number } | null>(null);

  const tempoWrapRef = useRef<HTMLDivElement>(null);
  const tempoCanvasRef = useRef<HTMLCanvasElement>(null);

  const tempoHistogram: TempoHistogramData | null = useMemo(() => {
    if (!isExpanded || result.beats.length < 2) return null;
    return computeTempoHistogram(result.beats, result.globalBpm);
  }, [isExpanded, result.beats, result.globalBpm]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_EXPERT_EXPANDED_KEY, next ? '1' : '0');
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const drawTempo = useCallback(() => {
    const canvas = tempoCanvasRef.current;
    const wrap = tempoWrapRef.current;
    if (!canvas || !wrap || !tempoHistogram) return;

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

    const th = tempoHistogram;
    const padL = 12;
    const padR = 12;
    const padT = 18;
    const padB = 22;
    const plotW = Math.max(20, width - padL - padR);
    const plotH = Math.max(20, height - padT - padB);
    const span = th.maxBpm - th.minBpm;

    let maxSmoothed = 1;
    for (const b of th.bins) {
      if (b.smoothed > maxSmoothed) maxSmoothed = b.smoothed;
    }

    const xForBpm = (bpm: number) => padL + ((bpm - th.minBpm) / span) * plotW;

    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    for (const bpmTick of [60, 90, 120, 150, 180, 210]) {
      const x = xForBpm(bpmTick);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.fillText(`${bpmTick}`, x, padT + plotH + 6);
    }

    const drawRefLine = (bpm: number, label: string) => {
      if (bpm < th.minBpm || bpm > th.maxBpm) return;
      const x = xForBpm(bpm);
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillText(label, x, 3);
    };

    drawRefLine(th.halfTimeBpm, t('web.evidence.tempo_halftime', { bpm: Math.round(th.halfTimeBpm) }));
    drawRefLine(th.doubleTimeBpm, t('web.evidence.tempo_doubletime', { bpm: Math.round(th.doubleTimeBpm) }));

    const barW = Math.max(1.5, (th.binWidth / span) * plotW - 1);
    for (const b of th.bins) {
      const h = (b.smoothed / maxSmoothed) * plotH;
      if (h < 0.5) continue;
      const x = xForBpm(b.bpm - th.binWidth / 2);
      const isPrimary = Math.abs(b.bpm - th.primaryBpm) <= 4;
      const isSecondary = th.secondaryBpm !== null && Math.abs(b.bpm - th.secondaryBpm) <= 4;

      ctx.fillStyle = isPrimary
        ? 'rgba(34, 211, 238, 0.88)'
        : isSecondary
        ? 'rgba(244, 63, 94, 0.78)'
        : 'rgba(129, 140, 248, 0.45)';
      ctx.fillRect(x, padT + plotH - h, barW, h);
    }

    ctx.restore();
  }, [tempoHistogram, t]);

  const drawTempoRef = useRef(drawTempo);
  drawTempoRef.current = drawTempo;

  useEffect(() => {
    if (!isExpanded) return;
    drawTempoRef.current();
  }, [isExpanded, tempoHistogram]);

  useEffect(() => {
    if (!isExpanded) return;
    const wrap = tempoWrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => drawTempoRef.current());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [isExpanded]);

  const handleTempoMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!tempoHistogram) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const padL = 12;
      const padR = 12;
      const plotW = Math.max(20, rect.width - padL - padR);
      const frac = Math.max(0, Math.min(1, (e.clientX - rect.left - padL) / plotW));
      const bpm = tempoHistogram.minBpm + frac * (tempoHistogram.maxBpm - tempoHistogram.minBpm);
      const idx = Math.min(
        tempoHistogram.bins.length - 1,
        Math.max(0, Math.floor((bpm - tempoHistogram.minBpm) / tempoHistogram.binWidth))
      );
      const bin = tempoHistogram.bins[idx];
      if (bin) setTempoHover({ bpm: Math.round(bin.bpm), count: Math.round(bin.count) });
    },
    [tempoHistogram]
  );

  return (
    <section
      aria-label={t('web.expert.title')}
      className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden"
    >
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            title={isExpanded ? t('web.expert.toggle_hide') : t('web.expert.toggle_show')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg py-1 pr-2 whitespace-nowrap shrink-0"
          >
            <Microscope className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{t('web.expert.title')}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>

          <span className="text-[11px] text-slate-500 hidden sm:inline whitespace-nowrap">
            {t('web.expert.subtitle')}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-800/70">
          {audioBuffer && (
            <div className="pt-2">
              <SpectrumAnalyzer
                result={result}
                audioBuffer={audioBuffer}
                viewRange={viewRange}
                currentTime={currentTime}
                onSeek={onSeek}
              />
            </div>
          )}

          {tempoHistogram && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
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
                <div className="font-mono tabular-nums text-slate-400 flex items-center gap-2">
                  <ValueTooltip
                    title={t('web.evidence.tempo_primary', {
                      bpm: num(tempoHistogram.primaryBpm, 0),
                      pct: pctValue(tempoHistogram.primarySharePct),
                    })}
                    body={t('web.evidence.tip_tempo_primary')}
                    className="text-cyan-300"
                  >
                    {t('web.evidence.tempo_primary', {
                      bpm: num(tempoHistogram.primaryBpm, 0),
                      pct: pctValue(tempoHistogram.primarySharePct),
                    })}
                  </ValueTooltip>
                  {tempoHistogram.secondaryBpm !== null && tempoHistogram.secondarySharePct !== null && (
                    <>
                      <span aria-hidden="true">·</span>
                      <ValueTooltip
                        title={t('web.evidence.tempo_bimodal', {
                          bpm: num(tempoHistogram.secondaryBpm, 0),
                          pct: pctValue(tempoHistogram.secondarySharePct),
                        })}
                        body={t('web.evidence.tip_tempo_bimodal')}
                        className="text-rose-300"
                      >
                        {t('web.evidence.tempo_bimodal', {
                          bpm: num(tempoHistogram.secondaryBpm, 0),
                          pct: pctValue(tempoHistogram.secondarySharePct),
                        })}
                      </ValueTooltip>
                    </>
                  )}
                  {tempoHover && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-200">
                        {tempoHover.bpm} BPM ({tempoHover.count})
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div
                ref={tempoWrapRef}
                className="relative h-32 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden"
              >
                <canvas
                  ref={tempoCanvasRef}
                  onMouseMove={handleTempoMove}
                  onMouseLeave={() => setTempoHover(null)}
                  className="w-full h-full block cursor-crosshair"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

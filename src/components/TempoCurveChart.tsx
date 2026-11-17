import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { AnalysisResult, BeatItem } from '../types/analyzer';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { DiagramInfoTooltip, ValueTooltip } from './DiagramInfoTooltip';

interface TempoCurveChartProps {
  result: AnalysisResult;
  currentTime: number;
  onSeek: (time: number) => void;
}

const STORAGE_TEMPO_EXPANDED_KEY = 'beatanalyzer.tempoExpanded';

function readInitialExpanded(hasDrift: boolean): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_TEMPO_EXPANDED_KEY);
    if (saved !== null) return saved === '1';
  } catch {
    // Ignore storage errors
  }
  return hasDrift;
}

function computeRelativeTempoDrift(result: AnalysisResult): boolean {
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

export const TempoCurveChart: React.FC<TempoCurveChartProps> = ({
  result,
  currentTime,
  onSeek,
}) => {
  const { t, num } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBeat, setHoveredBeat] = useState<BeatItem | null>(null);
  const hasTempoDrift = useMemo(() => computeRelativeTempoDrift(result), [result]);
  const [isExpanded, setIsExpanded] = useState<boolean>(() => readInitialExpanded(hasTempoDrift));

  const trackKey = `${result.metadata.fileName}:${result.metadata.duration}`;
  useEffect(() => {
    setIsExpanded(readInitialExpanded(hasTempoDrift));
  }, [trackKey, hasTempoDrift]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_TEMPO_EXPANDED_KEY, next ? '1' : '0');
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const beats = result.beats.filter((b) => b.instantBpm > 40 && b.instantBpm < 260);
  if (beats.length < 2) return null;

  const duration = result.metadata.duration || 1;
  const minBpm = Math.max(40, Math.floor(result.minBpm - 8));
  const maxBpm = Math.min(260, Math.ceil(result.maxBpm + 8));
  const bpmRange = maxBpm - minBpm || 1;

  const svgWidth = 800;
  const svgHeight = 140;
  const paddingX = 20;
  const paddingTop = 20;
  const paddingBottom = 25;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (time: number) => paddingX + (time / duration) * plotWidth;
  const getY = (bpm: number) => paddingTop + plotHeight - ((bpm - minBpm) / bpmRange) * plotHeight;

  // Build SVG path string
  const points = beats.map((b) => `${getX(b.time).toFixed(1)},${getY(b.instantBpm).toFixed(1)}`);
  const pathD = `M ${points.join(' L ')}`;

  // Area under curve
  const areaD = `${pathD} L ${getX(beats[beats.length - 1].time).toFixed(1)},${svgHeight - paddingBottom} L ${getX(beats[0].time).toFixed(1)},${svgHeight - paddingBottom} Z`;

  // Average BPM line Y
  const avgY = getY(result.averageBpm);

  // Playhead position
  const playheadX = getX(currentTime);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, (clickX - (paddingX / svgWidth) * rect.width) / ((plotWidth / svgWidth) * rect.width)));
    const targetTime = frac * duration;
    onSeek(targetTime);
  };

  return (
    <section
      aria-label={t('web.tempo.title')}
      className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden"
    >
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            title={isExpanded ? t('web.tempo.toggle_hide') : t('web.tempo.toggle_show')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg py-1 pr-1.5 whitespace-nowrap shrink-0"
          >
            <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{t('web.tempo.title')}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>
          <DiagramInfoTooltip
            buttonLabel={t('web.tempo.help_label')}
            help={{
              title: t('web.tempo.title'),
              summary: t('web.tempo.help_summary'),
              items: [
                { color: 'cyan', text: t('web.tempo.help_item1') },
                { color: 'rose', text: t('web.tempo.help_item2') },
              ],
              actionTip: t('web.tempo.help_tip'),
            }}
          />
        </div>

        <ValueTooltip
          title={`${t('web.tempo.range')} ${num(result.minBpm, 1)} – ${num(result.maxBpm, 1)} BPM`}
          body={t('web.tempo.tip_range')}
          className="text-[11px] text-slate-400 font-mono tabular-nums"
        >
          {t('web.tempo.range')} <span className="text-white font-semibold">{num(result.minBpm, 1)}</span> –{' '}
          <span className="text-white font-semibold">{num(result.maxBpm, 1)} BPM</span> · Ø{' '}
          <span className="text-cyan-400 font-bold">{num(result.averageBpm, 1)} BPM</span>
        </ValueTooltip>
      </div>

      {isExpanded && (
      <div ref={containerRef} className="relative w-full overflow-hidden select-none px-4 pb-3">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-28 sm:h-32 cursor-pointer"
          onClick={handleSvgClick}
        >
          <defs>
            <linearGradient id="tempoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal BPM) */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
          <text
            x={paddingX + 4}
            y={paddingTop + 10}
            fill="#64748b"
            fontSize="9"
            fontFamily="monospace"
          >
            {maxBpm} BPM
          </text>

          <line
            x1={paddingX}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingBottom}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
          <text
            x={paddingX + 4}
            y={svgHeight - paddingBottom - 4}
            fill="#64748b"
            fontSize="9"
            fontFamily="monospace"
          >
            {minBpm} BPM
          </text>

          {/* Average BPM reference line */}
          <line
            x1={paddingX}
            y1={avgY}
            x2={svgWidth - paddingX}
            y2={avgY}
            stroke="#38bdf8"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            opacity="0.6"
          />
          <text
            x={svgWidth - paddingX - 60}
            y={avgY - 4}
            fill="#38bdf8"
            fontSize="9"
            fontFamily="monospace"
          >
            Ø {num(result.averageBpm, 1)}
          </text>

          {/* Area under curve */}
          <path d={areaD} fill="url(#tempoGradient)" />

          {/* Tempo curve line */}
          <path
            d={pathD}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Downbeat points */}
          {beats
            .filter((b) => b.isDownbeat)
            .map((b) => (
              <circle
                key={b.id}
                cx={getX(b.time)}
                cy={getY(b.instantBpm)}
                r="3"
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth="1"
                className="hover:scale-150 transition-transform cursor-pointer"
                onMouseEnter={() => setHoveredBeat(b)}
                onMouseLeave={() => setHoveredBeat(null)}
              />
            ))}

          {/* Playhead marker line */}
          {playheadX >= paddingX && playheadX <= svgWidth - paddingX && (
            <line
              x1={playheadX}
              y1={paddingTop - 5}
              x2={playheadX}
              y2={svgHeight - paddingBottom + 5}
              stroke="#fbbf24"
              strokeWidth="2"
            />
          )}
        </svg>

        {hoveredBeat && (
          <div className="absolute top-2 right-4 px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-cyan-300 border border-slate-700 shadow-md">
            {t('output.marker_downbeat', { bar: hoveredBeat.barIndex })} ({num(hoveredBeat.time, 2)} s): {num(hoveredBeat.instantBpm, 1)} BPM
          </div>
        )}
      </div>
      )}
    </section>
  );
};

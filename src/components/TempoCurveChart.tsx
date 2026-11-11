import React, { useRef, useState } from 'react';
import { AnalysisResult, BeatItem } from '../types/analyzer';
import { TrendingUp } from 'lucide-react';

interface TempoCurveChartProps {
  result: AnalysisResult;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const TempoCurveChart: React.FC<TempoCurveChartProps> = ({
  result,
  currentTime,
  onSeek,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBeat, setHoveredBeat] = useState<BeatItem | null>(null);

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
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dynamische Tempo-Kurve (BPM-Verlauf über Zeit)</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Spanne: <span className="text-white font-semibold">{result.minBpm.toFixed(1)}</span> -{' '}
          <span className="text-white font-semibold">{result.maxBpm.toFixed(1)} BPM</span> • Ø{' '}
          <span className="text-cyan-400 font-bold">{result.averageBpm.toFixed(1)} BPM</span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
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
            Ø {result.averageBpm.toFixed(1)}
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
            Takt {hoveredBeat.barIndex} ({hoveredBeat.time.toFixed(2)}s): {hoveredBeat.instantBpm.toFixed(1)} BPM
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { AnalysisResult } from '../types/analyzer';
import { Gauge, Clock, Radio, Music, Zap, Disc3 } from 'lucide-react';

interface MetricsCardsProps {
  result: AnalysisResult;
  smoothBars: boolean;
  onToggleSmoothBars: (on: boolean) => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ result, smoothBars, onToggleSmoothBars }) => {
  const canSmooth = result.activationSource === 'beat_this';
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const getTempoCategory = (bpm: number): string => {
    if (bpm < 60) return 'Largo (Sehr langsam)';
    if (bpm < 76) return 'Adagio (Ruhig)';
    if (bpm < 108) return 'Andante (Gehend)';
    if (bpm < 120) return 'Moderato (Mäßig)';
    if (bpm < 156) return 'Allegro (Schnell/Tanzbar)';
    if (bpm < 176) return 'Vivace (Lebhaft)';
    return 'Presto (Sehr schnell)';
  };

  const avgIntervalMs =
    result.beats.length > 1
      ? Math.round(
          result.beats.slice(1).reduce((acc, b) => acc + b.deltaMs, 0) / (result.beats.length - 1)
        )
      : 500;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Global BPM */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl -mr-4 -mt-4"></div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span>Globales Tempo</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {result.globalBpm.toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-cyan-400">BPM</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {getTempoCategory(result.globalBpm)}
        </div>
      </div>

      {/* 2. Taktart / Time Signature */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl -mr-4 -mt-4"></div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
          <Music className="w-3.5 h-3.5 text-purple-400" />
          <span>Taktart (Meter)</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {result.timeSignature.numerator}/{result.timeSignature.denominator}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
            {result.timeSignature.barShare === null ? '–' : `${result.timeSignature.barShare} % der Takte`}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {result.barSmoothing?.applied
            ? `${result.barSmoothing.changedBeats} Beats neu eingeteilt`
            : result.timeSignature.name}
        </div>
        <label
          className={`mt-1.5 flex items-center gap-1.5 text-[11px] ${canSmooth ? 'text-slate-300 cursor-pointer' : 'text-slate-600 cursor-not-allowed'}`}
          title={canSmooth ? 'Gleichmäßiges Taktraster; neu angesetzt nur, wo beat_this klar eine andere „1“ hört' : 'nur mit beat_this'}
        >
          <input
            type="checkbox"
            className="accent-purple-500"
            checked={canSmooth && smoothBars}
            disabled={!canSmooth}
            onChange={(e) => onToggleSmoothBars(e.target.checked)}
          />
          Takte glätten
        </label>
      </div>

      {/* 3. Takte / Bars */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl -mr-4 -mt-4"></div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
          <Disc3 className="w-3.5 h-3.5 text-rose-400" />
          <span>Takte & Downbeats</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {result.totalBars}
          </span>
          <span className="text-xs font-semibold text-rose-400">Takte</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {result.totalBeats} Beats insgesamt
        </div>
      </div>

      {/* 4. Tempo-Stabilität */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-4 -mt-4"></div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tempo-Stabilität</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {result.tempoStability}%
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {result.tempoStability > 92
            ? 'Präziser Click-Track'
            : result.tempoStability > 80
            ? 'Natürlicher Groove'
            : 'Starke Tempovariation'}
        </div>
      </div>

      {/* 5. Beat-Intervall (IBI) */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl -mr-4 -mt-4"></div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Intervall (IBI)</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {avgIntervalMs}
          </span>
          <span className="text-xs font-semibold text-amber-400">ms</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {result.swingRatio > 55 ? `${result.swingRatio.toFixed(0)}% Swing-Gefühl` : 'Gerades 8tel Feeling'}
        </div>
      </div>

      {/* 6. Audiodatei & Format */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-full blur-xl -mr-4 -mt-4"></div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
          <Radio className="w-3.5 h-3.5 text-sky-400" />
          <span>Audiodetails</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
            {formatTime(result.metadata.duration)}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {result.metadata.format} • {(result.metadata.sampleRate / 1000).toFixed(1)} kHz
        </div>
      </div>
    </div>
  );
};

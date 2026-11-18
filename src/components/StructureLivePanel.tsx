import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flag, PanelLeftClose, PanelLeftOpen, Trash2, X } from 'lucide-react';
import { AnalysisResult, BeatItem } from '../types/analyzer';
import { SongSection, SongStructure, nearestBeatIndex } from '../utils/songStructure';
import { useI18n } from '../i18n';
import { DiagramInfoTooltip } from './DiagramInfoTooltip';
import { LiveSpectrum, LiveSpectrumSource } from './LiveSpectrum';
import { SectionChips } from './SectionChips';

export interface CueMark {
  /** time of the beat it sits on (s) */
  time: number;
}

interface StructureLivePanelProps {
  result: AnalysisResult;
  structure: SongStructure | null;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  liveSource: LiveSpectrumSource;
  cues: CueMark[];
  onAddCue: (downbeatOnly: boolean) => void;
  onRemoveCue: (index: number) => void;
  onClearCues: () => void;
}

const KIND_ARROW: Record<SongSection['kind'], string> = { start: '●', up: '▲', down: '▼', change: '◆' };
const KIND_COLOR: Record<SongSection['kind'], string> = {
  start: 'text-slate-300 border-slate-700 bg-slate-900/80',
  up: 'text-emerald-200 border-emerald-700/70 bg-emerald-950/40',
  down: 'text-sky-200 border-sky-700/70 bg-sky-950/40',
  change: 'text-violet-200 border-violet-700/70 bg-violet-950/40',
};
const KIND_RGB: Record<SongSection['kind'], string> = {
  start: '148, 163, 184',
  up: '52, 211, 153',
  down: '56, 189, 248',
  change: '167, 139, 250',
};
const LEVEL_RANGE_DB = 30;
const STORAGE_COUNTER_KEY = 'beatanalyzer.liveCounter';

export function formatClock(sec: number, tenths = false): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return tenths ? `${m}:${r.toFixed(1).padStart(4, '0')}` : `${m}:${String(Math.floor(r)).padStart(2, '0')}`;
}

/** index of the last beat at or before `time` (-1 before the first beat) */
function beatAt(beats: BeatItem[], time: number): number {
  let lo = 0;
  let hi = beats.length - 1;
  let idx = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (beats[m].time <= time + 0.02) {
      idx = m;
      lo = m + 1;
    } else hi = m - 1;
  }
  return idx;
}

/**
 * Song structure and live view in one panel. On top the structure strip: level per bar, section changes on their
 * "1" (click: jump to the nearest "1"); below, while listening, the bar counter with the countdown to the next "1"
 * and the next section, the live spectrum, and cue marks set with the key M.
 */
export const StructureLivePanel: React.FC<StructureLivePanelProps> = ({
  result,
  structure,
  currentTime,
  isPlaying,
  onSeek,
  liveSource,
  cues,
  onAddCue,
  onRemoveCue,
  onClearCues,
}) => {
  const { t, num } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ x: number; text: string } | null>(null);
  // bar counter left of the live spectrum: can be folded, then the spectrum takes the full width
  const [showCounter, setShowCounter] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_COUNTER_KEY) !== '0';
    } catch {
      return true;
    }
  });
  const toggleCounter = useCallback(() => {
    setShowCounter((prev) => {
      try {
        localStorage.setItem(STORAGE_COUNTER_KEY, prev ? '0' : '1');
      } catch {
        // Ignore storage errors
      }
      return !prev;
    });
  }, []);
  const duration = result.metadata.duration || 1;
  const beats = result.beats;

  const sectionLabel = useCallback(
    (s: SongSection) =>
      s.kind === 'start'
        ? t('web.structure.kind_start')
        : t(`web.structure.kind_${s.kind}`, { db: `${s.delta > 0 ? '+' : '−'}${num(Math.abs(s.delta), 0)}` }),
    [t, num]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const { width: w, height: h } = wrap.getBoundingClientRect();
    if (w <= 0 || h <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const top = 16;
    const bottom = h - 2;
    const plotH = bottom - top;
    const x = (time: number) => (time / duration) * w;

    if (structure) {
      // sections: soft background in the colour of their kind
      for (const s of structure.sections) {
        ctx.fillStyle = `rgba(${KIND_RGB[s.kind]}, 0.07)`;
        ctx.fillRect(x(s.time), top, x(s.end) - x(s.time), plotH);
      }
      // level per bar: the song's own range (quietest ~5 % of the bars .. loudest), at least 6 dB – compressed
      // masters move only a few dB, and these differences are what a cutter wants to see
      const sorted = structure.bars.map((b) => b.level).sort((a, b) => a - b);
      const range = Math.min(LEVEL_RANGE_DB, Math.max(6, -sorted[Math.floor(sorted.length * 0.05)] * 1.15));
      for (const b of structure.bars) {
        const v = Math.max(0.04, 1 + b.level / range);
        const bh = v * plotH;
        const x0 = x(b.time);
        const bw = Math.max(1, x(b.end) - x0 - 1);
        const g = ctx.createLinearGradient(0, bottom, 0, bottom - plotH);
        g.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
        g.addColorStop(1, 'rgba(34, 211, 238, 0.85)');
        ctx.fillStyle = g;
        ctx.fillRect(x0, bottom - bh, bw, bh);
      }
      // section changes: line on their "1" with the bar number
      ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      structure.sections.forEach((s, i) => {
        const sx = x(s.time);
        if (i > 0) {
          ctx.fillStyle = `rgba(${KIND_RGB[s.kind]}, 0.95)`;
          ctx.fillRect(sx - 1, top - 2, 2, plotH + 2);
        }
        ctx.fillStyle = `rgba(${KIND_RGB[s.kind]}, 0.95)`;
        const label = `${KIND_ARROW[s.kind]} ${s.bar}`;
        const tw = ctx.measureText(label).width;
        ctx.fillText(label, Math.min(w - tw - 2, sx + 3), 2);
      });
    }
    // cue marks
    for (const c of cues) {
      const cx = x(c.time);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.95)';
      ctx.beginPath();
      ctx.moveTo(cx - 4, top);
      ctx.lineTo(cx + 4, top);
      ctx.lineTo(cx, top + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(cx - 0.5, top, 1, plotH);
    }
    // playhead
    const px = x(currentTime);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.95)';
    ctx.fillRect(px - 1, top - 4, 2, plotH + 4);
    ctx.restore();
  }, [structure, cues, currentTime, duration]);

  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => drawRef.current(), [draw]);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => drawRef.current());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const timeAt = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
  };
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const i = nearestBeatIndex(beats, timeAt(e), true);   // a cut starts on a "1"
    if (i >= 0) onSeek(beats[i].time);
  };
  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const time = timeAt(e);
    const r = e.currentTarget.getBoundingClientRect();
    const bar = structure?.bars.find((b) => time >= b.time && time < b.end);
    const sec = structure?.sections.find((s) => time >= s.time && time < s.end);
    const text = bar
      ? t('web.structure.hover', { bar: bar.bar, time: formatClock(bar.time, true), db: num(bar.level, 1) }) +
        (sec ? ` · ${sectionLabel(sec)}` : '')
      : formatClock(time, true);
    setHover({ x: e.clientX - r.left, text });
  };

  // live counter: bar, beat, next section
  const live = useMemo(() => {
    const i = beatAt(beats, currentTime);
    const numerator = result.timeSignature.numerator || 4;
    if (i < 0) {
      const first = structure?.sections[0] ?? null;
      return { bar: null as number | null, beat: 0, numerator, next: first, barsToNext: first ? 0 : null };
    }
    const cur = beats[i];
    const next = structure?.sections.find((s) => s.time > currentTime + 0.02) ?? null;
    return {
      bar: cur.barIndex,
      beat: cur.beatInBar,
      numerator,
      next,
      barsToNext: next ? Math.max(0, next.bar - cur.barIndex) : null,
    };
  }, [beats, currentTime, result.timeSignature.numerator, structure]);

  const cueLabel = (c: CueMark) => {
    const i = nearestBeatIndex(beats, c.time);
    const b = i >= 0 ? beats[i] : null;
    return b ? `${b.barIndex}.${b.beatInBar} · ${formatClock(c.time, true)}` : formatClock(c.time, true);
  };

  return (
    <div className="space-y-4">
      {/* song structure */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="font-medium text-slate-300">{t('web.structure.strip_title')}</span>
          <DiagramInfoTooltip
            buttonLabel={t('web.structure.help_label')}
            help={{
              title: t('web.structure.strip_title'),
              summary: t('web.structure.help_summary'),
              items: [
                { color: 'emerald', text: t('web.structure.help_1') },
                { color: 'cyan', text: t('web.structure.help_2') },
                { color: 'amber', text: t('web.structure.help_3') },
              ],
              actionTip: t('web.structure.help_tip'),
            }}
          />
          {structure && structure.sections.length > 1 && (
            <span className="text-slate-500">{t('web.structure.count', { n: structure.sections.length })}</span>
          )}
          {hover && <span className="ml-auto font-mono tabular-nums text-slate-300">{hover.text}</span>}
        </div>
        <div ref={wrapRef} className="relative h-20 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden">
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
            className="absolute inset-0 w-full h-full block cursor-pointer"
            aria-label={t('web.structure.strip_title')}
          />
          {!structure && (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-500">
              {t('web.structure.none')}
            </div>
          )}
        </div>
        {structure && structure.sections.length > 1 && (
          <SectionChips
            activeIndex={structure.sections.findIndex((s) => currentTime >= s.time - 0.02 && currentTime < s.end)}
          >
            {structure.sections.map((s) => {
              const active = currentTime >= s.time - 0.02 && currentTime < s.end;
              return (
                <button
                  key={s.bar}
                  type="button"
                  onClick={() => onSeek(s.time)}
                  title={t('web.structure.chip_tip', { bars: s.bars })}
                  className={`shrink-0 px-2 py-1 rounded-lg border text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${KIND_COLOR[s.kind]} ${
                    active ? 'ring-1 ring-amber-400' : 'hover:brightness-125'
                  }`}
                >
                  <span className="font-mono tabular-nums">
                    {KIND_ARROW[s.kind]} {t('web.structure.bar', { bar: s.bar })} · {formatClock(s.time)}
                  </span>{' '}
                  <span className="opacity-80">{sectionLabel(s)}</span>
                </button>
              );
            })}
          </SectionChips>
        )}
      </div>

      {/* live: counter + spectrum */}
      <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="font-medium text-slate-300">{t('web.live.title')}</span>
        <DiagramInfoTooltip
          buttonLabel={t('web.live.help_label')}
          help={{
            title: t('web.live.title'),
            summary: t('web.live.help_summary'),
            items: [
              { color: 'cyan', text: t('web.live.help_1') },
              { color: 'rose', text: t('web.live.help_2') },
            ],
            actionTip: t('web.live.help_tip'),
          }}
        />
        <button
          type="button"
          onClick={toggleCounter}
          aria-expanded={showCounter}
          title={showCounter ? t('web.live.counter_hide_tip') : t('web.live.counter_show_tip')}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700/90 bg-slate-950/75 text-[10px] font-medium text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer whitespace-nowrap"
        >
          {showCounter ? <PanelLeftClose className="w-3 h-3" /> : <PanelLeftOpen className="w-3 h-3" />}
          <span>{showCounter ? t('web.live.counter_hide') : t('web.live.counter_show')}</span>
        </button>
      </div>
      <div className={`grid grid-cols-1 gap-3 ${showCounter ? 'md:grid-cols-[15rem_minmax(0,1fr)]' : ''}`}>
        {showCounter && (
        <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-3 flex flex-col justify-between gap-2 min-h-36">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{t('web.live.bar')}</div>
            <div className="text-3xl font-bold font-mono tabular-nums text-white leading-none">{live.bar ?? '–'}</div>
          </div>
          {/* beats of the bar: the "1" in rose, the current beat lit */}
          <div className="flex gap-1" aria-label={t('web.live.beats_aria', { beat: live.beat, n: live.numerator })}>
            {Array.from({ length: Math.max(live.numerator, live.beat) }, (_, k) => k + 1).map((n) => (
              <div
                key={n}
                className={`flex-1 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                  n === live.beat
                    ? n === 1
                      ? 'bg-rose-500 text-white'
                      : 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800/80 text-slate-500'
                }`}
              >
                {n}
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            {live.next && live.barsToNext !== null ? (
              <span>
                {t('web.live.next_section', {
                  bar: live.next.bar,
                  bars: live.barsToNext,
                  time: formatClock(live.next.time - currentTime, true),
                })}{' '}
                <span className="text-slate-300">{sectionLabel(live.next)}</span>
              </span>
            ) : (
              <span className="text-slate-600">{t('web.live.no_next_section')}</span>
            )}
          </div>
        </div>
        )}
        <LiveSpectrum source={liveSource} isPlaying={isPlaying} result={result} currentTime={currentTime} />
      </div>
      </div>

      {/* cue marks */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => onAddCue(e.shiftKey)}
          title={t('web.cue.add_tip')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-yellow-600/70 bg-yellow-950/40 text-[11px] font-semibold text-yellow-200 hover:bg-yellow-900/50 cursor-pointer"
        >
          <Flag className="w-3 h-3" />
          {t('web.cue.add')}
          <kbd className="ml-1 px-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">M</kbd>
        </button>
        <DiagramInfoTooltip
          buttonLabel={t('web.cue.help_label')}
          help={{
            title: t('web.cue.title'),
            summary: t('web.cue.help_summary'),
            items: [
              { color: 'amber', text: t('web.cue.help_1') },
              { color: 'rose', text: t('web.cue.help_2') },
            ],
            actionTip: t('web.cue.help_tip'),
          }}
        />
        {cues.length === 0 ? (
          <span className="text-[11px] text-slate-500">{t('web.cue.empty')}</span>
        ) : (
          <>
            {cues.map((c, i) => (
              <span
                key={`${c.time}-${i}`}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md border border-yellow-700/60 bg-slate-900 text-[11px] font-mono tabular-nums text-yellow-100"
              >
                <button type="button" onClick={() => onSeek(c.time)} className="cursor-pointer hover:text-white" title={t('web.cue.jump')}>
                  {t('web.cue.name', { n: i + 1 })} · {cueLabel(c)}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveCue(i)}
                  aria-label={t('web.cue.remove')}
                  title={t('web.cue.remove')}
                  className="p-0.5 rounded text-slate-500 hover:text-rose-300 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={onClearCues}
              title={t('web.cue.clear')}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] text-slate-500 hover:text-rose-300 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              {t('web.cue.clear')}
            </button>
            <span className="text-[10px] text-slate-500">{t('web.cue.export_note')}</span>
          </>
        )}
      </div>
    </div>
  );
};

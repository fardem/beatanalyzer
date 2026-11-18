import React, { useEffect, useRef } from 'react';
import { AnalysisResult } from '../types/analyzer';
import { useI18n } from '../i18n';

/** Reads the live spectrum of the player (Web Audio AnalyserNode). */
export interface LiveSpectrumSource {
  /** fills `target` with dB values per FFT bin; false while nothing plays */
  read: (target: Float32Array<ArrayBuffer>) => boolean;
  config: () => { binCount: number; sampleRate: number; minDecibels: number; maxDecibels: number };
}

interface LiveSpectrumProps {
  source: LiveSpectrumSource;
  isPlaying: boolean;
  result: AnalysisResult;
  currentTime: number;
}

const F_MIN = 30;
const F_MAX = 16000;
const KICK_MAX_HZ = 150;
const SNARE_MAX_HZ = 4000;
const BARS = 56;
const PEAK_FALL_PER_S = 0.55;   // peak caps sink this much of the full height per second (gone ~2 s after pause)
const FLASH_MS = 260;

// colours of the web app: kick rose, snare cyan, hi-hat indigo (as in the band lanes)
const ZONE_RGB = { kick: '251, 113, 133', snare: '34, 211, 238', hihat: '129, 140, 248' } as const;
type Zone = keyof typeof ZONE_RGB;

function zoneOf(freq: number): Zone {
  if (freq < KICK_MAX_HZ) return 'kick';
  if (freq < SNARE_MAX_HZ) return 'snare';
  return 'hihat';
}

function barFreq(i: number, n: number): number {
  return F_MIN * Math.pow(F_MAX / F_MIN, i / n);
}

/**
 * Live spectrum while the song plays – for watching kick, snare and hats move with the beat grid. Bars on a
 * logarithmic frequency axis with falling peak caps, a level per zone, and a flash on every beat (stronger on
 * the "1"). Draws only while playing; the last frame fades out when paused.
 */
export const LiveSpectrum: React.FC<LiveSpectrumProps> = ({ source, isPlaying, result, currentTime }) => {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levels = useRef(new Float32Array(BARS));
  const peaks = useRef(new Float32Array(BARS));
  const zoneLevels = useRef({ kick: 0, snare: 0, hihat: 0 });
  const flash = useRef<{ at: number; downbeat: boolean }>({ at: 0, downbeat: false });
  const lastBeatTime = useRef<number>(-1);

  // flash on each beat the playhead passes (currentTime comes from the player's time updates)
  useEffect(() => {
    if (!isPlaying) return;
    const beats = result.beats;
    let lo = 0;
    let hi = beats.length - 1;
    let idx = -1;
    while (lo <= hi) {   // last beat at or before the playhead
      const mid = (lo + hi) >> 1;
      if (beats[mid].time <= currentTime) {
        idx = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    if (idx >= 0 && beats[idx].time !== lastBeatTime.current && currentTime - beats[idx].time < 0.15) {
      lastBeatTime.current = beats[idx].time;
      flash.current = { at: performance.now(), downbeat: beats[idx].isDownbeat };
    }
  }, [currentTime, isPlaying, result.beats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let raf = 0;
    let last = performance.now();
    let buffer: Float32Array<ArrayBuffer> | null = null;
    let fadeUntil = isPlaying ? Infinity : performance.now() + 2000;

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cfg = source.config();
      if (!buffer || buffer.length !== cfg.binCount) buffer = new Float32Array(new ArrayBuffer(cfg.binCount * 4));
      const live = isPlaying && source.read(buffer);
      const span = cfg.maxDecibels - cfg.minDecibels || 75;
      const binHz = cfg.sampleRate / 2 / cfg.binCount;
      const lv = levels.current;
      const pk = peaks.current;
      const zones = { kick: 0, snare: 0, hihat: 0 };
      const zoneCount = { kick: 0, snare: 0, hihat: 0 };

      for (let i = 0; i < BARS; i++) {
        let target = 0;
        if (live && buffer) {
          const k0 = Math.max(1, Math.floor(barFreq(i, BARS) / binHz));
          const k1 = Math.max(k0, Math.min(cfg.binCount - 1, Math.floor(barFreq(i + 1, BARS) / binHz)));
          let db = -Infinity;
          for (let k = k0; k <= k1; k++) if (buffer[k] > db) db = buffer[k];
          target = Math.max(0, Math.min(1, (db - cfg.minDecibels) / span));
        }
        // fast attack, slower release: bars jump with the hit and settle smoothly
        lv[i] = target > lv[i] ? target : lv[i] + (target - lv[i]) * Math.min(1, dt * 9);
        pk[i] = Math.max(lv[i], pk[i] - PEAK_FALL_PER_S * dt);
        const z = zoneOf(Math.sqrt(barFreq(i, BARS) * barFreq(i + 1, BARS)));
        zones[z] += lv[i];
        zoneCount[z] += 1;
      }
      (Object.keys(zones) as Zone[]).forEach((z) => {
        zoneLevels.current[z] = zoneCount[z] ? zones[z] / zoneCount[z] : 0;
      });

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // beat flash: a soft glow behind the bars, rose on the "1", cyan on the other beats
      const age = now - flash.current.at;
      if (isPlaying && age < FLASH_MS) {
        const a = (1 - age / FLASH_MS) * (flash.current.downbeat ? 0.22 : 0.09);
        const rgb = flash.current.downbeat ? ZONE_RGB.kick : ZONE_RGB.snare;
        const g = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, Math.max(w, h) * 0.7);
        g.addColorStop(0, `rgba(${rgb}, ${a})`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      const meterW = 108;
      const plotL = 10;
      const plotR = w - meterW - 14;
      const plotT = 12;
      const plotB = h - 18;
      const plotH = plotB - plotT;
      const slot = (plotR - plotL) / BARS;
      const barW = Math.max(1, slot * 0.72);

      for (let i = 0; i < BARS; i++) {
        const z = zoneOf(Math.sqrt(barFreq(i, BARS) * barFreq(i + 1, BARS)));
        const x = plotL + i * slot + (slot - barW) / 2;
        const bh = lv[i] * plotH;
        const grad = ctx.createLinearGradient(0, plotB, 0, plotB - plotH);
        grad.addColorStop(0, `rgba(${ZONE_RGB[z]}, 0.35)`);
        grad.addColorStop(1, `rgba(${ZONE_RGB[z]}, 0.95)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, plotB - bh, barW, bh);
        if (pk[i] > 0.01) {
          ctx.fillStyle = `rgba(${ZONE_RGB[z]}, 0.9)`;
          ctx.fillRect(x, plotB - pk[i] * plotH - 2, barW, 2);
        }
      }

      // frequency axis
      ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const f of [60, 150, 500, 2000, 8000]) {
        const x = plotL + (Math.log(f / F_MIN) / Math.log(F_MAX / F_MIN)) * (plotR - plotL);
        ctx.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x, plotB + 4);
      }

      // level per zone (kick / snare / hats)
      const zonesOrder: Zone[] = ['kick', 'snare', 'hihat'];
      const mW = 18;
      const gap = (meterW - 12 - mW * 3) / 2;   // 12 px margin to the right edge for the labels
      ctx.font = '9px ui-sans-serif, system-ui, -apple-system, sans-serif';
      zonesOrder.forEach((z, j) => {
        const x = w - meterW + j * (mW + gap);
        const v = zoneLevels.current[z];
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(x, plotT, mW, plotH);
        ctx.fillStyle = `rgba(${ZONE_RGB[z]}, 0.9)`;
        ctx.fillRect(x, plotB - v * plotH, mW, v * plotH);
        ctx.fillStyle = `rgba(${ZONE_RGB[z]}, 0.85)`;
        ctx.fillText(t(`web.spectrum.zone_short_${z}`), x + mW / 2, plotB + 4);
      });

      if (!isPlaying) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
        ctx.font = '600 11px ui-sans-serif, system-ui, -apple-system, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(t('web.spectrum.live_idle'), (plotL + plotR) / 2, plotT + plotH / 2);
      }
      ctx.restore();

      if (isPlaying || now < fadeUntil) raf = requestAnimationFrame(frame);
    };
    if (!isPlaying) fadeUntil = performance.now() + 2000;
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, source, t]);

  return (
    <div ref={wrapRef} className="relative h-36 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" aria-label={t('web.spectrum.mode_live')} />
    </div>
  );
};

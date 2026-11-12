import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnalysisResult, BeatItem } from '../types/analyzer';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface WaveformBeatVisualizerProps {
  result: AnalysisResult;
  currentTime: number;
  onSeek: (time: number) => void;
  activeBeat: BeatItem | null;
}

export const WaveformBeatVisualizer: React.FC<WaveformBeatVisualizerProps> = ({
  result,
  currentTime,
  onSeek,
  activeBeat,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom & View state
  const [zoom, setZoom] = useState<number>(1.0); // 1.0 = fit whole song
  const [scrollOffsetSec, setScrollOffsetSec] = useState<number>(0);
  const [showBaf, setShowBaf] = useState<boolean>(true);
  const [showDaf, setShowDaf] = useState<boolean>(true);
  const [showBeats, setShowBeats] = useState<boolean>(true);

  // Mouse drag / interaction state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    time: number;
    beat: BeatItem | null;
  } | null>(null);

  const duration = result.metadata.duration || 1;
  const visibleDuration = duration / zoom;

  // Auto-scroll when playing beyond viewport
  useEffect(() => {
    if (currentTime < scrollOffsetSec || currentTime > scrollOffsetSec + visibleDuration) {
      // Center the playhead
      const newOffset = Math.max(0, Math.min(currentTime - visibleDuration * 0.35, duration - visibleDuration));
      setScrollOffsetSec(newOffset);
    }
  }, [currentTime, zoom, visibleDuration, duration, scrollOffsetSec]);

  // Main Canvas Rendering
  const drawMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0b1120');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid lines (seconds)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const secStep = zoom > 6 ? 0.5 : zoom > 3 ? 1 : zoom > 1.5 ? 2 : 5;
    const firstSec = Math.floor(scrollOffsetSec / secStep) * secStep;

    ctx.font = '10px Inter, monospace';
    ctx.fillStyle = '#64748b';

    for (let s = firstSec; s <= scrollOffsetSec + visibleDuration; s += secStep) {
      const x = ((s - scrollOffsetSec) / visibleDuration) * width;
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const mins = Math.floor(s / 60);
        const secs = (s % 60).toFixed(s % 1 === 0 ? 0 : 1);
        ctx.fillText(`${mins}:${secs.padStart(s % 1 === 0 ? 2 : 4, '0')}`, x + 4, height - 6);
      }
    }

    // 1. Draw Waveform
    const peaks = result.waveformPeaks;
    const numBuckets = peaks.length / 2;
    const midY = height * 0.45;
    const waveAmp = height * 0.35;

    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const startBucket = Math.floor((scrollOffsetSec / duration) * numBuckets);
    const endBucket = Math.ceil(((scrollOffsetSec + visibleDuration) / duration) * numBuckets);

    // Top envelope
    let firstPoint = true;
    for (let b = Math.max(0, startBucket); b < Math.min(numBuckets, endBucket); b++) {
      const bTime = (b / numBuckets) * duration;
      const x = ((bTime - scrollOffsetSec) / visibleDuration) * width;
      const maxVal = peaks[b * 2 + 1];
      const y = midY - maxVal * waveAmp;

      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Bottom envelope (reverse)
    for (let b = Math.min(numBuckets - 1, endBucket - 1); b >= Math.max(0, startBucket); b--) {
      const bTime = (b / numBuckets) * duration;
      const x = ((bTime - scrollOffsetSec) / visibleDuration) * width;
      const minVal = peaks[b * 2];
      const y = midY - minVal * waveAmp;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Draw Activation Functions (BAF / DAF) overlay
    const actCurve = result.activationCurve;
    const actBaseY = height * 0.88;
    const actHeight = height * 0.28;

    if (showBaf && actCurve.length > 0) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)'; // Cyan
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let first = true;

      for (let i = 0; i < actCurve.length; i++) {
        const pt = actCurve[i];
        if (pt.time < scrollOffsetSec - 0.5) continue;
        if (pt.time > scrollOffsetSec + visibleDuration + 0.5) break;

        const x = ((pt.time - scrollOffsetSec) / visibleDuration) * width;
        const y = actBaseY - pt.beatActivation * actHeight;

        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    if (showDaf && actCurve.length > 0) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)'; // Crimson/Rose
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let first = true;

      for (let i = 0; i < actCurve.length; i++) {
        const pt = actCurve[i];
        if (pt.downbeatActivation === null) continue; // no downbeat curve (librosa, browser)
        if (pt.time < scrollOffsetSec - 0.5) continue;
        if (pt.time > scrollOffsetSec + visibleDuration + 0.5) break;

        const x = ((pt.time - scrollOffsetSec) / visibleDuration) * width;
        const y = actBaseY - pt.downbeatActivation * actHeight;

        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // 3. Draw Beat & Downbeat Markers
    if (showBeats) {
      result.beats.forEach((b) => {
        if (b.time < scrollOffsetSec - 0.2 || b.time > scrollOffsetSec + visibleDuration + 0.2) return;
        const x = ((b.time - scrollOffsetSec) / visibleDuration) * width;

        if (b.isDownbeat) {
          // Downbeat (Bar marker): bold magenta/rose line
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();

          // Bar Flag
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x - 1, 0, 48, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(`Takt ${b.barIndex}`, x + 4, 13);
        } else {
          // Regular Beat: cyan / amber line
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 22);
          ctx.lineTo(x, height - 16);
          ctx.stroke();

          if (zoom > 2) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px Inter, monospace';
            ctx.fillText(`${b.beatInBar}`, x + 3, 34);
          }
        }
      });
    }

    // 4. Playhead Cursor
    if (currentTime >= scrollOffsetSec && currentTime <= scrollOffsetSec + visibleDuration) {
      const playX = ((currentTime - scrollOffsetSec) / visibleDuration) * width;

      // Glow
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();

      // Sharp line
      ctx.strokeStyle = '#fbbf24'; // Amber-400
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();

      // Top triangle badge
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(playX - 6, 0);
      ctx.lineTo(playX + 6, 0);
      ctx.lineTo(playX, 10);
      ctx.closePath();
      ctx.fill();
    }
  }, [
    result,
    currentTime,
    zoom,
    scrollOffsetSec,
    visibleDuration,
    duration,
    showBaf,
    showDaf,
    showBeats,
  ]);

  // Mini-map Overview Rendering
  const drawMinimap = useCallback(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Mini waveform
    const peaks = result.waveformPeaks;
    const numBuckets = peaks.length / 2;
    const midY = height / 2;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    for (let i = 0; i < numBuckets; i++) {
      const x = (i / numBuckets) * width;
      const minVal = peaks[i * 2];
      const maxVal = peaks[i * 2 + 1];
      const h = Math.max(1, (maxVal - minVal) * (height * 0.45));
      ctx.fillRect(x, midY - h / 2, Math.max(1, width / numBuckets), h);
    }

    // Mini Downbeats
    ctx.fillStyle = '#f43f5e';
    result.downbeats.forEach((d) => {
      const x = (d.time / duration) * width;
      ctx.fillRect(x, 0, 1.5, height);
    });

    // Viewport window overlay
    const viewLeft = (scrollOffsetSec / duration) * width;
    const viewWidth = (visibleDuration / duration) * width;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(viewLeft, 0, viewWidth, height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(viewLeft, 0, viewWidth, height);

    // Playhead in minimap
    const playX = (currentTime / duration) * width;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(playX - 1, 0, 2, height);
  }, [result, duration, scrollOffsetSec, visibleDuration, currentTime]);

  // Resize listener
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width * window.devicePixelRatio;
        canvasRef.current.height = 240 * window.devicePixelRatio;
        canvasRef.current.style.width = `${rect.width}px`;
        canvasRef.current.style.height = `240px`;

        if (minimapCanvasRef.current) {
          minimapCanvasRef.current.width = rect.width * window.devicePixelRatio;
          minimapCanvasRef.current.height = 36 * window.devicePixelRatio;
          minimapCanvasRef.current.style.width = `${rect.width}px`;
          minimapCanvasRef.current.style.height = `36px`;
        }

        drawMainCanvas();
        drawMinimap();
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [drawMainCanvas, drawMinimap]);

  useEffect(() => {
    drawMainCanvas();
    drawMinimap();
  }, [drawMainCanvas, drawMinimap]);

  // Mouse seeking & dragging
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleSeekFromEvent(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, x / rect.width));
    const targetTime = scrollOffsetSec + frac * visibleDuration;

    if (isDragging) {
      onSeek(targetTime);
    }

    // Find nearest beat
    let nearest: BeatItem | null = null;
    let minDiff = 0.25;
    for (const b of result.beats) {
      const diff = Math.abs(b.time - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = b;
      }
    }

    setHoverInfo({
      x,
      y: e.clientY - rect.top,
      time: targetTime,
      beat: nearest,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
    setHoverInfo(null);
  };

  const handleSeekFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, x / rect.width));
    const targetTime = scrollOffsetSec + frac * visibleDuration;
    onSeek(targetTime);
  };

  const handleMinimapClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = minimapCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, x / rect.width));
    const centerTime = frac * duration;
    const newOffset = Math.max(0, Math.min(centerTime - visibleDuration / 2, duration - visibleDuration));
    setScrollOffsetSec(newOffset);
    onSeek(centerTime);
  };

  const handleZoom = (factor: number) => {
    const nextZoom = Math.max(1.0, Math.min(16.0, zoom * factor));
    const centerTime = scrollOffsetSec + visibleDuration / 2;
    const nextVisibleDur = duration / nextZoom;
    const nextOffset = Math.max(0, Math.min(centerTime - nextVisibleDur / 2, duration - nextVisibleDur));
    setZoom(nextZoom);
    setScrollOffsetSec(nextOffset);
  };

  const handleResetZoom = () => {
    setZoom(1.0);
    setScrollOffsetSec(0);
  };

  return (
    <div className="space-y-3">
      {/* Visualizer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Wellenform & Beat Grid</span>
          {activeBeat && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-all ${
                activeBeat.isDownbeat
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/50 scale-105'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}
            >
              {activeBeat.isDownbeat
                ? `TAKTEINTRITT: Takt ${activeBeat.barIndex}`
                : `Beat ${activeBeat.beatInBar} (Takt ${activeBeat.barIndex})`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Curve Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setShowBeats(!showBeats)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                showBeats ? 'bg-cyan-900/60 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Beat- & Downbeat-Linien umschalten"
            >
              <span>Beats</span>
            </button>
            <button
              onClick={() => setShowBaf(!showBaf)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                showBaf ? 'bg-cyan-900/60 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Beat Activation Function (BAF)"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>BAF</span>
            </button>
            <button
              onClick={() => setShowDaf(!showDaf)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                showDaf ? 'bg-rose-900/60 text-rose-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Downbeat Activation Function (DAF)"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>DAF</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => handleZoom(0.7)}
              disabled={zoom <= 1.0}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              title="Verkleinern"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1 min-w-[32px] text-center">
              {zoom.toFixed(1)}x
            </span>
            <button
              onClick={() => handleZoom(1.4)}
              disabled={zoom >= 16.0}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              title="Vergrößern (Detailansicht)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Ganze Datei anzeigen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Waveform Canvas Container */}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950 cursor-crosshair select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
          className="block w-full h-[240px]"
        />

        {/* Hover Tooltip */}
        {hoverInfo && (
          <div
            className="absolute pointer-events-none z-30 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl text-xs text-white backdrop-blur-md -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: `${hoverInfo.x}px`, top: `${Math.max(30, hoverInfo.y)}px` }}
          >
            <div className="font-mono font-semibold text-cyan-300">
              {hoverInfo.time.toFixed(3)}s
            </div>
            {hoverInfo.beat && (
              <div className="text-[11px] text-slate-300 mt-0.5">
                {hoverInfo.beat.isDownbeat ? (
                  <span className="text-rose-400 font-bold">
                    Takt {hoverInfo.beat.barIndex} (Downbeat)
                  </span>
                ) : (
                  <span>
                    Takt {hoverInfo.beat.barIndex} • Beat {hoverInfo.beat.beatInBar}
                  </span>
                )}
                <span className="ml-1.5 text-slate-400 font-mono">
                  ({hoverInfo.beat.instantBpm.toFixed(0)} BPM)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mini-map Scrubber */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500 font-mono px-0.5">
          <span>Übersicht & Navigation</span>
          <span>Klick zum direkten Vor-/Zurückspringen</span>
        </div>
        <div
          className="relative rounded-lg border border-slate-800 overflow-hidden bg-slate-950 cursor-pointer h-9 shadow-inner"
          onClick={handleMinimapClick}
        >
          <canvas ref={minimapCanvasRef} className="block w-full h-9" />
        </div>
      </div>
    </div>
  );
};

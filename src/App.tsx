import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, Settings } from 'lucide-react';
import { AnalysisModel, AnalysisResult, BeatItem, PlaybackSpeed } from './types/analyzer';
import { analyzeAudioFile, LocalizedError } from './utils/audioAnalyzer';
import { useI18n } from './i18n';
import { BeatPlayer } from './utils/audioPlayer';
import { BackendHealth, getBackendHealth } from './utils/localBackend';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { MetricsCards } from './components/MetricsCards';
import { WaveformBeatVisualizer } from './components/WaveformBeatVisualizer';
import { PlayerControls } from './components/PlayerControls';
import { BeatEvidenceLab } from './components/BeatEvidenceLab';
import { TempoCurveChart } from './components/TempoCurveChart';
import { ExpertDiagnosticsPanel } from './components/ExpertDiagnosticsPanel';
import { LiveSpectrumSource } from './components/LiveSpectrum';
import { BeatTable } from './components/BeatTable';
import { applyGridOps, GridOp, opsFromBeatEdit } from './utils/beatTransforms';
import { ExportModal } from './components/ExportModal';
import { ModelInfoModal } from './components/ModelInfoModal';
import { LocalSetupModal } from './components/LocalSetupModal';
import { NonCommercialNoticeModal } from './components/NonCommercialNoticeModal';

export default function App() {
  const { t, pctValue } = useI18n();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultRef = useRef<AnalysisResult | null>(null);
  resultRef.current = result;
  const [selectedModel, setSelectedModel] = useState<AnalysisModel>('beat_this');
  const [mdConfirmedInSession, setMdConfirmedInSession] = useState<boolean>(false);
  const [showMdSetupModal, setShowMdSetupModal] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<{ key: string; params?: Record<string, string | number> }>({ key: '' });
  const stageText = stage.key ? t(stage.key, stage.params) : '';
  const [error, setError] = useState<string | null>(null);
  // the decoded audio, for a detailed waveform (the peaks in the result are too coarse when zoomed in)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [smoothBars, setSmoothBars] = useState<boolean>(true);
  const [protect, setProtect] = useState<number>(0.95); // protection of clear "1"s; 0.95 = "Glätten" 90 %
  // analysis result as the server gave it, and the grid corrections on top of it (see commitGrid)
  const baseRef = useRef<AnalysisResult | null>(null);
  const [gridOps, setGridOps] = useState<GridOp[]>([]);
  const gridOpsRef = useRef<GridOp[]>([]);
  const lastAudioRef = useRef<AudioBuffer | null>(null);
  const lastFileRef = useRef<{ file: File | Blob; name: string } | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeBeat, setActiveBeat] = useState<BeatItem | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(true);
  const [metronomeVolume, setMetronomeVolume] = useState<number>(0.65);
  const [musicVolume, setMusicVolume] = useState<number>(1.0);
  // loop: off, the section the waveform shows at the click, or the whole song
  const [loopMode, setLoopMode] = useState<'off' | 'view' | 'song'>('off');
  const [loopRange, setLoopRange] = useState<{ start: number; end: number } | null>(null);
  const [viewRange, setViewRange] = useState<{ start: number; end: number } | null>(null);
  const viewRef = useRef<{ start: number; end: number } | null>(null);
  const loopModeRef = useRef<'off' | 'view' | 'song'>('off');
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showModelInfoModal, setShowModelInfoModal] = useState<boolean>(false);
  const [showLocalSetupModal, setShowLocalSetupModal] = useState<boolean>(false);

  // Audio player ref
  const playerRef = useRef<BeatPlayer | null>(null);

  useEffect(() => {
    const player = new BeatPlayer();
    playerRef.current = player;

    player.onTimeUpdate = (time) => {
      setCurrentTime(time);
    };

    player.onBeatTrigger = (beat) => {
      setActiveBeat(beat);
    };

    player.onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveBeat(null);
    };

    getBackendHealth().then((health) => {
      if (health) setBackendHealth(health);
    });

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, []);

  // reanalysis: the same file once more with other smoothing settings (server only, decoded audio reused)
  const handleFileSelected = async (
    file: File | Blob,
    name: string,
    opts: { smooth?: boolean; protect?: number; reanalysis?: boolean; model?: AnalysisModel } = {}
  ) => {
    const smooth = opts.smooth ?? true;
    const protectValue = opts.protect ?? 0.95;
    const activeModel = opts.model ?? selectedModel;
    if (!opts.reanalysis) lastAudioRef.current = null;
    lastFileRef.current = { file, name };
    try {
      setError(null);
      setIsAnalyzing(true);
      setProgress(5);
      setStage({ key: 'web.progress.load' });
      if (playerRef.current) {
        playerRef.current.stop();
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveBeat(null);

      const { result: analysisResult, audioBuffer } = await analyzeAudioFile(
        file,
        name,
        (pct, key, params) => {
          setProgress(pct);
          setStage({ key, params });
        },
        {
          smoothBars: smooth,
          requireServer: opts.reanalysis ?? false,
          protect: protectValue,
          audioBuffer: opts.reanalysis ? lastAudioRef.current ?? undefined : undefined,
          model: activeModel,
        }
      );

      lastAudioRef.current = audioBuffer;
      setAudioBuffer(audioBuffer);
      if (!opts.reanalysis) {
        setLoopMode('off');   // a new song: no loop (loadBuffer keeps no loop either)
        loopModeRef.current = 'off';
        setLoopRange(null);
        setViewRange(null);
        playerRef.current?.setLoop(null);
      }
      // a re-analysis (smoothing) keeps the corrections; a new file starts without
      const ops = opts.reanalysis ? gridOpsRef.current : [];
      const shown = applyGridOps(analysisResult, ops);
      baseRef.current = analysisResult;
      gridOpsRef.current = ops;
      setGridOps(ops);
      setResult(shown);
      setSmoothBars(smooth); // only now: a failed re-analysis leaves box and slider as they were
      setProtect(protectValue);
      if (playerRef.current) {
        playerRef.current.loadBuffer(audioBuffer, shown.beats);
      }
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      const msg =
        err instanceof LocalizedError ? t(err.key, err.params) : err instanceof Error ? err.message : t('web.error.unexpected');
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlay = useCallback(() => {
    if (!playerRef.current || !result) return;
    playerRef.current.play();
    setIsPlaying(true);
  }, [result]);

  const handlePause = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.pause();
    setIsPlaying(false);
  }, []);

  const applyLoop = useCallback((mode: 'off' | 'view' | 'song', range: { start: number; end: number } | null) => {
    loopModeRef.current = mode;
    setLoopMode(mode);
    setLoopRange(range);
    playerRef.current?.setLoop(range);
  }, []);

  const handleSeek = useCallback((targetTime: number) => {
    if (!playerRef.current) return;
    // a jump out of the looped section ends the loop
    if (loopRange && loopMode === 'view' && (targetTime < loopRange.start || targetTime >= loopRange.end)) {
      applyLoop('off', null);
    }
    playerRef.current.seek(targetTime);
    setCurrentTime(targetTime);
  }, [loopRange, loopMode, applyLoop]);

  // off -> section of the waveform (skipped when it shows the whole song) -> whole song -> off
  const handleCycleLoop = useCallback(() => {
    if (!result) return;
    const dur = result.metadata.duration;
    const view = viewRef.current;
    const viewIsPart = view !== null && view.end - view.start < dur - 0.05;
    if (loopMode === 'off' && viewIsPart && view) applyLoop('view', { start: view.start, end: view.end });
    else if (loopMode !== 'song' && !(loopMode === 'off' && viewIsPart)) applyLoop('song', { start: 0, end: dur });
    else applyLoop('off', null);
  }, [result, loopMode, applyLoop]);

  // the blue frame moved or the zoom changed: with the loop "section" its left edge is the start, its right edge the
  // end (wish of the user, test 0.2.8); applied when the frame rests for a moment, not at every step of a drag
  const handleViewChange = useCallback((start: number, end: number) => {
    viewRef.current = { start, end };
    setViewRange((prev) =>
      prev && Math.abs(prev.start - start) < 1e-6 && Math.abs(prev.end - end) < 1e-6
        ? prev
        : { start, end }
    );
    if (loopModeRef.current !== 'view') return;
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    loopTimerRef.current = setTimeout(() => {
      if (loopModeRef.current === 'view') applyLoop('view', { start, end });
    }, 150);
  }, [applyLoop]);

  const handleSetMusicVolume = useCallback((vol: number) => {
    setMusicVolume(vol);
    playerRef.current?.setMusicVolume(vol);
  }, []);

  const handleSetSpeed = useCallback((speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(speed);
    }
  }, []);

  const handleToggleMetronome = useCallback(() => {
    setMetronomeEnabled((prev) => {
      const next = !prev;
      playerRef.current?.setMetronomeEnabled(next);
      return next;
    });
  }, []);

  const handleSetMetronomeVolume = useCallback((vol: number) => {
    setMetronomeVolume(vol);
    playerRef.current?.setMetronomeVolume(vol);
  }, []);

  // Grid corrections are kept as steps (GridOp) on top of the analysis result (baseRef): undo drops the last step,
  // a re-analysis with other smoothing applies the same steps to the new result (before, every correction was
  // lost silently when the smoothing slider moved).
  const commitGrid = useCallback((ops: GridOp[]) => {
    const base = baseRef.current;
    if (!base) return;
    const next = applyGridOps(base, ops);
    gridOpsRef.current = ops;
    setGridOps(ops);
    setResult(next);
    playerRef.current?.updateBeats(next.beats);
  }, []);

  const handleUpdateBeats = useCallback(
    (updatedBeats: BeatItem[]) => {
      const current = resultRef.current;
      if (!current) return;
      const ops = opsFromBeatEdit(current.beats, updatedBeats);
      if (ops.length > 0) commitGrid([...gridOpsRef.current, ...ops]);
    },
    [commitGrid]
  );

  const addGridOp = useCallback((op: GridOp) => commitGrid([...gridOpsRef.current, op]), [commitGrid]);
  const handleShiftDownbeat = useCallback((dir: -1 | 1) => addGridOp({ kind: 'downbeat', dir }), [addGridOp]);
  const handleShiftHalfBeat = useCallback((dir: -1 | 1) => addGridOp({ kind: 'half', dir }), [addGridOp]);
  const handleScaleTempo = useCallback((factor: 0.5 | 2) => addGridOp({ kind: 'tempo', factor }), [addGridOp]);
  const handleSetMeter = useCallback((beats: number) => addGridOp({ kind: 'meter', beats }), [addGridOp]);
  const handleUndoGrid = useCallback(() => commitGrid(gridOpsRef.current.slice(0, -1)), [commitGrid]);
  const handleResetGrid = useCallback(() => commitGrid([]), [commitGrid]);

  // live spectrum of the player for the expert view ("Live"); stable object, reads the player at call time
  const liveSource = useMemo<LiveSpectrumSource>(
    () => ({
      read: (target) => playerRef.current?.readFrequencyData(target) ?? false,
      config: () =>
        playerRef.current?.getSpectrumConfig() ?? { binCount: 2048, sampleRate: 44100, minDecibels: -85, maxDecibels: -10 },
    }),
    []
  );

  const handleReset = useCallback(() => {
    playerRef.current?.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveBeat(null);
    setViewRange(null);
    baseRef.current = null;
    gridOpsRef.current = [];
    setGridOps([]);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Header */}
      <Header
        result={result}
        selectedModel={selectedModel}
        serverEngine={backendHealth ? backendHealth.models?.[selectedModel] ?? backendHealth.engineInfo ?? null : null}
        onReset={handleReset}
        onOpenExport={() => setShowExportModal(true)}
        onOpenModelInfo={() => setShowModelInfoModal(true)}
        onOpenLocalSetup={() => setShowLocalSetupModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {!result ? (
          <UploadZone
            onFileSelected={handleFileSelected}
            isAnalyzing={isAnalyzing}
            progress={progress}
            stageText={stageText}
            error={error}
            selectedModel={selectedModel}
            onSelectModel={(model) => {
              if (model === 'md_beat_this' && !mdConfirmedInSession) {
                setShowMdSetupModal(true);
                return;
              }
              setSelectedModel(model);
            }}
            onOpenMdSetup={() => setShowMdSetupModal(true)}
            backendHealth={backendHealth}
          />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {result.selectedModel === 'md_beat_this' && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-950/35 border border-amber-600/60 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <p className="text-amber-200 font-medium truncate">
                    {result.engineInfo?.id === 'librosa'
                      ? t('web.app.md_fallback', { engine: result.engine ?? '' })
                      : t('web.app.md_active')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMdSetupModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                >
                  <Settings className="w-3 h-3" />
                  <span>{t('web.app.setup')}</span>
                </button>
              </div>
            )}

            {/* 1. Metrics & Key Stats */}
            <MetricsCards
              result={result}
              smoothBars={smoothBars}
              protect={protect}
              busyText={isAnalyzing ? `${stageText} (${pctValue(progress)})` : null}
              error={error}
              onChangeSmoothing={(smooth, value) => {
                // the same file once more with other smoothing; one analysis at a time
                if (lastFileRef.current && !isAnalyzing) {
                  handleFileSelected(lastFileRef.current.file, lastFileRef.current.name, {
                    smooth,
                    protect: value,
                    reanalysis: true,
                    model: result.selectedModel ?? selectedModel,
                  });
                }
              }}
            />

            {/* 2. Interactive Waveform & Beat Grid Canvas */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <WaveformBeatVisualizer
                result={result}
                audioBuffer={audioBuffer}
                loopRange={loopRange}
                onViewChange={handleViewChange}
                followPlayhead={loopMode !== 'view'}
                currentTime={currentTime}
                onSeek={handleSeek}
                activeBeat={activeBeat}
              />
            </div>

            {/* 3. Audio Player Controls & Metronome */}
            <PlayerControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={result.metadata.duration}
              activeBeat={activeBeat}
              playbackSpeed={playbackSpeed}
              metronomeEnabled={metronomeEnabled}
              metronomeVolume={metronomeVolume}
              globalBpm={result.globalBpm}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              onSetPlaybackSpeed={handleSetSpeed}
              onToggleMetronome={handleToggleMetronome}
              onSetMetronomeVolume={handleSetMetronomeVolume}
              musicVolume={musicVolume}
              onSetMusicVolume={handleSetMusicVolume}
              loopMode={loopMode}
              onCycleLoop={handleCycleLoop}
            />

            {/* 3b. Editor-Focused Beat Diagnostics (Compact Band-Onset-Lanes + Folded Bar + 1-Click Fixes) */}
            <BeatEvidenceLab
              result={result}
              audioBuffer={audioBuffer}
              currentTime={currentTime}
              viewRange={viewRange}
              onSeek={handleSeek}
              onShiftDownbeat={handleShiftDownbeat}
              onShiftHalfBeat={handleShiftHalfBeat}
              onScaleTempo={handleScaleTempo}
              onSetMeter={handleSetMeter}
              onUndoGrid={handleUndoGrid}
              onResetGrid={handleResetGrid}
              canUndoGrid={gridOps.length > 0}
              canResetGrid={gridOps.length > 0}
              correctionCount={gridOps.length}
            />

            {/* 4. Collapsed-by-default Expert Diagnostics (Spectrogram, Energy Spectrum, Live, Tempo Histogram);
                above the tempo curve (wish of the user) */}
            <ExpertDiagnosticsPanel
              result={result}
              audioBuffer={audioBuffer}
              viewRange={viewRange}
              currentTime={currentTime}
              onSeek={handleSeek}
              liveSource={liveSource}
              isPlaying={isPlaying}
            />

            {/* 4b. Tempo Curve Over Time (auto-collapsed on stable tempo) */}
            <TempoCurveChart
              result={result}
              currentTime={currentTime}
              onSeek={handleSeek}
            />

            {/* 5. Beat Table with Fine Nudging & Search */}
            <BeatTable
              result={result}
              currentTime={currentTime}
              onSeek={handleSeek}
              onUpdateBeats={handleUpdateBeats}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          BeatAnalyzer • {t('web.app.footer_inspired')}{' '}
          <a
            href="https://github.com/CPJKU/beat_this"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline font-medium"
          >
            CPJKU/beat_this
          </a>{' '}
          (Johannes Kepler Universität Linz) • {t('web.app.footer_formats')}
        </p>
      </footer>

      {/* Modals */}
      {showExportModal && result && (
        <ExportModal result={result} onClose={() => setShowExportModal(false)} />
      )}

      {showModelInfoModal && (
        <ModelInfoModal onClose={() => setShowModelInfoModal(false)} />
      )}

      {showLocalSetupModal && (
        <LocalSetupModal
          backendHealth={backendHealth}
          onHealthUpdated={setBackendHealth}
          onClose={() => setShowLocalSetupModal(false)}
        />
      )}

      {showMdSetupModal && (
        <NonCommercialNoticeModal
          backendHealth={backendHealth}
          onHealthUpdated={setBackendHealth}
          isInstalled={Boolean(backendHealth?.md_beat_this_installed)}
          alreadyConfirmed={mdConfirmedInSession}
          onConfirm={() => {
            setMdConfirmedInSession(true);
            setSelectedModel('md_beat_this');
            setShowMdSetupModal(false);
          }}
          onCancel={() => {
            setShowMdSetupModal(false);
          }}
        />
      )}
    </div>
  );
}

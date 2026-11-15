import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, Settings } from 'lucide-react';
import { AnalysisModel, AnalysisResult, BeatItem, PlaybackSpeed } from './types/analyzer';
import { analyzeAudioFile } from './utils/audioAnalyzer';
import { BeatPlayer } from './utils/audioPlayer';
import { BackendHealth, getBackendHealth } from './utils/localBackend';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { MetricsCards } from './components/MetricsCards';
import { WaveformBeatVisualizer } from './components/WaveformBeatVisualizer';
import { PlayerControls } from './components/PlayerControls';
import { TempoCurveChart } from './components/TempoCurveChart';
import { BeatTable } from './components/BeatTable';
import { ExportModal } from './components/ExportModal';
import { ModelInfoModal } from './components/ModelInfoModal';
import { LocalSetupModal } from './components/LocalSetupModal';
import { NonCommercialNoticeModal } from './components/NonCommercialNoticeModal';

export default function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<AnalysisModel>('beat_this');
  const [mdConfirmedInSession, setMdConfirmedInSession] = useState<boolean>(false);
  const [showMdSetupModal, setShowMdSetupModal] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stageText, setStageText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  // the decoded audio, for a detailed waveform (the peaks in the result are too coarse when zoomed in)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [smoothBars, setSmoothBars] = useState<boolean>(true);
  const [protect, setProtect] = useState<number>(0.95); // protection of clear "1"s; 0.95 = "Glätten" 90 %
  const lastAudioRef = useRef<AudioBuffer | null>(null);
  const lastFileRef = useRef<{ file: File | Blob; name: string } | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeBeat, setActiveBeat] = useState<BeatItem | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(true);
  const [metronomeVolume, setMetronomeVolume] = useState<number>(0.65);

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
      setStageText('Lade Audiodatei...');
      if (playerRef.current) {
        playerRef.current.stop();
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveBeat(null);

      const { result: analysisResult, audioBuffer } = await analyzeAudioFile(
        file,
        name,
        (pct, stage) => {
          setProgress(pct);
          setStageText(stage);
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
      setResult(analysisResult);
      setSmoothBars(smooth); // only now: a failed re-analysis leaves box and slider as they were
      setProtect(protectValue);
      if (playerRef.current) {
        playerRef.current.loadBuffer(audioBuffer, analysisResult.beats);
      }
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      const msg = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.';
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

  const handleSeek = useCallback((targetTime: number) => {
    if (!playerRef.current) return;
    playerRef.current.seek(targetTime);
    setCurrentTime(targetTime);
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

  const handleUpdateBeats = useCallback((updatedBeats: BeatItem[]) => {
    if (!result) return;
    const downbeats = updatedBeats.filter((b) => b.isDownbeat);
    setResult((prev) =>
      prev
        ? {
            ...prev,
            beats: updatedBeats,
            downbeats,
            totalBeats: updatedBeats.length,
            totalBars: downbeats.length,
          }
        : null
    );
    playerRef.current?.updateBeats(updatedBeats);
  }, [result]);

  const handleReset = useCallback(() => {
    playerRef.current?.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveBeat(null);
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
                      ? `Fallback aktiv (${result.engine}) — md_beat_this nur nicht-kommerziell (CC BY-NC 4.0).`
                      : 'Analyse mit md_beat_this — nur für nicht-kommerzielle Nutzung (CC BY-NC 4.0).'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMdSetupModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                >
                  <Settings className="w-3 h-3" />
                  <span>Einrichtung</span>
                </button>
              </div>
            )}

            {/* 1. Metrics & Key Stats */}
            <MetricsCards
              result={result}
              smoothBars={smoothBars}
              protect={protect}
              busyText={isAnalyzing ? `${stageText} (${Math.round(progress)} %)` : null}
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
            />

            {/* 4. Tempo Curve Over Time */}
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
          BeatAnalyzer • Inspiriert von{' '}
          <a
            href="https://github.com/CPJKU/beat_this"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline font-medium"
          >
            CPJKU/beat_this
          </a>{' '}
          (Johannes Kepler Universität Linz) • Unterstützt MP3, WAV, AAC & FLAC
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

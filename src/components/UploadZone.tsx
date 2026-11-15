import React, { useState, useRef } from 'react';
import {
  Upload,
  FileAudio,
  Sparkles,
  Music2,
  Play,
  AlertCircle,
  ArrowRight,
  Cpu,
  AlertTriangle,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { AnalysisModel } from '../types/analyzer';
import { BackendHealth } from '../utils/localBackend';
import { SAMPLE_TRACKS, generateSampleWavBlob } from '../utils/sampleTracks';
import { useI18n } from '../i18n';

interface UploadZoneProps {
  onFileSelected: (file: File | Blob, name: string) => void;
  isAnalyzing: boolean;
  progress: number;
  stageText: string;
  error: string | null;
  selectedModel: AnalysisModel;
  onSelectModel: (model: AnalysisModel) => void;
  onOpenMdSetup: () => void;
  backendHealth: BackendHealth | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  isAnalyzing,
  progress,
  stageText,
  error,
  selectedModel,
  onSelectModel,
  onOpenMdSetup,
  backendHealth,
}) => {
  const { t, pctValue } = useI18n();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChooseModel = (model: AnalysisModel) => {
    if (isAnalyzing) return;
    onSelectModel(model);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file, file.name);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file, file.name);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_TRACKS.find((s) => s.id === sampleId);
    if (!sample) return;
    const blob = generateSampleWavBlob(sampleId);
    onFileSelected(blob, `${sample.name}.wav`);
  };

  const mdInstalledOnServer = backendHealth?.md_beat_this_installed;
  const beatThisInstalledOnServer = backendHealth?.beat_this_installed;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          {t('web.upload.badge')}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('web.upload.title')}{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            BeatAnalyzer
          </span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          {t('web.upload.intro')}
        </p>
      </div>

      {/* Model Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('web.upload.choose_model')}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {backendHealth ? t('web.upload.server_connected') : t('web.upload.browser_active')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Analyse-Modell">
          {/* Option 1: CPJKU beat_this */}
          <button
            type="button"
            role="radio"
            aria-checked={selectedModel === 'beat_this'}
            disabled={isAnalyzing}
            onClick={() => handleChooseModel('beat_this')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer disabled:opacity-60 ${
              selectedModel === 'beat_this'
                ? 'bg-cyan-950/35 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">CPJKU beat_this</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    {t('web.upload.mit')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('web.upload.beat_this_text')}
                </p>
                {backendHealth && (
                  <p className="text-[11px] text-slate-500 pt-0.5">
                    {t('web.upload.local')}{' '}
                    <span className={beatThisInstalledOnServer ? 'text-emerald-400' : 'text-slate-400'}>
                      {beatThisInstalledOnServer ? t('web.upload.installed') : t('web.upload.not_installed_librosa')}
                    </span>
                  </p>
                )}
              </div>
              {selectedModel === 'beat_this' && (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              )}
            </div>
          </button>

          {/* Option 2: Masked Diffusion md_beat_this */}
          <div
            className={`rounded-xl border transition-all flex items-stretch justify-between ${
              selectedModel === 'md_beat_this'
                ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-950/30'
                : 'bg-slate-900/70 border-slate-800 hover:border-amber-700/60 hover:bg-slate-900'
            } ${isAnalyzing ? 'opacity-60' : ''}`}
          >
            <button
              type="button"
              role="radio"
              aria-checked={selectedModel === 'md_beat_this'}
              disabled={isAnalyzing}
              onClick={() => handleChooseModel('md_beat_this')}
              className="flex-1 text-left p-4 pr-2 cursor-pointer disabled:cursor-not-allowed rounded-l-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">Masked Diffusion (md_beat_this)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/70">
                    {t('web.upload.nc_only')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('web.upload.md_text')} (<span className="font-mono text-slate-300">CC BY-NC 4.0</span>).
                </p>
                {backendHealth && (
                  <p className="text-[11px] text-slate-500 pt-0.5">
                    {t('web.upload.local')}{' '}
                    <span className={mdInstalledOnServer ? 'text-emerald-400' : 'text-amber-300'}>
                      {mdInstalledOnServer ? t('web.upload.installed') : t('web.upload.not_installed_fallback')}
                    </span>
                  </p>
                )}
              </div>
            </button>

            <div className="flex items-start gap-1 p-3 pl-1 shrink-0">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={onOpenMdSetup}
                aria-label={t('web.upload.md_setup')}
                title={t('web.upload.md_setup')}
                className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/60 border border-transparent hover:border-amber-700/60 transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Settings className="w-4 h-4" />
              </button>
              {selectedModel === 'md_beat_this' && (
                <div className="p-1.5 text-amber-400" aria-hidden="true">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Highlighted Single-Line Non-Commercial Notice */}
        {selectedModel === 'md_beat_this' && (
          <div className="px-3.5 py-2 rounded-xl bg-amber-950/35 border border-amber-600/60 text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-amber-200 font-medium">
              {t('web.upload.md_notice')}
            </p>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">{t('web.upload.error_title')}</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Analyzing Progress State */}
      {isAnalyzing ? (
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800 animate-pulse"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"
              style={{ animationDuration: '1.2s' }}
            ></div>
            <Music2 className="w-8 h-8 text-cyan-400 animate-bounce" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">{t('web.upload.analysing')}</h3>
            <p className="text-xs text-cyan-300 font-mono h-5 transition-all">
              {stageText || t('web.upload.analysing')}
            </p>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60 mt-4">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
                style={{ width: `${Math.max(5, progress)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>Beats</span>
              <span>{pctValue(progress)}</span>
              <span>Downbeats</span>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 shadow-xl ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
              : 'border-slate-750 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.flac,.aac,.m4a,.ogg,audio/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-950/60 group-hover:text-cyan-300 group-hover:border-cyan-700 transition-all shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                {t('web.upload.drop')}{' '}
                <span className="text-cyan-400 underline underline-offset-4 decoration-cyan-500/50 group-hover:decoration-cyan-400">
                  {t('web.upload.browse')}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                {t('web.upload.drop_hint')}
              </p>
            </div>

            {/* Supported Formats Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['MP3', 'WAV', 'FLAC', 'AAC / M4A', 'OGG'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Demo Tracks Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">
              {t('web.upload.demo_title')}
            </h3>
          </div>
          <span className="text-xs text-slate-500">{t('web.upload.demo_hint')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_TRACKS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample.id)}
              className="group p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-600/60 hover:bg-slate-850/90 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {sample.name}
                    </h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {sample.bpm} BPM
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {t(`web.sample.${sample.id}`)} • <span className="text-indigo-300 font-mono">{sample.meter}</span>
                  </p>
                </div>
              </div>

              <div className="text-slate-600 group-hover:text-cyan-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

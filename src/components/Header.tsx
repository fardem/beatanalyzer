import React from 'react';
import { Activity, BookOpen, Download, RefreshCw, ExternalLink, Terminal } from 'lucide-react';
import { AnalysisModel, AnalysisResult, EngineInfo } from '../types/analyzer';
import { UpdateBadge } from './UpdateBadge';

interface HeaderProps {
  result: AnalysisResult | null;
  selectedModel: AnalysisModel;
  // what the server would use for the next analysis (null: no server, the browser analyses)
  serverEngine?: EngineInfo | null;
  onReset: () => void;
  onOpenExport: () => void;
  onOpenModelInfo: () => void;
  onOpenLocalSetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  result,
  selectedModel,
  serverEngine,
  onReset,
  onOpenExport,
  onOpenModelInfo,
  onOpenLocalSetup,
}) => {
  const activeModel = result?.selectedModel ?? selectedModel;
  const engine = engineLabel(result, serverEngine ?? null, activeModel);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                BeatAnalyzer
                {/* analysis program (concept section 8): of the shown result, else of the next analysis */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    engine.tone === 'ok'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800/80'
                      : engine.tone === 'nc'
                      ? 'bg-amber-950/90 text-amber-300 border-amber-700/80'
                      : 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                  }`}
                  title={engine.tip}
                >
                  {engine.text}
                </span>
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-3">
              <p className="text-xs text-slate-400">
                Präzise Beat- & Downbeat-Erkennung für MP3, WAV, AAC & FLAC
              </p>
              <UpdateBadge />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLocalSetup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 transition-colors shadow-sm cursor-pointer"
            title="Anleitung zur lokalen Ausführung mit install_and_run.bat"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Lokal starten (.bat)</span>
          </button>

          <button
            onClick={onOpenModelInfo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 transition-colors shadow-sm"
            title="Architektur & CPJKU beat_this Dokumentation"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Modell-Info</span>
          </button>

          <a
            href="https://github.com/CPJKU/beat_this"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="GitHub Repository öffnen"
          >
            <span className="hidden md:inline">GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {result && (
            <>
              <button
                onClick={onOpenExport}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportieren</span>
              </button>

              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                title="Neue Audiodatei analysieren"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Neue Datei</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const REASONS: Record<string, string> = {
  not_installed: 'nicht installiert',
  model_load_failed: 'Modell nicht geladen',
  inference_failed: 'Analyse gescheitert',
  analyzer_failed: 'Analyzer nicht geladen',
};

// "beat_this · CUDA (RTX 5080)", "md_beat_this · CPU", "librosa (Ersatz) – beat_this nicht installiert",
// "Browser-Analyse (Ersatz) – kein Server"
function engineLabel(
  result: AnalysisResult | null,
  serverEngine: EngineInfo | null,
  model: AnalysisModel
): { text: string; tip: string; tone: 'ok' | 'nc' | 'fallback' } {
  if (result && result.engine?.startsWith('Browser')) {
    return { text: 'Browser-Analyse (Ersatz) – kein Server', tip: 'Ohne lokalen Server rechnet der Browser grob nach.', tone: 'fallback' };
  }
  const info = result ? result.engineInfo ?? null : serverEngine;
  if (!info) {
    return result
      ? { text: result.engine || 'unbekannt', tip: '', tone: 'ok' }
      : { text: 'kein Server – Browser-Analyse', tip: 'Ohne lokalen Server rechnet der Browser grob nach (start.bat starten).', tone: 'fallback' };
  }
  if (info.id === 'librosa') {
    const reason = info.fallbackReason ? REASONS[info.fallbackReason] ?? info.fallbackReason : '';
    const what = info.fallbackReason === 'not_installed' ? `${model} ${reason}` : reason;
    return { text: `librosa (Ersatz)${what ? ` – ${what}` : ''}`, tip: 'librosa erkennt keine Downbeats: jeder 4. Beat gilt als „1“.', tone: 'fallback' };
  }
  const dev = info.device ? info.device.toUpperCase() + (info.gpu ? ` (${info.gpu.replace(/^NVIDIA (GeForce )?/, '')})` : '') : '';
  const licence = info.model ? `${info.model.name}: Lizenz ${info.model.license}${info.model.commercial ? '' : ' – nur nicht-kommerziell'}` : '';
  return { text: `${info.id}${dev ? ` · ${dev}` : ''}`, tip: licence, tone: info.id === 'md_beat_this' ? 'nc' : 'ok' };
}

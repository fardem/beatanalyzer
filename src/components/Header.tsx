import React from 'react';
import { Activity, BookOpen, Download, RefreshCw, ExternalLink, Terminal } from 'lucide-react';
import { AnalysisResult } from '../types/analyzer';
import { UpdateBadge } from './UpdateBadge';

interface HeaderProps {
  result: AnalysisResult | null;
  onReset: () => void;
  onOpenExport: () => void;
  onOpenModelInfo: () => void;
  onOpenLocalSetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  result,
  onReset,
  onOpenExport,
  onOpenModelInfo,
  onOpenLocalSetup,
}) => {
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
                BeatThis
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  CPJKU Transformer
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

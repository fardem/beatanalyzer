import React, { useState, useRef } from 'react';
import { Upload, FileAudio, Sparkles, Music2, Play, AlertCircle, ArrowRight } from 'lucide-react';
import { SAMPLE_TRACKS, generateSampleWavBlob } from '../utils/sampleTracks';

interface UploadZoneProps {
  onFileSelected: (file: File | Blob, name: string) => void;
  isAnalyzing: boolean;
  progress: number;
  stageText: string;
  error: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  isAnalyzing,
  progress,
  stageText,
  error,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          State-of-the-Art Music Information Retrieval
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Musik analysieren mit{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            BeatAnalyzer
          </span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Präzise Lokalisierung von Takten, Beats und Downbeats basierend auf der CPJKU-Transformer-Architektur. Unterstützt MP3, WAV, AAC und FLAC.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Analysefehler</p>
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
            <h3 className="text-lg font-bold text-white">Audiodatei wird analysiert...</h3>
            <p className="text-xs text-cyan-300 font-mono h-5 transition-all">
              {stageText || 'Verarbeite Spektraldaten...'}
            </p>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60 mt-4">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
                style={{ width: `${Math.max(5, progress)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>Spektral-Flux</span>
              <span>{Math.round(progress)}%</span>
              <span>Downbeat Tracker</span>
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
                Audiodatei hier ablegen oder{' '}
                <span className="text-cyan-400 underline underline-offset-4 decoration-cyan-500/50 group-hover:decoration-cyan-400">
                  durchsuchen
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Wähle eine Musikdatei zur automatischen Takt- und Beat-Erkennung
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
              Oder sofort mit Demo-Tracks ausprobieren:
            </h3>
          </div>
          <span className="text-xs text-slate-500">Klick zum direkten Testen</span>
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
                    {sample.genre} • <span className="text-indigo-300 font-mono">{sample.meter}</span>
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

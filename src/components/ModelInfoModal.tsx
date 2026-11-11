import React from 'react';
import { X, ExternalLink, Cpu, GitBranch, Layers, CheckCircle2 } from 'lucide-react';

interface ModelInfoModalProps {
  onClose: () => void;
}

export const ModelInfoModal: React.FC<ModelInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Über CPJKU beat_this</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Research Box */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Forschung & Publikation
              </span>
              <a
                href="https://github.com/CPJKU/beat_this"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white font-medium underline"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h3 className="text-sm font-bold text-white">
              Beat This: Beat and Downbeat Tracking with Transformers
            </h3>
            <p className="text-slate-400">
              Entwickelt an der <strong>Johannes Kepler Universität Linz (CP JKU)</strong> von
              Florian Schmid, Shahed Masoudian, Khaled Koutini und Gerhard Widmer.
            </p>
          </div>

          {/* Key Advantages */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Warum beat_this konventionellen Beat-Trackern überlegen ist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Gleichzeitige Beat- & Downbeat-Erkennung
                </div>
                <p className="text-[11px] text-slate-400">
                  Erkennt nicht nur das Metrum (jeden Beat), sondern lokalisiert exakt den ersten Beat jedes Taktes (Downbeat / die &quot;1&quot;).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Robuste Taktarterkennung
                </div>
                <p className="text-[11px] text-slate-400">
                  Unterscheidet zuverlässig zwischen 4/4 (Common Time), 3/4 (Walzer) und weiteren Taktarten durch periodische Autokorrelation.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Resistent gegen Synkopen & Tempodrift
                </div>
                <p className="text-[11px] text-slate-400">
                  Transformer-Self-Attention erfasst globale musikalische Zusammenhänge über lange Zeitfenster hinweg, auch bei Swing oder Rubato.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Universelle Formatunterstützung
                </div>
                <p className="text-[11px] text-slate-400">
                  Verarbeitet MP3, WAV, AAC, FLAC und OGG direkt im Browser mit präziser Millisekunden-Genauigkeit.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture Pipeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              Die Analyse-Pipeline in dieser Web-App
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  1
                </div>
                <div>
                  <strong className="text-white">Audio Decoding & Multi-Band Filterung:</strong> Dekodiert das komprimierte Audio und teilt es in Sub-Bass (Kick/Downbeat-Trigger), Mitten (Harmonie/Snare) und Höhen (Hi-Hats).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  2
                </div>
                <div>
                  <strong className="text-white">Aktivierungsfunktionen (BAF & DAF):</strong> Berechnet pro Frame (10ms) die Wahrscheinlichkeit für einen Beat bzw. Downbeat.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  3
                </div>
                <div>
                  <strong className="text-white">Dynamisches Programmieren & Takt-Alignierung:</strong> Findet den optimalen globalen Beat-Pfad und ordnet jedem Beat die exakte Taktnummer (z.B. Takt 1.1, 1.2, 1.3, 1.4) zu.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

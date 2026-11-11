import React, { useState } from 'react';
import { X, Terminal, Check, Copy, Laptop, FolderGit2, PlayCircle, Cpu } from 'lucide-react';

interface LocalSetupModalProps {
  onClose: () => void;
}

export const LocalSetupModal: React.FC<LocalSetupModalProps> = ({ onClose }) => {
  const [copiedBatch, setCopiedBatch] = useState(false);

  const copyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Lokal auf dem PC ausführen (Batch / venv)</h2>
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
          {/* Introduction Card */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>Vollständig isolierte Python-Umgebung (venv)</span>
            </div>
            <p className="text-slate-400">
              Im Projektordner liegt die fertige Datei <strong className="text-white font-mono">install_and_run.bat</strong> bereit. Sie richtet per Doppelklick automatisch eine isolierte virtuelle Umgebung ein, lädt PyTorch und das originale <strong className="text-cyan-300">CPJKU beat_this</strong> Transformer-Modell herunter und startet die Web-App auf deinem PC.
            </p>
          </div>

          {/* Step by Step Guide */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-400" />
              3 einfache Schritte zur lokalen Ausführung
            </h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Voraussetzung: Python 3.9+ installiert</span>
                </div>
                <p className="text-slate-400 text-[11px] pl-7">
                  Falls noch nicht installiert, lade Python von <a href="https://www.python.org/downloads/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">python.org</a> herunter. Setze bei der Installation unbedingt den Haken bei <strong>&quot;Add Python to PATH&quot;</strong>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Doppelklick auf <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">install_and_run.bat</code></span>
                </div>
                <p className="text-slate-400 text-[11px] pl-7">
                  Das Skript prüft Python, erstellt automatisch den isolierten Ordner <code className="text-indigo-300">venv/</code>, installiert alle nötigen PyTorch- und Audio-Pakete und baut das Frontend.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Browser öffnet sich auf <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">http://localhost:8000</code></span>
                </div>
                <p className="text-slate-400 text-[11px] pl-7">
                  Die Web-App ist nun mit deinem lokalen Python-Transformer verbunden. Ziehe deine MP3, WAV, AAC oder FLAC-Dateien hinein.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Files Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Bereitgestellte Batch- & Skriptdateien im Projekt
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-mono font-bold text-cyan-400">install_and_run.bat</div>
                <div className="text-slate-400 mt-0.5">Vollständige Erstinstallation + Serverstart</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-mono font-bold text-indigo-400">start.bat</div>
                <div className="text-slate-400 mt-0.5">Täglicher Schnellstart ohne Neuinstallation</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-mono font-bold text-emerald-400">run_cli.bat</div>
                <div className="text-slate-400 mt-0.5">Drag & Drop CLI: Ziehe Audio direkt auf die .bat Datei</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-mono font-bold text-amber-400">install_and_run.sh</div>
                <div className="text-slate-400 mt-0.5">Für macOS- und Linux-Nutzer im Terminal</div>
              </div>
            </div>
          </div>

          {/* GPU Acceleration note */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-200">Automatische NVIDIA GPU/CUDA-Erkennung:</strong> Falls eine NVIDIA Grafikkarte mit CUDA vorhanden ist, nutzt PyTorch automatisch die GPU für extrem schnelle Transformer-Berechnungen in unter 1 Sekunde.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};

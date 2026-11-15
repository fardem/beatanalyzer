import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { BackendHealth } from '../utils/localBackend';
import { FfmpegDirControl } from './FfmpegDirControl';

interface NonCommercialNoticeModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  backendHealth: BackendHealth | null;
  onHealthUpdated?: (health: BackendHealth) => void;
  isInstalled?: boolean;
  alreadyConfirmed?: boolean;
}

const INSTALL_CMD_WIN = 'venv\\Scripts\\pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip';
const INSTALL_CMD_UNIX = 'venv/bin/pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip';
const README_URL = 'https://github.com/fosfrancesco/md_beat_this/blob/main/README.md#installation';

export const NonCommercialNoticeModal: React.FC<NonCommercialNoticeModalProps> = ({
  onConfirm,
  onCancel,
  backendHealth,
  onHealthUpdated,
  isInstalled = false,
  alreadyConfirmed = false,
}) => {
  const backendConnected = Boolean(backendHealth);
  const [copiedTarget, setCopiedTarget] = useState<'win' | 'unix' | null>(null);
  const [accepted, setAccepted] = useState(alreadyConfirmed);

  const handleCopy = (cmd: string, target: 'win' | 'unix') => {
    navigator.clipboard.writeText(cmd);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nc-modal-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-amber-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-amber-950/25">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="nc-modal-title" className="text-sm sm:text-base font-bold text-white">
                Hinweis zur nicht-kommerziellen Nutzung
              </h2>
              <p className="text-[11px] text-amber-300/90 font-medium">
                Masked Diffusion (md_beat_this) · CC BY-NC 4.0
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-950/35 border border-amber-700/60 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Nur für nicht-kommerzielle Zwecke nutzbar</span>
            </div>
            <p className="text-amber-100/90 leading-relaxed">
              Das Modell <strong className="text-white">Masked Diffusion (md_beat_this)</strong> darf{' '}
              <strong className="text-amber-300 underline decoration-amber-500/60 underline-offset-2">
                ausschließlich genutzt werden, wenn eine nicht-kommerzielle Nutzung vorliegt
              </strong>
              . Code, Modellgewichte, Vorhersagen und Aktivierungen von{' '}
              <code className="text-amber-300 bg-slate-950/80 px-1.5 py-0.5 rounded font-mono">
                fosfrancesco/md_beat_this
              </code>{' '}
              stehen unter <strong className="text-white">CC BY-NC 4.0</strong> (Namensnennung + Nicht-kommerziell).
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
              <li>
                <strong className="text-white">Privat / Test / Forschung:</strong> Rein private, nicht-kommerzielle
                Tests oder Forschung mit Namensnennung (BY) sind von CC BY-NC 4.0 abgedeckt.
              </li>
              <li>
                <strong className="text-white">Social Media:</strong> Monetarisierte Kanäle, Werbung, Sponsorings,
                Affiliate-Links sowie Firmen- oder Creator-Promotion sind kommerziell und{' '}
                <strong className="text-amber-300">nicht erlaubt</strong>. Für Social Media empfiehlt sich im Zweifel{' '}
                <strong className="text-cyan-300">CPJKU beat_this</strong> (MIT-Lizenz).
              </li>
              <li>
                <strong className="text-white">Namensnennung (Attribution):</strong> Bei Weitergabe oder Veröffentlichung
                müssen die Autoren (Francesco Foscarin, Filip Korzeniowski, Richard Vogl) und die Lizenz genannt werden
                — BeatAnalyzer fügt dies in JSON-Exports automatisch hinzu.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manuelle Installation in deiner Python-Umgebung (venv)</span>
              </div>
              <a
                href={README_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline"
              >
                <span>GitHub README (#installation)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {backendConnected && isInstalled ? (
              <div className="flex items-center gap-2 text-emerald-300 text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>md_beat_this ist in deiner lokalen Python-Umgebung bereits installiert und einsatzbereit.</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                BeatAnalyzer lädt keine CC BY-NC 4.0-Pakete automatisch herunter. Um{' '}
                <code className="text-slate-200">md_beat_this</code> lokal zu nutzen, führe im{' '}
                <strong className="text-slate-200">BeatAnalyzer-Ordner</strong> einen der folgenden Befehle aus (vorher
                Basis-Setup über <code className="text-slate-200">install_and_run.bat</code> /{' '}
                <code className="text-slate-200">.sh</code> einmal durchlaufen lassen) und starte den Server danach neu:
              </p>
            )}

            <FfmpegDirControl backendHealth={backendHealth} onHealthUpdated={onHealthUpdated} />

            <div className="space-y-2">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Windows (CMD / PowerShell im BeatAnalyzer-Ordner)
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                  <code className="text-[11px] text-cyan-300 font-mono truncate flex-1">{INSTALL_CMD_WIN}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(INSTALL_CMD_WIN, 'win')}
                    className="shrink-0 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Windows-Befehl kopieren"
                  >
                    {copiedTarget === 'win' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Linux / macOS (Terminal im BeatAnalyzer-Ordner)
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                  <code className="text-[11px] text-cyan-300 font-mono truncate flex-1">{INSTALL_CMD_UNIX}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(INSTALL_CMD_UNIX, 'unix')}
                    className="shrink-0 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Linux/macOS-Befehl kopieren"
                  >
                    {copiedTarget === 'unix' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Non-Commercial Confirmation Checkbox (once per session) */}
          {alreadyConfirmed ? (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-700/50 text-[11px] text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Nicht-kommerzielle Nutzung (<strong className="text-white">CC BY-NC 4.0</strong>) ist für diese Sitzung bestätigt.
              </span>
            </div>
          ) : (
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/90 border border-amber-700/50 hover:border-amber-500/70 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-600 bg-slate-900 text-amber-400 focus:ring-amber-400 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-slate-200 leading-relaxed">
                Ich bestätige, dass ich <strong className="text-white">Masked Diffusion (md_beat_this)</strong>{' '}
                ausschließlich für <strong className="text-amber-300">nicht-kommerzielle Zwecke</strong> gemäß{' '}
                <strong className="text-white">CC BY-NC 4.0</strong> nutze und bei Veröffentlichung die erforderliche
                Namensnennung (Attribution) beachte.
              </span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-end gap-2.5">
          {alreadyConfirmed ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              Fertig
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={!accepted}
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg shadow-amber-950/50 transition-colors cursor-pointer"
              >
                Bestätigen (nur nicht-kommerzielle Nutzung)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

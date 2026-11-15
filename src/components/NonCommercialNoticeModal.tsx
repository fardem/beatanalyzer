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
import { useI18n } from '../i18n';

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
  const { t } = useI18n();
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
                {t('web.nc.title')}
              </h2>
              <p className="text-[11px] text-amber-300/90 font-medium">
                Masked Diffusion (md_beat_this) · CC BY-NC 4.0
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={t('web.common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-950/35 border border-amber-700/60 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('web.nc.only_nc')}</span>
            </div>
            <p className="text-amber-100/90 leading-relaxed">{t('web.nc.intro')}</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
              <li>
                <strong className="text-white">{t('web.nc.private_title')}</strong> {t('web.nc.private_text')}
              </li>
              <li>
                <strong className="text-white">{t('web.nc.social_title')}</strong> {t('web.nc.social_text')}
              </li>
              <li>
                <strong className="text-white">{t('web.nc.attribution_title')}</strong> {t('web.nc.attribution_text')}
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('web.nc.install_title')}</span>
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
                <span>{t('web.nc.installed')}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">{t('web.nc.install_text')}</p>
            )}

            <FfmpegDirControl backendHealth={backendHealth} onHealthUpdated={onHealthUpdated} />

            <div className="space-y-2">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  {t('web.nc.windows')}
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                  <code className="text-[11px] text-cyan-300 font-mono truncate flex-1">{INSTALL_CMD_WIN}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(INSTALL_CMD_WIN, 'win')}
                    className="shrink-0 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={t('web.nc.copy_cmd')}
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
                  {t('web.nc.unix')}
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                  <code className="text-[11px] text-cyan-300 font-mono truncate flex-1">{INSTALL_CMD_UNIX}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(INSTALL_CMD_UNIX, 'unix')}
                    className="shrink-0 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={t('web.nc.copy_cmd')}
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
              <span>{t('web.nc.confirmed')}</span>
            </div>
          ) : (
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/90 border border-amber-700/50 hover:border-amber-500/70 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-600 bg-slate-900 text-amber-400 focus:ring-amber-400 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-slate-200 leading-relaxed">{t('web.nc.confirm_text')}</span>
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
              {t('web.nc.done')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                {t('web.common.cancel')}
              </button>
              <button
                type="button"
                disabled={!accepted}
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg shadow-amber-950/50 transition-colors cursor-pointer"
              >
                {t('web.nc.confirm')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

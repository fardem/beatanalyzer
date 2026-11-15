import React from 'react';
import { X, ExternalLink, Cpu, GitBranch, Layers, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../i18n';

interface ModelInfoModalProps {
  onClose: () => void;
}

export const ModelInfoModal: React.FC<ModelInfoModalProps> = ({ onClose }) => {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">{t('web.info.title')}</h2>
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
                {t('web.info.standard')}
              </span>
              <a
                href="https://github.com/CPJKU/beat_this"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white font-medium underline"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h3 className="text-sm font-bold text-white">
              Beat this! Accurate beat tracking without DBN postprocessing (ISMIR 2024)
            </h3>
            <p className="text-slate-400">
              {t('web.info.beat_this_text')}
            </p>
          </div>

          {/* Optional Non-Commercial Model: md_beat_this */}
          <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-700/50 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                {t('web.info.optional')}
              </span>
              <a
                href="https://github.com/fosfrancesco/md_beat_this/blob/main/README.md#installation"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-white font-medium underline"
              >
                <span>{t('web.info.installation')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h3 className="text-sm font-bold text-white">
              Masked Diffusion Enables Coherent Beat Tracking (md_beat_this)
            </h3>
            <p className="text-slate-300">
              {t('web.info.md_text')}{' '}
              <code className="text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">
                venv\Scripts\pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip
              </code>
            </p>
          </div>

          {/* Key Advantages */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              {t('web.info.why')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['downbeats', 'meter', 'robust', 'formats'].map((k) => (
                <div key={k} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    {t(`web.info.adv_${k}`)}
                  </div>
                  <p className="text-[11px] text-slate-400">{t(`web.info.adv_${k}_text`)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis pipeline (server with beat_this) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              {t('web.info.pipeline')}
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    {n}
                  </div>
                  <div>
                    <strong className="text-white">{t(`web.info.step${n}`)}</strong> {t(`web.info.step${n}_text`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            {t('web.common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Terminal, Check, Copy, Laptop, FolderGit2, PlayCircle, Cpu } from 'lucide-react';
import { BackendHealth } from '../utils/localBackend';
import { FfmpegDirControl } from './FfmpegDirControl';
import { useI18n } from '../i18n';

interface LocalSetupModalProps {
  onClose: () => void;
  backendHealth: BackendHealth | null;
  onHealthUpdated?: (health: BackendHealth) => void;
}

export const LocalSetupModal: React.FC<LocalSetupModalProps> = ({
  onClose,
  backendHealth,
  onHealthUpdated,
}) => {
  const { t } = useI18n();
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
            <h2 className="text-base font-bold text-white">{t('web.setup.title')}</h2>
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
              <span>{t('web.setup.venv_title')}</span>
            </div>
            <p className="text-slate-400">
              {t('web.setup.venv_text')}
            </p>
          </div>

          {/* Step by Step Guide */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-400" />
              {t('web.setup.steps')}
            </h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold">1</span>
                  <span>{t('web.setup.step1')}</span>
                </div>
                <p className="text-slate-400 text-[11px] pl-7">
                  {t('web.setup.step1_text')}{' '}
                  <a href="https://www.python.org/downloads/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">python.org</a>
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold">2</span>
                  <span>{t('web.setup.step2')} <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">install_and_run.bat</code></span>
                </div>
                <p className="text-slate-400 text-[11px] pl-7">
                  {t('web.setup.step2_text')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold">3</span>
                  <span>{t('web.setup.step3')} <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">http://localhost:8000</code></span>
                </div>
                <p className="text-slate-400 text-[11px] pl-7">
                  {t('web.setup.step3_text')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Files Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t('web.setup.files')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-mono font-bold text-cyan-400">install_and_run.bat</div>
                <div className="text-slate-400 mt-0.5">{t('web.setup.file_install')}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-mono font-bold text-indigo-400">start.bat</div>
                <div className="text-slate-400 mt-0.5">{t('web.setup.file_start')}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-mono font-bold text-emerald-400">run_cli.bat</div>
                <div className="text-slate-400 mt-0.5">{t('web.setup.file_cli')}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-mono font-bold text-amber-400">install_and_run.sh</div>
                <div className="text-slate-400 mt-0.5">{t('web.setup.file_sh')}</div>
              </div>
            </div>
          </div>

          {/* GPU Acceleration note */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-200">{t('web.setup.gpu_title')}</strong> {t('web.setup.gpu_text')}
            </div>
          </div>

          {/* Optional md_beat_this note */}
          <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-800/50 space-y-2">
            <div className="text-[11px] font-semibold text-amber-300">
              {t('web.setup.md_title')}
            </div>
            <p className="text-[11px] text-slate-300">
              {t('web.setup.md_text1')}{' '}
              <a
                href="https://github.com/fosfrancesco/md_beat_this/blob/main/README.md#installation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 underline"
              >
                fosfrancesco/md_beat_this
              </a>{' '}
              {t('web.setup.md_text2')}
            </p>
            <code className="block text-[11px] font-mono text-cyan-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 overflow-x-auto">
              venv\Scripts\pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip
            </code>
            <code className="block text-[11px] font-mono text-cyan-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 overflow-x-auto">
              venv/bin/pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip
            </code>
            <FfmpegDirControl backendHealth={backendHealth} onHealthUpdated={onHealthUpdated} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            {t('web.common.ok')}
          </button>
        </div>
      </div>
    </div>
  );
};

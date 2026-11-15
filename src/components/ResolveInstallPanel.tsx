import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Loader2, PlugZap } from 'lucide-react';
import { getResolveStatus, installResolveScript, ResolveStatus } from '../utils/localBackend';
import { downloadTextFile } from '../utils/exportUtils';
import { useI18n } from '../i18n';
import resolveLuaScript from '../../resolve/BeatAnalyzer_Markers.lua?raw';

/** Installs resolve/BeatAnalyzer_Markers.lua into Resolve's script folder via the local server. */
export const ResolveInstallPanel: React.FC = () => {
  const { t } = useI18n();
  const [status, setStatus] = useState<ResolveStatus | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResolveStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  const install = async () => {
    setBusy(true);
    setError(null);
    try {
      const s = await installResolveScript();
      if (s) setStatus(s);
      else setError(t('web.error.no_server'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const downloadScript = (
    <button
      onClick={() => downloadTextFile(resolveLuaScript, 'BeatAnalyzer_Markers.lua', 'text/plain')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{t('web.resolve.download_lua')}</span>
    </button>
  );

  let line: React.ReactNode;
  let action: React.ReactNode = null;
  if (status === undefined) {
    line = t('web.resolve.checking');
  } else if (status === null) {
    line = (
      <>
        {t('web.resolve.no_server')}{' '}
        <code className="text-rose-300 break-all">
          %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\
        </code>
      </>
    );
    action = downloadScript;
  } else if (status.state === 'current') {
    line = (
      <span className="flex items-center gap-1.5 text-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t('web.resolve.current', { version: status.version })}
      </span>
    );
  } else {
    line = !status.resolveFound
      ? t('web.resolve.not_found')
      : status.legacyInstalled
      ? t('web.resolve.legacy')
      : status.state === 'outdated'
      ? t('web.resolve.outdated', { installed: status.installedVersion || '?', version: status.version })
      : t('web.resolve.not_installed');
    action = (
      <button
        onClick={install}
        disabled={busy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-60 cursor-pointer"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlugZap className="w-3.5 h-3.5" />}
        <span>{status.state === 'outdated' ? t('web.resolve.update') : t('web.resolve.install')}</span>
      </button>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-slate-300 leading-relaxed flex-1 min-w-[200px]">
          <span className="font-semibold text-slate-200">{t('web.resolve.script')} </span>
          {line}
        </div>
        {action}
      </div>
      {status && status.state === 'current' && (
        <p className="text-slate-500 break-all">{t('web.resolve.restart')}</p>
      )}
      {error && <p className="text-rose-300">{error}</p>}
    </div>
  );
};

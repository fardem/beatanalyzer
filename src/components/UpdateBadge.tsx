import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, Loader2 } from 'lucide-react';
import { applyUpdate, checkUpdate, UpdateInfo } from '../utils/localBackend';
import { useI18n } from '../i18n';

declare const __APP_VERSION__: string;

/** Version in the header; with the local server it checks GitHub for a newer release and installs it. */
export const UpdateBadge: React.FC = () => {
  const { t } = useI18n();
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    checkUpdate().then(setInfo).catch(() => setInfo(null));
  }, []);

  const runUpdate = async () => {
    if (!info?.latest) return;
    if (!window.confirm(t('web.update.confirm', { version: info.latest ?? '' }))) {
      return;
    }
    setBusy(true);
    try {
      const r = await applyUpdate();
      setMessage(r ? r.message : t('web.error.no_server'));
      if (r?.updated) setInfo({ ...info, available: false, current: r.version });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono text-slate-500" title={info?.error || undefined}>
        v{info?.current || __APP_VERSION__}
      </span>
      {info?.available && (
        <button
          onClick={runUpdate}
          disabled={busy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800 hover:bg-emerald-900/60 disabled:opacity-60 cursor-pointer"
          title={t('web.update.tip')}
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpCircle className="w-3 h-3" />}
          <span>{busy ? t('web.update.running') : t('web.update.button', { version: info.latest ?? '' })}</span>
        </button>
      )}
      {message && (
        <span role="status" className="text-[11px] text-amber-300 max-w-xs">
          {message}
        </span>
      )}
    </div>
  );
};

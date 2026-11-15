import React, { useState, useEffect } from 'react';
import { FolderSearch, CheckCircle2, AlertTriangle, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';
import { BackendHealth, getBackendHealth, saveFfmpegDir } from '../utils/localBackend';

interface FfmpegDirControlProps {
  backendHealth: BackendHealth | null;
  onHealthUpdated?: (health: BackendHealth) => void;
}

export const FfmpegDirControl: React.FC<FfmpegDirControlProps> = ({
  backendHealth,
  onHealthUpdated,
}) => {
  const [dirInput, setDirInput] = useState<string>(backendHealth?.ffmpeg_dir ?? '');
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setDirInput(backendHealth?.ffmpeg_dir ?? '');
    }
  }, [backendHealth?.ffmpeg_dir, editing]);

  if (!backendHealth) {
    return (
      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
        <strong className="text-slate-200">Hinweis zu ffmpeg:</strong> Im System muss <code className="font-mono">ffmpeg</code> direkt ausführbar sein (<code className="font-mono">PATH</code>). Sobald der lokale Python-Server verbunden ist, kannst du hier bei Bedarf auch einen eigenen <code className="font-mono">ffmpeg</code>-Ordner hinterlegen.
      </div>
    );
  }

  const available = Boolean(backendHealth.ffmpeg_available);
  const showForm = !available || editing;

  const applyDir = async (nextDir: string) => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await saveFfmpegDir(nextDir);
      if (!res) {
        setErrorMsg('Lokaler Python-Server ist nicht erreichbar.');
        return;
      }
      const updated = await getBackendHealth();
      if (updated) {
        onHealthUpdated?.(updated);
      }
      setEditing(false);
      setSuccessMsg(
        nextDir.trim()
          ? `ffmpeg gefunden und aktiv: ${res.ffmpegPath}`
          : res.ffmpegAvailable
          ? `Zurückgesetzt auf System-ffmpeg: ${res.ffmpegPath}`
          : 'Benutzerdefinierter Ordner entfernt (kein ffmpeg im System-PATH gefunden).'
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'ffmpeg-Ordner konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void applyDir(dirInput);
  };

  return (
    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-[11px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {available ? (
          <div className="flex items-start gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">
                ffmpeg ausführbar ({backendHealth.ffmpeg_source === 'custom' ? 'gewählter Ordner' : 'System-PATH'})
              </span>
              {backendHealth.ffmpeg_path && (
                <code className="block text-[10px] text-slate-400 font-mono break-all mt-0.5">
                  {backendHealth.ffmpeg_path}
                </code>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">
                ffmpeg ist im System nicht direkt ausführbar (nicht im PATH).
              </span>
              <span className="block text-amber-200/80 mt-0.5">
                Gib unten den Ordner ein, in dem <code className="font-mono">ffmpeg</code> (oder <code className="font-mono">bin/ffmpeg</code>) liegt — BeatAnalyzer spricht dann <code className="font-mono">ffmpeg</code> direkt aus diesem Verzeichnis an.
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {available && (
            <button
              type="button"
              onClick={() => {
                setEditing((v) => !v);
                setErrorMsg(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {editing ? 'Schließen' : 'Ordner ändern'}
            </button>
          )}
          {backendHealth.ffmpeg_dir && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setDirInput('');
                void applyDir('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Benutzerdefinierten ffmpeg-Ordner zurücksetzen"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <FolderSearch className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={dirInput}
              onChange={(e) => setDirInput(e.target.value)}
              placeholder="z. B. C:\ffmpeg\bin oder C:\Tools\ffmpeg"
              aria-label="FFmpeg-Verzeichnis"
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !dirInput.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Speichern &amp; prüfen</span>
          </button>
        </form>
      )}

      {errorMsg && (
        <div className="flex items-start gap-1.5 text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && !errorMsg && (
        <div className="flex items-start gap-1.5 text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};

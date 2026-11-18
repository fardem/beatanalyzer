import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { AnalysisResult } from '../types/analyzer';
import {
  generateAudacityLabels,
  generateBeatThisJson,
  generateCsv,
  generateMidiClickBlob,
  generateResolveMarkerJson,
  ResolveMarkerOptions,
  downloadTextFile,
  downloadBlob,
  MD_BEAT_THIS_ATTRIBUTION,
} from '../utils/exportUtils';
import { ResolveInstallPanel } from './ResolveInstallPanel';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  Code2,
  Table,
  Music2,
  Film,
  Sparkles,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface ExportModalProps {
  result: AnalysisResult;
  /** cue marks and section changes for the marker JSON and the Audacity labels */
  markerExtras?: ResolveMarkerOptions;
  onClose: () => void;
}

type TabType = 'davinci' | 'audacity' | 'json' | 'midi' | 'csv';

export const ExportModal: React.FC<ExportModalProps> = ({ result, markerExtras, onClose }) => {
  const { t, num, meter } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('davinci');
  const [copied, setCopied] = useState(false);
  const [copiedAttribution, setCopiedAttribution] = useState(false);


  const baseFileName = result.metadata.fileName.replace(/\.[^/.]+$/, '');
  const isMdBeatThis = result.engineInfo?.id === 'md_beat_this';
  const attributionText = result.attribution ?? MD_BEAT_THIS_ATTRIBUTION;

  const resolveJsonContent = generateResolveMarkerJson(result, markerExtras);

  const jsonContent = generateBeatThisJson(result);
  const audacityContent = generateAudacityLabels(result, markerExtras);
  const csvContent = generateCsv(result);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAttribution = () => {
    navigator.clipboard.writeText(attributionText);
    setCopiedAttribution(true);
    setTimeout(() => setCopiedAttribution(false), 2000);
  };

  const handleDownload = () => {
    if (activeTab === 'davinci') {
      downloadTextFile(resolveJsonContent, `${baseFileName}_resolve_markers.json`, 'application/json');
    } else if (activeTab === 'json') {
      downloadTextFile(jsonContent, `${baseFileName}_beat_this.json`, 'application/json');
    } else if (activeTab === 'audacity') {
      downloadTextFile(audacityContent, `${baseFileName}_audacity_labels.txt`, 'text/plain');
    } else if (activeTab === 'csv') {
      downloadTextFile(csvContent, `${baseFileName}_beats.csv`, 'text/csv');
    } else if (activeTab === 'midi') {
      const blob = generateMidiClickBlob(result);
      downloadBlob(blob, `${baseFileName}_click_track.mid`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">{t('web.export.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="grid grid-cols-5 p-2 bg-slate-950/80 border-b border-slate-800 gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('davinci')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'davinci'
                ? 'bg-rose-950 text-rose-300 border border-rose-800/80 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4 text-rose-400" />
            <span>DaVinci Resolve</span>
          </button>

          <button
            onClick={() => setActiveTab('audacity')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audacity'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audacity</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>beat_this JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('midi')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'midi'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music2 className="w-4 h-4" />
            <span>MIDI (.mid)</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'csv'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-4">
          {isMdBeatThis && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/60 font-sans text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold">
                    {t('web.export.attribution_required')}
                  </div>
                  <div className="text-[11px] text-amber-200/80">{attributionText}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyAttribution}
                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-amber-900/50 hover:bg-amber-900/80 text-amber-100 border border-amber-700/60 transition-colors cursor-pointer"
              >
                {copiedAttribution ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('web.export.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('web.export.copy_attribution')}</span>
                  </>
                )}
              </button>
            </div>
          )}
          {/* 1. DaVinci Resolve Marker Tab */}
          {activeTab === 'davinci' && (
            <div className="space-y-4 font-sans">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <Film className="w-4 h-4 text-rose-400" />
                  <span>{t('web.export.resolve_title')}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {t('web.export.resolve_intro')}
                </p>
                {((markerExtras?.cues?.length ?? 0) > 0 || (markerExtras?.sections?.length ?? 0) > 0) && (
                  <p className="text-xs leading-relaxed text-yellow-200/90">
                    {t('web.export.resolve_extras', {
                      cues: markerExtras?.cues?.length ?? 0,
                      sections: markerExtras?.sections?.length ?? 0,
                    })}
                  </p>
                )}
              </div>


              <ResolveInstallPanel />

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>{t('web.export.resolve_steps')}</span>
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-slate-300 leading-relaxed">
                  <li>
                    {t('web.export.step_install')}
                  </li>
                  <li>
                    <strong>{t('web.export.step_download')}</strong>
                  </li>
                  <li>
                    {t('web.export.step_select')} <code className="text-rose-300">{result.metadata.fileName}</code>.
                  </li>
                  <li>
                    <code className="text-rose-300 bg-slate-900 px-1.5 py-0.5 rounded">
                      Workspace → Scripts → BeatAnalyzer_Markers
                    </code>{' '}
                    {t('web.export.step_open', { way: t('plugin.way_json') })}
                  </li>
                </ol>
                {result.resolveOffset ? (
                  // test 0.2.4: the correction for MP3 was not visible anywhere in the web app
                  <p className="rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-3 py-2 text-cyan-200 leading-relaxed">
                    <strong>MP3:</strong> {t('web.export.mp3_offset', { ms: Math.round(result.resolveOffset * 1000) })}
                  </p>
                ) : null}
                <p className="text-slate-500 leading-relaxed">
                  {t('web.export.resolve_more', { srt: `${result.metadata.fileName.replace(/\.[^/.]+$/, '')}.srt` })}
                </p>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>{t('web.export.preview')}</span>
                  <span>{result.totalBeats} Marker</span>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-rose-300 max-h-36">
                  {resolveJsonContent.split('\n').slice(0, 24).join('\n')}
                  {'\n...'}
                </pre>
              </div>
            </div>
          )}

          {/* 2. Audacity Labels Tab */}
          {activeTab === 'audacity' && (
            <div className="space-y-2">
              <div className="text-slate-400 leading-relaxed font-sans text-xs">
                {t('web.export.audacity')}
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-emerald-300 max-h-72">
                {audacityContent}
              </pre>
            </div>
          )}

          {/* 3. JSON Tab */}
          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>{t('web.export.json_title')}</span>
                <span>{t('web.export.json_count', { beats: result.totalBeats, bars: result.totalBars })}</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-cyan-300 max-h-72">
                {jsonContent}
              </pre>
            </div>
          )}

          {/* 4. MIDI Tab */}
          {activeTab === 'midi' && (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-cyan-400 mx-auto">
                <Music2 className="w-6 h-6" />
              </div>
              <div className="font-sans space-y-1">
                <h4 className="text-sm font-bold text-white">{t('web.export.midi_title')}</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {t('web.export.midi_text', { bpm: num(result.globalBpm, 1), meter: meter(result.timeSignature.name) })}
                </p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {t('web.export.midi_compat')}
              </div>
            </div>
          )}

          {/* 5. CSV Tab */}
          {activeTab === 'csv' && (
            <div className="space-y-2">
              <div className="text-slate-400 font-sans text-xs">
                {t('web.export.csv')}
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-amber-300 max-h-72">
                {csvContent}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          {activeTab === 'davinci' ? (
            <div />
          ) : activeTab !== 'midi' ? (
            <button
              onClick={() =>
                handleCopy(
                  activeTab === 'json'
                    ? jsonContent
                    : activeTab === 'audacity'
                    ? audacityContent
                    : csvContent
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t('web.export.copied') : t('web.export.copy')}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t('web.common.close')}
            </button>
            <button
              onClick={handleDownload}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all cursor-pointer ${
                activeTab === 'davinci'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-rose-950'
                  : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-indigo-950'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {activeTab === 'davinci' ? t('web.export.download_markers') : t('web.export.download')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AnalysisResult } from '../types/analyzer';
import {
  generateAudacityLabels,
  generateBeatThisJson,
  generateCsv,
  generateMidiClickBlob,
  generateDaVinciEdlMarkers,
  generateDaVinciCsvMarkers,
  downloadTextFile,
  downloadBlob,
} from '../utils/exportUtils';
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
} from 'lucide-react';

interface ExportModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

type TabType = 'davinci' | 'audacity' | 'json' | 'midi' | 'csv';

export const ExportModal: React.FC<ExportModalProps> = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('davinci');
  const [copied, setCopied] = useState(false);

  // DaVinci Resolve spezifische Einstellungen
  const [davinciFps, setDavinciFps] = useState<number>(24);
  const [davinciStartHour, setDavinciStartHour] = useState<number>(1); // 1 = 01:00:00:00
  const [davinciOnlyDownbeats, setDavinciOnlyDownbeats] = useState<boolean>(false);

  const baseFileName = result.metadata.fileName.replace(/\.[^/.]+$/, '');

  const davinciEdlContent = generateDaVinciEdlMarkers(result, {
    fps: davinciFps,
    startHour: davinciStartHour,
    onlyDownbeats: davinciOnlyDownbeats,
  });

  const davinciCsvContent = generateDaVinciCsvMarkers(result, {
    fps: davinciFps,
    startHour: davinciStartHour,
    onlyDownbeats: davinciOnlyDownbeats,
  });

  const jsonContent = generateBeatThisJson(result);
  const audacityContent = generateAudacityLabels(result);
  const csvContent = generateCsv(result);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (activeTab === 'davinci') {
      downloadTextFile(
        davinciEdlContent,
        `${baseFileName}_DaVinci_${davinciFps}fps.edl`,
        'text/plain'
      );
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
            <h2 className="text-base font-bold text-white">Analyse-Ergebnisse & Marker exportieren</h2>
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
          {/* 1. DaVinci Resolve Marker Tab */}
          {activeTab === 'davinci' && (
            <div className="space-y-4 font-sans">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <Film className="w-4 h-4 text-rose-400" />
                  <span>DaVinci Resolve Timeline- & Clip-Marker</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Exportiert präzise Marker als <strong>EDL</strong> oder <strong>CSV</strong>. DaVinci Resolve importiert diese direkt auf die Timeline oder über deine Audio- und Videoclips für perfekten Taktschnitt!
                </p>
              </div>

              {/* Marker Options & Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {/* Framerate */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium block">Timeline-Bildrate (FPS):</label>
                  <select
                    value={davinciFps}
                    onChange={(e) => setDavinciFps(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-rose-500 focus:outline-none"
                  >
                    <option value={24}>24 fps (Kino standard)</option>
                    <option value={25}>25 fps (PAL / Europa)</option>
                    <option value={29.97}>29.97 fps (NTSC)</option>
                    <option value={30}>30 fps (Web / Video)</option>
                    <option value={50}>50 fps (PAL High)</option>
                    <option value={59.94}>59.94 fps (NTSC High)</option>
                    <option value={60}>60 fps (Gaming / High FPS)</option>
                  </select>
                </div>

                {/* Start Timecode */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium block">Start-Timecode:</label>
                  <select
                    value={davinciStartHour}
                    onChange={(e) => setDavinciStartHour(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-rose-500 focus:outline-none"
                  >
                    <option value={1}>01:00:00:00 (DaVinci Standard)</option>
                    <option value={0}>00:00:00:00 (Null-Start)</option>
                  </select>
                </div>

                {/* Marker Density Filter */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium block">Marker-Dichte:</label>
                  <select
                    value={davinciOnlyDownbeats ? 'downbeats' : 'all'}
                    onChange={(e) => setDavinciOnlyDownbeats(e.target.value === 'downbeats')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="all">Alle Beats (Rot & Cyan)</option>
                    <option value="downbeats">Nur Taktanfänge (Downbeats)</option>
                  </select>
                </div>
              </div>

              {/* Marker Color Scheme Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-medium">Marker-Farben in DaVinci:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30"></span>
                  <span className="text-slate-200">
                    <strong>Roter Marker</strong> = Downbeat (Takt 1)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30"></span>
                  <span className="text-slate-200">
                    <strong>Cyan Marker</strong> = Beats (2, 3, 4...)
                  </span>
                </div>
              </div>

              {/* Step-by-Step Instructions for DaVinci Resolve */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>So importierst du die Marker in DaVinci Resolve:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-slate-300 leading-relaxed">
                  <li>
                    Lade unten die <strong>.EDL</strong> Datei (oder .CSV) herunter.
                  </li>
                  <li>
                    Öffne dein Projekt in DaVinci Resolve (Edit- oder Fairlight-Page).
                  </li>
                  <li>
                    Rechtsklick auf die gewünschte Timeline im Media Pool (oder im Timeline-Menü):<br />
                    <code className="text-rose-300 bg-slate-900 px-1.5 py-0.5 rounded">
                      Timelines → Importieren → Timeline-Marker aus EDL...
                    </code>
                  </li>
                  <li>
                    Wähle die heruntergeladene Datei aus. Fertig! Alle Beats liegen nun millimetergenau als Marker auf der Timeline über deinem Song.
                  </li>
                </ol>
              </div>

              {/* EDL Preview snippet */}
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>CMX 3600 EDL Vorschau:</span>
                  <span>{davinciOnlyDownbeats ? result.totalBars : result.totalBeats} Marker</span>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-rose-300 max-h-36">
                  {davinciEdlContent.split('\n').slice(0, 16).join('\n')}
                  {'\n... (weitere Marker)'}
                </pre>
              </div>
            </div>
          )}

          {/* 2. Audacity Labels Tab */}
          {activeTab === 'audacity' && (
            <div className="space-y-2">
              <div className="text-slate-400 leading-relaxed font-sans text-xs">
                Audacity Label Track: Importiere diese Textdatei in Audacity (
                <span className="text-cyan-300 font-mono">Spuren → Textspuren importieren</span>
                ), um Marker exakt auf den Beats zu sehen.
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
                <span>CPJKU beat_this kompatible JSON-Struktur</span>
                <span>{result.totalBeats} Beats, {result.totalBars} Takte</span>
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
                <h4 className="text-sm font-bold text-white">Standard MIDI Click-Track Datei</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Enthält Tempo ({result.globalBpm.toFixed(1)} BPM), Taktart (
                  {result.timeSignature.name}) und Woodblock-Percussion Noten (Kanal 10) für jeden Beat und akzentuierten Downbeat.
                </p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Kompatibel mit: Logic Pro, Ableton Live, FL Studio, Cubase, Reaper, Pro Tools
              </div>
            </div>
          )}

          {/* 5. CSV Tab */}
          {activeTab === 'csv' && (
            <div className="space-y-2">
              <div className="text-slate-400 font-sans text-xs">
                CSV-Format für Excel, Google Sheets, Python Pandas oder Audio-DAWs.
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
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  downloadTextFile(
                    davinciCsvContent,
                    `${baseFileName}_DaVinci_Markers.csv`,
                    'text/csv'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors cursor-pointer"
                title="Als DaVinci CSV Marker exportieren"
              >
                <Table className="w-3.5 h-3.5 text-rose-400" />
                <span>Als .CSV laden</span>
              </button>

              <button
                onClick={() => handleCopy(davinciEdlContent)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopiert!' : 'EDL kopieren'}</span>
              </button>
            </div>
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
              <span>{copied ? 'Kopiert!' : 'In Zwischenablage kopieren'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Schließen
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
                {activeTab === 'davinci'
                  ? 'DaVinci EDL Marker herunterladen'
                  : 'Datei herunterladen'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { AnalysisResult, BeatItem } from '../types/analyzer';
import { Search, Play, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface BeatTableProps {
  result: AnalysisResult;
  currentTime: number;
  onSeek: (time: number) => void;
  onUpdateBeats: (beats: BeatItem[]) => void;
}

export const BeatTable: React.FC<BeatTableProps> = ({
  result,
  currentTime,
  onSeek,
  onUpdateBeats,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'downbeats'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  // follow playback: the table pages along with the playing beat
  const [follow, setFollow] = useState<boolean>(true);
  const pageSize = 15;

  const filteredBeats = result.beats.filter((b) => {
    if (filterType === 'downbeats' && !b.isDownbeat) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchBar = `takt ${b.barIndex}`.includes(term) || `${b.barIndex}` === term;
      const matchTime = b.time.toFixed(2).includes(term);
      return matchBar || matchTime;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredBeats.length / pageSize) || 1;

  // the row that is playing: the last listed beat that has started (with "Nur Downbeats": the current bar)
  let currentIndex = -1;
  for (let i = 0; i < filteredBeats.length && filteredBeats[i].time <= currentTime + 0.02; i++) currentIndex = i;
  const currentId = currentIndex >= 0 ? filteredBeats[currentIndex].id : null;
  const followPage = currentIndex >= 0 ? Math.floor(currentIndex / pageSize) + 1 : 1;

  // filterType/searchTerm: their buttons reset the page to 1, following puts it back on the playing beat
  useEffect(() => {
    if (follow) setCurrentPage(followPage);
  }, [follow, followPage, filterType, searchTerm]);

  // paging by hand stops following, otherwise the table would jump straight back
  const goToPage = (p: number) => {
    setFollow(false);
    setCurrentPage(Math.min(totalPages, Math.max(1, p)));
  };
  const currentBeats = filteredBeats.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = (s % 60).toFixed(3);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(6, '0')}`;
  };

  const handleNudge = (beatId: number, deltaSec: number) => {
    const updated = result.beats.map((b) => {
      if (b.id === beatId) {
        const newTime = Math.max(0, b.time + deltaSec);
        return { ...b, time: Math.round(newTime * 1000) / 1000 };
      }
      return b;
    });
    onUpdateBeats(updated);
  };

  const handleToggleDownbeat = (beatId: number) => {
    const updated = result.beats.map((b) => {
      if (b.id === beatId) {
        return {
          ...b,
          isDownbeat: !b.isDownbeat,
          beatInBar: !b.isDownbeat ? 1 : b.beatInBar,
        };
      }
      return b;
    });
    onUpdateBeats(updated);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            Erkannte Beat- & Takt-Tabelle ({filteredBeats.length})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none"
            title="Blättert beim Abspielen selbst auf die Seite des laufenden Beats"
          >
            <input
              type="checkbox"
              className="accent-cyan-500"
              checked={follow}
              onChange={(e) => setFollow(e.target.checked)}
            />
            Mitlaufen
          </label>

          {/* Filter toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alle Beats ({result.totalBeats})
            </button>
            <button
              onClick={() => {
                setFilterType('downbeats');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'downbeats'
                  ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nur Downbeats / Taktanfänge ({result.totalBars})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Takt filtern..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-32 sm:w-40"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Takt.Beat</th>
              <th className="py-2.5 px-3">Zeitpunkt</th>
              <th className="py-2.5 px-3">Intervall</th>
              <th className="py-2.5 px-3">Tempo</th>
              <th className="py-2.5 px-3">Typ</th>
              <th className="py-2.5 px-3">Konfidenz</th>
              <th className="py-2.5 px-3 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {currentBeats.map((b) => {
              const isActive = b.id === currentId;
              return (
                <tr
                  key={b.id}
                  data-current={isActive ? 'true' : undefined}
                  className={`transition-colors hover:bg-slate-800/50 ${
                    isActive ? 'bg-cyan-950/40 text-cyan-200' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-sans">
                    <span className="font-bold text-white">Takt {b.barIndex}</span>
                    <span className="text-slate-500 mx-1">•</span>
                    <span className={b.isDownbeat ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      Beat {b.beatInBar}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-slate-200">
                    {formatSec(b.time)}{' '}
                    <span className="text-[10px] text-slate-500">({b.time.toFixed(3)}s)</span>
                  </td>

                  <td className="py-2 px-3 text-slate-400">
                    {b.deltaMs > 0 ? `${b.deltaMs} ms` : '—'}
                  </td>

                  <td className="py-2 px-3">
                    <span className="font-semibold text-cyan-400">
                      {b.instantBpm.toFixed(1)}
                    </span>{' '}
                    <span className="text-[10px] text-slate-500">BPM</span>
                  </td>

                  <td className="py-2 px-3">
                    {b.isDownbeat ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/80">
                        Downbeat (1)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                        Beat {b.beatInBar}
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-3">
                    {b.confidence === null ? (
                      <span className="text-[10px] text-slate-500">–</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full"
                            style={{ width: `${Math.round(b.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {Math.round(b.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-3 text-right space-x-1">
                    <button
                      onClick={() => onSeek(b.time)}
                      className="p-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Abspielen ab diesem Beat"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <button
                      onClick={() => handleNudge(b.id, -0.01)}
                      className="px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="-10ms justieren"
                    >
                      -10ms
                    </button>
                    <button
                      onClick={() => handleNudge(b.id, 0.01)}
                      className="px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="+10ms justieren"
                    >
                      +10ms
                    </button>
                    <button
                      onClick={() => handleToggleDownbeat(b.id)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Downbeat Status umschalten"
                    >
                      1/X
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Seite {currentPage} von {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

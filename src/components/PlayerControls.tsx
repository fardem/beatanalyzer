import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Fingerprint,
  Repeat,
  Gauge,
  Music,
} from 'lucide-react';
import { BeatItem, PlaybackSpeed } from '../types/analyzer';
import { useI18n } from '../i18n';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  activeBeat: BeatItem | null;
  playbackSpeed: PlaybackSpeed;
  metronomeEnabled: boolean;
  metronomeVolume: number;
  globalBpm: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onSetPlaybackSpeed: (speed: PlaybackSpeed) => void;
  onToggleMetronome: () => void;
  onSetMetronomeVolume: (vol: number) => void;
  /** volume of the song 0 ... 1 */
  musicVolume: number;
  onSetMusicVolume: (vol: number) => void;
  songMuted: boolean;
  onToggleSongMuted: () => void;
  /** off, the section shown in the waveform, or the whole song; a click goes to the next mode */
  loopMode: 'off' | 'view' | 'song';
  onCycleLoop: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  activeBeat,
  playbackSpeed,
  metronomeEnabled,
  metronomeVolume,
  globalBpm,
  onPlay,
  onPause,
  onSeek,
  onSetPlaybackSpeed,
  onToggleMetronome,
  onSetMetronomeVolume,
  musicVolume,
  onSetMusicVolume,
  songMuted,
  onToggleSongMuted,
  loopMode,
  onCycleLoop,
}) => {
  const { t, num, pctValue } = useI18n();
  // Tap tempo state
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tappedBpm, setTappedBpm] = useState<number | null>(null);
  const [tapDiffPercent, setTapDiffPercent] = useState<number | null>(null);
  const tapResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcut: Space for Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          onPause();
        } else {
          onPlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onPlay, onPause]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const handleTap = () => {
    const now = performance.now();
    if (tapResetTimerRef.current) clearTimeout(tapResetTimerRef.current);

    const newTaps = [...tapTimes, now].filter((t) => now - t < 3000); // keep last 3 seconds
    setTapTimes(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push((newTaps[i] - newTaps[i - 1]) / 1000);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval > 0.15) {
        const calculatedBpm = Math.round(60 / avgInterval);
        setTappedBpm(calculatedBpm);

        const diff = Math.abs(calculatedBpm - globalBpm);
        const percent = Math.round((1 - diff / globalBpm) * 100);
        setTapDiffPercent(Math.max(0, percent));
      }
    }

    // Auto reset tap state after 3.5s of inactivity
    tapResetTimerRef.current = setTimeout(() => {
      setTapTimes([]);
    }, 3500);
  };

  const speeds: PlaybackSpeed[] = [0.5, 0.75, 1.0, 1.25, 1.5];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSeek(0)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('web.player.to_start')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSeek(Math.max(0, currentTime - 5))}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('web.player.back5')}
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? t('web.player.pause') : t('web.player.play')}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            )}
          </button>

          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 5))}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('web.player.fwd5')}
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Loop: off -> section of the waveform -> whole song -> off. A symbol instead of text (wish of the user);
              the mode is in the tooltip and shown by colour and the small "A-B" for the section */}
          <button
            onClick={onCycleLoop}
            aria-pressed={loopMode !== 'off'}
            aria-label={`${t('web.player.loop_off')}: ${t(`web.player.loop_${loopMode}`)}`}
            className={`relative w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              loopMode === 'off'
                ? 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
                : loopMode === 'view'
                ? 'text-amber-300 bg-amber-950/60 border-amber-700/70'
                : 'text-emerald-300 bg-emerald-950/60 border-emerald-700/70'
            }`}
            title={t(`web.player.loop_${loopMode}_tip`)}
          >
            <Repeat className="w-[18px] h-[18px]" strokeWidth={2.25} />
            {loopMode === 'view' && (
              <span className="absolute -bottom-1 -right-1 px-0.5 rounded bg-amber-500 text-[8px] leading-[10px] font-bold text-slate-950">
                A-B
              </span>
            )}
          </button>

          {/* Time Display */}
          <div className="font-mono text-xs sm:text-sm text-slate-300 ml-2">
            <span className="text-white font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-slate-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Live Beat Flash LED / Indicator: two lines in a fixed size ("Ölçü 35" / "Downbeat (Beat 1)"), so the row
            neither wraps on and off with every downbeat nor needs the width of the longest text (test 0.2.8) */}
        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 w-[10.5rem] h-12 shrink-0 overflow-hidden">
          <div className="relative flex items-center justify-center shrink-0">
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-100 ${
                activeBeat
                  ? activeBeat.isDownbeat
                    ? 'bg-rose-500 ring-4 ring-rose-500/40 scale-125 shadow-lg shadow-rose-500'
                    : 'bg-cyan-400 ring-2 ring-cyan-400/40 scale-110 shadow-sm shadow-cyan-400'
                  : 'bg-slate-700'
              }`}
            />
          </div>

          <div className="text-xs leading-tight min-w-0">
            {activeBeat ? (
              <>
                <div className={`font-bold truncate ${activeBeat.isDownbeat ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {t('output.marker_downbeat', { bar: activeBeat.barIndex })}
                </div>
                {/* glossary: Downbeat stays English; the downbeat is beat 1 of the bar */}
                <div className="text-slate-200 font-mono text-[11px] whitespace-nowrap">
                  {activeBeat.isDownbeat ? (
                    <>
                      <span className="text-rose-300 font-bold">Downbeat</span> (Beat {activeBeat.beatInBar})
                    </>
                  ) : (
                    <>Beat {activeBeat.beatInBar}</>
                  )}
                </div>
              </>
            ) : (
              <span className="text-slate-500 font-mono text-[11px]">{t('web.player.ready')}</span>
            )}
          </div>
        </div>

        {/* Metronome Sound & Speed Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* volume of the song; song, metronome and speed are all h-10 (test 0.2.9: different heights) */}
          <div className="flex items-center gap-2 h-10 bg-slate-950/60 border border-slate-800 rounded-xl px-3">
            {/* the note mutes the song – only the metronome is heard (test 0.6.0 b1) */}
            <button
              type="button"
              onClick={onToggleSongMuted}
              aria-pressed={songMuted}
              aria-label={songMuted ? t('web.player.song_unmute') : t('web.player.song_mute')}
              title={songMuted ? t('web.player.song_unmute') : t('web.player.song_mute')}
              className={`inline-flex items-center gap-2 rounded-md px-1 -mx-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                songMuted ? 'text-rose-300' : 'text-slate-300 hover:text-white'
              }`}
            >
              {songMuted ? <VolumeX className="w-4 h-4" /> : <Music className="w-4 h-4 text-indigo-300" />}
              <span className={`text-xs font-medium hidden sm:inline ${songMuted ? 'line-through' : ''}`}>{t('web.player.song')}</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={(e) => onSetMusicVolume(parseFloat(e.target.value))}
              disabled={songMuted}
              className="w-16 accent-indigo-400 cursor-pointer disabled:opacity-40"
              title={t('web.player.song_volume')}
              aria-label={t('web.player.song_volume')}
            />
          </div>

          {/* Metronome toggle & volume */}
          <div className="flex items-center gap-2 h-10 bg-slate-950/60 border border-slate-800 rounded-xl px-3">
            <button
              onClick={onToggleMetronome}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                metronomeEnabled
                  ? 'text-cyan-400 hover:text-cyan-300 bg-cyan-950/50'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={metronomeEnabled ? t('web.player.metronome_off') : t('web.player.metronome_on')}
            >
              {metronomeEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <span className="text-xs font-medium text-slate-300 hidden sm:inline">{t('web.player.metronome')}</span>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={metronomeEnabled ? metronomeVolume : 0}
              onChange={(e) => onSetMetronomeVolume(parseFloat(e.target.value))}
              disabled={!metronomeEnabled}
              className="w-16 accent-cyan-400 cursor-pointer disabled:opacity-30"
              title={t('web.player.metronome_volume')}
            />
          </div>

          {/* Speed: one field instead of five buttons, so the player stays one row */}
          <label
            className="flex items-center gap-1.5 h-10 shrink-0 bg-slate-950/60 border border-slate-800 rounded-xl pl-3 pr-2 text-xs text-slate-300"
            title={t('web.player.speed')}
          >
            <Gauge className="w-4 h-4 text-indigo-300" />
            <select
              value={playbackSpeed}
              onChange={(e) => onSetPlaybackSpeed(parseFloat(e.target.value) as PlaybackSpeed)}
              className="bg-transparent font-mono text-slate-200 focus:outline-none cursor-pointer min-w-[4.25rem] h-full"
              aria-label={t('web.player.speed')}
            >
              {speeds.map((sp) => (
                <option key={sp} value={sp} className="bg-slate-900">
                  {sp}x
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Tap-Tempo Live Verification Tool */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title={t('web.player.tap_tip')}
          >
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{t('web.player.tap')}</span>
          </button>
          <span className="text-slate-400 hidden sm:inline">
            {t('web.player.tap_hint')}
          </span>
        </div>

        {tappedBpm && (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 font-mono">
            <span className="text-slate-400">{t('web.player.your_tap')}</span>
            <span className="text-cyan-400 font-bold">{tappedBpm} BPM</span>
            <span className="text-slate-600">vs</span>
            <span className="text-white font-bold">{num(globalBpm, 0)} BPM</span>
            {tapDiffPercent !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  tapDiffPercent >= 90
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {t('web.player.match', { pct: pctValue(tapDiffPercent) })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

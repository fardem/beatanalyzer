import { BeatItem } from '../types/analyzer';
import { planClicks } from './clickSchedule';

const SCHEDULE_EVERY_MS = 25;   // how often the next clicks are planned
const SCHEDULE_AHEAD_S = 0.12;   // how far ahead (playback seconds)

/**
 * Web Audio Playback Engine with Synchronized Metronome Click
 * Clicks (higher on the downbeat) are planned ahead and started on the exact AudioContext time of their beat,
 * sample-exact with the music; the drawing loop only updates the position and the active beat.
 */

export class BeatPlayer {
  private ctx: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private metronomeGain: GainNode | null = null;

  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private playbackRate: number = 1.0;
  private metronomeEnabled: boolean = true;
  private metronomeVolume: number = 0.6;
  private musicVolume: number = 1.0;
  // loop range in seconds (section of the waveform or the whole song); the source loops sample-exact
  private loop: { start: number; end: number } | null = null;
  private lastTickTime: number = 0;

  private beats: BeatItem[] = [];
  private nextBeatIndex: number = 0;
  private animFrameId: number | null = null;
  private scheduleTimer: ReturnType<typeof setInterval> | null = null;
  private plannedUntil = 0;   // playback position up to which clicks are planned
  private scheduled: OscillatorNode[] = [];

  public onTimeUpdate?: (currentTime: number, progress: number) => void;
  public onBeatTrigger?: (beat: BeatItem) => void;
  public onEnded?: () => void;

  constructor() {
    // Lazy init audio context on first user interaction
  }

  private initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.analyserNode = null;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.analyserNode) {
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 4096;
      this.analyserNode.smoothingTimeConstant = 0.72;
      this.analyserNode.minDecibels = -85;
      this.analyserNode.maxDecibels = -10;
    }
    return this.ctx;
  }

  public loadBuffer(buffer: AudioBuffer, beats: BeatItem[]) {
    this.stop();
    this.audioBuffer = buffer;
    this.beats = [...beats].sort((a, b) => a.time - b.time);
    this.pauseOffset = 0;
    this.nextBeatIndex = 0;
  }

  public updateBeats(beats: BeatItem[]) {
    this.beats = [...beats].sort((a, b) => a.time - b.time);
    this.updateNextBeatIndex(this.getCurrentTime());
    if (this.isPlaying) this.replanClicks();
  }

  public play(fromTime?: number) {
    if (!this.audioBuffer) return;
    const ctx = this.initContext();

    if (this.isPlaying) {
      this.stopSource();
    }

    if (fromTime !== undefined) {
      this.pauseOffset = Math.max(0, Math.min(fromTime, this.audioBuffer.duration));
    }

    if (this.pauseOffset >= this.audioBuffer.duration) {
      this.pauseOffset = 0;
    }

    this.sourceNode = ctx.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.playbackRate.value = this.playbackRate;
    if (this.loop) {
      this.sourceNode.loop = true;
      this.sourceNode.loopStart = this.loop.start;
      this.sourceNode.loopEnd = this.loop.end;
    }

    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = this.musicVolume;

    this.metronomeGain = ctx.createGain();
    this.metronomeGain.gain.value = this.metronomeEnabled ? this.metronomeVolume : 0;

    if (this.analyserNode) {
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.gainNode);
    } else {
      this.sourceNode.connect(this.gainNode);
    }
    this.gainNode.connect(ctx.destination);
    this.metronomeGain.connect(ctx.destination);

    this.startTime = ctx.currentTime - this.pauseOffset / this.playbackRate;
    this.sourceNode.start(0, this.pauseOffset);
    this.isPlaying = true;

    this.updateNextBeatIndex(this.pauseOffset);
    this.lastTickTime = this.pauseOffset;

    this.sourceNode.onended = () => {
      if (this.isPlaying && this.getCurrentTime() >= (this.audioBuffer?.duration || 0) - 0.1) {
        this.isPlaying = false;
        this.pauseOffset = 0;
        this.cancelLoop();
        this.stopScheduler();
        this.onEnded?.();
      }
    };

    this.startLoop();
    this.replanClicks();
    this.startScheduler();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.pauseOffset = this.getCurrentTime();
    this.stopSource();
    this.isPlaying = false;
    this.cancelLoop();
  }

  public stop() {
    this.stopSource();
    this.isPlaying = false;
    this.pauseOffset = 0;
    this.nextBeatIndex = 0;
    this.cancelLoop();
    this.onTimeUpdate?.(0, 0);
  }

  public seek(targetTime: number) {
    const wasPlaying = this.isPlaying;
    const dur = this.audioBuffer ? this.audioBuffer.duration : 1;
    const clamped = Math.max(0, Math.min(targetTime, dur));

    this.pauseOffset = clamped;
    this.updateNextBeatIndex(clamped);

    if (wasPlaying) {
      this.play(clamped);
    } else {
      this.onTimeUpdate?.(clamped, clamped / (dur || 1));
    }
  }

  public setPlaybackRate(rate: number) {
    if (this.sourceNode && this.ctx) {
      const current = this.getCurrentTime();   // with the old rate
      this.playbackRate = rate;
      this.sourceNode.playbackRate.value = rate;
      this.startTime = this.ctx.currentTime - current / rate;
      this.replanClicks();
    } else {
      this.playbackRate = rate;
    }
  }

  public setMetronomeEnabled(enabled: boolean) {
    this.metronomeEnabled = enabled;
    if (this.metronomeGain) {
      this.metronomeGain.gain.value = enabled ? this.metronomeVolume : 0;
    }
  }

  public setMetronomeVolume(vol: number) {
    this.metronomeVolume = Math.max(0, Math.min(1, vol));
    if (this.metronomeGain && this.metronomeEnabled) {
      this.metronomeGain.gain.value = this.metronomeVolume;
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.gainNode) this.gainNode.gain.value = this.musicVolume;
  }

  /** Loop a range (seconds) or stop looping (null). Outside the range playback jumps to its start. */
  public setLoop(range: { start: number; end: number } | null) {
    const dur = this.audioBuffer?.duration ?? 0;
    this.loop = range && range.end - range.start > 0.05
      ? { start: Math.max(0, range.start), end: Math.min(dur || range.end, range.end) }
      : null;
    let t = this.getCurrentTime();
    if (this.loop && (t < this.loop.start || t >= this.loop.end)) t = this.loop.start;
    if (this.isPlaying) {
      this.play(t);   // a new source with the loop points
    } else {
      this.pauseOffset = t;
      this.updateNextBeatIndex(t);
      this.onTimeUpdate?.(t, t / (dur || 1));
    }
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.ctx) {
      return this.pauseOffset;
    }
    const elapsed = Math.max(0, (this.ctx.currentTime - this.startTime) * this.playbackRate);
    // the source started inside the loop: after loopEnd it continues at loopStart
    if (this.loop && elapsed >= this.loop.end) {
      const len = this.loop.end - this.loop.start;
      return this.loop.start + ((elapsed - this.loop.end) % len);
    }
    return elapsed;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getSpectrumConfig(): { binCount: number; sampleRate: number; minDecibels: number; maxDecibels: number } {
    return {
      binCount: this.analyserNode?.frequencyBinCount ?? 2048,
      sampleRate: this.ctx?.sampleRate ?? 44100,
      minDecibels: this.analyserNode?.minDecibels ?? -85,
      maxDecibels: this.analyserNode?.maxDecibels ?? -10,
    };
  }

  public readFrequencyData(target: Float32Array<ArrayBuffer>): boolean {
    if (!this.analyserNode || !this.isPlaying || target.length < this.analyserNode.frequencyBinCount) {
      return false;
    }
    this.analyserNode.getFloatFrequencyData(target);
    return true;
  }

  private stopSource() {
    this.stopScheduler();
    this.cancelClicks();
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch {
        // Ignore if already stopped
      }
      this.sourceNode = null;
    }
  }

  private updateNextBeatIndex(currentTime: number) {
    let idx = 0;
    while (idx < this.beats.length && this.beats[idx].time < currentTime - 0.02) {
      idx++;
    }
    this.nextBeatIndex = idx;
  }

  private startLoop() {
    this.cancelLoop();
    const tick = () => {
      if (!this.isPlaying || !this.audioBuffer) return;

      const curTime = this.getCurrentTime();
      if (curTime < this.lastTickTime - 0.05) this.updateNextBeatIndex(curTime);   // the loop jumped back
      this.lastTickTime = curTime;
      const progress = curTime / this.audioBuffer.duration;
      this.onTimeUpdate?.(curTime, progress);

      // Check for metronome beat trigger
      while (
        this.nextBeatIndex < this.beats.length &&
        this.beats[this.nextBeatIndex].time <= curTime + 0.025
      ) {
        const beat = this.beats[this.nextBeatIndex];
        // Trigger beat if within 100ms
        if (curTime - beat.time < 0.12) this.onBeatTrigger?.(beat);   // display only; clicks are planned
        this.nextBeatIndex++;
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  private cancelLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /** playback position counting on past a loop end (see planClicks): (ctx time − start) × rate */
  private position(): number {
    if (!this.ctx) return this.pauseOffset;
    return Math.max(0, (this.ctx.currentTime - this.startTime) * this.playbackRate);
  }

  private startScheduler() {
    this.stopScheduler();
    this.scheduleTimer = setInterval(() => this.scheduleClicks(), SCHEDULE_EVERY_MS);
  }

  private stopScheduler() {
    if (this.scheduleTimer !== null) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = null;
    }
  }

  /** drops the planned clicks and plans again from the current position (seek, tempo, new beats) */
  private replanClicks() {
    this.cancelClicks();
    this.plannedUntil = this.position();
    this.scheduleClicks();
  }

  private cancelClicks() {
    for (const osc of this.scheduled) {
      try {
        osc.stop(0);
        osc.disconnect();
      } catch {
        // already ended
      }
    }
    this.scheduled = [];
  }

  private scheduleClicks() {
    if (!this.isPlaying || !this.ctx) return;
    const until = this.position() + SCHEDULE_AHEAD_S * this.playbackRate;
    if (until <= this.plannedUntil) return;
    const now = this.ctx.currentTime;
    for (const c of planClicks(this.beats, this.plannedUntil, until, this.loop)) {
      const when = this.startTime + c.at / this.playbackRate;
      if (when < now - 0.01) continue;   // missed (tab was in the background): no late click
      this.playClickSound(c.downbeat, Math.max(when, now));
    }
    this.plannedUntil = until;
  }

  /**
   * Synthesized woodblock click at the AudioContext time `when`:
   * downbeat 1280 Hz triangle with more punch, other beats 850 Hz sine.
   */
  private playClickSound(isDownbeat: boolean, when: number) {
    if (!this.ctx || !this.metronomeGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();

      const baseFreq = isDownbeat ? 1280 : 850;
      const duration = isDownbeat ? 0.045 : 0.03;

      osc.type = isDownbeat ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, when);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, when + duration);

      env.gain.setValueAtTime(isDownbeat ? 1.0 : 0.65, when);
      env.gain.exponentialRampToValueAtTime(0.001, when + duration);

      osc.connect(env);
      env.connect(this.metronomeGain);

      osc.start(when);
      osc.stop(when + duration);
      this.scheduled.push(osc);
      osc.onended = () => {
        const i = this.scheduled.indexOf(osc);
        if (i >= 0) this.scheduled.splice(i, 1);
      };
    } catch {
      // AudioContext state error safety
    }
  }

  public destroy() {
    this.stop();
    this.analyserNode = null;
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // Safe ignore
      }
      this.ctx = null;
    }
  }
}

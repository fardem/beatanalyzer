export interface BeatItem {
  id: number;
  time: number; // in seconds
  beatInBar: number; // 1, 2, 3, 4 (1 = downbeat)
  barIndex: number; // 1, 2, 3...
  isDownbeat: boolean;
  confidence: number | null; // 0.0 to 1.0 from beat_this; null without beat_this
  instantBpm: number;
  deltaMs: number; // interval from previous beat in ms
}

export interface ActivationPoint {
  time: number;
  beatActivation: number; // 0.0 to 1.0
  downbeatActivation: number | null; // 0.0 to 1.0; null when there is no downbeat curve
}

export interface AudioMetadata {
  fileName: string;
  fileSize: number;
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
}

export interface EngineInfo {
  id: 'beat_this' | 'librosa';
  device: 'cuda' | 'cpu' | null;
  gpu: string | null;
  fallbackReason: 'not_installed' | 'model_load_failed' | 'inference_failed' | null;
}

export interface AnalysisResult {
  engine?: string;
  engineInfo?: EngineInfo;
  activationSource?: 'beat_this' | 'onset'; // beat_this probabilities or librosa/browser onset strength
  metadata: AudioMetadata;
  beats: BeatItem[];
  downbeats: BeatItem[];
  globalBpm: number;
  averageBpm: number;
  medianBpm: number;
  minBpm: number;
  maxBpm: number;
  tempoStability: number; // percentage (0-100)
  timeSignature: {
    numerator: number;
    denominator: number;
    name: string;
    barShare: number | null; // share of bars with this beat count in percent; null with fewer than 2 downbeats
  };
  swingRatio: number; // 50% = straight, ~66% = triplet swing
  totalBeats: number;
  totalBars: number;
  activationCurve: ActivationPoint[];
  waveformPeaks: Float32Array; // min-max peak pairs
  waveformDuration: number;
}

export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5;

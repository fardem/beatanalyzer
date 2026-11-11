export interface BeatItem {
  id: number;
  time: number; // in seconds
  beatInBar: number; // 1, 2, 3, 4 (1 = downbeat)
  barIndex: number; // 1, 2, 3...
  isDownbeat: boolean;
  confidence: number; // 0.0 to 1.0
  instantBpm: number;
  deltaMs: number; // interval from previous beat in ms
}

export interface ActivationPoint {
  time: number;
  beatActivation: number; // 0.0 to 1.0
  downbeatActivation: number; // 0.0 to 1.0
}

export interface AudioMetadata {
  fileName: string;
  fileSize: number;
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
}

export interface AnalysisResult {
  engine?: string;
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
    confidence: number; // 0-100%
  };
  swingRatio: number; // 50% = straight, ~66% = triplet swing
  totalBeats: number;
  totalBars: number;
  activationCurve: ActivationPoint[];
  waveformPeaks: Float32Array; // min-max peak pairs
  waveformDuration: number;
}

export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5;

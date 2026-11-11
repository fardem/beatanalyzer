/**
 * Procedural Audio Synthesizer for Demo Tracks
 * Generates valid PCM WAV Blobs for immediate analysis testing
 * across different tempos (85 BPM to 150 BPM) and meters (4/4, 3/4).
 */

export interface SampleTrackMeta {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  meter: string;
  duration: number; // seconds
  description: string;
}

export const SAMPLE_TRACKS: SampleTrackMeta[] = [
  {
    id: 'house_126',
    name: 'Electro Club Drive',
    genre: 'Electronic / House',
    bpm: 126,
    meter: '4/4',
    duration: 16,
    description: 'Klassischer 4-on-the-Floor Beat mit starkem Kick auf jedem Beat, Snare/Clap auf 2 & 4.',
  },
  {
    id: 'waltz_150',
    name: 'Wiener Walzer Elegance',
    genre: 'Klassik / Walzer',
    bpm: 150,
    meter: '3/4',
    duration: 15,
    description: 'Ausgeprägter 3/4-Takt (Boom-Tschack-Tschack) mit betonter Eins zur Verifikation der Taktarterkennung.',
  },
  {
    id: 'funk_108',
    name: 'Midnight Funk Session',
    genre: 'Funk & Soul',
    bpm: 108,
    meter: '4/4 (Swing)',
    duration: 18,
    description: 'Synkopierter Bassgroove, Ghost Notes und leichtes Swing-Feeling.',
  },
  {
    id: 'lofi_85',
    name: 'Chill Coffee Lo-Fi',
    genre: 'Lo-Fi Hip Hop',
    bpm: 85,
    meter: '4/4',
    duration: 20,
    description: 'Entspannter Downtempo Boom-Bap mit warmen Rhodes-Akkorden.',
  },
];

export function generateSampleWavBlob(trackId: string): Blob {
  const meta = SAMPLE_TRACKS.find((t) => t.id === trackId) || SAMPLE_TRACKS[0];
  const sampleRate = 44100;
  const numChannels = 2;
  const totalSamples = Math.floor(sampleRate * meta.duration);

  const leftChannel = new Float32Array(totalSamples);
  const rightChannel = new Float32Array(totalSamples);

  const bpm = meta.bpm;
  const beatIntervalSec = 60 / bpm;
  const beatIntervalSamples = Math.floor(sampleRate * beatIntervalSec);
  const isWaltz = meta.meter.startsWith('3/4');
  const meterBeats = isWaltz ? 3 : 4;

  const totalBeats = Math.floor(totalSamples / beatIntervalSamples);

  for (let b = 0; b < totalBeats; b++) {
    const beatStart = b * beatIntervalSamples;
    const beatInBar = (b % meterBeats) + 1;
    const isDownbeat = beatInBar === 1;

    // 1. Kick Drum (Stronger on Downbeat)
    const kickSamples = Math.floor(sampleRate * 0.35);
    const kickFreqStart = isDownbeat ? 140 : 110;
    const kickFreqEnd = 40;
    const kickAmp = isDownbeat ? 0.85 : (isWaltz ? 0.3 : 0.65);

    for (let i = 0; i < kickSamples && beatStart + i < totalSamples; i++) {
      const t = i / sampleRate;
      const progress = i / kickSamples;
      const freq = kickFreqStart * Math.exp(-progress * 7) + kickFreqEnd;
      const env = Math.pow(1 - progress, 2);
      const val = Math.sin(2 * Math.PI * freq * t) * env * kickAmp;
      leftChannel[beatStart + i] += val * 0.9;
      rightChannel[beatStart + i] += val * 0.9;
    }

    // 2. Snare / Chord on backbeats
    if (!isWaltz && (beatInBar === 2 || beatInBar === 4)) {
      const snareSamples = Math.floor(sampleRate * 0.25);
      for (let i = 0; i < snareSamples && beatStart + i < totalSamples; i++) {
        const progress = i / snareSamples;
        const env = Math.pow(1 - progress, 2.5);
        // Noise + body
        const noise = (Math.random() * 2 - 1) * 0.45;
        const body = Math.sin(2 * Math.PI * 190 * (i / sampleRate)) * 0.4;
        const val = (noise + body) * env;
        leftChannel[beatStart + i] += val * 0.7;
        rightChannel[beatStart + i] += val * 0.7;
      }
    } else if (isWaltz && (beatInBar === 2 || beatInBar === 3)) {
      // Waltz acoustic chord strum on 2 and 3
      const strumSamples = Math.floor(sampleRate * 0.3);
      for (let i = 0; i < strumSamples && beatStart + i < totalSamples; i++) {
        const t = i / sampleRate;
        const progress = i / strumSamples;
        const env = Math.pow(1 - progress, 2);
        const chord =
          Math.sin(2 * Math.PI * 440 * t) * 0.2 +
          Math.sin(2 * Math.PI * 554.37 * t) * 0.2 +
          Math.sin(2 * Math.PI * 659.25 * t) * 0.2;
        leftChannel[beatStart + i] += chord * env * 0.6;
        rightChannel[beatStart + i] += chord * env * 0.6;
      }
    }

    // 3. Hi-Hat / Cymbals (Offbeats and tick)
    const hatSamples = Math.floor(sampleRate * 0.05);
    const offbeatSample = beatStart + Math.floor(beatIntervalSamples * 0.5);
    for (let i = 0; i < hatSamples && offbeatSample + i < totalSamples; i++) {
      const progress = i / hatSamples;
      const env = Math.pow(1 - progress, 3);
      const noise = (Math.random() * 2 - 1) * env * 0.25;
      leftChannel[offbeatSample + i] += noise;
      rightChannel[offbeatSample + i] += noise;
    }

    // 4. Harmonic Synth Bass note
    const bassSamples = Math.floor(sampleRate * 0.4);
    const bassFreq = isDownbeat ? 55 : (beatInBar === 3 ? 65.41 : 48.99);
    for (let i = 0; i < bassSamples && beatStart + i < totalSamples; i++) {
      const t = i / sampleRate;
      const env = Math.max(0, 1 - (i / bassSamples));
      const bassVal = Math.sin(2 * Math.PI * bassFreq * t) * 0.35 * env;
      leftChannel[beatStart + i] += bassVal;
      rightChannel[beatStart + i] += bassVal;
    }
  }

  // Normalize / Soft clip to prevent distortion
  for (let i = 0; i < totalSamples; i++) {
    leftChannel[i] = Math.tanh(leftChannel[i]);
    rightChannel[i] = Math.tanh(rightChannel[i]);
  }

  return encodeWav(leftChannel, rightChannel, sampleRate);
}

function encodeWav(left: Float32Array, right: Float32Array, sampleRate: number): Blob {
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = left.length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample = 16

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM audio
  let offset = 44;
  for (let i = 0; i < left.length; i++) {
    // Left channel
    const sampleL = Math.max(-1, Math.min(1, left[i]));
    view.setInt16(offset, sampleL < 0 ? sampleL * 0x8000 : sampleL * 0x7fff, true);
    offset += 2;

    // Right channel
    const sampleR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sampleR < 0 ? sampleR * 0x8000 : sampleR * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

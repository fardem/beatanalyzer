/**
 * Calls to the local Python server (backend/server.py). Without it (e.g. only `npm run dev`) every call returns null.
 */
import { EngineInfo } from '../types/analyzer';

export interface ResolveStatus {
  resolveFound: boolean;
  path: string;
  installedVersion: string | null;
  version: string;
  legacyInstalled?: boolean;
  state: 'missing' | 'outdated' | 'current';
}

export interface UpdateInfo {
  current: string;
  latest: string | null;
  available: boolean;
  page?: string;
  error?: string;
}

async function call<T>(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  timeoutMs = 8000,
  body?: unknown
): Promise<T | null> {
  try {
    const resp = await fetch(path, {
      method,
      signal: AbortSignal.timeout(timeoutMs),
      ...(body !== undefined
        ? {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        : {}),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.error || `HTTP ${resp.status}`);
    }
    return data as T;
  } catch (err) {
    if (err instanceof Error && !(err.name === 'TimeoutError' || err instanceof TypeError || err instanceof SyntaxError)) {
      throw err;
    }
    return null;
  }
}

export interface BackendHealth {
  status: string;
  beat_this_installed: boolean;
  md_beat_this_installed?: boolean;
  ffmpeg_available?: boolean;
  ffmpeg_path?: string | null;
  ffmpeg_dir?: string;
  ffmpeg_source?: 'custom' | 'system' | null;
  cuda_available: boolean;
  engine: string;
  engineInfo?: EngineInfo;
  models?: {
    beat_this?: EngineInfo;
    md_beat_this?: EngineInfo;
  };
  version?: string;
  python_version?: string;
}

export interface FfmpegSettingsResponse {
  ffmpegDir: string;
  ffmpegAvailable: boolean;
  ffmpegPath: string | null;
  ffmpegSource: 'custom' | 'system' | null;
}

export const getBackendHealth = () => call<BackendHealth>('/api/health', 'GET', 1200);
export const saveFfmpegDir = (ffmpegDir: string) =>
  call<FfmpegSettingsResponse>('/api/settings', 'POST', 8000, { ffmpegDir });
export const getResolveStatus = () => call<ResolveStatus>('/api/resolve/status');
export const installResolveScript = () => call<ResolveStatus>('/api/resolve/install', 'POST');
export const checkUpdate = () => call<UpdateInfo>('/api/update/check', 'GET', 15000);
export const applyUpdate = () =>
  call<{ updated: boolean; version: string; message: string }>('/api/update/apply', 'POST', 15 * 60 * 1000);

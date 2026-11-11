/**
 * Calls to the local Python server (backend/server.py). Without it (e.g. only `npm run dev`) every call returns null.
 */

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

async function call<T>(path: string, method: 'GET' | 'POST' = 'GET', timeoutMs = 8000): Promise<T | null> {
  try {
    const resp = await fetch(path, { method, signal: AbortSignal.timeout(timeoutMs) });
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

export const getResolveStatus = () => call<ResolveStatus>('/api/resolve/status');
export const installResolveScript = () => call<ResolveStatus>('/api/resolve/install', 'POST');
export const checkUpdate = () => call<UpdateInfo>('/api/update/check', 'GET', 15000);
export const applyUpdate = () =>
  call<{ updated: boolean; version: string; message: string }>('/api/update/apply', 'POST', 15 * 60 * 1000);

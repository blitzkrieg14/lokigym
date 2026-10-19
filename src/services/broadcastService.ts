import { Capacitor, CapacitorHttp } from '@capacitor/core';

/**
 * Darts Board / External Display Live Workout Broadcast Service
 */

export interface WorkoutLiveTelemetry {
  active: boolean;
  workoutName?: string;
  durationSeconds?: number;
  formattedDuration?: string;
  currentExercise?: string;
  currentSet?: number;
  totalSetsForExercise?: number;
  totalSetsCompleted?: number;
  totalWeightMoved?: number;
  weightUnit?: string;
  isResting?: boolean;
  restRemaining?: number;
  totalRestDuration?: number;
  timestamp?: number;
}

const STORAGE_KEY_URL = 'workout_darts_server_url';
const STORAGE_KEY_ENABLED = 'workout_darts_broadcast_enabled';

/**
 * Normalizes input server URLs (e.g. "192.168.1.70:8089" -> "http://192.168.1.70:8089")
 */
export function normalizeServerUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  return url.replace(/\/+$/, '');
}

export function getDartsServerUrl(): string {
  const raw = localStorage.getItem(STORAGE_KEY_URL) || '';
  return normalizeServerUrl(raw);
}

export function setDartsServerUrl(url: string): void {
  const normalized = normalizeServerUrl(url);
  localStorage.setItem(STORAGE_KEY_URL, normalized);
}

export function getDartsBroadcastEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEY_ENABLED);
  // Default to true if not explicitly set to 'false'
  if (val === null) {
    return true;
  }
  return val === 'true';
}

export function setDartsBroadcastEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
}

/**
 * Generic post helper that uses native CapacitorHttp on mobile (bypassing CORS & Mixed Content)
 * with a graceful browser fetch fallback.
 */
async function postJson(
  url: string,
  payload: any,
  timeoutMs = 5000
): Promise<{ ok: boolean; status: number; data?: any }> {
  // Try native CapacitorHttp first if running on native mobile or plugin is active
  try {
    if (Capacitor.isNativePlatform() || (CapacitorHttp && typeof CapacitorHttp.post === 'function')) {
      const res = await CapacitorHttp.post({
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: payload,
        connectTimeout: timeoutMs,
        readTimeout: timeoutMs
      });
      return {
        ok: res.status >= 200 && res.status < 300,
        status: res.status,
        data: res.data
      };
    }
  } catch (nativeErr) {
    console.warn('[Loki Telemetry] Native CapacitorHttp call error, trying fetch fallback:', nativeErr);
  }

  // Web fetch fallback
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await res.json().catch(() => null);
    return {
      ok: res.ok,
      status: res.status,
      data
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Throttle tracking
let lastSendTime = 0;
const SEND_INTERVAL_MS = 1000; // 1 second

/**
 * Broadcast live workout telemetry to the external Darts app server.
 */
export async function broadcastWorkoutTelemetry(
  data: WorkoutLiveTelemetry,
  force = false
): Promise<boolean> {
  const enabled = getDartsBroadcastEnabled();
  const serverUrl = getDartsServerUrl();

  if (!enabled || !serverUrl) return false;

  const now = Date.now();
  if (!force && now - lastSendTime < SEND_INTERVAL_MS) {
    return false;
  }
  lastSendTime = now;

  const endpoint = `${serverUrl}/api/workout/live`;

  try {
    const payload: WorkoutLiveTelemetry = {
      ...data,
      timestamp: now
    };

    const res = await postJson(endpoint, payload, 3500);

    if (!res.ok) {
      console.warn(`[Loki Telemetry] Server responded with HTTP status ${res.status}`);
    }

    return res.ok;
  } catch (e: any) {
    console.warn('[Loki Telemetry] Broadcast network error:', e?.message || e);
    return false;
  }
}

/**
 * Test connectivity with the Darts app server.
 */
export async function testDartsServerConnection(
  url: string
): Promise<{ success: boolean; message: string }> {
  if (!url || !url.trim()) {
    return { success: false, message: 'Please enter a valid server URL (e.g. http://192.168.1.70:8089)' };
  }

  const cleanUrl = normalizeServerUrl(url);
  const endpoint = `${cleanUrl}/api/workout/live`;

  try {
    const testPayload: WorkoutLiveTelemetry = {
      active: false,
      workoutName: 'Loki Gym Connection Test',
      timestamp: Date.now()
    };

    const res = await postJson(endpoint, testPayload, 5000);

    if (res.ok) {
      return { success: true, message: `Connected successfully to ${cleanUrl}!` };
    } else {
      return { success: false, message: `Server responded with HTTP status ${res.status}` };
    }
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.message?.toLowerCase().includes('timeout')) {
      return { success: false, message: 'Connection timed out. Check IP and port.' };
    }
    return { success: false, message: err?.message || 'Could not reach server. Verify local network.' };
  }
}

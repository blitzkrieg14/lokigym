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

export function getDartsServerUrl(): string {
  return localStorage.getItem(STORAGE_KEY_URL) || '';
}

export function setDartsServerUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
}

export function getDartsBroadcastEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY_ENABLED) === 'true';
}

export function setDartsBroadcastEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
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

  const cleanUrl = serverUrl.replace(/\/+$/, '');
  const endpoint = `${cleanUrl}/api/workout/live`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const payload: WorkoutLiveTelemetry = {
      ...data,
      timestamp: now
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    // Silently fail on network packet drop during live workout
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
    return { success: false, message: 'Please enter a valid server URL (e.g. http://192.168.1.50:8080)' };
  }

  const cleanUrl = url.trim().replace(/\/+$/, '');
  const endpoint = `${cleanUrl}/api/workout/live`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const testPayload: WorkoutLiveTelemetry = {
      active: false,
      workoutName: 'Loki Gym Connection Test',
      timestamp: Date.now()
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return { success: true, message: `Connected successfully to ${cleanUrl}!` };
    } else {
      return { success: false, message: `Server responded with HTTP status ${res.status}` };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Connection timed out. Check IP and port.' };
    }
    return { success: false, message: err?.message || 'Could not reach server. Verify local network.' };
  }
}

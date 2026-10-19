import { APP_VERSION, GITHUB_RELEASES_API, GITHUB_RELEASES_URL, compareSemver } from '../version';

export interface AppUpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseTitle: string;
  releaseNotes: string;
  releaseUrl: string;
  downloadUrl: string;
  publishedAt: string;
  apkSizeFormatted?: string;
  apkFileName?: string;
  noReleasesYet?: boolean;
}

const STORAGE_KEY_DISMISSED = 'loki_gym_dismissed_update';
const STORAGE_KEY_LAST_CHECK = 'loki_gym_last_update_check';
const STORAGE_KEY_AUTO_CHECK = 'loki_gym_auto_check_updates';

/**
 * Format bytes into human-readable string (e.g. 24.5 MB)
 */
function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check GitHub releases API for newer version of the app.
 */
export async function checkForUpdate(force = false): Promise<AppUpdateInfo> {
  const defaultResult: AppUpdateInfo = {
    hasUpdate: false,
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    releaseTitle: '',
    releaseNotes: '',
    releaseUrl: GITHUB_RELEASES_URL,
    downloadUrl: GITHUB_RELEASES_URL,
    publishedAt: ''
  };

  try {
    const response = await fetch(GITHUB_RELEASES_API, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });

    // If repo has no releases yet (404), return clean state
    if (response.status === 404) {
      return {
        ...defaultResult,
        noReleasesYet: true
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const data = await response.json();
    const latestTag = (data.tag_name || '').replace(/^v/i, '').trim();

    if (!latestTag) {
      return defaultResult;
    }

    const isNewer = compareSemver(latestTag, APP_VERSION) > 0;

    // Find any APK asset attached to the release
    let apkDownloadUrl = data.html_url || GITHUB_RELEASES_URL;
    let apkSizeFormatted: string | undefined;
    let apkFileName: string | undefined;

    if (Array.isArray(data.assets) && data.assets.length > 0) {
      const apkAsset = data.assets.find((asset: any) =>
        typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk')
      );
      if (apkAsset) {
        apkDownloadUrl = apkAsset.browser_download_url;
        apkFileName = apkAsset.name;
        if (apkAsset.size) {
          apkSizeFormatted = formatBytes(apkAsset.size);
        }
      }
    }

    // Save timestamp of last check
    localStorage.setItem(STORAGE_KEY_LAST_CHECK, Date.now().toString());

    return {
      hasUpdate: isNewer,
      currentVersion: APP_VERSION,
      latestVersion: latestTag,
      releaseTitle: data.name || `Release v${latestTag}`,
      releaseNotes: data.body || 'No release notes provided.',
      releaseUrl: data.html_url || GITHUB_RELEASES_URL,
      downloadUrl: apkDownloadUrl,
      publishedAt: data.published_at || '',
      apkSizeFormatted,
      apkFileName
    };
  } catch (err) {
    console.warn('[UpdateService] Failed to check for updates from GitHub:', err);
    throw err;
  }
}

/**
 * Dismiss a specific version prompt so it doesn't pop up again
 */
export function dismissUpdate(version: string): void {
  localStorage.setItem(STORAGE_KEY_DISMISSED, version);
}

/**
 * Check if a version update has already been dismissed by user
 */
export function isUpdateDismissed(version: string): boolean {
  const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);
  return dismissed === version;
}

/**
 * Get auto-check setting (default true)
 */
export function getAutoCheckEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEY_AUTO_CHECK);
  return val === null ? true : val === 'true';
}

/**
 * Set auto-check setting
 */
export function setAutoCheckEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_AUTO_CHECK, enabled ? 'true' : 'false');
}

/**
 * Trigger download of the APK or open release page
 */
export function triggerDownload(url: string): void {
  // Use window.open with _system for Capacitor / Android intent, or standard window open
  if (typeof window !== 'undefined') {
    const w = window.open(url, '_system');
    if (!w) {
      window.location.href = url;
    }
  }
}

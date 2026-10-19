/**
 * Application Version and GitHub Repository Configuration
 */
export const APP_VERSION = '3.3.3';
export const GITHUB_OWNER = 'blitzkrieg14';
export const GITHUB_REPO = 'lokigym';
export const GITHUB_FULL_REPO = `${GITHUB_OWNER}/${GITHUB_REPO}`;
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_FULL_REPO}`;
export const GITHUB_RELEASES_API = `https://api.github.com/repos/${GITHUB_FULL_REPO}/releases/latest`;
export const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_FULL_REPO}/releases`;

/**
 * Compare two semantic version strings (e.g. '3.3.1' vs '3.3.0' or 'v3.3.1' vs '3.3.0').
 * Returns:
 *   1 if v1 > v2 (v1 is newer)
 *  -1 if v1 < v2 (v1 is older)
 *   0 if v1 == v2
 */
export function compareSemver(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/i, '').trim();
  const parts1 = clean(v1).split('.').map(n => parseInt(n, 10) || 0);
  const parts2 = clean(v2).split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

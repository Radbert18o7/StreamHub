/**
 * Stream Health Checker
 * Probes stream URLs via CORS proxy to determine if they are alive or dead
 * before attempting to load them in the player.
 */

// In-memory cache: url → { alive: bool, checkedAt: timestamp }
const healthCache = new Map();
const CACHE_TTL = 20 * 60 * 1000; // 20 minutes

const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

/**
 * Check if a single stream URL is responding.
 * Returns true if alive, false if dead/unreachable.
 */
export async function isStreamAlive(url, timeoutMs = 6000) {
  if (!url) return false;

  // Return cached result if fresh
  const cached = healthCache.get(url);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL) {
    return cached.alive;
  }

  // Try each proxy
  for (const buildProxy of PROXIES) {
    try {
      const proxyUrl = buildProxy(url);
      const res = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(timeoutMs),
        // Don't cache at HTTP level
        cache: 'no-store',
      });
      const alive = res.ok; // 200-299
      healthCache.set(url, { alive, checkedAt: Date.now() });
      return alive;
    } catch {
      // Proxy failed or timed out, try next
    }
  }

  // All proxies failed — treat as dead
  healthCache.set(url, { alive: false, checkedAt: Date.now() });
  return false;
}

/**
 * Given a list of URLs, probe them ALL in parallel and return
 * the first one that responds as alive, or null if none work.
 */
export async function findFirstWorkingUrl(urls, timeoutMs = 6000) {
  if (!urls || urls.length === 0) return null;

  return new Promise((resolve) => {
    let resolved = false;
    let pending = urls.length;

    urls.forEach(async (url) => {
      try {
        const alive = await isStreamAlive(url, timeoutMs);
        if (alive && !resolved) {
          resolved = true;
          resolve(url);
        }
      } catch {
        // ignore
      } finally {
        pending--;
        if (pending === 0 && !resolved) {
          resolve(null); // All URLs are dead
        }
      }
    });
  });
}

/**
 * Pre-validate a channel: check its primary URL and all backup URLs,
 * return the best working URL, or null if everything is dead.
 */
export async function findBestWorkingUrl(channel) {
  const allUrls = [channel.streamUrl, ...(channel.backupUrls || [])].filter(Boolean);
  return findFirstWorkingUrl(allUrls);
}

/**
 * Expose the cache for UI use (e.g. showing health dots on cards)
 */
export function getCachedHealth(url) {
  return healthCache.get(url) || null;
}

export function setCachedHealth(url, alive) {
  healthCache.set(url, { alive, checkedAt: Date.now() });
}

import { parseM3u } from '../utils/m3uParser';
import { dedupeChannels } from '../utils/dedupe';
import { set, get } from 'idb-keyval';

const CACHE_KEY = 'streamhub_channels_v3';
const CACHE_TIME_KEY = 'streamhub_channels_timestamp_v3';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// CORS-friendly proxies as fallback
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

async function fetchWithFallback(url, timeoutMs = 20000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (error) {
    // Try CORS proxies
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(timeoutMs) });
        if (res.ok) return await res.text();
      } catch {
        // continue
      }
    }
    throw new Error(`All fetch attempts failed for ${url}`);
  }
}

/**
 * Fetches the iptv-org channels.json and returns a Set of known CLOSED channel IDs.
 * These are channels that have officially shut down.
 */
async function fetchClosedChannelIds() {
  try {
    const res = await fetch('https://iptv-org.github.io/api/channels.json', {
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return new Set();
    const channels = await res.json();
    // Build a set of closed channel names (normalized) for fast lookup
    const closedNames = new Set();
    channels.forEach(ch => {
      if (ch.closed !== null) {
        // Normalize name for matching
        closedNames.add(ch.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (ch.id) closedNames.add(ch.id.toLowerCase());
      }
    });
    return closedNames;
  } catch (e) {
    console.warn('[PlaylistFetcher] Could not fetch closed channel list:', e);
    return new Set();
  }
}

export async function loadPlaylists(forceRefresh = false) {
  if (!forceRefresh) {
    const cachedTime = await get(CACHE_TIME_KEY);
    if (cachedTime && (Date.now() - cachedTime < CACHE_DURATION)) {
      const cachedChannels = await get(CACHE_KEY);
      if (cachedChannels && cachedChannels.length > 0) {
        console.log(`[PlaylistFetcher] Loaded ${cachedChannels.length} channels from cache`);
        return cachedChannels;
      }
    }
  }

  // The best single-source for global IPTV: iptv-org's country-indexed playlist
  // has 14,900+ streams and is the most comprehensive free source
  const sources = [
    // Primary: full global index
    'https://iptv-org.github.io/iptv/index.m3u',
    // Secondary: country-indexed (catches channels missing from main index)
    'https://iptv-org.github.io/iptv/index.country.m3u',
    // Tertiary: hand-curated working streams
    'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
  ];

  // Fetch the closed channel blocklist and playlist data concurrently
  const [closedIds, ...playlistResults] = await Promise.allSettled([
    fetchClosedChannelIds(),
    ...sources.map(async (url) => {
      try {
        const text = await fetchWithFallback(url);
        const channels = await parseM3u(text);
        console.log(`[PlaylistFetcher] ✅ ${url.split('/').pop()}: ${channels.length} channels`);
        return channels;
      } catch (err) {
        console.error(`[PlaylistFetcher] ❌ Failed: ${url}`, err);
        return [];
      }
    })
  ]);

  const closedSet = closedIds.status === 'fulfilled' ? closedIds.value : new Set();
  console.log(`[PlaylistFetcher] Blocking ${closedSet.size} known closed channels`);

  let allChannels = [];
  playlistResults.forEach(result => {
    if (result.status === 'fulfilled') {
      allChannels = [...allChannels, ...result.value];
    }
  });

  // Deduplicate (merges same channel from different sources into one with backupUrls)
  let dedupedChannels = dedupeChannels(allChannels);

  // Filter out channels that are known to be permanently closed
  if (closedSet.size > 0) {
    const before = dedupedChannels.length;
    dedupedChannels = dedupedChannels.filter(ch => {
      const normName = ch.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normId = (ch.tvgId || '').toLowerCase();
      return !closedSet.has(normName) && !closedSet.has(normId);
    });
    console.log(`[PlaylistFetcher] Filtered out ${before - dedupedChannels.length} closed channels`);
  }

  // Sort: channels with more backup URLs first (more reliable)
  dedupedChannels.sort((a, b) => (b.backupUrls?.length || 0) - (a.backupUrls?.length || 0));

  console.log(`[PlaylistFetcher] Final: ${dedupedChannels.length} channels`);

  // Cache to IndexedDB
  await set(CACHE_KEY, dedupedChannels);
  await set(CACHE_TIME_KEY, Date.now());

  return dedupedChannels;
}

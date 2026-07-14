import { parseM3u } from '../utils/m3uParser';
import { dedupeChannels } from '../utils/dedupe';
import { set, get } from 'idb-keyval';

const CACHE_KEY = 'streamhub_channels';
const CACHE_TIME_KEY = 'streamhub_channels_timestamp';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// A list of free CORS proxies as fallbacks
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

async function fetchWithFallback(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.text();
  } catch (error) {
    console.warn(`Direct fetch failed for ${url}, trying CORS proxies...`);
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
        if (res.ok) return await res.text();
      } catch (proxyError) {
        console.warn(`Proxy ${proxy} failed for ${url}`);
      }
    }
    throw new Error(`All fetch attempts failed for ${url}`);
  }
}

export async function loadPlaylists(forceRefresh = false) {
  if (!forceRefresh) {
    const cachedTime = await get(CACHE_TIME_KEY);
    if (cachedTime && (Date.now() - cachedTime < CACHE_DURATION)) {
      const cachedChannels = await get(CACHE_KEY);
      if (cachedChannels && cachedChannels.length > 0) {
        return cachedChannels;
      }
    }
  }

  const sources = [
    'https://iptv-org.github.io/iptv/index.m3u',
    'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
    'https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u'
  ];

  let allChannels = [];

  // Fetch all sources concurrently
  const fetchPromises = sources.map(async (url) => {
    try {
      const text = await fetchWithFallback(url);
      const channels = await parseM3u(text);
      return channels;
    } catch (err) {
      console.error(`Failed to fetch and parse playlist from ${url}`, err);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  
  results.forEach(channels => {
    allChannels = [...allChannels, ...channels];
  });

  const dedupedChannels = dedupeChannels(allChannels);

  // Cache to IndexedDB
  await set(CACHE_KEY, dedupedChannels);
  await set(CACHE_TIME_KEY, Date.now());

  return dedupedChannels;
}

/**
 * Deep Web Crawler (Federated IPTV Search)
 * Scrapes multiple massive open-source IPTV aggregators to find backup streams.
 */

const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?'
];

// Reliable massive federated repositories (CORS-friendly)
const FEDERATED_REPOS = [
  { type: 'm3u', url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8' },
  { type: 'json', url: 'https://iptv-org.github.io/api/streams.json' }
];

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractM3u8Links(html) {
  const m3u8Regex = /https?:\/\/[^\s"'<>]+?\.m3u8/gi;
  const matches = html.match(m3u8Regex) || [];
  const uniqueUrls = [...new Set(matches)];
  return uniqueUrls.filter(url => !url.includes('example.com') && !url.includes('w3.org'));
}

export async function scrapeWebForStream(channelName) {
  if (!channelName) return [];
  
  const links = new Set();
  const looseName = channelName.split(' ').slice(0, 2).join(' ');
  const normLoose = normalize(looseName);
  const normExact = normalize(channelName);

  // 1. Deep Crawl Federated Repositories Concurrently
  const fetchPromises = FEDERATED_REPOS.map(async (repo) => {
    try {
      const res = await fetch(repo.url);
      if (!res.ok) return;

      if (repo.type === 'm3u') {
        const text = await res.text();
        const lines = text.split('\n');
        
        // Exact match first
        for (let i = 0; i < lines.length; i++) {
          if (normalize(lines[i]).includes(normExact) && lines[i+1] && lines[i+1].startsWith('http')) {
            links.add(lines[i+1].trim());
          }
        }
        
        // Fuzzy match if nothing
        if (links.size === 0 && normLoose.length > 3) {
          for (let i = 0; i < lines.length; i++) {
            if (normalize(lines[i]).includes(normLoose) && lines[i+1] && lines[i+1].startsWith('http')) {
              links.add(lines[i+1].trim());
            }
          }
        }
      } else if (repo.type === 'json') {
        const json = await res.json();
        
        // Search JSON fields
        json.forEach(stream => {
          if (!stream.channel) return;
          const streamNorm = normalize(stream.channel);
          
          if (streamNorm.includes(normExact) || (normLoose.length > 3 && streamNorm.includes(normLoose))) {
            if (stream.url && stream.url.startsWith('http')) {
              links.add(stream.url.trim());
            }
          }
        });
      }
    } catch (e) {
      console.warn(`[DeepCrawler] Failed to query ${repo.url}`, e);
    }
  });

  await Promise.allSettled(fetchPromises);

  if (links.size > 0) {
    return Array.from(links);
  }

  // 2. Fallback to DuckDuckGo HTML Web Scraping via CORS Proxy
  const query = `"${channelName.replace(/ /g, '+')}"+ext:m3u8`;
  const targetUrl = `https://html.duckduckgo.com/html/?q=${query}`;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(`${proxy}${encodeURIComponent(targetUrl)}`);
      if (!response.ok) continue;

      let html = '';
      if (proxy.includes('allorigins')) {
        const data = await response.json();
        html = data.contents;
      } else {
        html = await response.text();
      }

      const ddgLinks = extractM3u8Links(html);
      if (ddgLinks.length > 0) {
        return ddgLinks;
      }
    } catch (err) {
      continue;
    }
  }

  return [];
}

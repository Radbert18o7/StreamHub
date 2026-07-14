/**
 * Web Stream Scraper
 * Uses a CORS proxy to search public web for working m3u8 streams dynamically.
 */

// List of CORS proxies to fallback on
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?'
];

/**
 * Extracts .m3u8 URLs from a given text string (HTML)
 */
function extractM3u8Links(html) {
  const m3u8Regex = /https?:\/\/[^\s"'<>]+?\.m3u8/gi;
  const matches = html.match(m3u8Regex) || [];
  
  // Deduplicate and filter out common false positives
  const uniqueUrls = [...new Set(matches)];
  return uniqueUrls.filter(url => 
    !url.includes('example.com') && 
    !url.includes('w3.org')
  );
}

/**
 * Normalizes strings for loose comparison
 */
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Scrapes DuckDuckGo Lite for the channel name and extracts m3u8 URLs.
 */
export async function scrapeWebForStream(channelName) {
  if (!channelName) return [];

  const links = [];

  // Create a looser version of the channel name (e.g. "Bumblebee TV Cute Zone" -> "Bumblebee TV")
  const parts = channelName.split(' ');
  const looseName = parts.slice(0, 2).join(' ');
  
  // 1. Fallback Aggregators
  try {
    const rawRes = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8'));
    const data = await rawRes.json();
    const lines = data.contents.split('\n');
    
    // First pass: try to find an exact match
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(channelName.toLowerCase()) && lines[i+1] && lines[i+1].startsWith('http')) {
        links.push(lines[i+1].trim());
      }
    }
    
    // Second pass: if no exact match, try the loose match (first two words)
    if (links.length === 0 && looseName.length > 3) {
      for (let i = 0; i < lines.length; i++) {
        const normLine = normalize(lines[i]);
        const normLoose = normalize(looseName);
        if (normLine.includes(normLoose) && lines[i+1] && lines[i+1].startsWith('http')) {
          links.push(lines[i+1].trim());
        }
      }
    }
  } catch (e) {
    console.warn("[WebScraper] Free-TV fallback failed", e);
  }

  if (links.length > 0) {
    return [...new Set(links)];
  }

  // 2. DuckDuckGo HTML Search as absolute last resort
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

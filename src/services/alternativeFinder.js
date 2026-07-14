import Fuse from 'fuse.js';

let fuseInstance = null;

export function initAlternativeFinder(channels) {
  fuseInstance = new Fuse(channels, {
    keys: ['name', 'tvgId'],
    threshold: 0.3, // Fuzzy matching
    includeScore: true
  });
}

export function findAlternativeStream(brokenChannel, channels, triedUrls = []) {
  // 1. Check if the broken channel has backupUrls itself
  if (brokenChannel.backupUrls && brokenChannel.backupUrls.length > 0) {
    // Find the first backup URL that hasn't been tried yet
    const nextUrlIndex = brokenChannel.backupUrls.findIndex(url => !triedUrls.includes(url));
    
    if (nextUrlIndex !== -1) {
      const nextUrl = brokenChannel.backupUrls[nextUrlIndex]; 
      const remainingBackups = brokenChannel.backupUrls.slice(nextUrlIndex + 1);
      return { 
        ...brokenChannel, 
        streamUrl: nextUrl, 
        backupUrls: remainingBackups, 
        originalName: brokenChannel.name 
      };
    }
  }

  // 2. Fuzzy search for channels with similar names or exact tvgId
  if (!fuseInstance && channels) {
    initAlternativeFinder(channels);
  }

  if (fuseInstance) {
    const results = fuseInstance.search(brokenChannel.tvgId || brokenChannel.name);
    // Filter out the broken channel itself, and any URLs we've already tried
    const validAlternatives = results
      .filter(res => res.item.streamUrl !== brokenChannel.streamUrl)
      .filter(res => res.item.id !== brokenChannel.id)
      .filter(res => !triedUrls.includes(res.item.streamUrl))
      .sort((a, b) => a.score - b.score); // Lower score is better match

    if (validAlternatives.length > 0) {
      const bestMatch = validAlternatives[0].item;
      return { 
        ...bestMatch, 
        originalName: brokenChannel.name,
        isAlternative: true
      };
    }
  }

  return null;
}

export function dedupeChannels(channels) {
  const channelMap = new Map();
  
  channels.forEach(channel => {
    // Create a key based on normalized name and country
    const normalizedName = channel.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${normalizedName}-${channel.country}`.toLowerCase();
    
    if (channelMap.has(key)) {
      const existing = channelMap.get(key);
      // If stream URL is different, add as backup
      if (existing.streamUrl !== channel.streamUrl && !existing.backupUrls.includes(channel.streamUrl)) {
        existing.backupUrls.push(channel.streamUrl);
      }
      // Prefer the channel with a logo or a tvg-id if the existing one lacks it
      if (!existing.logo && channel.logo) existing.logo = channel.logo;
      if (!existing.tvgId && channel.tvgId) existing.tvgId = channel.tvgId;
      if (!existing.group && channel.group) existing.group = channel.group;
      if (!existing.language && channel.language) existing.language = channel.language;
    } else {
      channelMap.set(key, { ...channel, backupUrls: [] });
    }
  });
  
  return Array.from(channelMap.values());
}

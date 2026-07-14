self.onmessage = function(e) {
  const { text } = e.data;
  
  const channels = [];
  const lines = text.split('\n');
  
  let currentChannel = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      // Parse tvg attributes
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/i);
      const tvgCountryMatch = line.match(/tvg-country="([^"]*)"/i);
      const tvgLanguageMatch = line.match(/tvg-language="([^"]*)"/i);
      
      currentChannel.tvgId = tvgIdMatch ? tvgIdMatch[1] : '';
      currentChannel.logo = tvgLogoMatch ? tvgLogoMatch[1] : '';
      currentChannel.group = groupTitleMatch ? groupTitleMatch[1] : '';
      currentChannel.country = tvgCountryMatch ? tvgCountryMatch[1] : '';
      currentChannel.language = tvgLanguageMatch ? tvgLanguageMatch[1] : '';
      
      // Parse name (everything after the last comma)
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentChannel.name = line.substring(commaIndex + 1).trim();
      } else {
        currentChannel.name = 'Unknown Channel';
      }
    } else if (!line.startsWith('#')) {
      // It's a stream URL
      if (currentChannel) {
        currentChannel.streamUrl = line;
        // Create a unique deterministic ID if possible, otherwise fallback
        currentChannel.id = currentChannel.tvgId || 
          (currentChannel.name + '-' + currentChannel.country).replace(/\s+/g, '-').toLowerCase();
        currentChannel.backupUrls = []; 
        channels.push(currentChannel);
        currentChannel = null;
      }
    }
  }
  
  self.postMessage({ channels });
};

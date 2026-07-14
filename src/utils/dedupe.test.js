import { dedupeChannels } from './dedupe';
import { describe, it, expect } from 'vitest';

describe('dedupeChannels', () => {
  it('should deduplicate channels with the same name and country, merging backup URLs', () => {
    const channels = [
      { id: '1', name: 'BBC One', country: 'UK', streamUrl: 'http://stream1.m3u8', logo: 'logo1.png' },
      { id: '2', name: 'BBC ONE', country: 'uk', streamUrl: 'http://stream2.m3u8', logo: '' },
      { id: '3', name: 'BBC Two', country: 'UK', streamUrl: 'http://stream3.m3u8', logo: '' },
    ];

    const result = dedupeChannels(channels);

    expect(result.length).toBe(2);
    
    const bbcOne = result.find(c => c.name.toLowerCase() === 'bbc one');
    expect(bbcOne).toBeDefined();
    expect(bbcOne.streamUrl).toBe('http://stream1.m3u8');
    expect(bbcOne.backupUrls).toContain('http://stream2.m3u8');
    expect(bbcOne.logo).toBe('logo1.png');
    
    const bbcTwo = result.find(c => c.name.toLowerCase() === 'bbc two');
    expect(bbcTwo).toBeDefined();
    expect(bbcTwo.backupUrls.length).toBe(0);
  });
});

import { findAlternativeStream, initAlternativeFinder } from './alternativeFinder';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Alternative Stream Finder', () => {
  const channels = [
    { id: '1', name: 'CNN News', tvgId: 'cnn', streamUrl: 'http://cnn.url' },
    { id: '2', name: 'CNN International', tvgId: 'cnn', streamUrl: 'http://cnn-int.url' },
    { id: '3', name: 'Fox News', tvgId: 'fox', streamUrl: 'http://fox.url' },
  ];

  beforeEach(() => {
    initAlternativeFinder(channels);
  });

  it('should use backupUrls if available', () => {
    const brokenChannel = {
      id: 'broken1',
      name: 'BBC',
      streamUrl: 'http://broken.url',
      backupUrls: ['http://backup1.url', 'http://backup2.url']
    };

    const alt = findAlternativeStream(brokenChannel, channels);
    expect(alt).toBeDefined();
    expect(alt.streamUrl).toBe('http://backup1.url');
    expect(alt.backupUrls).toEqual(['http://backup2.url']);
  });

  it('should fallback to fuzzy search if no backups', () => {
    const brokenChannel = {
      id: '1',
      name: 'CNN News',
      tvgId: 'cnn',
      streamUrl: 'http://cnn.url',
      backupUrls: []
    };

    const alt = findAlternativeStream(brokenChannel, channels);
    expect(alt).toBeDefined();
    // It should find 'CNN International' because it shares the tvgId 'cnn'
    expect(alt.streamUrl).toBe('http://cnn-int.url');
    expect(alt.isAlternative).toBe(true);
  });

  it('should return null if no alternatives found', () => {
    const brokenChannel = {
      id: '99',
      name: 'Obscure TV',
      tvgId: 'obscure',
      streamUrl: 'http://obscure.url',
      backupUrls: []
    };

    const alt = findAlternativeStream(brokenChannel, channels);
    expect(alt).toBeNull();
  });
});

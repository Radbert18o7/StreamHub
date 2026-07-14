import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChannelStore } from '../store/useChannelStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CategoryRow } from '../components/CategoryRow';

export function Home() {
  const channels = useChannelStore(state => state.channels);
  const isLoading = useChannelStore(state => state.isLoading);
  const favorites = useFavoritesStore(state => state.favorites);
  const watchHistory = useSettingsStore(state => state.watchHistory);
  const navigate = useNavigate();

  const categories = useMemo(() => {
    if (!channels.length) return {};
    const cats = {
      'News': [],
      'Sports': [],
      'Movies': [],
      'Music': [],
      'Entertainment': [],
      'Documentary': [],
      'Kids': []
    };
    
    channels.forEach(c => {
      if (!c.group) return;
      const groupLower = c.group.toLowerCase();
      if (groupLower.includes('news')) cats['News'].push(c);
      else if (groupLower.includes('sport')) cats['Sports'].push(c);
      else if (groupLower.includes('movie')) cats['Movies'].push(c);
      else if (groupLower.includes('music')) cats['Music'].push(c);
      else if (groupLower.includes('entertainment')) cats['Entertainment'].push(c);
      else if (groupLower.includes('documentary')) cats['Documentary'].push(c);
      else if (groupLower.includes('kids') || groupLower.includes('children')) cats['Kids'].push(c);
    });
    
    // Sort and limit
    Object.keys(cats).forEach(k => {
      cats[k] = cats[k].slice(0, 50); // Show max 50 per row
    });
    
    return cats;
  }, [channels]);

  const handleChannelClick = (channel) => {
    navigate(`/channel/${encodeURIComponent(channel.id)}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse pt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-6">
            <div className="h-8 bg-zinc-800 rounded w-64 ml-8"></div>
            <div className="flex space-x-4 overflow-hidden px-8">
              {[1, 2, 3, 4, 5, 6].map(j => (
                <div key={j} className="h-48 w-48 bg-zinc-800 rounded-xl flex-shrink-0"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {watchHistory.length > 0 && (
        <CategoryRow title="Continue Watching" channels={watchHistory} onChannelClick={handleChannelClick} />
      )}
      
      {favorites.length > 0 && (
        <CategoryRow title="Your Favorites" channels={favorites} onChannelClick={handleChannelClick} />
      )}
      
      {Object.entries(categories).map(([title, items]) => (
        items.length > 0 && <CategoryRow key={title} title={title} channels={items} onChannelClick={handleChannelClick} />
      ))}
    </div>
  );
}

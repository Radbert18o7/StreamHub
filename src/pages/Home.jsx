import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-800" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-[#0ea5e9] animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Loading StreamHub</h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Fetching channels from global sources and filtering out dead streams...
          </p>
        </div>
        {/* Skeleton preview */}
        <div className="w-full space-y-8 animate-pulse mt-4 opacity-30">
          {[1, 2].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-zinc-800 rounded w-48 ml-2" />
              <div className="flex gap-4 overflow-hidden px-2">
                {[1,2,3,4,5,6].map(j => (
                  <div key={j} className="h-44 w-36 bg-zinc-800 rounded-xl flex-shrink-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {watchHistory.length > 0 && (
        <CategoryRow title="Continue Watching" channels={watchHistory} onChannelClick={handleChannelClick} />
      )}
      
      {favorites.length > 0 && (
        <CategoryRow title="Your Favorites" channels={favorites} onChannelClick={handleChannelClick} />
      )}
      
      {Object.entries(categories).map(([title, items]) => (
        items.length > 0 && <CategoryRow key={title} title={title} channels={items} onChannelClick={handleChannelClick} />
      ))}
    </motion.div>
  );
}

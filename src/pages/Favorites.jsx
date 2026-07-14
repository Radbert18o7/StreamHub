import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { ChannelCard } from '../components/ChannelCard';
import { HeartCrack } from 'lucide-react';

export function Favorites() {
  const favorites = useFavoritesStore(state => state.favorites);
  const navigate = useNavigate();

  const handleChannelClick = (channel) => {
    navigate(`/channel/${encodeURIComponent(channel.id)}`);
  };

  return (
    <div>
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Favorites</h1>
        <p className="text-gray-400">Your saved channels in one place.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-32 bg-[#1a1a24] rounded-2xl border border-white/5 flex flex-col items-center shadow-lg">
          <div className="bg-zinc-800/50 p-6 rounded-full mb-6 border border-white/5">
            <HeartCrack size={64} className="text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No favorites yet</h2>
          <p className="text-gray-400 max-w-md">
            Click the heart icon on any channel card to add it to your favorites list.
          </p>
          <button 
            onClick={() => navigate('/browse')}
            className="mt-8 px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0ea5e9]/20"
          >
            Browse Channels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {favorites.map(channel => (
            <ChannelCard 
              key={channel.id} 
              channel={channel} 
              onClick={handleChannelClick} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

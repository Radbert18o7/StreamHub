import React from 'react';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { twMerge } from 'tailwind-merge';

export function ChannelCard({ channel, onClick, className }) {
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFavorite = useFavoritesStore(state => state.isFavorite(channel.id));

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(channel);
  };

  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      onClick={() => onClick(channel)}
      className={twMerge(
        "group relative bg-[#1a1a24] hover:bg-[#2a2a35] border border-white/5 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0ea5e9]/10 flex flex-col items-center text-center h-48",
        className
      )}
    >
      <button 
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 p-2 rounded-full bg-black/40 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Heart size={16} fill={isFavorite ? "#ef4444" : "none"} className={isFavorite ? "text-red-500" : "text-white"} />
      </button>

      <div className="w-20 h-20 mb-4 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
        {channel.logo ? (
          <>
            <img 
              src={channel.logo} 
              alt={channel.name} 
              loading="lazy"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.target.style.display = 'none';
                if(e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div className="w-full h-full hidden items-center justify-center text-2xl font-bold text-white/50 bg-gradient-to-br from-zinc-700 to-zinc-900">
              {getInitials(channel.name)}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/50 bg-gradient-to-br from-zinc-700 to-zinc-900">
            {getInitials(channel.name)}
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-white line-clamp-2 w-full text-sm">
        {channel.name}
      </h3>
      
      <div className="mt-auto flex items-center space-x-2 text-xs text-gray-400">
        {channel.country && <span className="uppercase">{channel.country}</span>}
        {channel.group && (
          <>
            <span>•</span>
            <span className="truncate max-w-[80px]">{channel.group}</span>
          </>
        )}
      </div>
    </div>
  );
}

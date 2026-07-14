import React from 'react';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export function ChannelCard({ channel, onClick, className }) {
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFavorite = useFavoritesStore(state => state.isFavorite(channel.id));

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(channel);
  };

  const getInitials = (name) => name.substring(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(channel)}
      className={twMerge(
        "group relative bg-[#1a1a24] hover:bg-[#2a2a35] border border-white/5 rounded-xl p-3 sm:p-4 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-[#0ea5e9]/10 flex flex-col items-center text-center h-44 sm:h-48",
        className
      )}
    >
      {/* Favorite button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity z-10"
      >
        <Heart size={14} fill={isFavorite ? "#ef4444" : "none"} className={isFavorite ? "text-red-500" : "text-white"} />
      </button>

      {/* Backup sources indicator */}
      {channel.backupUrls?.length > 0 && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-medium">
            {channel.backupUrls.length + 1}
          </span>
        </div>
      )}

      <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner flex-shrink-0">
        {channel.logo ? (
          <>
            <img
              src={channel.logo}
              alt={channel.name}
              loading="lazy"
              className="w-full h-full object-contain p-1.5"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full hidden items-center justify-center text-xl font-bold text-white/50 bg-gradient-to-br from-zinc-700 to-zinc-900">
              {getInitials(channel.name)}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/50 bg-gradient-to-br from-zinc-700 to-zinc-900">
            {getInitials(channel.name)}
          </div>
        )}
      </div>

      <h3 className="font-semibold text-white line-clamp-2 w-full text-xs sm:text-sm leading-snug">
        {channel.name}
      </h3>

      <div className="mt-auto flex items-center gap-1 text-xs text-gray-500 truncate w-full justify-center">
        {channel.country && <span className="uppercase">{channel.country}</span>}
        {channel.group && (
          <>
            <span>•</span>
            <span className="truncate max-w-[70px]">{channel.group}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

import React, { useRef } from 'react';
import { ChannelCard } from './ChannelCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CategoryRow({ title, channels, onChannelClick }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!channels || channels.length === 0) return null;

  return (
    <div className="mb-10 relative group">
      <h2 className="text-xl font-bold text-white mb-4 px-4 sm:px-8 border-l-4 border-[#0ea5e9] ml-4 sm:ml-8 pl-3">{title}</h2>
      
      <button 
        className="absolute left-0 top-[50%] -translate-y-1/2 z-10 bg-black/80 p-2 rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black text-[#0ea5e9] hidden sm:flex items-center h-32 shadow-lg shadow-black/50 backdrop-blur-md"
        onClick={() => scroll('left')}
      >
        <ChevronLeft size={32} />
      </button>

      <div 
        ref={rowRef}
        className="flex overflow-x-auto space-x-4 scrollbar-hide px-4 sm:px-8 pb-4 snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {channels.map(channel => (
          <div key={channel.id} className="flex-none w-48 snap-start">
            <ChannelCard channel={channel} onClick={onChannelClick} />
          </div>
        ))}
      </div>

      <button 
        className="absolute right-0 top-[50%] -translate-y-1/2 z-10 bg-black/80 p-2 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black text-[#0ea5e9] hidden sm:flex items-center h-32 shadow-lg shadow-black/50 backdrop-blur-md"
        onClick={() => scroll('right')}
      >
        <ChevronRight size={32} />
      </button>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </div>
  );
}

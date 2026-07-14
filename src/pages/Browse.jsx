import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';
import { useChannelStore } from '../store/useChannelStore';
import { ChannelCard } from '../components/ChannelCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export function Browse() {
  const filteredChannels = useChannelStore(state => state.filteredChannels);
  const isLoading = useChannelStore(state => state.isLoading);
  const searchQuery = useChannelStore(state => state.searchQuery);
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleChannelClick = useCallback((channel) => {
    navigate(`/channel/${encodeURIComponent(channel.id)}`);
  }, [navigate]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex justify-center items-center h-64"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ea5e9]"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Filter sidebar (desktop: inline; mobile: bottom drawer via portal) */}
      <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      <motion.div layout className="flex-1 min-w-0">
        {/* Header bar */}
        <div className="mb-5 flex justify-between items-center bg-[#1a1a24] px-4 py-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isFilterOpen
                  ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
              title="Toggle Filters"
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <h1 className="text-base sm:text-xl font-bold text-white truncate">
              {searchQuery ? `"${searchQuery}"` : 'All Channels'}
            </h1>
          </div>
          <span className="flex-shrink-0 text-xs sm:text-sm font-semibold bg-zinc-800 px-2.5 py-1 rounded-full text-gray-300 ml-3">
            {filteredChannels.length.toLocaleString()}
          </span>
        </div>

        {filteredChannels.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#1a1a24] rounded-xl border border-white/5"
          >
            <p className="text-xl text-gray-400">No channels found.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <VirtuosoGrid
            useWindowScroll
            totalCount={filteredChannels.length}
            components={{
              List: React.forwardRef(({ style, children, ...props }, ref) => (
                <div
                  ref={ref}
                  {...props}
                  style={style}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 pb-8"
                >
                  {children}
                </div>
              )),
              Item: ({ children, ...props }) => (
                <div {...props}>{children}</div>
              )
            }}
            itemContent={(index) => (
              <ChannelCard
                channel={filteredChannels[index]}
                onClick={handleChannelClick}
              />
            )}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

import React, { useMemo } from 'react';
import { useChannelStore } from '../store/useChannelStore';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FilterSidebar({ isOpen, onClose }) {
  const channels = useChannelStore(state => state.channels);
  const filters = useChannelStore(state => state.filters);
  const setFilter = useChannelStore(state => state.setFilter);

  const categories = useMemo(() => {
    const cats = new Set();
    channels.forEach(c => {
      if (c.group) cats.add(c.group.split(';')[0].trim());
    });
    return Array.from(cats).filter(Boolean).sort();
  }, [channels]);

  const countries = useMemo(() => {
    const cnts = new Set();
    channels.forEach(c => {
      if (c.country) cnts.add(c.country);
    });
    return Array.from(cnts).filter(Boolean).sort();
  }, [channels]);

  const languages = useMemo(() => {
    const langs = new Set();
    channels.forEach(c => {
      if (c.language) langs.add(c.language);
    });
    return Array.from(langs).filter(Boolean).sort();
  }, [channels]);

  const resetFilters = () => {
    setFilter('category', '');
    setFilter('country', '');
    setFilter('language', '');
  };

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2 text-white font-bold text-lg">
          <Filter size={20} />
          <h2>Filters</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Category</h3>
        <select
          className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none text-sm"
          value={filters.category}
          onChange={(e) => setFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Country</h3>
        <select
          className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none text-sm"
          value={filters.country}
          onChange={(e) => setFilter('country', e.target.value)}
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Language</h3>
        <select
          className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none text-sm"
          value={filters.language}
          onChange={(e) => setFilter('language', e.target.value)}
        >
          <option value="">All Languages</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <button
        onClick={resetFilters}
        className="w-full py-2.5 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="hidden md:block flex-shrink-0 h-fit sticky top-24 overflow-hidden"
          >
            <div className="w-[260px] bg-[#1a1a24] border border-white/5 p-5 rounded-xl">
              {filterContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile bottom drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            {/* Drawer */}
            <motion.div
              key="mobile-drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a24] border-t border-white/10 rounded-t-2xl p-6 pb-8 md:hidden"
              style={{ maxHeight: '85vh', overflowY: 'auto' }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              {filterContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useMemo } from 'react';
import { useChannelStore } from '../store/useChannelStore';
import { Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FilterSidebar({ isOpen }) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ width: 0, opacity: 0, marginLeft: 0 }}
          animate={{ width: 256, opacity: 1, marginLeft: 0 }}
          exit={{ width: 0, opacity: 0, marginLeft: -32 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="flex-shrink-0 h-fit sticky top-24 overflow-hidden"
        >
          <div className="w-64 space-y-8 bg-[#1a1a24] border border-white/5 p-6 rounded-xl">
            <div className="flex items-center space-x-2 text-white font-bold text-lg mb-6 border-b border-white/10 pb-4">
              <Filter size={20} />
              <h2>Filters</h2>
            </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Category</h3>
        <select 
          className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg p-2 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
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
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Country</h3>
        <select 
          className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg p-2 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
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
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Language</h3>
        <select 
          className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg p-2 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
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
        onClick={() => {
          setFilter('category', '');
          setFilter('country', '');
          setFilter('language', '');
        }}
        className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5"
      >
        Reset Filters
      </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { Search, Tv, Menu, X, Heart, Grid } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useChannelStore } from '../store/useChannelStore';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const searchQuery = useChannelStore(state => state.searchQuery);
  const setSearchQuery = useChannelStore(state => state.setSearchQuery);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== '/browse') {
      navigate('/browse');
    }
  };

  const navLinks = [
    { to: '/browse', label: 'Browse', icon: <Grid size={18} /> },
    { to: '/favorites', label: 'Favorites', icon: <Heart size={18} /> },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] text-white shadow-lg shadow-[#0ea5e9]/20">
                <Tv size={20} />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
                StreamHub
              </span>
            </Link>

            {/* Search bar — takes all remaining space */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500 group-focus-within:text-[#0ea5e9] transition-colors" />
              </div>
              <input
                id="global-search"
                type="text"
                placeholder="Search channels..."
                className="block w-full pl-9 pr-3 py-2 border border-white/10 rounded-xl text-sm bg-zinc-900/60 text-white placeholder-gray-500 focus:outline-none focus:bg-zinc-900 focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-[#0ea5e9]/15 text-[#0ea5e9]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="sm:hidden flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden sticky top-14 z-30 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex flex-col gap-1"
          >
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-[#0ea5e9]/15 text-[#0ea5e9]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

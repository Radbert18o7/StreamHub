import React, { useEffect } from 'react';
import { Search, Tv } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useChannelStore } from '../store/useChannelStore';

export function Navbar() {
  const searchQuery = useChannelStore(state => state.searchQuery);
  const setSearchQuery = useChannelStore(state => state.setSearchQuery);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== '/browse') {
      navigate('/browse');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('global-search').focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] text-white shadow-lg shadow-[#0ea5e9]/20">
              <Tv size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all hidden sm:block">
              StreamHub
            </span>
          </Link>

          <div className="flex-1 max-w-xl px-4 sm:px-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-500 group-focus-within:text-[#0ea5e9] transition-colors" />
              </div>
              <input
                id="global-search"
                type="text"
                placeholder="Search channels..."
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-gray-500 focus:outline-none focus:bg-zinc-900 focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 sm:text-sm transition-all"
                value={searchQuery}
                onChange={handleSearch}
              />
              <div className="absolute inset-y-0 right-0 pr-3 hidden sm:flex items-center pointer-events-none">
                <span className="text-gray-500 text-xs border border-gray-600 rounded px-1.5 py-0.5">/</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link to="/browse" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Browse</Link>
            <Link to="/favorites" className="text-gray-300 hover:text-white transition-colors text-sm font-medium hidden sm:block">Favorites</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

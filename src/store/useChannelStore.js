import { create } from 'zustand';
import Fuse from 'fuse.js';

export const useChannelStore = create((set, get) => ({
  channels: [],
  filteredChannels: [],
  isLoading: false,
  searchQuery: '',
  filters: {
    category: '',
    country: '',
    language: ''
  },
  fuse: null,
  
  setChannels: (channels) => {
    const fuse = new Fuse(channels, {
      keys: ['name', 'group', 'country', 'language'],
      threshold: 0.3,
    });
    set({ channels, filteredChannels: channels, fuse, isLoading: false });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    }));
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { channels, searchQuery, filters, fuse } = get();
    let result = channels;

    // Apply search
    if (searchQuery && fuse) {
      result = fuse.search(searchQuery).map(res => res.item);
    }

    // Apply exact filters
    if (filters.category) {
      result = result.filter(c => c.group && c.group.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.country) {
      result = result.filter(c => c.country && c.country.toLowerCase() === filters.country.toLowerCase());
    }
    if (filters.language) {
      result = result.filter(c => c.language && c.language.toLowerCase() === filters.language.toLowerCase());
    }

    set({ filteredChannels: result });
  }
}));

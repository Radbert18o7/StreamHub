import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      
      toggleFavorite: (channel) => {
        const { favorites } = get();
        const exists = favorites.find(c => c.id === channel.id);
        if (exists) {
          set({ favorites: favorites.filter(c => c.id !== channel.id) });
        } else {
          set({ favorites: [...favorites, channel] });
        }
      },
      
      isFavorite: (channelId) => {
        return get().favorites.some(c => c.id === channelId);
      }
    }),
    {
      name: 'streamhub-favorites',
    }
  )
);

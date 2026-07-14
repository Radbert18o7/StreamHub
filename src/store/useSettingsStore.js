import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // dark, light, amoled
      density: 'comfortable', // compact, comfortable, large
      watchHistory: [],
      
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      
      addToHistory: (channel) => {
        const history = get().watchHistory;
        const newHistory = [
          channel,
          ...history.filter(c => c.id !== channel.id)
        ].slice(0, 20); // Keep last 20
        set({ watchHistory: newHistory });
      }
    }),
    {
      name: 'streamhub-settings',
    }
  )
);

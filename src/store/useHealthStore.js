import { create } from 'zustand';

/**
 * Global health status store.
 * Tracks which stream URLs are known-alive or known-dead.
 * Used to show health indicators on channel cards.
 */
export const useHealthStore = create((set, get) => ({
  // Map of url -> true (alive) | false (dead) | undefined (unknown)
  health: {},

  setHealth: (url, alive) => set(state => ({
    health: { ...state.health, [url]: alive }
  })),

  getHealth: (url) => get().health[url],

  isChecked: (url) => get().health[url] !== undefined,
}));

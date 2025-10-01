import { create } from 'zustand';

interface SearchStore {
  recentSearches: string[];
  addSearch: (term: string) => void;
}

export const useSearchStore = create<SearchStore>(set => ({
  recentSearches: [],
  addSearch: (term: string) =>
    set(state => {
      const updated = [...state.recentSearches.filter(s => s !== term), term];
      // garder max 3
      return { recentSearches: updated.slice(-3) };
    }),
}));

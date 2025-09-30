// __tests__/useSearchStore.test.ts
import { useSearchStore } from '@/hooks/useSearchStore';
import { act } from '@testing-library/react';

describe('useSearchStore', () => {
  beforeEach(() => {
    // On reset l'état du store avant chaque test
    useSearchStore.setState({ recentSearches: [] });
  });

  it('ajoute une nouvelle recherche', () => {
    act(() => {
      useSearchStore.getState().addSearch('banque');
    });

    expect(useSearchStore.getState().recentSearches).toEqual(['banque']);
  });

  it('replace un terme existant à la fin', () => {
    act(() => {
      useSearchStore.setState({ recentSearches: ['banque', 'credit'] });
      useSearchStore.getState().addSearch('banque');
    });

    expect(useSearchStore.getState().recentSearches).toEqual(['credit', 'banque']);
  });

  it('garde seulement 3 recherches max', () => {
    act(() => {
      useSearchStore.getState().addSearch('banque');
      useSearchStore.getState().addSearch('assurance');
      useSearchStore.getState().addSearch('pret');
      useSearchStore.getState().addSearch('investissement'); // dépasse 3
    });

    expect(useSearchStore.getState().recentSearches).toEqual([
      'assurance',
      'pret',
      'investissement',
    ]);
  });
});

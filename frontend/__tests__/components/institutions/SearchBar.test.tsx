import { render, screen } from '@testing-library/react';
import React from 'react';
import SearchBar from '@/components/institutions/SearchBar';
import type { FilterOptions } from '@/types/FilterOptions';

// 1) Mock du hook Zustand (historique de recherche)
jest.mock('@/hooks/useSearchStore', () => ({
  useSearchStore: (selector: any) =>
    selector({
      recentSearches: [], // pas de dropdown à tester ici
      addSearch: () => {}, // no-op
    }),
}));

// 2) Mock du FilterPopupAdapter pour inspecter les props sans interaction
jest.mock('@/components/institutions/filters/FilterPopupAdapter', () => {
  return function MockFilterPopupAdapter(props: {
    isOpen: boolean;
    currentFilters: FilterOptions;
    onClose: () => void;
    onApplyFilters: (f: FilterOptions) => void;
  }) {
    return (
      <div data-testid='filter-popup-adapter'>
        <div data-testid='is-open'>{String(props.isOpen)}</div>
        <div data-testid='current-filters'>{JSON.stringify(props.currentFilters)}</div>
      </div>
    );
  };
});

describe('SearchBar', () => {
  const EMPTY_FILTERS: FilterOptions = { type: [], zone: [], date: '' };

  it('rend le titre avec le nombre de résultats', () => {
    render(
      <SearchBar
        onSearch={() => {}}
        resultsCount={7}
        onApplyFilters={() => {}}
        currentFilters={EMPTY_FILTERS}
      />
    );
    expect(screen.getByText(/Services financiers \(7\)/i)).toBeInTheDocument();
  });

  it('rend le champ de recherche et le bouton "Filtrer"', () => {
    render(
      <SearchBar
        onSearch={() => {}}
        resultsCount={0}
        onApplyFilters={() => {}}
        currentFilters={EMPTY_FILTERS}
      />
    );

    // input présent
    expect(screen.getByPlaceholderText('Rechercher un service...')).toBeInTheDocument();

    // bouton "Filtrer" présent
    expect(screen.getByText('Filtrer')).toBeInTheDocument();
  });

  it('passe bien currentFilters au FilterPopupAdapter et isOpen=false par défaut', () => {
    const currentFilters: FilterOptions = {
      type: ['CREDIT'], // si TS râle ici, cast en ServiceType[] dans ton projet
      zone: ['DAKAR'],
      date: '',
    } as FilterOptions;

    render(
      <SearchBar
        onSearch={() => {}}
        resultsCount={0}
        onApplyFilters={() => {}}
        currentFilters={currentFilters}
      />
    );

    // l’adaptateur est monté
    expect(screen.getByTestId('filter-popup-adapter')).toBeInTheDocument();

    // Par défaut, le state interne filterOpen=false => isOpen doit être "false"
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');

    // Les filtres passés sont retransmis tels quels
    expect(screen.getByTestId('current-filters').textContent).toBe(JSON.stringify(currentFilters));
  });
});

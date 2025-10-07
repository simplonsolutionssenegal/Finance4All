import { render, screen } from '@testing-library/react';
import React from 'react';
import SearchBar from '@/components/institutions/SearchBar';
import type { FilterOptions } from '@/types/FilterOptions';

jest.mock('@/hooks/useSearchStore', () => ({
  useSearchStore: (selector: any) =>
    selector({
      recentSearches: [],
      addSearch: () => {},
    }),
}));

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

    expect(screen.getByPlaceholderText('Rechercher un service...')).toBeInTheDocument();

    expect(screen.getByText('Filtrer')).toBeInTheDocument();
  });

  it('passe bien currentFilters au FilterPopupAdapter et isOpen=false par défaut', () => {
    const currentFilters: FilterOptions = {
      type: ['CREDIT'],
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
    expect(screen.getByTestId('filter-popup-adapter')).toBeInTheDocument();

    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    expect(screen.getByTestId('current-filters').textContent).toBe(JSON.stringify(currentFilters));
  });
});

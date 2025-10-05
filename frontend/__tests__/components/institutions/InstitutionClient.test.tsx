import { render, screen } from '@testing-library/react';
import React from 'react';
import InstitutionClient from '@/components/institutions/InstitutionClient';
import { ServicesAPI } from '@/lib/api-services';

// Mock API
jest.mock('@/lib/api-services', () => ({
  ServicesAPI: {
    getByInstitution: jest.fn().mockResolvedValue([]),
    filterByInstitution: jest.fn().mockResolvedValue([]),
  },
}));

// Mock ServiceList pour afficher le nombre d'items passés
jest.mock('@/components/institutions/ServiceList', () => {
  return function MockServiceList(props: { services: any[]; isLoading?: boolean }) {
    return (
      <div>
        <div data-testid='service-count'>{props.services.length}</div>
        {props.isLoading ? <div data-testid='loading'>loading</div> : null}
      </div>
    );
  };
});

// Mock SearchBar (juste rendu statique, on ne déclenche pas d’actions)
jest.mock('@/components/institutions/SearchBar', () => {
  return function MockSearchBar(props: {
    onSearch: (v: string) => void;
    resultsCount: number;
    onApplyFilters: (f: any) => void;
    currentFilters: any;
  }) {
    return (
      <div>
        <div data-testid='searchbar'>SearchBar</div>
        <div data-testid='results'>{props.resultsCount}</div>
        <div data-testid='current-filters'>{JSON.stringify(props.currentFilters)}</div>
      </div>
    );
  };
});

describe('InstitutionClient', () => {
  it('appelle getByInstitution au montage et rend la liste (0 item au départ)', async () => {
    render(<InstitutionClient institutionId='inst-123' />);

    // getByInstitution doit être appelé une fois au premier chargement (EMPTY_FILTERS)
    expect(ServicesAPI.getByInstitution).toHaveBeenCalledWith('inst-123');

    // ServiceList reçoit un tableau vide => "0"
    expect(await screen.findByTestId('service-count')).toHaveTextContent('0');

    // SearchBar rend aussi le compteur passé (ici 0 car aucune recherche)
    expect(screen.getByTestId('results')).toHaveTextContent('0');
  });
});

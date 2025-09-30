// __tests__/components/institutions/SearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import type { FilterOptions } from '@/types/FilterOptions';

// --- Mock du store Zustand (safe vs hoisting/TDZ) ---
jest.mock('@/hooks/useSearchStore', () => {
  const addSearch = jest.fn();
  // On expose la fonction pour les assertions :
  (global as any).__addSearchMock = addSearch;

  const recentSearches = ['CREDIT', 'EPARGNE', 'MOBILE MONEY'];
  return {
    __esModule: true,
    useSearchStore: (selector: any) => selector({ recentSearches, addSearch }),
  };
});

// --- Mock du FilterPopup (pas de test UI détaillé ici) ---
jest.mock('@/components/institutions/FilterPopup', () => {
  return function MockFilterPopup({
    isOpen,
    onApplyFilters,
    onClose,
  }: {
    isOpen: boolean;
    onApplyFilters: (f: FilterOptions) => void;
    onClose: () => void;
  }) {
    if (!isOpen) return null;

    const apply = () => {
      const mock: FilterOptions = { type: ['CREDIT'], zone: ['1'], date: 'recent' };
      onApplyFilters(mock);
    };

    return (
      <div data-testid='filter-popup'>
        <button onClick={apply}>Appliquer filtres</button>
        <button onClick={onClose}>Fermer</button>
      </div>
    );
  };
});

// ⚠️ on importe APRES les mocks
import SearchBar from '@/components/institutions/SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    // reset du mock exposé via global
    const addSearchMock = (global as any).__addSearchMock as jest.Mock;
    addSearchMock.mockClear();
  });

  it('affiche le titre avec le compteur et le champ de recherche', () => {
    render(<SearchBar onSearch={jest.fn()} resultsCount={10} />);
    expect(screen.getByText(/Services financiers\s*\(10\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Rechercher un service/i)).toBeInTheDocument();
  });

  it('appelle onSearch à la saisie et affiche le dropdown des recherches récentes', () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} resultsCount={5} />);

    const input = screen.getByPlaceholderText(/Rechercher un service/i);

    // focus -> dropdown visible (car le store a des recherches)
    fireEvent.focus(input);
    expect(screen.getByText('CREDIT')).toBeInTheDocument();
    expect(screen.getByText('EPARGNE')).toBeInTheDocument();
    expect(screen.getByText('MOBILE MONEY')).toBeInTheDocument();

    // saisie -> onSearch('banque')
    fireEvent.change(input, { target: { value: 'banque' } });
    expect(handleSearch).toHaveBeenCalledWith('banque');
  });

  it('Enter ajoute la recherche au store et ferme le dropdown', () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} resultsCount={0} />);

    const input = screen.getByPlaceholderText(/Rechercher un service/i);

    fireEvent.change(input, { target: { value: 'banque' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    const addSearchMock = (global as any).__addSearchMock as jest.Mock;
    expect(addSearchMock).toHaveBeenCalledWith('banque');

    // Le dropdown doit se fermer après Enter
    expect(screen.queryByText('CREDIT')).not.toBeInTheDocument();
  });

  it('cliquer sur une recherche récente appelle onSearch et addSearch', () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} resultsCount={0} />);

    const input = screen.getByPlaceholderText(/Rechercher un service/i);
    fireEvent.focus(input);

    // sélectionner "EPARGNE"
    fireEvent.click(screen.getByText('EPARGNE'));

    const addSearchMock = (global as any).__addSearchMock as jest.Mock;
    expect(handleSearch).toHaveBeenCalledWith('EPARGNE');
    expect(addSearchMock).toHaveBeenCalledWith('EPARGNE');
  });

  it('ferme le dropdown quand on clique à l’extérieur', () => {
    render(<SearchBar onSearch={jest.fn()} resultsCount={0} />);
    const input = screen.getByPlaceholderText(/Rechercher un service/i);

    fireEvent.focus(input);
    expect(screen.getByText('CREDIT')).toBeInTheDocument();

    // clic en dehors (mousedown sur le document)
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('CREDIT')).not.toBeInTheDocument();
  });

  it('ouvre le popup de filtre et applique les filtres', () => {
    const handleApplyFilters = jest.fn();
    render(<SearchBar onSearch={jest.fn()} resultsCount={0} onApplyFilters={handleApplyFilters} />);

    const filterBtn = screen.getByRole('button', { name: /Filtrer/i });
    fireEvent.click(filterBtn);

    // notre mock de FilterPopup rend "Appliquer filtres"
    fireEvent.click(screen.getByText(/Appliquer filtres/i));

    expect(handleApplyFilters).toHaveBeenCalledWith({
      type: ['CREDIT'],
      zone: ['1'],
      date: 'recent',
    });
  });
});

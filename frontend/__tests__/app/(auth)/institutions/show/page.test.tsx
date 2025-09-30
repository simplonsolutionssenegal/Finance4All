// __tests__/app/(auth)/institutions/show/page.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

// 👉 1) Mock du BASE_URL de ton app
jest.mock('@/_constantes/url_base', () => ({
  _BASE_URL: 'http://localhost:5000/api/v1',
}));

// 👉 2) Mocks des sous-composants pour simplifier les tests et contrôler les interactions
jest.mock('@/components/institutions/InstituteHeaderProps', () => {
  return function MockHeader() {
    return <div data-testid='mock-header'>HEADER</div>;
  };
});

jest.mock('@/components/institutions/SearchBar', () => {
  return function MockSearchBar(props: {
    onSearch: (v: string) => void;
    resultsCount: number;
    onApplyFilters: (f: any) => void;
  }) {
    return (
      <div data-testid='mock-searchbar'>
        <div>Résultats: {props.resultsCount}</div>
        <button data-testid='btn-search-credit' onClick={() => props.onSearch('credit')}>
          Rechercher 'credit'
        </button>
        <button
          data-testid='btn-apply-filters'
          onClick={() => props.onApplyFilters({ type: ['CREDIT'], zone: [1], date: 'recent' })}
        >
          Appliquer filtres
        </button>
      </div>
    );
  };
});

jest.mock('@/components/institutions/ServiceList', () => {
  return function MockServiceList(props: { services: any[]; isLoading: boolean }) {
    if (props.isLoading) return <div data-testid='loading'>Chargement...</div>;
    return (
      <ul data-testid='service-list'>
        {props.services.map(s => (
          <li key={s.id}>{s.designation}</li>
        ))}
      </ul>
    );
  };
});

// 👉 3) Import du composant (adapte si ton chemin diffère)
import InstitutionPage from '@/app/(auth)/institutions/show/page';

// 👉 4) Types utilitaires (alignés sur ton composant)
type Service = {
  id: number | string;
  designation: string;
  type: string;
  modesRemboursement: string;
};

type ApiResponse<T> = {
  status: 'success' | 'error';
  data: T[];
};

// 👉 5) Données factices & helpers
const SERVICES: Service[] = [
  { id: 1, designation: 'Crédit Habitat', type: 'CREDIT', modesRemboursement: 'Agence' },
  { id: 2, designation: 'Épargne Classique', type: 'EPARGNE', modesRemboursement: 'USSD' },
  { id: 3, designation: 'Crédit Auto', type: 'CREDIT', modesRemboursement: 'Agence' },
];

const ok = (data: Service[]): ApiResponse<Service> => ({ status: 'success', data });

describe('InstitutionPage', () => {
  const BASE_URL = 'http://localhost:5000/api/v1/service/by-institution/1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('charge les services au premier rendu et affiche la liste', async () => {
    // ⚠️ Si ton composant fait 2 fetch au montage, répond identique pour TOUS les appels :
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ok(SERVICES),
    });

    render(<InstitutionPage />);

    // état de chargement visible
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // la liste s’affiche ensuite
    await waitFor(() => expect(screen.getByTestId('service-list')).toBeInTheDocument());

    // l’URL de base est bien appelée au moins une fois
    const calls = (global.fetch as jest.Mock).mock.calls.map(c => c[0] as string);
    expect(calls.some(u => u === BASE_URL)).toBe(true);

    // 3 services visibles
    expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
    expect(screen.getByText('Épargne Classique')).toBeInTheDocument();
    expect(screen.getByText('Crédit Auto')).toBeInTheDocument();

    // header mock présent
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  test('filtre localement via la recherche (onSearch)', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ok(SERVICES),
    });

    render(<InstitutionPage />);

    await waitFor(() => expect(screen.getByTestId('service-list')).toBeInTheDocument());

    // avant recherche: 3 items
    expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
    expect(screen.getByText('Épargne Classique')).toBeInTheDocument();
    expect(screen.getByText('Crédit Auto')).toBeInTheDocument();

    // simule la saisie 'credit' via le bouton du mock SearchBar
    fireEvent.click(screen.getByTestId('btn-search-credit'));

    // après recherche: seuls les crédits restent
    await waitFor(() => {
      expect(screen.queryByText('Épargne Classique')).not.toBeInTheDocument();
      expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
      expect(screen.getByText('Crédit Auto')).toBeInTheDocument();
    });
  });

  test('applique les filtres côté API et construit la bonne URL', async () => {
    // ⚠️ Si 2 fetch au montage, il faut 2 réponses 'Once' identiques AVANT l’appel filtré
    const fetchMock = jest
      .fn()
      // 1er appel (montage)
      .mockResolvedValueOnce({ ok: true, json: async () => ok(SERVICES) })
      // 2e appel (montage)
      .mockResolvedValueOnce({ ok: true, json: async () => ok(SERVICES) })
      // 3e appel (après filtres)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ok([SERVICES[0], SERVICES[2]]),
      });

    global.fetch = fetchMock as any;

    render(<InstitutionPage />);

    await waitFor(() => expect(screen.getByTestId('service-list')).toBeInTheDocument());

    // clique qui déclenche onApplyFilters
    fireEvent.click(screen.getByTestId('btn-apply-filters'));

    // vérifie l’URL filtrée
    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls.map(c => c[0] as string);
      const filteredCall = calls.find(u => u.includes('/filter?'));
      expect(filteredCall).toBeTruthy();
      expect(filteredCall).toContain(`${BASE_URL}/filter?`);
      expect(filteredCall).toContain('type=CREDIT');
      expect(filteredCall).toContain('zone=1');
      expect(filteredCall).toContain('date=recent');
    });

    // la liste après filtre ne contient plus l’épargne
    await waitFor(() => {
      expect(screen.queryByText('Épargne Classique')).not.toBeInTheDocument();
      expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
      expect(screen.getByText('Crédit Auto')).toBeInTheDocument();
    });
  });

  test('affiche une erreur si HTTP non OK, puis retry fonctionne', async () => {
    const fetchMock = jest
      .fn()
      // 1er appel (montage) -> échec
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })
      // 2e appel (montage) -> échec (si double fetch)
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })
      // 3e appel (après 'Réessayer') -> succès
      .mockResolvedValueOnce({ ok: true, json: async () => ok(SERVICES) });

    global.fetch = fetchMock as any;

    render(<InstitutionPage />);

    // message d’erreur visible
    await waitFor(() => {
      expect(screen.getByText(/Erreur de chargement/i)).toBeInTheDocument();
      expect(screen.getByText(/HTTP 500 - Internal Server Error/i)).toBeInTheDocument();
    });

    // clique sur 'Réessayer'
    fireEvent.click(screen.getByRole('button', { name: /Réessayer/i }));

    // revient à la liste
    await waitFor(() => {
      expect(screen.getByTestId('service-list')).toBeInTheDocument();
      expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
      expect(screen.getByText('Épargne Classique')).toBeInTheDocument();
      expect(screen.getByText('Crédit Auto')).toBeInTheDocument();
    });
  });
});

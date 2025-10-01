import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

// 🔧 On mocke les sous-composants pour simplifier le test
jest.mock('@/components/institutions/InstituteHeaderProps', () => ({
  __esModule: true,
  default: function InstituteHeaderMock() {
    return <div data-testid='header'>InstituteHeader</div>;
  },
}));

// Mock de ServiceList : affiche juste les désignations pour pouvoir les asserter
jest.mock('@/components/institutions/ServiceList', () => ({
  __esModule: true,
  default: function ServiceListMock({
    services,
    isLoading,
  }: {
    services: any[];
    isLoading: boolean;
  }) {
    if (isLoading) return <div>Loading...</div>;
    return (
      <ul data-testid='service-list'>
        {services.map(s => (
          <li key={s.id}>{s.designation}</li>
        ))}
      </ul>
    );
  },
}));

// Mock de SearchBar : expose deux boutons pour simuler recherche + filtres
jest.mock('@/components/institutions/SearchBar', () => ({
  __esModule: true,
  default: function SearchBarMock({
    onSearch,
    onApplyFilters,
    resultsCount,
  }: {
    onSearch: (v: string) => void;
    onApplyFilters?: (f: any) => void;
    resultsCount: number;
  }) {
    return (
      <div data-testid='searchbar'>
        <div>Results: {resultsCount}</div>
        <button onClick={() => onSearch('credit')}>Simuler recherche "credit"</button>
        <button
          onClick={() =>
            onApplyFilters?.({
              type: ['CREDIT'],
              zone: [1],
              date: 'recent',
            })
          }
        >
          Appliquer filtres
        </button>
      </div>
    );
  },
}));

// ⚠️ IMPORTANT: ce chemin doit correspondre exactement à ton import réel
import InstitutionPage from '@/app/(auth)/institutions/show/page';

// Aide: structure de réponse attendue par le composant
type ApiResponse<T> = {
  status: 'success' | 'error';
  data: T[];
  message?: string;
};

const mockServices = [
  { id: 1, designation: 'Crédit logement', type: 'CREDIT', modesRemboursement: 'Agence' },
  { id: 2, designation: 'Épargne classique', type: 'EPARGNE', modesRemboursement: 'USSD' },
];

const successResponse: ApiResponse<any> = {
  status: 'success',
  data: mockServices,
};

describe('InstitutionPage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('charge la liste au montage (succès) et affiche les services', async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => successResponse,
    });

    render(<InstitutionPage />);

    // Loading d’abord (mock ServiceList)
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // On attend l’affichage des éléments
    await waitFor(() => {
      expect(screen.getByTestId('service-list')).toBeInTheDocument();
      expect(screen.getByText('Crédit logement')).toBeInTheDocument();
      expect(screen.getByText('Épargne classique')).toBeInTheDocument();
    });

    // Vérifie l’appel initial sans filtres
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/\/service\/by-institution\/1$/);
  });

  it('affiche une erreur quand l’API renvoie un status != ok puis “Réessayer” relance la requête', async () => {
    // 1ère réponse: HTTP 500
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    render(<InstitutionPage />);

    // Une erreur doit s’afficher
    await waitFor(() => {
      expect(screen.getByText(/Erreur de chargement/i)).toBeInTheDocument();
      expect(screen.getByText(/HTTP 500 - Server Error/i)).toBeInTheDocument();
    });

    // 2e réponse: succès après retry
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => successResponse,
    });

    fireEvent.click(screen.getByText('Réessayer'));

    // On s’attend à voir la liste
    await waitFor(() => {
      expect(screen.getByText('Crédit logement')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('applique les filtres et appelle le bon endpoint /filter', async () => {
    // Appel initial (sans filtres)
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => successResponse,
    });

    render(<InstitutionPage />);

    await waitFor(() => {
      expect(screen.getByText('Crédit logement')).toBeInTheDocument();
    });

    // Prépare la réponse pour l’appel filtré
    const filteredResponse: ApiResponse<any> = {
      status: 'success',
      data: [{ id: 3, designation: 'Crédit auto', type: 'CREDIT', modesRemboursement: 'Agence' }],
    };
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => filteredResponse,
    });

    // Clique sur "Appliquer filtres" (exposé par le mock de SearchBar)
    fireEvent.click(screen.getByText('Appliquer filtres'));

    // Vérifie l’affichage du résultat filtré
    await waitFor(() => {
      expect(screen.getByText('Crédit auto')).toBeInTheDocument();
    });

    // Vérifie l’URL appelée contient /filter?type=CREDIT&zone=1&date=recent (ordre des params non garanti)
    const lastCallUrl = (global.fetch as jest.Mock).mock.calls.pop()[0] as string;
    expect(lastCallUrl).toMatch(/\/service\/by-institution\/1\/filter\?/);
    expect(lastCallUrl).toMatch(/type=CREDIT/);
    expect(lastCallUrl).toMatch(/zone=1/);
    expect(lastCallUrl).toMatch(/date=recent/);
  });

  it('filtre côté client par terme de recherche (via onSearch)', async () => {
    // Appel initial
    // @ts-expect-error
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => successResponse,
    });

    render(<InstitutionPage />);

    await waitFor(() => {
      expect(screen.getByText('Crédit logement')).toBeInTheDocument();
      expect(screen.getByText('Épargne classique')).toBeInTheDocument();
    });

    // Le mock SearchBar expose un bouton pour appeler onSearch('credit')
    fireEvent.click(screen.getByText(/Simuler recherche "credit"/i));

    // Comme le filtre client utilise .includes sur designation/type/modesRemboursement,
    // "Épargne classique" doit disparaître si aucun champ ne contient "credit"
    await waitFor(() => {
      expect(screen.getByText('Crédit logement')).toBeInTheDocument();
      expect(screen.queryByText('Épargne classique')).toBeNull();
    });
  });
});

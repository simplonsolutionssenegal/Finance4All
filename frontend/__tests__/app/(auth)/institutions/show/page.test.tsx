// __tests__/app/(auth)/institutions/show/page.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

jest.mock('@/_constantes/url_base', () => ({
  _BASE_URL: 'http://localhost:5000/api/v1',
}));

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

import InstitutionPage from '@/app/(auth)/institutions/show/page';

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
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ok(SERVICES),
    });

    render(<InstitutionPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByTestId('service-list')).toBeInTheDocument());

    const calls = (global.fetch as jest.Mock).mock.calls.map(c => c[0] as string);
    expect(calls.some(u => u === BASE_URL)).toBe(true);

    expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
    expect(screen.getByText('Épargne Classique')).toBeInTheDocument();
    expect(screen.getByText('Crédit Auto')).toBeInTheDocument();

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  test('filtre localement via la recherche (onSearch)', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ok(SERVICES),
    });

    render(<InstitutionPage />);

    await waitFor(() => expect(screen.getByTestId('service-list')).toBeInTheDocument());

    expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
    expect(screen.getByText('Épargne Classique')).toBeInTheDocument();
    expect(screen.getByText('Crédit Auto')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-search-credit'));

    await waitFor(() => {
      expect(screen.queryByText('Épargne Classique')).not.toBeInTheDocument();
      expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
      expect(screen.getByText('Crédit Auto')).toBeInTheDocument();
    });
  });

  test('applique les filtres côté API et construit la bonne URL', async () => {
    const fetchMock = jest
      .fn()

      .mockResolvedValueOnce({ ok: true, json: async () => ok(SERVICES) })

      .mockResolvedValueOnce({ ok: true, json: async () => ok(SERVICES) })

      .mockResolvedValueOnce({
        ok: true,
        json: async () => ok([SERVICES[0], SERVICES[2]]),
      });

    global.fetch = fetchMock as any;

    render(<InstitutionPage />);

    await waitFor(() => expect(screen.getByTestId('service-list')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('btn-apply-filters'));

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls.map(c => c[0] as string);
      const filteredCall = calls.find(u => u.includes('/filter?'));
      expect(filteredCall).toBeTruthy();
      expect(filteredCall).toContain(`${BASE_URL}/filter?`);
      expect(filteredCall).toContain('type=CREDIT');
      expect(filteredCall).toContain('zone=1');
      expect(filteredCall).toContain('date=recent');
    });

    await waitFor(() => {
      expect(screen.queryByText('Épargne Classique')).not.toBeInTheDocument();
      expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
      expect(screen.getByText('Crédit Auto')).toBeInTheDocument();
    });
  });

  test('affiche une erreur si HTTP non OK, puis retry fonctionne', async () => {
    const fetchMock = jest
      .fn()

      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })

      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })

      .mockResolvedValueOnce({ ok: true, json: async () => ok(SERVICES) });

    global.fetch = fetchMock as any;

    render(<InstitutionPage />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur de chargement/i)).toBeInTheDocument();
      expect(screen.getByText(/HTTP 500 - Internal Server Error/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Réessayer/i }));

    await waitFor(() => {
      expect(screen.getByTestId('service-list')).toBeInTheDocument();
      expect(screen.getByText('Crédit Habitat')).toBeInTheDocument();
      expect(screen.getByText('Épargne Classique')).toBeInTheDocument();
      expect(screen.getByText('Crédit Auto')).toBeInTheDocument();
    });
  });
});

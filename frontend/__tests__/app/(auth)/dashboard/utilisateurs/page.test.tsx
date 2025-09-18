import React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import UsersPage from '@/app/(auth)/dashboard/utilisateurs/page';

// 💡 URL de base mockée (aligne avec ton code: ...API_UR sans L)
jest.mock('@/app/_constantes/api_constants', () => ({
  NEXT_PUBLIC_API_UR: 'https://api.example.com/',
}));

const mockUsers = [
  {
    id: 1,
    email: 'john@example.com',
    username: 'john123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Admin',
    status: 'ACTIF',
    avatar: null,
    isActive: true,
    lastSignInAt: '2025-09-18T10:00:00Z',
    organisationId: 37,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    publicMetadata: { role: 'Admin' },
  },
  {
    id: 2,
    email: 'jane@example.com',
    username: 'jane456',
    firstName: 'Jane',
    lastName: 'Smith',
    status: 'INACTIF',
    avatar: null,
    isActive: false,
    lastSignInAt: null,
    organisationId: 37,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

beforeEach(() => {
  // @ts-expect-error override fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () =>
        Promise.resolve({
          status: 'success',
          results: mockUsers.length,
          data: mockUsers,
        }),
    }),
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('UsersPage', () => {
  test('affiche un spinner pendant le chargement', async () => {
    const { container } = render(<UsersPage />);
    // Spinner présent immédiatement
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    // Attendre que le spinner disparaisse pour éviter le warning act(...)
    await waitForElementToBeRemoved(() => container.querySelector('.animate-spin'));
  });

  test('affiche les utilisateurs après chargement', async () => {
    render(<UsersPage />);

    // Vérifie que fetch est appelé avec l’URL attendue
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/organisations/37/users',
      ),
    );

    // On s’appuie sur les emails (stables)
    expect(await screen.findByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();

    // Le spinner ne doit plus être visible
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
  });

  test('affiche un message d’erreur si fetch échoue', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });

    render(<UsersPage />);

    expect(await screen.findByText(/Erreur de chargement/i)).toBeInTheDocument();
    // Le message reprend `statusText` via l’Error construite par le composant
    expect(screen.getByText(/HTTP 500 - Internal Server Error/i)).toBeInTheDocument();
  });

  test('filtre les utilisateurs via la recherche', async () => {
    render(<UsersPage />);

    // Attendre que la liste soit rendue
    await screen.findByText('john@example.com');

    // Trouver l’input de la SearchBar (placeholder réel)
    const input = screen.getByPlaceholderText('Rechercher un utilisateur...');
    fireEvent.change(input, { target: { value: 'jane' } });

    await waitFor(() => {
      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });
});

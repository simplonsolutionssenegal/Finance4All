// __tests__/app/(auth)/dashboard/utilisateurs/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import UsersPage from '@/app/(auth)/dashboard/utilisateurs/page';

// --- Setup global fetch & console ---
beforeAll(() => {
    // assure que fetch est un mock utilisable dans tous les tests
    (global as any).fetch = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => { });
});
afterAll(() => {
    (console.log as jest.Mock).mockRestore();
});
beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
});

// --- Mocks enfants avec LES ALIAS `@/…` (comme dans le code réel) ---
jest.mock('@/components/admin/SearchBar', () => {
    return function MockSearchBar({ onSearch, onApplyFilters, resultsCount }: any) {
        return (
            <div data-testid="search-bar">
                <input
                    data-testid="search-input"
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Rechercher..."
                />
                <span data-testid="results-count">{resultsCount} résultats</span>
                <button
                    data-testid="apply-filters"
                    onClick={() =>
                        onApplyFilters({
                            role: ['admin'],
                            status: ['ACTIF'],
                            lastConnection: '',
                            customDate: '',
                        })
                    }
                >
                    Appliquer filtres
                </button>
            </div>
        );
    };
});

jest.mock('@/components/admin/UserTable', () => {
    return function MockUserTable({ users, isLoading }: any) {
        if (isLoading) return <div data-testid="loading">Chargement...</div>;
        return (
            <div data-testid="user-table">
                {users.map((user: any) => (
                    <div key={user.id} data-testid={`user-${user.id}`}>
                        {user.email} - {user.role}
                    </div>
                ))}
            </div>
        );
    };
});

jest.mock('@/components/admin/UserStatst', () => {
    return function MockUserStats({ users }: any) {
        return <div data-testid="user-stats">{users.length} utilisateurs</div>;
    };
});

// --- Mock de la constante d’API avec l’alias ---
jest.mock('@/app/_constantes/api_constants', () => ({
    NEXT_PUBLIC_API_UR: 'http://api/',
}));

// --- Données de test ---
const mockUsers = [
    {
        id: 1,
        email: 'john.doe@example.com',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        status: 'ACTIF',
        avatar: '',
        isActive: true,
        lastLoginAt: '2023-01-15T10:00:00Z',
        organisationId: 37,
        organisation: {
            id: 37, name: 'Test Org', avatar: '', address: '', phone: '',
            createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
        },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 2,
        email: 'jane.smith@example.com',
        username: 'janesmith',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
        status: 'INACTIF',
        avatar: '',
        isActive: false,
        lastLoginAt: '2023-01-10T10:00:00Z',
        organisationId: 37,
        organisation: {
            id: 37, name: 'Test Org', avatar: '', address: '', phone: '',
            createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
        },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
];

const mockApiResponse = {
    status: 'success',
    results: mockUsers.length,
    data: mockUsers,
};

// --- Tests ---
describe('UsersPage', () => {
    describe('Chargement des données', () => {
        it('charge et affiche les utilisateurs', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockApiResponse,
            });

            render(<UsersPage />);

            expect(screen.getByTestId('loading')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByTestId('results-count').textContent?.replace(/\s+/g, ' ').trim())
                    .toBe('2 résultats');
            });

            expect(screen.getByTestId('user-1')).toBeInTheDocument();
            expect(screen.getByTestId('user-2')).toBeInTheDocument();
            expect(screen.getByText('2 utilisateurs')).toBeInTheDocument();
        });

        it("affiche une erreur si le chargement échoue (rejété)", async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Erreur réseau'));
            render(<UsersPage />);

            await waitFor(() => {
                expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
                expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
            });
        });

        it('affiche une erreur pour une réponse HTTP non-OK', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            render(<UsersPage />);

            await waitFor(() => {
                expect(screen.getByText('HTTP 404 - Not Found')).toBeInTheDocument();
            });
        });

        it('gère le bouton Réessayer', async () => {
            (global.fetch as jest.Mock)
                .mockRejectedValueOnce(new Error('Erreur réseau')) // 1er appel : KO
                .mockResolvedValue({                               // ensuite : OK pour tous
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    json: async () => mockApiResponse,
                });

            render(<UsersPage />);

            await waitFor(() => {
                expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Réessayer'));

            await waitFor(() => {
                expect(screen.getByTestId('user-1')).toBeInTheDocument();
            });
        });

    });

    describe('Recherche locale', () => {
        beforeEach(async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockApiResponse,
            });
            render(<UsersPage />);
            await waitFor(() => {
                expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
            });
        });

        it('affiche tout quand la recherche est vide', async () => {
            const input = screen.getByPlaceholderText('Rechercher...');

            // Simule une saisie
            fireEvent.change(input, { target: { value: 'john' } });

            // Puis on vide pour vérifier “tout est affiché”
            fireEvent.change(input, { target: { value: '' } });

            await waitFor(() => {
                expect(screen.getByText('2 résultats')).toBeInTheDocument();
            });
        });

    });

    describe('Filtres distants', () => {
        beforeEach(async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockApiResponse,
            });
            render(<UsersPage />);
            await waitFor(() => {
                expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
            });
        });

        it('ré-appelle l’API quand on applique des filtres', async () => {
            const callsBefore = (global.fetch as jest.Mock).mock.calls.length;
            fireEvent.click(screen.getByTestId('apply-filters'));

            await waitFor(() => {
                expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(callsBefore);
            });
        });

        it("construit correctement l'URL de filtrage", async () => {
            fireEvent.click(screen.getByTestId('apply-filters'));

            await waitFor(() => {
                const calls = (global.fetch as jest.Mock).mock.calls;
                const lastUrl = String(calls[calls.length - 1][0]);
                expect(lastUrl).toContain('/filter');
                expect(lastUrl).toContain('status=ACTIF');
                expect(lastUrl).toContain('role=admin');
            });
        });
    });

    describe("URL de base sans filtres", () => {
        it("utilise l'endpoint non filtré", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockApiResponse,
            });
            render(<UsersPage />);
            await waitFor(() => {
                const firstUrl = String((global.fetch as jest.Mock).mock.calls[0][0]);
                expect(firstUrl).toBe('http://api/users/organisations/37/users');
            });
        });
    });

    describe('États de chargement & format API', () => {
        it('affiche le loading pendant la requête', () => {
            (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));
            render(<UsersPage />);
            expect(screen.getByTestId('loading')).toBeInTheDocument();
        });

        it('gère un format de réponse invalide', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ status: 'error', message: 'Bad format' }),
            });
            render(<UsersPage />);
            await waitFor(() => {
                expect(screen.getByText('Format de réponse API inattendu')).toBeInTheDocument();
            });
        });
    });
});

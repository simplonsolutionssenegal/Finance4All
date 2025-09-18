import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 🔧 Mock léger du Dialog shadcn pour simplifier les tests
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import UserTable from '@/components/admin/UserTable';

type Status = 'ACTIF' | 'INACTIF' | 'EN_ATTENTE';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role?: string;
  status: Status;
  avatar?: string;
  isActive: boolean;
  lastSignInAt: string | null;
  organisationId: number;
  createdAt: string;
  updatedAt: string;
}

const makeUser = (i: number, overrides: Partial<User> = {}): User => ({
  id: String(i),
  email: `user${i}@example.com`,
  username: `user${i}`,
  firstName: `First${i}`,
  lastName: `Last${i}`,
  role: i % 2 === 0 ? 'admin' : 'manager',
  status: (i % 3 === 0 ? 'EN_ATTENTE' : i % 2 === 0 ? 'ACTIF' : 'INACTIF') as Status,
  avatar: undefined,
  isActive: i % 2 === 0,
  lastSignInAt: i % 4 === 0 ? null : `2025-09-${(i % 28) + 1}T12:00:00.000Z`,
  organisationId: 37,
  createdAt: '2025-09-01T00:00:00.000Z',
  updatedAt: '2025-09-10T00:00:00.000Z',
  ...overrides,
});

describe('UserTable', () => {
  test('affiche le spinner quand isLoading = true', () => {
    const { container } = render(<UserTable users={[]} isLoading={true} />);
    // on cherche l’élément animé (classe Tailwind)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('affiche l’état vide quand users.length = 0 et isLoading = false', () => {
    render(<UserTable users={[]} isLoading={false} />);
    expect(screen.getByText('Aucun utilisateur')).toBeInTheDocument();
    expect(screen.getByText('Commencez par ajouter un nouvel utilisateur.')).toBeInTheDocument();
  });

  test('rend les 5 premiers users avec pagination (5 par page)', async () => {
    const users = Array.from({ length: 8 }, (_, idx) => makeUser(idx + 1));
    render(<UserTable users={users} isLoading={false} />);

    // Page 1 / 2
    expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();

    // 5 premiers visibles
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`user${i}@example.com`)).toBeInTheDocument();
    }
    // le 6e pas encore visible
    expect(screen.queryByText('user6@example.com')).not.toBeInTheDocument();

    // bouton Précédent désactivé sur la première page
    const prevBtn = screen.getByRole('button', { name: /Précédent/i });
    const nextBtn = screen.getByRole('button', { name: /Suivant/i });
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Aller en page 2
    await userEvent.click(nextBtn);
    expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();

    // Les 3 suivants (6..8) visibles, le 1 plus visible
    for (let i = 6; i <= 8; i++) {
      expect(screen.getByText(`user${i}@example.com`)).toBeInTheDocument();
    }
    expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();

    // En dernière page, Suivant désactivé
    expect(nextBtn).toBeDisabled();
    expect(prevBtn).not.toBeDisabled();
  });

  test('affiche le badge statut correct et "Jamais connecté" si lastSignInAt = null', () => {
    const users: User[] = [
      makeUser(1, { status: 'ACTIF', lastSignInAt: '2025-09-12T10:00:00.000Z' }),
      makeUser(2, { status: 'INACTIF', lastSignInAt: '2025-09-11T10:00:00.000Z' }),
      makeUser(3, { status: 'EN_ATTENTE', lastSignInAt: null }),
    ];

    render(<UserTable users={users} isLoading={false} />);

    // Badges (texte)
    expect(screen.getByText('Actif')).toBeInTheDocument();
    expect(screen.getByText('Inactif')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();

    // "Jamais connecté" présent pour le 3e user
    expect(screen.getByText(/Jamais connecté/i)).toBeInTheDocument();
  });

  test('affiche les actions (modifier / supprimer) pour chaque user', () => {
    const users = [makeUser(1), makeUser(2)];
    render(<UserTable users={users} isLoading={false} />);

    // Boutons d’action en fonction des titres/aria-label
    expect(
      screen.getByRole('button', { name: new RegExp(`Modifier ${users[0].firstName}`, 'i') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(`Supprimer ${users[0].firstName}`, 'i') }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: new RegExp(`Modifier ${users[1].firstName}`, 'i') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(`Supprimer ${users[1].firstName}`, 'i') }),
    ).toBeInTheDocument();
  });
});

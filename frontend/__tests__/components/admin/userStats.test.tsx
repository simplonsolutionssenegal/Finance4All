import React from 'react';
import { render, screen } from '@testing-library/react';
import UserStatst from '@/components/admin/UserStatst';

type Status = 'ACTIF' | 'INACTIF' | 'EN_ATTENTE';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role?: string;
  status?: Status;
  avatar?: string;
  isActive: boolean;
  lastSignInAt: string | null;
  organisationId: number;
  createdAt: string;
  updatedAt: string;
}

const makeUser = (i: number, status: Status): User => ({
  id: String(i),
  email: `user${i}@example.com`,
  username: `user${i}`,
  firstName: `First${i}`,
  lastName: `Last${i}`,
  status,
  isActive: status === 'ACTIF',
  lastSignInAt: null,
  organisationId: 37,
  createdAt: '2025-09-01T00:00:00.000Z',
  updatedAt: '2025-09-10T00:00:00.000Z',
});

describe('UserStatst', () => {
  test('affiche 0 partout quand la liste est vide', () => {
    render(<UserStatst users={[]} />);

    expect(screen.getByTestId('card-total-count')).toHaveTextContent('0');
    expect(screen.getByTestId('card-total-percentage')).toHaveTextContent('0% Actifs');

    expect(screen.getByTestId('card-active-count')).toHaveTextContent('0');
    expect(screen.getByTestId('card-active-percentage')).toHaveTextContent('0%');

    expect(screen.getByTestId('card-pending-count')).toHaveTextContent('0');
    expect(screen.getByTestId('card-pending-percentage')).toHaveTextContent('0%');
  });

  test('calcule correctement les comptes et pourcentages (arrondis) sur un jeu équilibré', () => {
    // 10 users : 5 ACTIF, 3 EN_ATTENTE, 2 INACTIF
    const users: User[] = [
      ...Array.from({ length: 5 }, (_, i) => makeUser(i + 1, 'ACTIF')),
      ...Array.from({ length: 3 }, (_, i) => makeUser(100 + i, 'EN_ATTENTE')),
      ...Array.from({ length: 2 }, (_, i) => makeUser(200 + i, 'INACTIF')),
    ];

    render(<UserStatst users={users} />);

    // Totaux
    expect(screen.getByTestId('card-total-count')).toHaveTextContent('10');
    expect(screen.getByTestId('card-active-count')).toHaveTextContent('5');
    expect(screen.getByTestId('card-pending-count')).toHaveTextContent('3');

    // % arrondis: actifs 50%, en attente 30%
    expect(screen.getByTestId('card-total-percentage')).toHaveTextContent('50% Actifs');
    expect(screen.getByTestId('card-active-percentage')).toHaveTextContent('50%');
    expect(screen.getByTestId('card-pending-percentage')).toHaveTextContent('30%');
  });

  test('arrondit correctement avec des ratios non entiers', () => {
    // 3 users : 2 ACTIF (≈ 66.67% => 67%), 1 EN_ATTENTE (≈ 33.33% => 33%)
    const users: User[] = [
      makeUser(1, 'ACTIF'),
      makeUser(2, 'ACTIF'),
      makeUser(3, 'EN_ATTENTE'),
    ];

    render(<UserStatst users={users} />);

    expect(screen.getByTestId('card-total-count')).toHaveTextContent('3');
    expect(screen.getByTestId('card-active-count')).toHaveTextContent('2');
    expect(screen.getByTestId('card-pending-count')).toHaveTextContent('1');

    expect(screen.getByTestId('card-total-percentage')).toHaveTextContent('67% Actifs');
    expect(screen.getByTestId('card-active-percentage')).toHaveTextContent('67%');
    expect(screen.getByTestId('card-pending-percentage')).toHaveTextContent('33%');
  });
});

// frontend/components/admin/__tests__/UserTable.test.tsx
import UserTable from '@/components/admin/UserTable';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';


type User = Parameters<typeof UserTable>[0]['users'][number];

const baseUser: User = {
  id: 1,
  email: 'jane.doe@example.com',
  username: 'janed',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'admin',
  status: 'ACTIF',
  avatar: '',
  isActive: true,
  lastLoginAt: '2025-08-31T14:09:09.613Z',
  organisationId: 1,
  organisation: {
    id: 1,
    name: 'Org',
    avatar: '',
    address: '',
    phone: '',
    createdAt: '',
    updatedAt: '',
  },
  createdAt: '',
  updatedAt: '',
};

function makeUser(overrides?: Partial<User>): User {
  return { ...baseUser, ...overrides, id: overrides?.id ?? baseUser.id };
}

function buildUsers(list: Array<Partial<User>>): User[] {
  return list.map((u, i) => makeUser({ id: i + 1, ...u }));
}

describe('UserTable', () => {
  test('affiche le loader quand isLoading=true', () => {
    const { container } = render(<UserTable users={[]} isLoading={true} />);
    // Le spinner n’a pas de rôle/texte — on vérifie la présence de l’élément .animate-spin
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    // Et on s’assure que la table n’est pas rendue
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test("affiche l'état vide quand users=[] et isLoading=false", () => {
    render(<UserTable users={[]} isLoading={false} />);
    expect(screen.getByText(/Aucun utilisateur/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Commencez par ajouter un nouvel utilisateur/i)
    ).toBeInTheDocument();
  });

  test('affiche les lignes + pagination et le badge de statut', async () => {
    // 7 users -> 2 pages (itemsPerPage=5)
    const users = buildUsers([
      { firstName: 'Jane', lastName: 'Doe', role: 'admin', status: 'ACTIF' },
      { firstName: 'John', lastName: 'Smith', role: 'manager', status: 'pending' },
      { firstName: 'Amy', lastName: 'Lee', role: 'user', status: 'inactive' },
      { firstName: 'Bob', lastName: 'Ray', role: 'user', status: 'ACTIF' },
      { firstName: 'Eva', lastName: 'Fox', role: 'manager', status: 'pending' },
      { firstName: 'Tom', lastName: 'Kay', role: 'user', status: 'inactive' },
      { firstName: 'Lia', lastName: 'Kim', role: 'admin', status: 'ACTIF' },
    ]);

    render(<UserTable users={users} isLoading={false} />);

    // En-têtes
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Rôle')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Dernière connexion')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    // Page 1/2
    expect(screen.getByText(/Page 1 \/ 2/)).toBeInTheDocument();

    // "Jane Doe" visible sur la page 1
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();

    // Badge statut ACTIF : label "Actif" + classe Tailwind "text-green-600"
    const actifEls = screen.getAllByText('Actif');
    expect(actifEls.length).toBeGreaterThan(0);
    // on vérifie la classe sur au moins un badge
    expect(actifEls[0].closest('span')?.className).toMatch(/text-green-600/);

    // Pagination: Suivant actif / Précédent disabled
    const prevBtn = screen.getByRole('button', { name: /Précédent/i });
    const nextBtn = screen.getByRole('button', { name: /Suivant/i });
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Aller page 2
    await userEvent.click(nextBtn);
    expect(screen.getByText(/Page 2 \/ 2/)).toBeInTheDocument();

    // "Lia Kim" sur la page 2
    expect(screen.getByText(/Lia Kim/)).toBeInTheDocument();
  });

  test("affiche les boutons d'action (Modifier/Supprimer) pour chaque ligne", () => {
    const users = buildUsers([{ firstName: 'Jane', lastName: 'Doe' }]);
    render(<UserTable users={users} isLoading={false} />);

    // Bouton Modifier (aria-label défini dans le composant)
    expect(
      screen.getByRole('button', { name: /Modifier Jane Doe/i })
    ).toBeInTheDocument();

    // Bouton Supprimer
    expect(
      screen.getByRole('button', { name: /Supprimer Jane Doe/i })
    ).toBeInTheDocument();
  });

  test('affiche les initiales dans le rond (ex: JD pour Jane Doe)', () => {
    const users = buildUsers([{ firstName: 'Jane', lastName: 'Doe' }]);
    render(<UserTable users={users} isLoading={false} />);
    // Les initiales sont rendues comme texte direct
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});

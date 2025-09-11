import { render, screen ,fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from '@/components/admin/SearchBar';
// ✅ On mocke FilterPopup pour piloter facilement les callbacks
jest.mock('@/components/admin/FilterPopup', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onApplyFilters }: any) => (
    <div data-testid="filter-popup" data-open={isOpen}>
      {isOpen && (
        <div>
          <button onClick={onClose} aria-label="Fermer le filtre">Fermer</button>
          <button
            onClick={() =>
              onApplyFilters?.({ role: ['admin'], status: ['ACTIF'], lastConnection: '', customDate: '' })
            }
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  ),
}));

describe('SearchBar', () => {
  it('affiche le titre et le compteur de résultats', () => {
    render(<SearchBar onSearch={() => {}} resultsCount={42} />);
    expect(screen.getByText(/Liste des utilisateurs/i)).toBeInTheDocument();
    expect(screen.getByText(/\(42\)/)).toBeInTheDocument();
  });

 it('appelle onSearch à la saisie (fireEvent)', () => {
  const onSearch = jest.fn();

  render(<SearchBar onSearch={onSearch} resultsCount={0} />);

  const input = screen.getByPlaceholderText(/Rechercher un utilisateur/i);
  fireEvent.change(input, { target: { value: 'Ali' } });

  expect(onSearch).toHaveBeenCalledWith('Ali');
});

  it('ouvre le popup de filtres puis le ferme', async () => {
    const user = userEvent;
    render(<SearchBar onSearch={() => {}} resultsCount={0} />);

    const popup = screen.getByTestId('filter-popup');
    // Par défaut fermé
    expect(popup).toHaveAttribute('data-open', 'false');

    // Clique sur "Filtrer" -> ouvert
    await user.click(screen.getByRole('button', { name: /Filtrer/i }));
    expect(popup).toHaveAttribute('data-open', 'true');

    // Fermer via le bouton du mock
    await user.click(screen.getByRole('button', { name: /Fermer le filtre/i }));
    expect(popup).toHaveAttribute('data-open', 'false');
  });

  it('appelle onApplyFilters avec les filtres et referme le popup', async () => {
    const user = userEvent;
    const onApplyFilters = jest.fn();
    render(
      <SearchBar
        onSearch={() => {}}
        resultsCount={0}
        onApplyFilters={onApplyFilters}
        rolesOptions={['admin', 'manager']}
        statusesOptions={['ACTIF', 'INACTIF']}
      />
    );

    // Ouvrir
    await user.click(screen.getByRole('button', { name: /Filtrer/i }));
    const popup = screen.getByTestId('filter-popup');
    expect(popup).toHaveAttribute('data-open', 'true');

    // Appliquer filtres (via le mock)
    await user.click(screen.getByRole('button', { name: /Appliquer/i }));
    expect(onApplyFilters).toHaveBeenCalledWith({
      role: ['admin'],
      status: ['ACTIF'],
      lastConnection: '',
      customDate: '',
    });

    // Le composant ferme le popup après application
    expect(popup).toHaveAttribute('data-open', 'false');
  });

  it('le bouton "Ajouter un utilisateur" est visible', () => {
    render(<SearchBar onSearch={() => {}} resultsCount={0} />);
    expect(screen.getByRole('button', { name: /Ajouter un utilisateur/i })).toBeInTheDocument();
  });
});

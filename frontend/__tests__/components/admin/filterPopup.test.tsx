// __tests__/components/admin/filterPopup.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterPopup, { type FilterOptions } from '@/components/admin/FilterPopup';

describe('FilterPopup', () => {
  const onClose = jest.fn();
  const onApplyFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderOpen = () =>
    render(<FilterPopup isOpen={true} onClose={onClose} onApplyFilters={onApplyFilters} />);

  const renderClosed = () =>
    render(<FilterPopup isOpen={false} onClose={onClose} onApplyFilters={onApplyFilters} />);

  // Helper: cliquer un chip (souvent du texte à l'intérieur d'un <label>)
  const clickChip = (text: string) => {
    const node = screen.getByText(text);
    const label = node.closest('label') ?? node;
    fireEvent.click(label as HTMLElement);
  };

  it('ne rend rien quand isOpen=false', () => {
    const { container } = renderClosed();
    expect(container.firstChild).toBeNull();
  });

  it('rend le contenu quand isOpen=true (sections Rôle / Dernière connexion / Statut)', () => {
    renderOpen();
    expect(screen.getByText('Rôle')).toBeInTheDocument();
    expect(screen.getByText('Dernière connexion')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();

    // Quelques options visibles
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Développeur')).toBeInTheDocument();
    expect(screen.getByText('Collaborateur')).toBeInTheDocument();

    expect(screen.getByText('Plus récent')).toBeInTheDocument();
    expect(screen.getByText('Il y a un mois')).toBeInTheDocument();
    expect(screen.getByText('Choisir une date')).toBeInTheDocument();

    expect(screen.getByText('Actif')).toBeInTheDocument();
    expect(screen.getByText('Inactif')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  it('validation: empêche Confirmer sans aucun filtre sélectionné', () => {
    renderOpen();
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    expect(window.alert).toHaveBeenCalledWith(
      'Veuillez sélectionner au moins un filtre (statut, rôle ou date de connexion).'
    );
    expect(onApplyFilters).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('validation: exige une date quand "Choisir une date" est sélectionné sans date', () => {
    renderOpen();

    // Choisir "Choisir une date"
    clickChip('Choisir une date');

    // Confirmer sans date -> alerte
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    expect(window.alert).toHaveBeenCalledWith(
      'Veuillez sélectionner une date pour le filtre personnalisé.'
    );
    expect(onApplyFilters).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Confirmer: applique Rôle + Statut + Dernière connexion (non custom) et ferme', () => {
    renderOpen();

    // Rôles
    clickChip('Admin');
    // Statuts
    clickChip('Actif');
    // Dernière connexion
    clickChip('Plus récent');

    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    // Vérifie la payload envoyée
    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    const payload = (onApplyFilters.mock.calls[0][0] as FilterOptions);
    expect(payload).toEqual({
      role: ['admin'],              // valeurs en lowercase côté composant
      status: ['ACTIF'],            // valeurs en UPPERCASE côté composant
      lastConnection: 'recent',
      customDate: '',
    });

    // Ferme le popup
    expect(onClose).toHaveBeenCalled();
  });

  it('Confirmer: applique la date custom si "Choisir une date" + saisie de date', () => {
    renderOpen();

    // Sélectionne "Choisir une date"
    clickChip('Choisir une date');

    // Récupère l'input type="date"
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();

    // Saisit la date
    fireEvent.change(dateInput, { target: { value: '2025-08-15' } });
    expect(dateInput.value).toBe('2025-08-15');

    // Coche un statut pour satisfaire la validation "au moins un filtre"
    clickChip('Actif');

    // Confirme
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    // Vérifie la payload envoyée
    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(onApplyFilters).toHaveBeenCalledWith({
      role: [],
      status: ['ACTIF'],
      lastConnection: 'custom',
      customDate: '2025-08-15',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('Annuler: reset les filtres, appelle onApplyFilters avec reset et ferme', () => {
    renderOpen();

    // Préselectionne quelques filtres
    clickChip('Admin');
    clickChip('Actif');
    clickChip('Plus récent');

    // Annuler
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    const reset = onApplyFilters.mock.calls[0][0] as FilterOptions;
    expect(reset).toEqual({
      role: [],
      lastConnection: '',
      customDate: '',
      status: [],
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('toggle rôle/statut: re-cliquer le même chip le retire', () => {
    renderOpen();

    // Toggle "Admin" on/off
    clickChip('Admin');
    clickChip('Admin');

    // Ajoute "Actif" pour satisfaire la 1ère validation
    clickChip('Actif');

    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    const payload = onApplyFilters.mock.calls[0][0] as FilterOptions;
    expect(payload.role).toEqual([]); // retiré
    expect(payload.status).toEqual(['ACTIF']);
  });
});

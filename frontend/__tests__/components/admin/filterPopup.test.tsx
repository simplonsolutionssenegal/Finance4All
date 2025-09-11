import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
  import { fireEvent } from '@testing-library/react';
import FilterPopup, { type FilterOptions } from '@/components/admin/FilterPopup';

describe('FilterPopup', () => {
  const onClose = jest.fn();
  const onApplyFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock des alertes pour vérifier les validations
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderOpen = () =>
    render(<FilterPopup isOpen={true} onClose={onClose} onApplyFilters={onApplyFilters} />);

  const renderClosed = () =>
    render(<FilterPopup isOpen={false} onClose={onClose} onApplyFilters={onApplyFilters} />);

  // Helper: cliquer sur un "chip" (label) par son texte
  const clickChip = async (text: string) => {
    const node = screen.getByText(text);
    const label = node.closest('label') ?? node;
    await userEvent.click(label as HTMLElement);
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

  it('validation: empêche Confirmer sans aucun filtre sélectionné', async () => {
    renderOpen();
    await userEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    expect(window.alert).toHaveBeenCalledWith(
      'Veuillez sélectionner au moins un filtre (statut, rôle ou date de connexion).'
    );
    expect(onApplyFilters).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('validation: exige une date quand "Choisir une date" est sélectionné sans date', async () => {
    renderOpen();

    // Choisir "Choisir une date"
    await clickChip('Choisir une date');

    // Confirmer sans date -> alerte
    await userEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    expect(window.alert).toHaveBeenCalledWith(
      'Veuillez sélectionner une date pour le filtre personnalisé.'
    );
    expect(onApplyFilters).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Confirmer: applique Rôle + Statut + Dernière connexion (non custom) et ferme', async () => {
    renderOpen();

    // Rôles
    await clickChip('Admin');
    // Statuts
    await clickChip('Actif');
    // Dernière connexion
    await clickChip('Plus récent');

    await userEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

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

  it('Confirmer: applique la date custom si "Choisir une date" + saisie de date', async () => {
  render(<FilterPopup isOpen={true} onClose={onClose} onApplyFilters={onApplyFilters} />);

  // Sélectionne "Choisir une date"
  await userEvent.click(screen.getByText('Choisir une date').closest('label')!);

  // Récupère l'input type="date" via un sélecteur
  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
  expect(dateInput).toBeInTheDocument();

  // Saisit la date (avec change pour JSDOM)
  // userEvent.type() marche parfois, mais change() est plus fiable ici.

  fireEvent.change(dateInput, { target: { value: '2025-08-15' } });
  expect(dateInput.value).toBe('2025-08-15');

  // Coche un statut pour satisfaire la validation "au moins un filtre"
  await userEvent.click(screen.getByText('Actif').closest('label')!);

  // Confirme
  await userEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

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


  it('Annuler: reset les filtres, appelle onApplyFilters avec reset et ferme', async () => {
    renderOpen();

    // Préselectionne quelques filtres
    await clickChip('Admin');
    await clickChip('Actif');
    await clickChip('Plus récent');

    // Annuler
    await userEvent.click(screen.getByRole('button', { name: /Annuler/i }));

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

  it('toggle rôle/statut: re-cliquer le même chip le retire', async () => {
    renderOpen();

    // Toggle "Admin" on/off
    await clickChip('Admin');
    await clickChip('Admin');

    // Ajoute "Actif" pour satisfaire la 1ère validation
    await clickChip('Actif');

    await userEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    const payload = onApplyFilters.mock.calls[0][0] as FilterOptions;
    expect(payload.role).toEqual([]); // retiré
    expect(payload.status).toEqual(['ACTIF']);
  });
});

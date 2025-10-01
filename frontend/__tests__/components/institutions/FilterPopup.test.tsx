// __tests__/components/FilterPopup.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ⚠️ ajuste ce chemin :
import FilterPopup from '@/components/institutions/FilterPopup';

describe('FilterPopup', () => {
  const setup = (props?: Partial<React.ComponentProps<typeof FilterPopup>>) => {
    const onClose = jest.fn();
    const onApplyFilters = jest.fn();

    const utils = render(
      <FilterPopup
        isOpen={props?.isOpen ?? true}
        onClose={props?.onClose ?? onClose}
        onApplyFilters={props?.onApplyFilters ?? onApplyFilters}
      />
    );

    return {
      ...utils,
      onClose,
      onApplyFilters,
      user: userEvent.setup(),
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ne rend rien quand isOpen=false', () => {
    const { queryByText } = setup({ isOpen: false });
    expect(queryByText(/Type de produit/i)).toBeNull();
  });

  it('affiche le popup quand isOpen=true', () => {
    const { getByText } = setup({ isOpen: true });
    expect(getByText(/Type de produit/i)).toBeInTheDocument();
    expect(getByText(/Zone géographique/i)).toBeInTheDocument();
    expect(getByText(/Date/i)).toBeInTheDocument();
  });

  it('sélection + confirmer appelle onApplyFilters avec les bons filtres et ferme', async () => {
    const { user, onApplyFilters, onClose } = setup();

    await user.click(screen.getByLabelText(/Crédit/i)); // label du chip

    await user.click(screen.getByLabelText(/Zone Géo A/i));

    await user.click(screen.getByLabelText(/Récente/i));

    await user.click(screen.getByRole('button', { name: /Confirmer/i }));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(onApplyFilters).toHaveBeenCalledWith({
      type: ['CREDIT'],
      zone: ['1'],
      date: 'recent',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Réinitialiser vide les filtres et ne ferme pas', async () => {
    const { user, onApplyFilters, onClose } = setup();

    await user.click(screen.getByLabelText(/Épargne|Epargne/i));
    await user.click(screen.getByLabelText(/Zone Géo B/i));
    await user.click(screen.getByLabelText(/Il y a 3 mois/i));

    await user.click(screen.getByRole('button', { name: /Réinitialiser/i }));

    expect(onApplyFilters).toHaveBeenCalledWith({ type: [], zone: [], date: '' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('Annuler vide les filtres et ferme', async () => {
    const { user, onApplyFilters, onClose } = setup();

    // Sélectionner au moins un filtre
    await user.click(screen.getByLabelText(/Crédit/i));

    // Annuler
    await user.click(screen.getByRole('button', { name: /Annuler/i }));

    expect(onApplyFilters).toHaveBeenCalledWith({ type: [], zone: [], date: '' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Confirmer sans filtre déclenche alert et ne ferme pas', async () => {
    const { user, onApplyFilters, onClose } = setup();

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await user.click(screen.getByRole('button', { name: /Confirmer/i }));

    expect(alertSpy).toHaveBeenCalled();
    expect(onApplyFilters).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});

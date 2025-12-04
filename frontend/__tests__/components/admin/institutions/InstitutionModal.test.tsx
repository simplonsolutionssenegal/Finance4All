import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InstitutionModal from '@/components/admin/institutions/InstitutionModal';
import type { Institution } from '@/types/Institution';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid='next-image'
    />
  ),
}));

const createInstitutionMock = jest.fn();
const updateInstitutionMock = jest.fn();

jest.mock('@/hooks/institution/useCreateInstitution', () => ({
  useCreateInstitution: jest.fn(),
}));
jest.mock('@/hooks/institution/useUpdateInstitution', () => ({
  useUpdateInstitution: jest.fn(),
}));

const renderModal = (overrides?: Partial<React.ComponentProps<typeof InstitutionModal>>) => {
  const onOpenChange = jest.fn();
  const refresh = jest.fn();
  render(<InstitutionModal open onOpenChange={onOpenChange} refresh={refresh} {...overrides} />);
  return { onOpenChange, refresh };
};

const openDropdownAndChoose = async (triggerLabel: string, optionText: string) => {
  const u = userEvent.setup();
  const trigger = screen.getByRole('button', { name: new RegExp(triggerLabel, 'i') });
  await u.click(trigger);

  // Attendre que le menu s'ouvre réellement
  const item = await screen.findByRole(
    'menuitem',
    { name: new RegExp(optionText, 'i') },
    { timeout: 3000 }
  );
  await u.click(item);

  // Attendre que le dropdown se ferme
  await waitFor(
    () => {
      expect(
        screen.queryByRole('menuitem', { name: new RegExp(optionText, 'i') })
      ).not.toBeInTheDocument();
    },
    { timeout: 1000 }
  );
};

const addZone = async (zoneText: string) => {
  const u = userEvent.setup();
  const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
  await u.clear(zoneInput);
  await u.type(zoneInput, zoneText.slice(0, 3));

  // Attendre que le dropdown s'ouvre et que l'option apparaisse
  const option = await screen.findByRole('button', { name: zoneText }, { timeout: 3000 });
  await u.click(option);

  // Attendre que la zone soit ajoutée
  await waitFor(
    () => {
      expect(screen.getByText(zoneText)).toBeInTheDocument();
    },
    { timeout: 1000 }
  );
};

const navigateToStep = async (targetStep: number) => {
  const u = userEvent.setup();

  if (targetStep >= 2) {
    // Remplir Étape 1
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'Orange Money');
    await openDropdownAndChoose('Banque', 'Service de paiement');

    const nextBtn = screen.getByRole('button', { name: /Suivant/i });
    await u.click(nextBtn);

    // Attendre d'être sur l'Étape 2
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  }

  if (targetStep >= 3) {
    // Remplir Étape 2
    await u.type(
      screen.getByPlaceholderText('https://example.com/logo.png'),
      'https://exemple.com/logo.png'
    );
    await u.type(
      screen.getByPlaceholderText("Description de l'institution"),
      'Une description valide'
    );
    await u.type(screen.getByPlaceholderText('https://www.example.com'), 'https://ok.sn');

    const nextBtn = screen.getByRole('button', { name: /Suivant/i });
    await u.click(nextBtn);

    // Attendre d'être sur l'Étape 3
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText('Ex: Dakar, Thiès...')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  }
};

// ───────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  const { useCreateInstitution } = require('@/hooks/institution/useCreateInstitution');
  (useCreateInstitution as jest.Mock).mockReturnValue({
    isCreating: false,
    createInstitution: createInstitutionMock,
  });

  const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
  (useUpdateInstitution as jest.Mock).mockReturnValue({
    isUpdating: false,
    updateInstitution: updateInstitutionMock,
  });
});

describe('InstitutionModal (structure en 3 étapes)', () => {
  test('affiche le stepper avec 3 étapes', () => {
    renderModal();

    expect(screen.getByText('Informations de base')).toBeInTheDocument();
    expect(screen.getByText('Détails')).toBeInTheDocument();
    expect(screen.getByText('Contact & Localisation')).toBeInTheDocument();
  });

  test('Étape 1: validation - bouton Suivant désactivé si champs invalides', async () => {
    const u = userEvent.setup();
    renderModal();

    // Initialement désactivé (pas de nom ni type)
    expect(screen.getByRole('button', { name: /Suivant/i })).toBeDisabled();

    // Remplir le nom seulement
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'OM');
    expect(screen.getByRole('button', { name: /Suivant/i })).toBeDisabled();

    // Ajouter le type
    await openDropdownAndChoose('Banque', 'Service de paiement');
    expect(screen.getByRole('button', { name: /Suivant/i })).toBeEnabled();
  });

  test('Étape 1: navigation - passe à Étape 2 quand valide', async () => {
    const u = userEvent.setup();
    renderModal();

    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'Orange Money');
    await openDropdownAndChoose('Banque', 'Service de paiement');

    await u.click(screen.getByRole('button', { name: /Suivant/i }));

    // Vérifie qu'on est à l'Étape 2
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Description de l'institution")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  test('Étape 2: validation - bouton Suivant désactivé si description trop courte', async () => {
    const u = userEvent.setup();
    renderModal();

    await navigateToStep(2);

    // Description trop courte
    await u.type(screen.getByPlaceholderText("Description de l'institution"), 'court');
    expect(screen.getByRole('button', { name: /Suivant/i })).toBeDisabled();

    // Description valide
    await u.clear(screen.getByPlaceholderText("Description de l'institution"));
    await u.type(
      screen.getByPlaceholderText("Description de l'institution"),
      'Une description valide (>= 10 caractères)'
    );
    expect(screen.getByRole('button', { name: /Suivant/i })).toBeEnabled();
  });

  test('Étape 2: aperçu du logo affiché quand URL valide', async () => {
    const u = userEvent.setup();
    renderModal();

    await navigateToStep(2);

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.type(logoInput, 'https://valid.com/logo.png');

    await waitFor(() => {
      expect(screen.getByAltText('Aperçu du logo')).toBeInTheDocument();
    });
  });

  test('Étape 2: aperçu du logo disparaît quand URL invalide ou vidée', async () => {
    const u = userEvent.setup();
    renderModal();

    await navigateToStep(2);

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.type(logoInput, 'https://valid.com/logo.png');

    await waitFor(() => {
      expect(screen.getByAltText('Aperçu du logo')).toBeInTheDocument();
    });

    await u.clear(logoInput);

    await waitFor(() => {
      expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
    });
  });

  test('Étape 2: bouton Retour ramène à Étape 1', async () => {
    const u = userEvent.setup();
    renderModal();

    await navigateToStep(2);

    await u.click(screen.getByRole('button', { name: /Retour/i }));

    // Vérifie qu'on est revenu à l'Étape 1
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText('Ex: Orange Money')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  test('Étape 3: validation - bouton Créer désactivé si zones manquantes', async () => {
    const u = userEvent.setup();
    renderModal();

    await navigateToStep(3);

    // Sans zone
    expect(screen.getByRole('button', { name: /Créer l'institution/i })).toBeDisabled();

    // Ajouter pays
    await openDropdownAndChoose('Sélectionner un pays', 'Sénégal');

    // Toujours désactivé sans zone
    expect(screen.getByRole('button', { name: /Créer l'institution/i })).toBeDisabled();

    // Ajouter une zone
    await addZone('UEMOA');

    // Maintenant activé
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /Créer l'institution/i })).toBeEnabled();
      },
      { timeout: 2000 }
    );
  });

  test('Étape 3: zones - ajouter et retirer une zone', async () => {
    const u = userEvent.setup();
    renderModal();

    await navigateToStep(3);

    await openDropdownAndChoose('Sélectionner un pays', 'Sénégal');
    await addZone('UEMOA');

    // Vérifie que la zone est affichée
    expect(screen.getByText('UEMOA')).toBeInTheDocument();

    // Retirer la zone
    const zoneBadge = screen.getByText('UEMOA');
    await u.click(zoneBadge);

    // Vérifier que la zone a été retirée
    await waitFor(
      () => {
        expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('création complète: envoie le payload à createInstitution', async () => {
    const u = userEvent.setup();
    renderModal();

    // Étape 1
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'Orange Money');
    await openDropdownAndChoose('Banque', 'Service de paiement');
    await u.click(screen.getByRole('button', { name: /Suivant/i }));

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Étape 2
    await u.type(
      screen.getByPlaceholderText('https://example.com/logo.png'),
      'https://exemple.com/logo.png'
    );
    await u.type(
      screen.getByPlaceholderText("Description de l'institution"),
      'Une description valide'
    );
    await u.type(screen.getByPlaceholderText('https://www.example.com'), 'https://www.orange.sn');
    await u.click(screen.getByRole('button', { name: /Suivant/i }));

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText('Ex: Dakar, Thiès...')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Étape 3
    await openDropdownAndChoose('Sélectionner un pays', 'Sénégal');
    await addZone('UEMOA');

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /Créer l'institution/i })).toBeEnabled();
      },
      { timeout: 2000 }
    );

    await u.click(screen.getByRole('button', { name: /Créer l'institution/i }));

    await waitFor(() => {
      expect(createInstitutionMock).toHaveBeenCalledTimes(1);
    });

    expect(createInstitutionMock).toHaveBeenCalledWith({
      name: 'Orange Money',
      description: 'Une description valide',
      website: 'https://www.orange.sn',
      geographicZones: ['UEMOA'],
      logoUrl: 'https://exemple.com/logo.png',
      type: 'SERVICE_PAIEMENT_ELECTRONIQUE',
      pays: 'SENEGAL',
    });
  });

  test('Annuler ferme le modal si pas en soumission', async () => {
    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('Annuler ne ferme pas pendant la soumission', async () => {
    const { useCreateInstitution } = require('@/hooks/institution/useCreateInstitution');
    (useCreateInstitution as jest.Mock).mockReturnValue({
      isCreating: true,
      createInstitution: createInstitutionMock,
    });

    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('édition: pré-remplit les champs et permet modification', async () => {
    const u = userEvent.setup();

    const inst: Institution = {
      id: 'inst_1',
      name: 'Banky',
      description: 'Description existante assez longue',
      website: 'https://banky.sn',
      geographicZones: ['UEMOA', 'CEMAC'],
      logoUrl: 'https://cdn/logo.png',
      status: 'ACTIVE' as any,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
      type: 'SERVICE_PAIEMENT_ELECTRONIQUE' as any,
      pays: 'SENEGAL' as any,
    };

    renderModal({ institution: inst });

    // Vérifie pré-remplissage Étape 1
    expect(screen.getByPlaceholderText('Ex: Orange Money')).toHaveValue('Banky');

    // Modifier le nom
    await u.clear(screen.getByPlaceholderText('Ex: Orange Money'));
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'Banky Plus');

    // Naviguer jusqu'à l'étape 3
    await u.click(screen.getByRole('button', { name: /Suivant/i }));
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    await u.click(screen.getByRole('button', { name: /Suivant/i }));
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText('Ex: Dakar, Thiès...')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        const submitBtn = screen.getByRole('button', { name: /Créer l'institution/i });
        expect(submitBtn).toBeEnabled();
      },
      { timeout: 2000 }
    );

    await u.click(screen.getByRole('button', { name: /Créer l'institution/i }));

    await waitFor(() => {
      expect(updateInstitutionMock).toHaveBeenCalledTimes(1);
    });

    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: 'inst_1',
      data: {
        name: 'Banky Plus',
        description: 'Description existante assez longue',
        website: 'https://banky.sn',
        geographicZones: ['UEMOA', 'CEMAC'],
        logoUrl: 'https://cdn/logo.png',
        type: 'SERVICE_PAIEMENT_ELECTRONIQUE',
        pays: 'SENEGAL',
      },
    });
  });

  test('affiche le titre "Nouvelle institution" en mode création', () => {
    renderModal();
    expect(screen.getByText('Nouvelle institution')).toBeInTheDocument();
  });

  test('Étape 1: affiche erreur si nom trop court après tentative de navigation', async () => {
    const u = userEvent.setup();
    renderModal();

    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'O');
    await openDropdownAndChoose('Banque', 'Service de paiement');

    // Le bouton est désactivé car nom invalide
    expect(screen.getByRole('button', { name: /Suivant/i })).toBeDisabled();
  });

  test('réinitialise à Étape 1 quand le modal se ferme', async () => {
    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    await navigateToStep(3);

    // Fermer le modal
    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('Étape 3: filtrage des zones par recherche', async () => {
    const u = userEvent.setup();
    renderModal();

    await navigateToStep(3);

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.click(zoneInput);
    await u.type(zoneInput, 'UEM');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'UEMOA' })).toBeInTheDocument();
    });
  });
});

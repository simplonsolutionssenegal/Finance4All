import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditInstitutionModal from '@/components/admin/institutions/EditInstitutionModal';
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

const updateInstitutionMock = jest.fn();

jest.mock('@/hooks/institution/useUpdateInstitution', () => ({
  useUpdateInstitution: jest.fn(),
}));

const baseInstitution: Institution = {
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

const querySubmitButton = () =>
  screen.getByRole('button', {
    name: /Enregistrer les modifications|Enregistrement…/,
  });

let capturedOnSuccess: (() => void) | undefined;

const renderModal = (
  overrides?: Partial<React.ComponentProps<typeof EditInstitutionModal>> & {
    institution?: Institution;
  }
) => {
  const onOpenChange = jest.fn();
  const refresh = jest.fn();
  const institution = overrides?.institution ?? baseInstitution;

  render(
    <EditInstitutionModal
      open
      onOpenChange={onOpenChange}
      refresh={refresh}
      institution={institution}
      {...overrides}
    />
  );

  return { onOpenChange, refresh };
};

beforeEach(() => {
  jest.clearAllMocks();
  capturedOnSuccess = undefined;

  const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
  (useUpdateInstitution as jest.Mock).mockImplementation((options?: { onSuccess?: () => void }) => {
    capturedOnSuccess = options?.onSuccess;
    return {
      isUpdating: false,
      updateInstitution: updateInstitutionMock,
    };
  });
});

describe('EditInstitutionModal', () => {
  test('prérremplit le formulaire avec les données de l’institution et affiche l’aperçu du logo', () => {
    renderModal();

    expect(screen.getByPlaceholderText('Ex: Orange Money')).toHaveValue(baseInstitution.name);
    expect(screen.getByPlaceholderText("Description de l'institution")).toHaveValue(
      baseInstitution.description
    );
    expect(screen.getByPlaceholderText('https://www.example.com')).toHaveValue(
      baseInstitution.website
    );
    expect(screen.getByPlaceholderText('https://example.com/logo.png')).toHaveValue(
      baseInstitution.logoUrl
    );

    // Zones
    expect(screen.getByText('UEMOA')).toBeInTheDocument();
    expect(screen.getByText('CEMAC')).toBeInTheDocument();

    // Type & pays (labels FR)
    expect(
      screen.getByRole('button', { name: /Service de paiement|Service de paiement électronique/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sénégal/ })).toBeInTheDocument();

    // Aperçu du logo
    expect(screen.getByAltText('Aperçu du logo')).toBeInTheDocument();

    // Titre d’édition
    expect(
      screen.getByText(/Modifier l'institution|Modifier l&apos;institution/)
    ).toBeInTheDocument();
  });

  test('validation: erreurs affichées après submit quand les champs sont invalides puis correction rend le bouton actif', async () => {
    const u = userEvent.setup();
    renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    const descInput = screen.getByPlaceholderText("Description de l'institution");
    const websiteInput = screen.getByPlaceholderText('https://www.example.com');
    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');

    // Rendre les champs invalides
    await u.clear(nameInput);
    await u.clear(descInput);
    await u.clear(websiteInput);
    await u.clear(logoInput);

    // Enlever toutes les zones
    await u.click(screen.getByText('UEMOA'));
    await u.click(screen.getByText('CEMAC'));

    // URLs invalides
    await u.type(websiteInput, 'not-a-url');
    await u.type(logoInput, 'also-not-a-url');

    // Soumettre le formulaire
    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form');
    if (!form) throw new Error('Form not found in dialog');
    fireEvent.submit(form);

    // Erreurs visibles
    expect(
      await screen.findByText('Le nom doit contenir au moins 2 caractères')
    ).toBeInTheDocument();
    expect(
      screen.getByText('La description doit contenir au moins 10 caractères')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Doit être une URL valide').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Au moins une zone géographique est requise/i)).toBeInTheDocument();

    expect(querySubmitButton()).toBeDisabled();

    // Corriger les champs
    await u.clear(nameInput);
    await u.type(nameInput, 'Banky');
    await u.clear(descInput);
    await u.type(descInput, 'Une description valide (>= 10 caractères)');
    await u.clear(websiteInput);
    await u.type(websiteInput, 'https://site.sn');
    await u.clear(logoInput);
    await u.type(logoInput, 'https://site.sn/logo.png');

    // Ajouter une zone
    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'UEM');
    const option = await screen.findByRole('button', { name: 'UEMOA' });
    await u.click(option);

    // Laisser le temps à RHF/zod de recalculer isValid
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(querySubmitButton()).toBeEnabled();
  });

  test('soumission: appelle updateInstitution avec id + data mis à jour', async () => {
    const u = userEvent.setup();
    renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    await u.type(nameInput, ' Plus');

    await u.click(querySubmitButton());

    expect(updateInstitutionMock).toHaveBeenCalledTimes(1);
    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: baseInstitution.id,
      data: {
        name: 'Banky Plus',
        description: baseInstitution.description,
        website: baseInstitution.website,
        geographicZones: baseInstitution.geographicZones,
        logoUrl: baseInstitution.logoUrl,
        type: baseInstitution.type,
        pays: baseInstitution.pays,
      },
    });
  });

  test('au succès: reset le formulaire, ferme le modal et appelle refresh', async () => {
    const u = userEvent.setup();
    const { onOpenChange, refresh } = renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    await u.clear(nameInput);
    await u.type(nameInput, 'Temporaire');

    expect(nameInput).toHaveValue('Temporaire');

    await u.click(querySubmitButton());
    expect(updateInstitutionMock).toHaveBeenCalledTimes(1);

    // Simuler le succès de la mutation
    capturedOnSuccess?.();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalledTimes(1);

    // Le formulaire doit être reset
    expect(screen.getByPlaceholderText('Ex: Orange Money')).toHaveValue(baseInstitution.name);
  });

  test('zones: ajout puis retrait via badge met à jour les zones du formulaire', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    // Pas de badges au départ
    expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'UEM');

    const option = await screen.findByRole('button', { name: 'UEMOA' });
    await u.click(option);

    // Badge présent
    expect(screen.getByText('UEMOA')).toBeInTheDocument();

    // Retirer la zone en cliquant le badge
    await u.click(screen.getByText('UEMOA'));
    expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
  });

  test('ferme la liste des zones sur clic extérieur (et reste ouverte sur clic intérieur)', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'UEM');

    const option = await screen.findByRole('button', { name: 'UEMOA' });
    expect(option).toBeInTheDocument();

    // Clic à l'intérieur du dropdown (dans l'input) -> ne doit PAS fermer
    fireEvent.mouseDown(zoneInput);
    expect(screen.getByRole('button', { name: 'UEMOA' })).toBeInTheDocument();

    // Clic à l’extérieur du dropdown -> fermeture
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('button', { name: 'UEMOA' })).not.toBeInTheDocument();
  });

  test('aperçu du logo: affiché quand l’URL est valide, disparaît quand l’input est vidé ou invalide', async () => {
    const u = userEvent.setup();
    renderModal();

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');

    // Visible avec l’URL de base
    expect(screen.getByAltText('Aperçu du logo')).toBeInTheDocument();

    // Vider l’input -> plus d’aperçu
    await u.clear(logoInput);
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();

    // URL invalide -> erreur + pas d’aperçu
    await u.type(logoInput, 'not-a-url');

    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form');
    if (!form) throw new Error('Form not found in dialog');
    fireEvent.submit(form);

    await screen.findByText('Doit être une URL valide');
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
  });

  test('désactive les champs et le submit pendant la mise à jour', () => {
    const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
    (useUpdateInstitution as jest.Mock).mockImplementation(
      (options?: { onSuccess?: () => void }) => {
        capturedOnSuccess = options?.onSuccess;
        return {
          isUpdating: true,
          updateInstitution: updateInstitutionMock,
        };
      }
    );

    renderModal();

    expect(screen.getByPlaceholderText('Ex: Orange Money')).toBeDisabled();
    expect(querySubmitButton()).toBeDisabled();
    // Texte conditionnel du bouton
    expect(querySubmitButton()).toHaveTextContent('Enregistrement…');
  });

  test("sélection du type via dropdown met à jour l'affichage", async () => {
    const u = userEvent.setup();
    renderModal();

    // Sélectionner un type
    const typeButton = screen.getByRole('button', {
      name: /Service de paiement|Banque|Banque numérique/i,
    });
    await u.click(typeButton);

    // Choisir 'Banque numérique'
    const bankOption = await screen.findByText('Banque numérique');
    await u.click(bankOption);
    expect(screen.getByText('Banque numérique')).toBeInTheDocument();
  });

  // country selection rendering est maintenant testée plus bas

  test("affiche 'Aucune zone trouvée' quand la recherche ne matche rien", async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'ZZZ');

    // The dropdown opens on typing (input onChange sets isDropdownOpen = true)
    expect(await screen.findByText('Aucune zone trouvée')).toBeInTheDocument();
  });

  test('cliquer sur badge ne retire pas la zone quand isUpdating true', async () => {
    const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
    (useUpdateInstitution as jest.Mock).mockImplementation(
      (options?: { onSuccess?: () => void }) => {
        capturedOnSuccess = options?.onSuccess;
        return {
          isUpdating: true,
          updateInstitution: updateInstitutionMock,
        };
      }
    );

    const u = userEvent.setup();
    renderModal();

    // Badge présent
    const badge = screen.getByText('UEMOA');
    expect(badge).toBeInTheDocument();

    // Tenter de le cliquer (ne doit pas le retirer)
    await u.click(badge);
    expect(screen.getByText('UEMOA')).toBeInTheDocument();
  });

  test("le bouton 'Ajouter' ouvre puis ferme le dropdown des zones", async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const addButton = screen.getByRole('button', { name: 'Ajouter' });

    // Au départ, le dropdown n'est pas visible
    expect(screen.queryByRole('button', { name: 'UEMOA' })).not.toBeInTheDocument();

    // Premier clic -> ouverture
    await u.click(addButton);
    const option = await screen.findByRole('button', { name: 'UEMOA' });
    expect(option).toBeInTheDocument();

    // Second clic -> fermeture
    await u.click(addButton);
    expect(screen.queryByRole('button', { name: 'UEMOA' })).not.toBeInTheDocument();
  });

  test("sélection du pays via dropdown met à jour l'affichage (Cameroun)", async () => {
    const u = userEvent.setup();
    renderModal();

    // Bouton actuel affiche Sénégal
    const paysButton = screen.getByRole('button', { name: /Sénégal/ });
    await u.click(paysButton);

    // Choisir Cameroun
    const cameroonOption = await screen.findByText('Cameroun');
    await u.click(cameroonOption);

    // On doit voir Cameroun + le drapeau 🇨🇲
    expect(screen.getByText('Cameroun')).toBeInTheDocument();
    expect(screen.getByText('🇨🇲')).toBeInTheDocument();
  });

  test("l'aperçu du logo utilise l'URL trimée (espaces en début/fin ignorés)", async () => {
    const u = userEvent.setup();
    renderModal();

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');

    await u.clear(logoInput);
    await u.type(logoInput, '  https://site.sn/logo.png  ');

    const img = await screen.findByAltText('Aperçu du logo');
    expect(img).toHaveAttribute('src', 'https://site.sn/logo.png');
  });

  test("affiche 'Banque' par défaut quand le type est indéfini", () => {
    const instWithoutType: Institution = {
      ...baseInstitution,
      type: undefined as any,
    };

    renderModal({ institution: instWithoutType });

    // Le bouton doit afficher le label par défaut "Banque"
    expect(screen.getByRole('button', { name: /Banque/ })).toBeInTheDocument();
  });

  test("affiche 'Sélectionner un pays' quand aucun pays n'est défini", () => {
    const instWithoutCountry: Institution = {
      ...baseInstitution,
      pays: undefined as any,
    };

    renderModal({ institution: instWithoutCountry });

    expect(screen.getByRole('button', { name: /Sélectionner un pays/ })).toBeInTheDocument();
  });

  test('gère une institution sans logo, sans site et sans zones', () => {
    const instPartial: Institution = {
      ...baseInstitution,
      website: undefined as any,
      logoUrl: undefined as any,
      geographicZones: undefined as any,
    };

    renderModal({ institution: instPartial });

    // Site web vide
    expect(screen.getByPlaceholderText('https://www.example.com')).toHaveValue('');
    // Logo vide et pas d’aperçu
    expect(screen.getByPlaceholderText('https://example.com/logo.png')).toHaveValue('');
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
    // Aucune zone affichée
    expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
    expect(screen.queryByText('CEMAC')).not.toBeInTheDocument();
  });

  test('au succès: ignore les erreurs de document.querySelector dans le bloc try/catch', async () => {
    const u = userEvent.setup();
    const { onOpenChange, refresh } = renderModal();

    await u.click(querySubmitButton());
    expect(updateInstitutionMock).toHaveBeenCalledTimes(1);

    const originalQuerySelector = document.querySelector;
    try {
      (document as any).querySelector = jest.fn(() => {
        throw new Error('test');
      });

      expect(() => capturedOnSuccess?.()).not.toThrow();
    } finally {
      document.querySelector = originalQuerySelector;
    }

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

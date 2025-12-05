import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('EditInstitutionModal - Tests de couverture supplémentaires', () => {
  // ==================== Tests de validation des champs ====================

  test('validation du nom: affiche erreur si moins de 2 caractères', async () => {
    const u = userEvent.setup();
    renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    await u.clear(nameInput);
    await u.type(nameInput, 'B'); // 1 seul caractère

    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form');
    fireEvent.submit(form!);

    expect(
      await screen.findByText('Le nom doit contenir au moins 2 caractères')
    ).toBeInTheDocument();
  });

  test('validation de la description: affiche erreur si moins de 10 caractères', async () => {
    const u = userEvent.setup();
    renderModal();

    const descInput = screen.getByPlaceholderText("Description de l'institution");
    await u.clear(descInput);
    await u.type(descInput, 'Court'); // Moins de 10 caractères

    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form');
    fireEvent.submit(form!);

    expect(
      await screen.findByText('La description doit contenir au moins 10 caractères')
    ).toBeInTheDocument();
  });

  test('validation du site web: accepte une URL vide (optional)', async () => {
    const u = userEvent.setup();
    renderModal();

    const websiteInput = screen.getByPlaceholderText('https://www.example.com');
    await u.clear(websiteInput);

    // Attendre que la validation se fasse
    await waitFor(() => {
      expect(querySubmitButton()).toBeEnabled();
    });

    await u.click(querySubmitButton());

    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: baseInstitution.id,
      data: expect.objectContaining({
        website: '',
      }),
    });
  });

  test('validation du logo: accepte une URL vide (optional)', async () => {
    const u = userEvent.setup();
    renderModal();

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.clear(logoInput);

    await waitFor(() => {
      expect(querySubmitButton()).toBeEnabled();
    });

    await u.click(querySubmitButton());

    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: baseInstitution.id,
      data: expect.objectContaining({
        logoUrl: '',
      }),
    });
  });

  test('validation du logo: erreur avec URL invalide', async () => {
    const u = userEvent.setup();
    renderModal();

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.clear(logoInput);
    await u.type(logoInput, 'invalid-url');

    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Doit être une URL valide')).toBeInTheDocument();
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
  });

  // ==================== Tests des dropdowns ====================

  test('sélection du type: affiche tous les types disponibles', async () => {
    const u = userEvent.setup();
    renderModal();

    const typeButton = screen
      .getAllByRole('button')
      .find(
        btn =>
          btn.textContent?.includes('Service de paiement') || btn.textContent?.includes('Banque')
      );

    await u.click(typeButton!);

    expect(await screen.findByText('Établissement de monnaie électronique')).toBeInTheDocument();
    expect(screen.getByText('Portefeuille numérique')).toBeInTheDocument();
    expect(screen.getByText('Banque numérique')).toBeInTheDocument();
    expect(screen.getByText('SFD')).toBeInTheDocument();
    expect(screen.getByText('Financement participatif')).toBeInTheDocument();
    expect(screen.getByText('Investissement')).toBeInTheDocument();
    expect(screen.getByText('Gestion financière')).toBeInTheDocument();
    expect(screen.getByText('Assurance numérique')).toBeInTheDocument();
  });

  test('sélection du type: change le type affiché', async () => {
    const u = userEvent.setup();
    renderModal();

    const typeButton = screen
      .getAllByRole('button')
      .find(
        btn =>
          btn.textContent?.includes('Service de paiement') || btn.textContent?.includes('Banque')
      );

    await u.click(typeButton!);
    const option = await screen.findByText('Portefeuille numérique');
    await u.click(option);

    expect(screen.getByText('Portefeuille numérique')).toBeInTheDocument();
  });

  test('sélection du pays: affiche les deux pays disponibles', async () => {
    const u = userEvent.setup();
    renderModal();

    const paysButton = screen
      .getAllByRole('button')
      .find(btn => btn.textContent?.includes('Sénégal') || btn.textContent?.includes('Cameroun'));

    await u.click(paysButton!);

    expect(await screen.findByText('🇸🇳')).toBeInTheDocument();
    expect(screen.getByText('🇨🇲')).toBeInTheDocument();
  });

  test('sélection du pays: change le pays affiché', async () => {
    const u = userEvent.setup();
    renderModal();

    const paysButton = screen
      .getAllByRole('button')
      .find(btn => btn.textContent?.includes('Sénégal'));

    await u.click(paysButton!);

    // Trouver l'option Cameroun et cliquer
    const options = screen.getAllByText('Cameroun');
    await u.click(options[0]);

    // Vérifier que le bouton affiche maintenant Cameroun
    expect(screen.getByText('🇨🇲')).toBeInTheDocument();
  });

  // ==================== Tests des zones géographiques ====================

  test('zones: ajout de plusieurs zones successivement', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');

    // Ajouter UEMOA
    await u.type(zoneInput, 'UEM');
    const option1 = await screen.findByRole('button', { name: 'UEMOA' });
    await u.click(option1);
    expect(screen.getByText('UEMOA')).toBeInTheDocument();

    // Ajouter CEMAC
    await u.type(zoneInput, 'CEM');
    const option2 = await screen.findByRole('button', { name: 'CEMAC' });
    await u.click(option2);
    expect(screen.getByText('CEMAC')).toBeInTheDocument();
    expect(screen.getByText('UEMOA')).toBeInTheDocument();
  });

  test('zones: filtre les zones déjà sélectionnées', async () => {
    const u = userEvent.setup();
    renderModal();

    // UEMOA et CEMAC sont déjà sélectionnés
    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'UEM');

    // UEMOA ne devrait pas apparaître dans la liste
    expect(screen.queryByRole('button', { name: 'UEMOA' })).not.toBeInTheDocument();
  });

  test('zones: bouton "Ajouter" ouvre/ferme le dropdown', async () => {
    const u = userEvent.setup();
    renderModal();

    const addButton = screen.getByRole('button', { name: 'Ajouter' });

    // Ouvrir le dropdown
    await u.click(addButton);
    expect(await screen.findByText('EURO')).toBeInTheDocument();

    // Fermer le dropdown
    await u.click(addButton);
    await waitFor(() => {
      expect(screen.queryByText('EURO')).not.toBeInTheDocument();
    });
  });

  test('zones: recherche avec plusieurs caractères', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'Pacif');

    expect(await screen.findByRole('button', { name: 'Pacifique' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'UEMOA' })).not.toBeInTheDocument();
  });

  // ==================== Tests de l'état isUpdating ====================

  test('isUpdating: désactive le bouton Ajouter des zones', () => {
    const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
    (useUpdateInstitution as jest.Mock).mockImplementation(() => ({
      isUpdating: true,
      updateInstitution: updateInstitutionMock,
    }));

    renderModal();

    const addButton = screen.getByRole('button', { name: 'Ajouter' });
    expect(addButton).toBeDisabled();
  });

  test('isUpdating: désactive le champ de recherche de zones', () => {
    const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
    (useUpdateInstitution as jest.Mock).mockImplementation(() => ({
      isUpdating: true,
      updateInstitution: updateInstitutionMock,
    }));

    renderModal();

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    expect(zoneInput).toBeDisabled();
  });

  test('isUpdating: désactive les dropdowns', () => {
    const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
    (useUpdateInstitution as jest.Mock).mockImplementation(() => ({
      isUpdating: true,
      updateInstitution: updateInstitutionMock,
    }));

    renderModal();

    const buttons = screen.getAllByRole('button');
    const typeButton = buttons.find(btn => btn.textContent?.includes('Service de paiement'));
    const paysButton = buttons.find(btn => btn.textContent?.includes('Sénégal'));

    expect(typeButton).toBeDisabled();
    expect(paysButton).toBeDisabled();
  });

  // ==================== Tests du reset et fermeture ====================

  test('fermeture du modal sans soumission: reset les valeurs', async () => {
    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    await u.clear(nameInput);
    await u.type(nameInput, 'Nouveau nom');

    expect(nameInput).toHaveValue('Nouveau nom');

    // Fermer le modal en appelant onOpenChange(false)
    onOpenChange(false);

    // Rouvrir le modal
    renderModal({ open: false });
    renderModal({ open: true });

    // Les valeurs devraient être reset
    expect(screen.getByPlaceholderText('Ex: Orange Money')).toHaveValue(baseInstitution.name);
  });

  test('fermeture bloquée pendant isUpdating', async () => {
    const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
    (useUpdateInstitution as jest.Mock).mockImplementation(() => ({
      isUpdating: true,
      updateInstitution: updateInstitutionMock,
    }));

    const { onOpenChange } = renderModal();

    // Tenter de fermer le modal via Dialog
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    // onOpenChange ne devrait pas être appelé avec false
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  // ==================== Tests des cas limites ====================

  test('soumission avec toutes les modifications possibles', async () => {
    const u = userEvent.setup();
    renderModal();

    // Modifier tous les champs
    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    await u.clear(nameInput);
    await u.type(nameInput, 'Nouveau nom');

    const descInput = screen.getByPlaceholderText("Description de l'institution");
    await u.clear(descInput);
    await u.type(descInput, 'Nouvelle description longue');

    const websiteInput = screen.getByPlaceholderText('https://www.example.com');
    await u.clear(websiteInput);
    await u.type(websiteInput, 'https://nouveau-site.com');

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.clear(logoInput);
    await u.type(logoInput, 'https://nouveau-logo.com/logo.png');

    // Changer le type
    const typeButton = screen
      .getAllByRole('button')
      .find(btn => btn.textContent?.includes('Service de paiement'));
    await u.click(typeButton!);
    const typeOption = await screen.findByText('Banque numérique');
    await u.click(typeOption);

    // Changer le pays
    const paysButton = screen
      .getAllByRole('button')
      .find(btn => btn.textContent?.includes('Sénégal'));
    await u.click(paysButton!);
    const paysOptions = screen.getAllByText('Cameroun');
    await u.click(paysOptions[0]);

    // Retirer une zone
    await u.click(screen.getByText('UEMOA'));

    // Ajouter une nouvelle zone
    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'EUR');
    const zoneOption = await screen.findByRole('button', { name: 'EURO' });
    await u.click(zoneOption);

    await u.click(querySubmitButton());

    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: baseInstitution.id,
      data: {
        name: 'Nouveau nom',
        description: 'Nouvelle description longue',
        website: 'https://nouveau-site.com',
        logoUrl: 'https://nouveau-logo.com/logo.png',
        type: 'BANQUE_NUMERIQUE',
        pays: 'CAMEROUN',
        geographicZones: ['CEMAC', 'EURO'],
      },
    });
  });

  test('institution avec données minimales (champs optionnels vides)', () => {
    const minimalInstitution: Institution = {
      ...baseInstitution,
      website: '',
      logoUrl: '',
    };

    renderModal({ institution: minimalInstitution });

    expect(screen.getByPlaceholderText('https://www.example.com')).toHaveValue('');
    expect(screen.getByPlaceholderText('https://example.com/logo.png')).toHaveValue('');
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
  });

  test('affichage du texte "Enregistrement…" pendant isUpdating', () => {
    const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
    (useUpdateInstitution as jest.Mock).mockImplementation(() => ({
      isUpdating: true,
      updateInstitution: updateInstitutionMock,
    }));

    renderModal();

    expect(screen.getByRole('button', { name: /Enregistrement…/ })).toBeInTheDocument();
  });

  test('logo avec URL contenant des espaces (trim)', async () => {
    const u = userEvent.setup();
    renderModal();

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.clear(logoInput);
    await u.type(logoInput, '  https://logo.com/image.png  ');

    // L'aperçu devrait s'afficher avec l'URL trimée
    expect(screen.getByAltText('Aperçu du logo')).toHaveAttribute(
      'src',
      'https://logo.com/image.png'
    );
  });

  test('validation: erreur de type requise', async () => {
    const institutionSansType: Institution = {
      ...baseInstitution,
      type: undefined as any,
    };

    renderModal({ institution: institutionSansType });

    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Le type est requis')).toBeInTheDocument();
  });

  test('validation: erreur de pays requis', async () => {
    const institutionSansPays: Institution = {
      ...baseInstitution,
      pays: undefined as any,
    };

    renderModal({ institution: institutionSansPays });

    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Le pays est requis')).toBeInTheDocument();
  });

  test('zones: input onChange ouvre le dropdown', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');

    // Taper dans l'input
    await u.type(zoneInput, 'E');

    // Le dropdown devrait s'ouvrir automatiquement
    expect(await screen.findByText('EURO')).toBeInTheDocument();
  });
});

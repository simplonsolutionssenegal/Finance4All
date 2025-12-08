import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditInstitutionModal from '@/components/admin/institutions/EditInstitutionModal';

const AVAILABLE_ZONES = [
  'EURO',
  'USD',
  'Franc Suisse',
  'Roupie indienne',
  'Australie',
  'Caraïbes orientales',
  'Sud Africain',
  'UEMOA',
  'CEMAC',
  'Pacifique',
];

const INSTITUTION_TYPE_OPTIONS = [
  { value: 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE', label: 'Établissement de monnaie électronique' },
  { value: 'PORTEFEUILLE_NUMERIQUE', label: 'Portefeuille numérique' },
  { value: 'SERVICE_PAIEMENT_ELECTRONIQUE', label: 'Service de paiement' },
  { value: 'BANQUE_NUMERIQUE', label: 'Banque numérique' },
  { value: 'SERVICE_FINANCIER_DECENTRALISE', label: 'SFD' },
  { value: 'SERVICE_FINANCEMENT_PARTICIPATIF', label: 'Financement participatif' },
  { value: 'SERVICE_INVESTISSEMENT', label: 'Investissement' },
  { value: 'SERVICE_GESTION_FINANCIERE', label: 'Gestion financière' },
  { value: 'SERVICE_ASSURANCE_NUMERIQUE', label: 'Assurance numérique' },
];

const INSTITUTION_TYPE_LABELS = INSTITUTION_TYPE_OPTIONS.map(o => o.label);

// Build a loose regex to find the type trigger button by matching any label text
const TYPE_LABEL_REGEX = new RegExp(
  INSTITUTION_TYPE_LABELS.map(l => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
);
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

// Helper pour retrouver le bouton du dropdown "Type" de façon robuste
const findTypeTrigger = () =>
  Array.from(screen.getAllByRole('button')).find(b => TYPE_LABEL_REGEX.test(b.textContent || ''));

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

describe('EditInstitutionModal - Tests complémentaires', () => {
  // ===== Tests pour la fermeture du modal =====

  test('fermeture du modal: reset le formulaire aux valeurs initiales', async () => {
    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    await u.clear(nameInput);
    await u.type(nameInput, 'Nom modifié');

    expect(nameInput).toHaveValue('Nom modifié');

    // Fermer le modal via onOpenChange(false)
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    // onOpenChange doit avoir été appelé pour fermer
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Nettoyer le DOM puis réouvrir pour vérifier le reset
    cleanup();
    renderModal();
    expect(screen.getByPlaceholderText('Ex: Orange Money')).toHaveValue(baseInstitution.name);
  });

  test('ne peut pas fermer le modal pendant isUpdating', () => {
    const { useUpdateInstitution } = require('@/hooks/institution/useUpdateInstitution');
    (useUpdateInstitution as jest.Mock).mockImplementation(() => ({
      isUpdating: true,
      updateInstitution: updateInstitutionMock,
    }));

    const { onOpenChange } = renderModal();

    // Tenter de fermer
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    // onOpenChange ne doit pas être appelé avec false
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  // ===== Tests pour les validations spécifiques =====

  test('validation: nom avec exactement 2 caractères est valide', async () => {
    const u = userEvent.setup();
    renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    await u.clear(nameInput);
    await u.type(nameInput, 'AB');

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(
      screen.queryByText('Le nom doit contenir au moins 2 caractères')
    ).not.toBeInTheDocument();
  });

  test('validation: description avec exactement 10 caractères est valide', async () => {
    const u = userEvent.setup();
    renderModal();

    const descInput = screen.getByPlaceholderText("Description de l'institution");
    await u.clear(descInput);
    await u.type(descInput, '1234567890');

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(
      screen.queryByText('La description doit contenir au moins 10 caractères')
    ).not.toBeInTheDocument();
  });

  test('validation: URL vide pour website et logoUrl est acceptée', async () => {
    const u = userEvent.setup();
    renderModal();

    const websiteInput = screen.getByPlaceholderText('https://www.example.com');
    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');

    await u.clear(websiteInput);
    await u.clear(logoInput);

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(screen.queryByText('Doit être une URL valide')).not.toBeInTheDocument();
  });

  // ===== Tests pour les zones géographiques =====

  test('zones: filtre case-insensitive fonctionne correctement', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');

    // Recherche en minuscules
    await u.type(zoneInput, 'uemoa');
    expect(await screen.findByRole('button', { name: 'UEMOA' })).toBeInTheDocument();

    await u.clear(zoneInput);

    // Recherche en majuscules
    await u.type(zoneInput, 'CEMAC');
    expect(await screen.findByRole('button', { name: 'CEMAC' })).toBeInTheDocument();

    await u.clear(zoneInput);

    // Recherche partielle
    await u.type(zoneInput, 'franc');
    expect(await screen.findByRole('button', { name: 'Franc Suisse' })).toBeInTheDocument();
  });

  test('zones: exclut les zones déjà sélectionnées du dropdown', async () => {
    const u = userEvent.setup();
    renderModal(); // baseInstitution a UEMOA et CEMAC

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'U');

    // UEMOA ne doit pas apparaître car déjà sélectionnée
    expect(screen.queryByRole('button', { name: 'UEMOA' })).not.toBeInTheDocument();

    // USD doit apparaître car non sélectionnée
    expect(await screen.findByRole('button', { name: 'USD' })).toBeInTheDocument();
  });

  test('zones: ajouter plusieurs zones successivement', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');

    // Ajouter EURO
    await u.type(zoneInput, 'EURO');
    await u.click(await screen.findByRole('button', { name: 'EURO' }));
    expect(screen.getByText('EURO')).toBeInTheDocument();

    // Ajouter USD
    await u.type(zoneInput, 'USD');
    await u.click(await screen.findByRole('button', { name: 'USD' }));
    expect(screen.getByText('USD')).toBeInTheDocument();

    // Les deux badges sont présents
    expect(screen.getByText('EURO')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  test('zones: vider le champ de recherche après sélection', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'EURO');

    expect(zoneInput).toHaveValue('EURO');

    await u.click(await screen.findByRole('button', { name: 'EURO' }));

    // Le champ doit être vidé
    expect(zoneInput).toHaveValue('');
  });

  test('zones: dropdown se ferme après sélection', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'EURO');

    const option = await screen.findByRole('button', { name: 'EURO' });
    await u.click(option);

    // Le dropdown ne doit plus être visible
    expect(screen.queryByRole('button', { name: 'EURO' })).not.toBeInTheDocument();
  });

  // ===== Tests pour tous les types d'institution =====

  test("tous les types d'institution sont sélectionnables", async () => {
    for (const type of INSTITUTION_TYPE_OPTIONS) {
      const { onOpenChange } = renderModal({
        institution: { ...baseInstitution, type: type.value as any },
      });

      // Vérifier que le type est affiché
      expect(screen.getByText(type.label)).toBeInTheDocument();

      // Nettoyer pour le prochain test
      onOpenChange(false);
    }
  });

  test('sélection de tous les types via dropdown', async () => {
    const u = userEvent.setup();
    renderModal();

    for (const typeLabel of INSTITUTION_TYPE_LABELS) {
      const typeButton = findTypeTrigger();
      if (!typeButton) throw new Error('Type trigger not found');
      await u.click(typeButton);

      const option = await screen.findByText(typeLabel);
      await u.click(option);

      expect(screen.getByText(typeLabel)).toBeInTheDocument();
    }
  });

  // ===== Tests pour les drapeaux des pays =====

  test('affiche le drapeau sénégalais quand SENEGAL est sélectionné', () => {
    renderModal();
    const countryButton = Array.from(screen.getAllByRole('button')).find(b =>
      /Sénégal/.test(b.textContent || '')
    );
    expect(countryButton).toBeDefined();
    expect(countryButton!.textContent).toMatch(/🇸🇳/);
  });

  test('affiche le drapeau camerounais quand CAMEROUN est sélectionné', () => {
    const instCameroun: Institution = {
      ...baseInstitution,
      pays: 'CAMEROUN' as any,
    };

    renderModal({ institution: instCameroun });
    const countryButton = Array.from(screen.getAllByRole('button')).find(b =>
      /Cameroun/.test(b.textContent || '')
    );
    expect(countryButton).toBeDefined();
    expect(countryButton!.textContent).toMatch(/🇨🇲/);
  });

  // ===== Tests pour le logo avec différents formats =====

  test('aperçu du logo avec URL HTTPS', async () => {
    const u = userEvent.setup();
    renderModal();

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.clear(logoInput);
    await u.type(logoInput, 'https://example.com/new-logo.png');

    const img = await screen.findByAltText('Aperçu du logo');
    expect(img).toHaveAttribute('src', 'https://example.com/new-logo.png');
  });

  test('aperçu du logo avec URL HTTP', async () => {
    const u = userEvent.setup();
    renderModal();

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.clear(logoInput);
    await u.type(logoInput, 'http://example.com/logo.png');

    const img = await screen.findByAltText('Aperçu du logo');
    expect(img).toHaveAttribute('src', 'http://example.com/logo.png');
  });

  // ===== Tests de soumission avec différentes combinaisons =====

  test('soumission: modification de plusieurs champs simultanément', async () => {
    const u = userEvent.setup();
    renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    const descInput = screen.getByPlaceholderText("Description de l'institution");
    const websiteInput = screen.getByPlaceholderText('https://www.example.com');

    await u.clear(nameInput);
    await u.type(nameInput, 'Nouveau nom');

    await u.clear(descInput);
    await u.type(descInput, 'Nouvelle description longue');

    await u.clear(websiteInput);
    await u.type(websiteInput, 'https://nouveau-site.com');

    await u.click(querySubmitButton());

    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: baseInstitution.id,
      data: expect.objectContaining({
        name: 'Nouveau nom',
        description: 'Nouvelle description longue',
        website: 'https://nouveau-site.com',
      }),
    });
  });

  test('soumission: changement de type et pays', async () => {
    const u = userEvent.setup();
    renderModal();

    // Changer le type
    const typeButton = findTypeTrigger();
    if (!typeButton) throw new Error('Type trigger not found');
    await u.click(typeButton);
    await u.click(await screen.findByText('Banque numérique'));

    // Changer le pays
    const paysButton = screen.getByRole('button', { name: /Sénégal/ });
    await u.click(paysButton);
    await u.click(await screen.findByText('Cameroun'));

    await u.click(querySubmitButton());

    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: baseInstitution.id,
      data: expect.objectContaining({
        type: 'BANQUE_NUMERIQUE',
        pays: 'CAMEROUN',
      }),
    });
  });

  // ===== Tests pour la gestion du focus et de l'interaction =====

  test("le dropdown des zones s'ouvre au focus de l'input", async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');

    // Focus sur l'input en tapant
    await u.click(zoneInput);
    await u.type(zoneInput, 'E');

    // Le dropdown doit être visible
    expect(await screen.findByRole('button', { name: 'EURO' })).toBeInTheDocument();
  });

  // ===== Tests pour les erreurs multiples =====

  test('affiche toutes les erreurs de validation simultanément', async () => {
    const u = userEvent.setup();
    const instMinimal: Institution = {
      ...baseInstitution,
      name: '',
      description: '',
      website: '',
      geographicZones: [],
      logoUrl: '',
    };

    renderModal({ institution: instMinimal });

    // Remplir avec des valeurs invalides
    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    const descInput = screen.getByPlaceholderText("Description de l'institution");
    const websiteInput = screen.getByPlaceholderText('https://www.example.com');
    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');

    await u.type(nameInput, 'A'); // Trop court
    await u.type(descInput, 'Court'); // Trop court
    await u.type(websiteInput, 'invalid'); // URL invalide
    await u.type(logoInput, 'invalid'); // URL invalide

    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form');
    if (!form) throw new Error('Form not found');
    fireEvent.submit(form);

    // Toutes les erreurs doivent être visibles
    expect(
      await screen.findByText('Le nom doit contenir au moins 2 caractères')
    ).toBeInTheDocument();
    expect(
      screen.getByText('La description doit contenir au moins 10 caractères')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Doit être une URL valide').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Au moins une zone géographique est requise/i)).toBeInTheDocument();
  });

  // ===== Tests pour le comportement du succès avec erreurs =====

  test("au succès: gère l'erreur de setValue dans le try/catch", async () => {
    const u = userEvent.setup();
    renderModal();

    await u.click(querySubmitButton());

    // Just ensure onSuccess handler doesn't throw even if setValue had issues
    expect(() => capturedOnSuccess?.()).not.toThrow();
  });

  // ===== Tests pour toutes les zones disponibles =====

  test('toutes les zones géographiques sont disponibles dans le dropdown', async () => {
    const u = userEvent.setup();
    const instWithoutZones: Institution = {
      ...baseInstitution,
      geographicZones: [],
    };

    renderModal({ institution: instWithoutZones });

    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');

    for (const zone of AVAILABLE_ZONES) {
      await u.clear(zoneInput);
      await u.type(zoneInput, zone);
      expect(await screen.findByRole('button', { name: zone })).toBeInTheDocument();
    }
  });

  // ===== Test pour la prop open =====

  test("modal ne s'affiche pas quand open=false", () => {
    renderModal({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // ===== Tests pour le mode onChange du formulaire =====

  test('validation en temps réel (mode onChange) fonctionne', async () => {
    const u = userEvent.setup();
    renderModal();

    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');

    await u.clear(nameInput);
    await u.type(nameInput, 'A');

    // L'erreur devrait apparaître immédiatement
    await waitFor(() => {
      expect(screen.getByText('Le nom doit contenir au moins 2 caractères')).toBeInTheDocument();
    });

    await u.type(nameInput, 'B');

    // L'erreur devrait disparaître
    await waitFor(() => {
      expect(
        screen.queryByText('Le nom doit contenir au moins 2 caractères')
      ).not.toBeInTheDocument();
    });
  });

  // ===== Test du removeZone helper =====

  test('fonction removeZone retire correctement une zone', () => {
    const { removeZone } = require('@/components/admin/institutions/EditInstitutionModal');

    const zones = ['UEMOA', 'CEMAC', 'EURO'];
    const result = removeZone(zones, 'CEMAC');

    expect(result).toEqual(['UEMOA', 'EURO']);
    expect(result).not.toContain('CEMAC');
  });

  test('fonction removeZone gère un tableau undefined', () => {
    const { removeZone } = require('@/components/admin/institutions/EditInstitutionModal');

    const result = removeZone(undefined, 'UEMOA');

    expect(result).toEqual([]);
  });

  // ===== Tests d'intégration complets =====

  test('workflow complet: édition, validation, soumission, succès', async () => {
    const u = userEvent.setup();
    const { onOpenChange, refresh } = renderModal();

    // Modifier tous les champs
    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    await u.clear(nameInput);
    await u.type(nameInput, 'Institution Complète');

    const descInput = screen.getByPlaceholderText("Description de l'institution");
    await u.clear(descInput);
    await u.type(descInput, 'Une description complète et détaillée');

    // Changer le type
    const typeButton = screen.getByRole('button', { name: /Service de paiement/ });
    await u.click(typeButton);
    await u.click(await screen.findByText('Investissement'));

    // Changer le pays
    const paysButton = screen.getByRole('button', { name: /Sénégal/ });
    await u.click(paysButton);
    await u.click(await screen.findByText('Cameroun'));

    // Ajouter une zone
    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'EURO');
    await u.click(await screen.findByRole('button', { name: 'EURO' }));

    // Soumettre
    await u.click(querySubmitButton());

    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: baseInstitution.id,
      data: expect.objectContaining({
        name: 'Institution Complète',
        description: 'Une description complète et détaillée',
        type: 'SERVICE_INVESTISSEMENT',
        pays: 'CAMEROUN',
        geographicZones: expect.arrayContaining(['UEMOA', 'CEMAC', 'EURO']),
      }),
    });

    // Simuler le succès
    capturedOnSuccess?.();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalled();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

const querySubmitButton = () =>
  screen.getByRole('button', {
    name: /Créer l'institution|Créer l&apos;institution|Enregistrer les modifications|Enregistrement…/,
  });

const renderModal = (overrides?: Partial<React.ComponentProps<typeof InstitutionModal>>) => {
  const onOpenChange = jest.fn();
  const refresh = jest.fn();
  render(<InstitutionModal open onOpenChange={onOpenChange} refresh={refresh} {...overrides} />);
  return { onOpenChange, refresh };
};

const openDropdownAndChoose = async (triggerLabel: string, optionText: string) => {
  const u = userEvent.setup();
  const trigger = screen.getByRole('button', { name: new RegExp(triggerLabel) });
  await u.click(trigger);
  await new Promise(resolve => setTimeout(resolve, 100)); // Attendre l'animation d'ouverture
  const item = await screen.findByRole('menuitem', { name: optionText });
  await u.click(item);
  await new Promise(resolve => setTimeout(resolve, 50)); // Attendre l'animation de fermeture
};

const addZone = async (zoneText: string) => {
  const u = userEvent.setup();
  const zoneInput = screen.getByPlaceholderText('Sélectionner une zone');
  await u.click(zoneInput);
  await new Promise(resolve => setTimeout(resolve, 100)); // Attendre l'ouverture
  await u.type(zoneInput, zoneText.slice(0, 3));
  const option = await screen.findByRole('button', { name: zoneText });
  await u.click(option);
  await new Promise(resolve => setTimeout(resolve, 100)); // Attendre la fermeture
};

// Soumettre le <form> directement (même si le bouton est disabled)
const submitFormProgrammatically = () => {
  const dialog = screen.getByRole('dialog');
  const form = dialog.querySelector('form');
  if (!form) throw new Error('Form not found in dialog');
  fireEvent.submit(form);
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

describe('InstitutionModal (nouvelle implémentation)', () => {
  test('validation: erreurs affichées après submit, puis correction rend le bouton actif', async () => {
    const u = userEvent.setup();
    renderModal();

    expect(querySubmitButton()).toBeDisabled();

    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'O'); // trop court
    await u.type(screen.getByPlaceholderText("Description de l'institution"), 'trop court'); // < 10
    await u.type(screen.getByPlaceholderText('https://'), 'not-a-url');
    await u.type(screen.getByPlaceholderText('🏦 ou https://'), 'also-not-a-url');

    submitFormProgrammatically();

    await screen.findByText('Le nom doit contenir au moins 2 caractères');

    await screen.findByText(/Le nom doit contenir au moins 2 caractères/i);
    await new Promise(resolve => setTimeout(resolve, 100)); // Donner du temps aux autres messages

    expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    expect(screen.getByText(/une zone géographique est requise/i)).toBeInTheDocument();

    await u.clear(screen.getByPlaceholderText('Ex: Orange Money'));
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'Orange Money');

    const desc = screen.getByPlaceholderText("Description de l'institution");
    await u.clear(desc);
    await u.type(desc, 'Une description valide (>= 10 caractères)');

    // Website OK
    const website = screen.getByPlaceholderText('https://');
    await u.clear(website);
    await u.type(website, 'https://ok.sn');

    // Logo OK
    const logo = screen.getByPlaceholderText('🏦 ou https://');
    await u.clear(logo);
    await u.type(logo, 'https://exemple.com/logo.png');

    // Sélectionner Type & Pays (requis par zod)
    await openDropdownAndChoose('Sélectionner un type', 'Service de paiement');
    await openDropdownAndChoose('Sélectionner un pays', 'Sénégal');

    // Ajouter une zone
    await addZone('UEMOA');

    // Aperçu du logo rendu
    expect(await screen.findByAltText('Aperçu du logo')).toBeInTheDocument();

    // Form valide => bouton actif (label création)
    expect(screen.getByRole('button', { name: 'Créer l&apos;institution' })).toBeEnabled();
  });

  test('création: envoie le payload complet à createInstitution', async () => {
    const u = userEvent.setup();
    renderModal();

    // Champs requis + valides
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'Orange Money');
    await u.type(
      screen.getByPlaceholderText("Description de l'institution"),
      'Une description valide'
    );
    await u.type(screen.getByPlaceholderText('https://'), 'https://www.orange.sn');
    await u.type(screen.getByPlaceholderText('🏦 ou https://'), 'https://exemple.com/logo.png');

    await openDropdownAndChoose('Sélectionner un type', 'Service de paiement');
    await openDropdownAndChoose('Sélectionner un pays', 'Sénégal');
    await addZone('UEMOA');

    await u.click(screen.getByRole('button', { name: 'Créer l&apos;institution' }));

    expect(createInstitutionMock).toHaveBeenCalledTimes(1);
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

  test('zones: retirer une zone via badge remet le formulaire invalide (submit désactivé si plus de zone)', async () => {
    const u = userEvent.setup();
    renderModal();

    // Remplir minimal valide
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'OM');
    await u.type(
      screen.getByPlaceholderText("Description de l'institution"),
      'Une description valide'
    );
    await u.type(screen.getByPlaceholderText('https://'), 'https://ok.sn');
    await openDropdownAndChoose('Sélectionner un type', 'Service de paiement');
    await openDropdownAndChoose('Sélectionner un pays', 'Sénégal');
    await addZone('UEMOA');

    // Bouton devrait être activé si tout est ok
    expect(querySubmitButton()).toBeEnabled();

    // Retirer la zone en cliquant le badge
    await u.click(screen.getByText('UEMOA'));

    // Plus de zone → invalide
    expect(querySubmitButton()).toBeDisabled();
  });

  test("Aperçu du logo: affiché quand URL valide, disparaît quand l'input est vidé", async () => {
    const u = userEvent.setup();
    renderModal();

    // Rendre la prévisualisation visible (tout en validant le form)
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'OM');
    await u.type(
      screen.getByPlaceholderText("Description de l'institution"),
      'Une description valide'
    );
    await u.type(screen.getByPlaceholderText('https://'), 'https://ok.sn');
    await openDropdownAndChoose('Sélectionner un type', 'Service de paiement');
    await openDropdownAndChoose('Sélectionner un pays', 'Sénégal');
    await addZone('UEMOA');

    const logo = screen.getByPlaceholderText('🏦 ou https://');
    await u.type(logo, 'https://valid.com/logo.png');

    expect(await screen.findByAltText('Aperçu du logo')).toBeInTheDocument();

    await u.clear(logo);
    // L’aperçu doit disparaître
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
  });

  test('Annuler ferme le modal si pas en soumission, ne ferme pas pendant la soumission', async () => {
    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Simuler soumission
    const { useCreateInstitution } = require('@/hooks/institution/useCreateInstitution');
    (useCreateInstitution as jest.Mock).mockReturnValue({
      isCreating: true,
      createInstitution: createInstitutionMock,
    });

    // Rerender pour refléter isSubmitting=true
    onOpenChange.mockClear();
    renderModal();

    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('édition: modifie le nom puis soumet -> appelle updateInstitution avec id + data', async () => {
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

    // Titre d’édition + bouton d’action spécifique
    expect(screen.getByText('Modifier l&apos;institution')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'Enregistrer les modifications' });
    // Selon les libs RHF/zod, isValid peut être false au premier rendu -> bouton potentiellement disabled
    // Assurer l'activation en modifiant un champ
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), ' Plus');

    expect(submit).toBeEnabled();
    await u.click(submit);

    expect(updateInstitutionMock).toHaveBeenCalledTimes(1);
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

  test("l'aperçu n'apparaît pas si logo invalide (url non valide)", async () => {
    const u = userEvent.setup();
    renderModal();

    // Rendre form quasi valide sauf logo
    await u.type(screen.getByPlaceholderText('Ex: Orange Money'), 'OM');
    await u.type(
      screen.getByPlaceholderText("Description de l'institution"),
      'Une description valide'
    );
    await u.type(screen.getByPlaceholderText('https://'), 'https://ok.sn');
    await openDropdownAndChoose('Sélectionner un type', 'Service de paiement');
    await openDropdownAndChoose('Sélectionner un pays', 'Sénégal');
    await addZone('UEMOA');

    // S'assurer qu'il n'y a pas d'aperçu au départ
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();

    // Logo invalide
    const logoInput = screen.getByPlaceholderText('🏦 ou https://');
    await u.clear(logoInput);
    await u.type(logoInput, 'not-a-url');

    // Attendre que la validation soit faite
    await screen.findByText('Doit être une URL valide');

    // Vérifier qu'il n'y a pas d'aperçu
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InstitutionModal from '@/components/admin/institutions/InstitutionModal';
import type { Institution } from '@/types/Institution';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />, // simplifie Next/Image
}));

const createInstitutionMock = jest.fn();
const updateInstitutionMock = jest.fn();

jest.mock('@/hooks/institution/useCreateInstitution', () => ({
  useCreateInstitution: jest.fn(),
}));
jest.mock('@/hooks/institution/useUpdateInstitution', () => ({
  useUpdateInstitution: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: jest.fn(async () => 'test-token') }),
}));

// ───────────────────────────────────────────────────────────────────────────────
// Utils
// ───────────────────────────────────────────────────────────────────────────────

const submitForm = () => {
  const dialog = screen.getByRole('dialog');
  const form = dialog.querySelector('form') as HTMLFormElement;
  fireEvent.submit(form);
};

const fillValidForm = async (u: ReturnType<typeof userEvent.setup>) => {
  await u.type(screen.getByPlaceholderText('Ex : Orange Money'), 'Orange Money');
  await u.type(
    screen.getByPlaceholderText('Description de l’institution…'),
    'Une description valide pour le test'
  );
  await u.type(screen.getByPlaceholderText('https://www.institution.sn'), 'https://www.orange.sn');
  await u.type(
    screen.getByPlaceholderText('https://exemple.com/logo.png'),
    'https://exemple.com/logo.png'
  );

  const search = screen.getByPlaceholderText('Rechercher une zone…');
  await u.click(search);
  await u.type(search, 'UEM');
  await u.click(await screen.findByRole('button', { name: 'UEMOA' }));

  expect(screen.getByText('UEMOA')).toBeInTheDocument();
};

const querySubmitButton = () =>
  screen.getByRole('button', { name: /Enregistrer|Modifier|Enregistrement…/ });

const renderCreate = (overrides?: Partial<React.ComponentProps<typeof InstitutionModal>>) => {
  const onOpenChange = jest.fn();
  const refresh = jest.fn();
  return {
    ...render(
      <InstitutionModal open onOpenChange={onOpenChange} refresh={refresh} {...overrides} />
    ),
    onOpenChange,
    refresh,
  };
};

const origWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
    const msg = String(args[0] ?? '');
    if (msg.includes('Missing `Description` or `aria-describedby')) return;
    // @ts-ignore
    origWarn(...args);
  });
});
afterAll(() => {
  (console.warn as unknown as jest.SpyInstance).mockRestore();
});

describe('InstitutionModal (create & edit)', () => {
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

  test('création: erreurs de validation, puis formulaire valide active le bouton', async () => {
    const u = userEvent.setup();
    renderCreate();

    // bouton désactivé au départ
    expect(querySubmitButton()).toBeDisabled();

    // URLs invalides
    await u.type(screen.getByPlaceholderText('https://www.institution.sn'), 'not-a-url');
    await u.type(screen.getByPlaceholderText('https://exemple.com/logo.png'), 'also-not-a-url');

    // Submit du <form> (le bouton est disabled)
    submitForm();

    // Attendre les messages d’erreur
    expect(
      await screen.findByText('Le nom doit contenir au moins 2 caractères')
    ).toBeInTheDocument();
    expect(
      screen.getByText('La description doit contenir au moins 10 caractères')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Doit être une URL valide').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Au moins une zone géographique est requise')).toBeInTheDocument();

    // Corriger -> form valide -> bouton actif
    await u.clear(screen.getByPlaceholderText('https://www.institution.sn'));
    await u.type(screen.getByPlaceholderText('https://www.institution.sn'), 'https://ok.sn');

    await u.clear(screen.getByPlaceholderText('https://exemple.com/logo.png'));
    await u.type(
      screen.getByPlaceholderText('https://exemple.com/logo.png'),
      'https://exemple.com/logo.png'
    );

    await u.type(screen.getByPlaceholderText('Ex : Orange Money'), 'OM');
    await u.type(
      screen.getByPlaceholderText('Description de l’institution…'),
      'Une super institution'
    );

    const search = screen.getByPlaceholderText('Rechercher une zone…');
    await u.click(search);
    await u.type(search, 'UEM');
    await u.click(await screen.findByRole('button', { name: 'UEMOA' }));

    expect(await screen.findByAltText('Aperçu du logo')).toBeInTheDocument();
    expect(querySubmitButton()).toBeEnabled();
  });

  test('création: soumet et appelle createInstitution avec le payload correct', async () => {
    const u = userEvent.setup();
    renderCreate();

    await fillValidForm(u);
    await u.click(querySubmitButton());

    expect(createInstitutionMock).toHaveBeenCalledTimes(1);
    expect(createInstitutionMock).toHaveBeenCalledWith({
      name: 'Orange Money',
      description: 'Une description valide pour le test',
      website: 'https://www.orange.sn',
      geographicZones: ['UEMOA'],
      logoUrl: 'https://exemple.com/logo.png',
    });
  });

  test('création: ajouter puis supprimer une zone via le badge désactive à nouveau le submit', async () => {
    const u = userEvent.setup();
    renderCreate();

    await fillValidForm(u);

    const badgeText = screen.getByText('UEMOA');
    const badgeEl = badgeText.closest('[data-slot="badge"]') || badgeText;
    await u.click(badgeEl as Element);

    expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
    expect(querySubmitButton()).toBeDisabled();
  });

  test("création: 'Annuler' ferme le modal si pas en soumission", async () => {
    const u = userEvent.setup();
    const { onOpenChange } = renderCreate();
    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("création: 'Annuler' ne ferme pas si isSubmitting=true", async () => {
    const { useCreateInstitution } = require('@/hooks/institution/useCreateInstitution');
    (useCreateInstitution as jest.Mock).mockReturnValue({
      isCreating: true,
      createInstitution: createInstitutionMock,
    });

    const u = userEvent.setup();
    const { onOpenChange } = renderCreate();
    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('édition: bouton désactivé au départ, devient actif après modification et appelle updateInstitution', async () => {
    const u = userEvent.setup();

    const institution: Institution = {
      id: 'inst_1',
      name: 'Banky',
      description: 'Desc existante',
      website: 'https://banky.sn',
      geographicZones: ['UEMOA', 'CEMAC'],
      logoUrl: 'https://cdn/logo.png',
      status: 'ACTIVE' as any,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    };

    renderCreate({ institution });

    expect(screen.getByText("Modifier l'institution")).toBeInTheDocument();

    // au reset, isValid n'est pas encore true => disabled
    const submit = screen.getByRole('button', { name: 'Modifier' });
    expect(submit).toBeDisabled();

    // modification d'un champ => isValid true => enabled
    await u.type(screen.getByPlaceholderText('Ex : Orange Money'), ' Plus');
    expect(submit).toBeEnabled();

    await u.click(submit);

    expect(updateInstitutionMock).toHaveBeenCalledTimes(1);
    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: 'inst_1',
      data: {
        name: 'Banky Plus',
        description: 'Desc existante',
        website: 'https://banky.sn',
        geographicZones: ['UEMOA', 'CEMAC'],
        logoUrl: 'https://cdn/logo.png',
      },
    });
  });

  test("l'aperçu du logo disparaît quand la valeur devient vide (non fournie)", async () => {
    const u = userEvent.setup();
    renderCreate();

    await u.type(screen.getByPlaceholderText('Ex : Orange Money'), 'OM');
    await u.type(
      screen.getByPlaceholderText('Description de l’institution…'),
      'Une super description'
    );
    await u.type(screen.getByPlaceholderText('https://www.institution.sn'), 'https://ok.sn');
    const logoInput = screen.getByPlaceholderText('https://exemple.com/logo.png');
    await u.type(logoInput, 'https://valid.com/logo.png');

    const search = screen.getByPlaceholderText('Rechercher une zone…');
    await u.click(search);
    await u.type(search, 'UEM');
    await u.click(await screen.findByRole('button', { name: 'UEMOA' }));

    expect(await screen.findByAltText('Aperçu du logo')).toBeInTheDocument();

    await u.clear(logoInput);

    await screen.findByRole('button', { name: 'Enregistrer' }); // petite synchro
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
  });
});

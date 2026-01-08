import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controller } from 'react-hook-form';

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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Mocks UI shadcn/radix (pas de portal, pas de focus trap)
 * ─────────────────────────────────────────────────────────────────────────────
 */
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid='dialog' data-open={open}>
      <button type='button' aria-label='dialog-open' onClick={() => onOpenChange(true)}>
        open
      </button>
      <button type='button' aria-label='dialog-close' onClick={() => onOpenChange(false)}>
        close
      </button>
      {children}
    </div>
  ),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock InstitutionFormFields :
 * - mêmes placeholders que le composant réel
 * - pas de Radix DropdownMenu (juste des boutons)
 * - RHF wiring via Controller
 * ─────────────────────────────────────────────────────────────────────────────
 */
jest.mock('@/components/admin/institutions/shared/InstitutionFormFields', () => {
  const React = require('react');
  const { Controller } = require('react-hook-form');

  const TYPE_VALUE = 'SERVICE_PAIEMENT_ELECTRONIQUE';
  const PAYS_VALUE = 'SENEGAL';

  function Step1({ control, disabled }: any) {
    return (
      <div>
        <Controller
          name='name'
          control={control}
          render={({ field }: any) => (
            <input placeholder='Ex: Orange Money' {...field} disabled={disabled} />
          )}
        />
        <Controller
          name='type'
          control={control}
          render={({ field }: any) => (
            <button
              type='button'
              aria-label='Banque'
              onClick={() => field.onChange(TYPE_VALUE)}
              disabled={disabled}
            >
              Banque
            </button>
          )}
        />
      </div>
    );
  }

  function Step2({ control, watch, errors, disabled }: any) {
    const logoUrl = watch('logoUrl') || '';
    const sanitized = typeof logoUrl === 'string' ? logoUrl.trim() : logoUrl;

    return (
      <div>
        <Controller
          name='logoUrl'
          control={control}
          render={({ field }: any) => (
            <input placeholder='https://example.com/logo.png' {...field} disabled={disabled} />
          )}
        />

        {/* aperçu comme dans le vrai composant compact */}
        {sanitized && !errors?.logoUrl && <img alt='Aperçu du logo' src={sanitized} />}

        <Controller
          name='description'
          control={control}
          render={({ field }: any) => (
            <textarea placeholder="Description de l'institution" {...field} disabled={disabled} />
          )}
        />

        <Controller
          name='website'
          control={control}
          render={({ field }: any) => (
            <input placeholder='https://www.example.com' {...field} disabled={disabled} />
          )}
        />
      </div>
    );
  }

  function Step3({ control, disabled }: any) {
    const ReactLocal = React;
    const [query, setQuery] = ReactLocal.useState('');

    return (
      <div>
        <Controller
          name='pays'
          control={control}
          render={({ field }: any) => (
            <button
              type='button'
              aria-label='Sélectionner un pays'
              onClick={() => field.onChange(PAYS_VALUE)}
              disabled={disabled}
            >
              Sélectionner un pays
            </button>
          )}
        />

        <Controller
          name='geographicZones'
          control={control}
          render={({ field }: any) => {
            const zones: string[] = field.value || [];
            const choices = ['UEMOA', 'CEMAC']
              .filter(z => z.toLowerCase().includes(query.toLowerCase()))
              .filter(z => !zones.includes(z));

            return (
              <div>
                <input
                  placeholder='Ex: Dakar, Thiès...'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  disabled={disabled}
                />

                {choices.map(z => (
                  <button
                    key={z}
                    type='button'
                    onClick={() => field.onChange([...zones, z])}
                    disabled={disabled}
                  >
                    {z}
                  </button>
                ))}

                {/* badges -> remove */}
                <div>
                  {zones.map(z => (
                    <button
                      key={z}
                      type='button'
                      onClick={() => field.onChange(zones.filter(x => x !== z))}
                      disabled={disabled}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>
            );
          }}
        />
      </div>
    );
  }

  return {
    __esModule: true,
    InstitutionFormFields: ({ control, watch, errors, disabled, step }: any) => {
      if (step === 1) return <Step1 control={control} disabled={disabled} />;
      if (step === 2)
        return <Step2 control={control} watch={watch} errors={errors} disabled={disabled} />;
      if (step === 3) return <Step3 control={control} disabled={disabled} />;
      return null;
    },
  };
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Hooks mocks (create / update)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const createInstitutionMock = jest.fn();
const updateInstitutionMock = jest.fn();
let createOnSuccess: (() => void) | undefined;
let updateOnSuccess: (() => void) | undefined;

let createState = { isCreating: false };
let updateState = { isUpdating: false };

jest.mock('@/hooks/institution/useCreateInstitution', () => ({
  useCreateInstitution: (opts: any) => {
    createOnSuccess = opts?.onSuccess;
    return { isCreating: createState.isCreating, createInstitution: createInstitutionMock };
  },
}));

jest.mock('@/hooks/institution/useUpdateInstitution', () => ({
  useUpdateInstitution: (opts: any) => {
    updateOnSuccess = opts?.onSuccess;
    return { isUpdating: updateState.isUpdating, updateInstitution: updateInstitutionMock };
  },
}));

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Render helper qui expose rerender (important)
 * ─────────────────────────────────────────────────────────────────────────────
 */
function renderModal(overrides?: Partial<React.ComponentProps<typeof InstitutionModal>>): {
  onOpenChange: jest.Mock;
  refresh: jest.Mock;
  rerenderModal: (nextOverrides?: Partial<React.ComponentProps<typeof InstitutionModal>>) => void;
} {
  const onOpenChange = jest.fn();
  const refresh = jest.fn();

  const baseProps = {
    open: true,
    onOpenChange,
    refresh,
    ...overrides,
  } as React.ComponentProps<typeof InstitutionModal>;

  const r = render(<InstitutionModal {...baseProps} />);

  return {
    onOpenChange,
    refresh,
    rerenderModal: (nextOverrides?: Partial<React.ComponentProps<typeof InstitutionModal>>) => {
      const props = { ...baseProps, ...nextOverrides } as React.ComponentProps<
        typeof InstitutionModal
      >;
      r.rerender(<InstitutionModal {...props} />);
    },
  };
}

/**
 * Force un rerender après modifications (sinon disabled peut rester figé)
 */
async function makeStep1Valid(u: ReturnType<typeof userEvent.setup>, rerenderModal: () => void) {
  const name = screen.getByPlaceholderText('Ex: Orange Money');
  await u.clear(name);
  await u.type(name, 'Orange Money');

  await u.click(screen.getByRole('button', { name: /Banque/i }));

  // force recalcul disabled
  rerenderModal();

  await waitFor(() => expect(screen.getByRole('button', { name: /Suivant/i })).toBeEnabled());
}

async function goToStep2(u: ReturnType<typeof userEvent.setup>, rerenderModal: () => void) {
  await makeStep1Valid(u, rerenderModal);
  await u.click(screen.getByRole('button', { name: /Suivant/i }));
  expect(await screen.findByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();
}

async function makeStep2Valid(u: ReturnType<typeof userEvent.setup>, rerenderModal: () => void) {
  const desc = screen.getByPlaceholderText("Description de l'institution");
  await u.clear(desc);
  await u.type(desc, 'Une description valide');

  const website = screen.getByPlaceholderText('https://www.example.com');
  await u.clear(website);
  await u.type(website, 'https://www.orange.sn');

  // force recalcul disabled
  rerenderModal();

  await waitFor(() => expect(screen.getByRole('button', { name: /Suivant/i })).toBeEnabled());
}

async function goToStep3(u: ReturnType<typeof userEvent.setup>, rerenderModal: () => void) {
  await goToStep2(u, rerenderModal);
  await makeStep2Valid(u, rerenderModal);
  await u.click(screen.getByRole('button', { name: /Suivant/i }));
  expect(await screen.findByPlaceholderText('Ex: Dakar, Thiès...')).toBeInTheDocument();
}

beforeEach(() => {
  jest.clearAllMocks();
  createOnSuccess = undefined;
  updateOnSuccess = undefined;
  createState.isCreating = false;
  updateState.isUpdating = false;
});

describe('InstitutionModal (brand new stable tests)', () => {
  test('render: titre + stepper', () => {
    renderModal();

    expect(screen.getByText('Nouvelle institution')).toBeInTheDocument();
    expect(screen.getByText('Informations de base')).toBeInTheDocument();
    expect(screen.getByText('Détails')).toBeInTheDocument();
    expect(screen.getByText('Contact & Localisation')).toBeInTheDocument();
  });

  test('Étape 1: Suivant disabled puis enabled (name + type) et navigation step2', async () => {
    const u = userEvent.setup();
    const { rerenderModal } = renderModal();

    expect(screen.getByRole('button', { name: /Suivant/i })).toBeDisabled();

    await makeStep1Valid(u, () => rerenderModal());
    await u.click(screen.getByRole('button', { name: /Suivant/i }));

    expect(await screen.findByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retour/i })).toBeInTheDocument();
  });

  test('Étape 2: logo preview apparaît/disparaît et bloque si logoUrl invalide', async () => {
    const u = userEvent.setup();
    const { rerenderModal } = renderModal();

    await goToStep2(u, () => rerenderModal());

    const nextBtn = screen.getByRole('button', { name: /Suivant/i });
    expect(nextBtn).toBeDisabled(); // description vide

    // description ok -> enabled
    await makeStep2Valid(u, () => rerenderModal());
    expect(nextBtn).toBeEnabled();

    // logo invalide => zod url => errors.logoUrl => canGoToStep3 false => disabled
    const logo = screen.getByPlaceholderText('https://example.com/logo.png');
    await u.clear(logo);
    await u.type(logo, 'not-a-url');
    rerenderModal();
    await waitFor(() => expect(nextBtn).toBeDisabled());
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();

    // logo valide => enabled + preview
    await u.clear(logo);
    await u.type(logo, 'https://example.com/logo.png');
    rerenderModal();
    await waitFor(() => expect(nextBtn).toBeEnabled());
    expect(screen.getByAltText('Aperçu du logo')).toBeInTheDocument();

    // vider logo => preview disparaît et reste ok
    await u.clear(logo);
    rerenderModal();
    await waitFor(() => expect(nextBtn).toBeEnabled());
    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
  });

  test('Retour step2 -> step1', async () => {
    const u = userEvent.setup();
    const { rerenderModal } = renderModal();

    await goToStep2(u, () => rerenderModal());
    await u.click(screen.getByRole('button', { name: /Retour/i }));

    expect(await screen.findByPlaceholderText('Ex: Orange Money')).toBeInTheDocument();
  });

  test('Étape 3: submit disabled tant que pays/zones manquants puis createInstitution appelé', async () => {
    const u = userEvent.setup();
    const { rerenderModal } = renderModal();

    await goToStep3(u, () => rerenderModal());

    const submit = screen.getByRole('button', { name: /Créer l'institution/i });
    expect(submit).toBeDisabled();

    // set pays seulement => toujours disabled
    await u.click(screen.getByRole('button', { name: /Sélectionner un pays/i }));
    rerenderModal();
    expect(submit).toBeDisabled();

    // add zone via search
    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'UEM');
    await u.click(screen.getByRole('button', { name: 'UEMOA' }));

    rerenderModal();
    await waitFor(() => expect(submit).toBeEnabled());

    await u.click(submit);

    await waitFor(() => expect(createInstitutionMock).toHaveBeenCalledTimes(1));
    expect(createInstitutionMock).toHaveBeenCalledWith({
      name: 'Orange Money',
      description: 'Une description valide',
      website: 'https://www.orange.sn',
      geographicZones: ['UEMOA'],
      logoUrl: '',
      type: 'SERVICE_PAIEMENT_ELECTRONIQUE',
      pays: 'SENEGAL',
    });
  });

  test('Étape 3: retirer zone re-bloque le submit', async () => {
    const u = userEvent.setup();
    const { rerenderModal } = renderModal();

    await goToStep3(u, () => rerenderModal());

    // pays + zone
    await u.click(screen.getByRole('button', { name: /Sélectionner un pays/i }));
    const zoneInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await u.type(zoneInput, 'U');
    await u.click(screen.getByRole('button', { name: 'UEMOA' }));
    rerenderModal();

    const submit = screen.getByRole('button', { name: /Créer l'institution/i });
    await waitFor(() => expect(submit).toBeEnabled());

    // remove zone badge
    await u.click(screen.getByRole('button', { name: 'UEMOA' }));
    rerenderModal();

    await waitFor(() => expect(submit).toBeDisabled());
  });

  test('Annuler ferme si pas en soumission', async () => {
    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('Dialog onOpenChange(true) appelle onOpenChange(true)', async () => {
    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    await u.click(screen.getByRole('button', { name: /dialog-open/i }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  test('Dialog close reset step 1 quand pas en soumission', async () => {
    const u = userEvent.setup();
    const { onOpenChange, rerenderModal } = renderModal();

    await goToStep2(u, () => rerenderModal());
    expect(screen.getByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: /dialog-close/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(await screen.findByPlaceholderText('Ex: Orange Money')).toBeInTheDocument();
  });

  test('Soumission: Annuler + Dialog close ignorés quand isCreating=true', async () => {
    createState.isCreating = true;

    const u = userEvent.setup();
    const { onOpenChange } = renderModal();

    await u.click(screen.getByRole('button', { name: 'Annuler' }));
    await u.click(screen.getByRole('button', { name: /dialog-close/i }));
    await u.click(screen.getByRole('button', { name: /dialog-open/i }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('Mode édition: pré-remplit et updateInstitution appelé', async () => {
    const u = userEvent.setup();

    const inst: Institution = {
      id: 'inst_1',
      name: 'Banky',
      description: 'Description existante assez longue',
      website: 'https://banky.sn',
      geographicZones: ['UEMOA', 'CEMAC'],
      logoUrl: 'https://example.com/logo.png',
      status: 'ACTIVE' as any,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
      type: 'SERVICE_PAIEMENT_ELECTRONIQUE' as any,
      pays: 'SENEGAL' as any,
    };

    const { rerenderModal } = renderModal({ institution: inst });

    const name = screen.getByPlaceholderText('Ex: Orange Money') as HTMLInputElement;
    expect(name.value).toBe('Banky');

    // modifier name + rerender
    await u.clear(name);
    await u.type(name, 'Banky Plus');
    rerenderModal();

    await waitFor(() => expect(screen.getByRole('button', { name: /Suivant/i })).toBeEnabled());
    await u.click(screen.getByRole('button', { name: /Suivant/i }));

    await screen.findByPlaceholderText('https://example.com/logo.png');

    rerenderModal();
    await waitFor(() => expect(screen.getByRole('button', { name: /Suivant/i })).toBeEnabled());
    await u.click(screen.getByRole('button', { name: /Suivant/i }));

    await screen.findByPlaceholderText('Ex: Dakar, Thiès...');

    rerenderModal();
    const submit = screen.getByRole('button', { name: /Créer l'institution/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await u.click(submit);

    await waitFor(() => expect(updateInstitutionMock).toHaveBeenCalledTimes(1));
    expect(updateInstitutionMock).toHaveBeenCalledWith({
      id: 'inst_1',
      data: {
        name: 'Banky Plus',
        description: 'Description existante assez longue',
        website: 'https://banky.sn',
        geographicZones: ['UEMOA', 'CEMAC'],
        logoUrl: 'https://example.com/logo.png',
        type: 'SERVICE_PAIEMENT_ELECTRONIQUE',
        pays: 'SENEGAL',
      },
    });
  });

  test('onSuccess create: reset + close + refresh + step1', async () => {
    const u = userEvent.setup();
    const { onOpenChange, refresh, rerenderModal } = renderModal();

    await goToStep2(u, () => rerenderModal());
    expect(screen.getByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();

    expect(typeof createOnSuccess).toBe('function');
    createOnSuccess?.();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalledTimes(1);

    const name = await screen.findByPlaceholderText('Ex: Orange Money');
    expect((name as HTMLInputElement).value).toBe('');
  });

  test('onSuccess update: reset + close + refresh', () => {
    const inst: Institution = {
      id: 'inst_2',
      name: 'Test',
      description: 'Une description existante assez longue',
      website: '',
      geographicZones: ['UEMOA'],
      logoUrl: '',
      status: 'ACTIVE' as any,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
      type: 'SERVICE_PAIEMENT_ELECTRONIQUE' as any,
      pays: 'SENEGAL' as any,
    };

    const { onOpenChange, refresh } = renderModal({ institution: inst });

    expect(typeof updateOnSuccess).toBe('function');
    updateOnSuccess?.();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

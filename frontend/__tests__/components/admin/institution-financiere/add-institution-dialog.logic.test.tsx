// __tests__/components/admin/institution-financiere/add-institution-dialog.logic.test.tsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddInstitutionDialog } from '@/components/admin/institution-financiere/add-institution-dialog';

// --- Mocks d’UI "steps" pour éviter RHF dans les sous-composants ---
jest.mock('@/components/admin/institution-financiere/steps/StepInstitutionInfo', () => ({
  StepInstitutionInfo: () => <div data-testid="step-institution-info">Step 1</div>,
}));
jest.mock('@/components/admin/institution-financiere/steps/StepContactInfo', () => ({
  StepContactInfo: () => <div data-testid="step-contact-info">Step 2</div>,
}));
jest.mock('@/components/admin/institution-financiere/steps/StepRegionsCoverage', () => ({
  StepRegionsCoverage: () => <div data-testid="step-regions-coverage">Step 3</div>,
}));
jest.mock('@/components/admin/institution-financiere/step-progress-indicator', () => ({
  StepProgressIndicator: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="progress">Step {currentStep}</div>
  ),
}));

// --- Mocks ---
// toast (sonner)
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
const { toast } = jest.requireMock('sonner');

// API
jest.mock('@/lib/api/institutions', () => ({
  createInstitution: jest.fn(),
}));
const { createInstitution } = jest.requireMock('@/lib/api/institutions');

// Partial mock de RHF : garder tout sauf useForm (pour injecter des fake values)
const fakeValues = {
  nom: 'X',
  type: 'Banque',
  description: 'Desc',
  siteWeb: 'https://x.test',
  contactNom: '',
  contactEmail: '',
  contactTelephone: '',
  regionsDesservies: ['DAKAR'],
};
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      handleSubmit:
        (fn: any) =>
        (e?: any) => {
          e?.preventDefault?.();
          return fn(fakeValues);
        },
      reset: jest.fn(),
      setValue: jest.fn(),
      control: {}, // n'est pas utilisé grâce aux mocks des steps
      formState: { isDirty: false, errors: {} },
    }),
  };
});

describe('AddInstitutionDialog — navigation, fermeture & submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parcourt 1→2→3, rend correctement les boutons, puis ferme (reset exécuté)', async () => {
    const onOpenChange = jest.fn();
    render(<AddInstitutionDialog open={true} onOpenChange={onOpenChange} />);

    // Étape 1
    expect(screen.getByTestId('step-institution-info')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suivant/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /précédent/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enregistrer/i })).not.toBeInTheDocument();

    // Étape 2
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    await waitFor(() => {
      expect(screen.getByTestId('step-contact-info')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /précédent/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /suivant/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /enregistrer/i })).not.toBeInTheDocument();
    });

    // Étape 3
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    await waitFor(() => {
      expect(screen.getByTestId('step-regions-coverage')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /suivant/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /précédent/i })).toBeInTheDocument();
    });

    // Retour étape 2
    fireEvent.click(screen.getByRole('button', { name: /précédent/i }));
    await waitFor(() => {
      expect(screen.getByTestId('step-contact-info')).toBeInTheDocument();
    });

    // Fermer (internalClose -> handleOpenChange(false) -> resetDialogState)
    fireEvent.click(screen.getByRole('button', { name: /fermer/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('onSubmit: succès → createInstitution, onCreated, toast.success, puis fermeture', async () => {
    const onOpenChange = jest.fn();
    const onCreated = jest.fn();
    (createInstitution as jest.Mock).mockResolvedValue({
      id: '1',
      ...fakeValues,
      statut: 'Actif',
      createdAt: '2025-09-16T12:00:00Z',
    });

    render(<AddInstitutionDialog open={true} onOpenChange={onOpenChange} onCreated={onCreated} />);

    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    const submit = screen.getByRole('button', { name: /enregistrer/i });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(createInstitution).toHaveBeenCalledWith(fakeValues);
      expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: '1', nom: 'X' }));
      expect(toast.success).toHaveBeenCalledWith('Institution financière ajoutée avec succès');
      expect(onOpenChange).toHaveBeenCalledWith(false); // internalClose
      expect(submit).not.toBeDisabled(); // finally
    });
  });

  it('onSubmit: erreur avec Error → toast.error(message), pas de fermeture', async () => {
    const onOpenChange = jest.fn();
    (createInstitution as jest.Mock).mockRejectedValue(new Error('Boom!'));

    render(<AddInstitutionDialog open={true} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    const submit = screen.getByRole('button', { name: /enregistrer/i });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(createInstitution).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Boom!');
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(submit).not.toBeDisabled();
    });
  });

  it("onSubmit: erreur avec non-Error → toast.error('Erreur inconnue ...'), pas de fermeture", async () => {
    const onOpenChange = jest.fn();
    (createInstitution as jest.Mock).mockRejectedValue({ bad: true });

    render(<AddInstitutionDialog open={true} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    const submit = screen.getByRole('button', { name: /enregistrer/i });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(createInstitution).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Erreur inconnue lors de la création');
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(submit).not.toBeDisabled();
    });
  });
});

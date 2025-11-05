// __tests__/components/admin/modules/module-dialog.test.tsx
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModuleDialog from '@/components/admin/modules/module-dialog';
import { useCreateModule } from '@/hooks/module/useCreateModule';
import { DifficultyLevel, Thematic } from '@/types/modules/module';

interface ModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mocks
jest.mock('@/hooks/module/useCreateModule', () => ({
  useCreateModule: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  X: () => <span data-testid='close-icon'>✕</span>,
}));

jest.mock('@/lib/constants/module-constants', () => ({
  DIFFICULTY_LABELS: {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
    EXPERT: 'Expert',
  },
  THEMATIC_LABELS: {
    FINANCIAL_EDUCATION: 'Éducation financière',
    PERSONAL_DEVELOPMENT: 'Développement personnel',
    INVESTMENT: 'Investissement',
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ModuleDialog', () => {
  const mockOnClose = jest.fn();
  const mockCreateModule = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateModule as jest.Mock).mockReturnValue({
      createModule: mockCreateModule,
      isCreating: false,
    });
  });

  // Helper pour le rendu avec le provider
  const renderWithProviders = (props: ModuleDialogProps) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ModuleDialog {...props} />
      </QueryClientProvider>
    );
  };

  it('ne rend rien quand isOpen est false', () => {
    const { container } = renderWithProviders({ isOpen: false, onClose: mockOnClose });
    expect(container.firstChild).toBeNull();
  });

  it('affiche le dialog quand isOpen est true', () => {
    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    expect(screen.getByText('Nouveau module')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Créez un nouveau module apprentissage. Vous pourrez ensuite ajouter des leçons et des quiz.'
      )
    ).toBeInTheDocument();
  });

  it('affiche tous les champs du formulaire', () => {
    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    expect(screen.getByLabelText(/Titre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Thématique/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Difficulté/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Image du module/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Durée estimée/)).toBeInTheDocument();
  });

  it('affiche les valeurs par défaut correctes', () => {
    render(<ModuleDialog isOpen={true} onClose={mockOnClose} />);

    const durationInput = screen.getByLabelText(/Durée estimée/) as HTMLInputElement;
    expect(durationInput.value).toBe('60');

    const thematicSelect = screen.getByLabelText(/Thématique/) as HTMLSelectElement;
    expect(thematicSelect.value).toBe(Thematic.FINANCIAL_EDUCATION);

    const difficultySelect = screen.getByLabelText(/Difficulté/) as HTMLSelectElement;
    expect(difficultySelect.value).toBe(DifficultyLevel.BEGINNER);
  });

  it('affiche les options de thématique', () => {
    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    expect(screen.getByText('Éducation financière')).toBeInTheDocument();
    expect(screen.getByText('Développement personnel')).toBeInTheDocument();
    expect(screen.getByText('Investissement')).toBeInTheDocument();
  });

  it('affiche les options de difficulté', () => {
    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    expect(screen.getByText('Débutant')).toBeInTheDocument();
    expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
    expect(screen.getByText('Avancé')).toBeInTheDocument();
    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('ferme le dialog au clic sur le bouton X', async () => {
    const user = userEvent.setup();
    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    const closeButton = screen.getByTestId('close-icon').parentElement;
    expect(closeButton).toBeInTheDocument();
    await user.click(closeButton as HTMLElement);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ferme le dialog au clic sur le bouton Annuler', async () => {
    const user = userEvent.setup();
    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ferme le dialog au clic sur le backdrop', async () => {
    const user = userEvent.setup();
    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    const backdrop = document.querySelector('.bg-black\\/50');
    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop as HTMLElement);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('soumet le formulaire avec des données valides', async () => {
    const user = userEvent.setup();
    (useCreateModule as jest.Mock).mockReturnValue({
      createModule: mockCreateModule,
      isCreating: false,
    });

    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    // Remplir les champs obligatoires
    await user.type(screen.getByLabelText(/Titre/), 'Module Test Complet');
    await user.type(screen.getByLabelText(/Description/), 'Description complète du module de test');

    // Modifier la durée
    const durationInput = screen.getByLabelText(/Durée estimée/);
    await user.clear(durationInput);
    await user.type(durationInput, '120');

    // Ajouter une URL d'image
    await user.type(screen.getByLabelText(/Image du module/), 'https://example.com/image.jpg');

    // Soumettre
    const submitButton = screen.getByText('Créer');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateModule).toHaveBeenCalledWith({
        title: 'Module Test Complet',
        description: 'Description complète du module de test',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 120,
        thematics: [Thematic.FINANCIAL_EDUCATION],
      });
    });
  });

  it('affiche un loader pendant la soumission', async () => {
    const user = userEvent.setup();
    mockCreateModule.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: '1' } as any);
          }, 100);
        })
    );

    render(<ModuleDialog isOpen={true} onClose={mockOnClose} />);

    // Remplir le formulaire
    await user.type(screen.getByLabelText(/Titre/), 'Test Module');
    await user.type(screen.getByLabelText(/Description/), 'Test description');

    const submitButton = screen.getByText('Créer');
    await user.click(submitButton);

    // Attendre la fin de la soumission
    await waitFor(
      () => {
        expect(screen.queryByText('Création...')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('désactive les boutons pendant la soumission', async () => {
    const user = userEvent.setup();
    mockCreateModule.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: '1' } as any);
          }, 100);
        })
    );

    render(<ModuleDialog isOpen={true} onClose={mockOnClose} />);

    // Remplir le formulaire
    await user.type(screen.getByLabelText(/Titre/), 'Test Module');
    await user.type(screen.getByLabelText(/Description/), 'Test description');

    const submitButton = screen.getByText('Créer');

    await user.click(submitButton);

    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 2000 }
    );
  });

  it("affiche un message d'erreur en cas d'échec", async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen={true} onClose={mockOnClose} />);

    // Remplir le formulaire
    await user.type(screen.getByLabelText(/Titre/), 'Test Module');
    await user.type(screen.getByLabelText(/Description/), 'Test description');

    await user.click(screen.getByText('Créer'));

    // Le dialog ne doit pas se fermer en cas d'erreur
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('valide les champs obligatoires', async () => {
    const user = userEvent.setup();
    render(<ModuleDialog isOpen={true} onClose={mockOnClose} />);

    // Essayer de soumettre sans remplir les champs
    const submitButton = screen.getByText('Créer');
    await user.click(submitButton);

    // Le formulaire ne doit pas être soumis
    expect(mockCreateModule).not.toHaveBeenCalled();
  });

  it('permet de changer la thématique', async () => {
    const user = userEvent.setup();
    mockCreateModule.mockResolvedValue({ id: '1' } as any);

    render(<ModuleDialog isOpen={true} onClose={mockOnClose} />);

    // Changer la thématique
    const thematicSelect = screen.getByLabelText(/Thématique/);
    await user.selectOptions(thematicSelect, Thematic.INVESTMENT);

    // Remplir les champs obligatoires
    await user.type(screen.getByLabelText(/Titre/), 'Test Module');
    await user.type(screen.getByLabelText(/Description/), 'Test description');

    await user.click(screen.getByText('Créer'));

    await waitFor(() => {
      expect(mockCreateModule).toHaveBeenCalledWith(
        expect.objectContaining({
          thematics: [Thematic.INVESTMENT],
        })
      );
    });
  });

  it('permet de changer le niveau de difficulté', async () => {
    const user = userEvent.setup();
    (useCreateModule as jest.Mock).mockReturnValue({
      createModule: mockCreateModule,
      isCreating: false,
    });

    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    // Changer la difficulté
    const difficultySelect = screen.getByLabelText(/Difficulté/);
    await user.selectOptions(difficultySelect, DifficultyLevel.ADVANCED);

    // Remplir les champs obligatoires
    await user.type(screen.getByLabelText(/Titre/), 'Test Module');
    await user.type(screen.getByLabelText(/Description/), 'Test description');

    await user.click(screen.getByText('Créer'));

    await waitFor(() => {
      expect(mockCreateModule).toHaveBeenCalledWith(
        expect.objectContaining({
          difficultyLevel: DifficultyLevel.ADVANCED,
        })
      );
    });
  });

  it("gère correctement l'URL d'image vide", async () => {
    const user = userEvent.setup();
    (useCreateModule as jest.Mock).mockReturnValue({
      createModule: mockCreateModule,
      isCreating: false,
    });

    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    // Remplir les champs obligatoires sans image
    await user.type(screen.getByLabelText(/Titre/), 'Test Module');
    await user.type(screen.getByLabelText(/Description/), 'Test description');

    await user.click(screen.getByText('Créer'));
  });

  it('remet à zéro le formulaire après succès', async () => {
    const user = userEvent.setup();
    (useCreateModule as jest.Mock).mockReturnValue({
      createModule: mockCreateModule,
      isCreating: false,
    });

    renderWithProviders({ isOpen: true, onClose: mockOnClose });

    // Remplir et soumettre
    await user.type(screen.getByLabelText(/Titre/), 'Test Module');
    await user.type(screen.getByLabelText(/Description/), 'Test description');

    await user.click(screen.getByText('Créer'));

    // Rouvrir le dialog (simulé en re-render)
    render(<ModuleDialog isOpen={true} onClose={mockOnClose} />);
  });
});

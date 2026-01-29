// __tests__/components/admin/modules/module-dialog.test.tsx
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModuleDialog from '@/components/admin/modules/module-dialog';
import { useCreateModule } from '@/hooks/module/useCreateModule';
import { DifficultyLevel } from '@/types/modules/module';

// Mock du hook de création de module
jest.mock('@/hooks/module/useCreateModule', () => ({
  useCreateModule: jest.fn(),
}));

// Mock des icônes Lucide pour simplifier le rendu
jest.mock('lucide-react', () => ({
  X: (props: any) => <button data-testid='close-icon' {...props} />,
  Upload: (props: any) => <span data-testid='upload-icon' {...props} />,
}));

// Mock des labels de difficulté
jest.mock('@/lib/constants/module-constants', () => ({
  DIFFICULTY_LABELS: {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
    EXPERT: 'Expert',
  },
}));

const mockedUseCreateModule = useCreateModule as jest.Mock;

describe('ModuleDialog', () => {
  const mockOnClose = jest.fn();
  const mockCreateModule = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseCreateModule.mockImplementation(({ onSuccess }: { onSuccess?: () => void }) => ({
      createModule: (payload: any) => {
        mockCreateModule(payload);
        if (onSuccess) onSuccess();
      },
      isCreating: false,
    }));
  });

  it('ne rend rien quand isOpen est false', () => {
    const { container } = render(<ModuleDialog isOpen={false} onClose={mockOnClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('affiche le dialog et les principaux textes quand isOpen est true', () => {
    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    expect(screen.getByText('Nouveau module')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Créez un nouveau module de apprentissage. Vous pourrez ensuite ajouter des leçons et des quiz.'
      )
    ).toBeInTheDocument();
  });

  it('affiche les champs principaux du formulaire et les valeurs par défaut', () => {
    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    expect(screen.getByLabelText(/Titre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Durée estimée/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Thématiques/)).toBeInTheDocument();
    expect(screen.getByText('Image du module')).toBeInTheDocument();

    const durationInput = screen.getByLabelText(/Durée estimée/) as HTMLInputElement;
    expect(durationInput.value).toBe('0');

    const difficultySelect = screen.getByLabelText(/Difficulté/) as HTMLSelectElement;
    expect(difficultySelect.value).toBe(DifficultyLevel.BEGINNER);
  });

  it('soumet le formulaire valide et appelle useCreateModule.createModule avec le bon payload', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/Titre/), 'Module Test Complet');
    await user.type(screen.getByLabelText(/Description/), 'Description complète du module de test');
    await user.type(screen.getByLabelText(/Thématiques/), 'Finance de base');

    const durationInput = screen.getByLabelText(/Durée estimée/);
    await user.clear(durationInput);
    await user.type(durationInput, '90');

    await user.click(screen.getByText('Créer le module'));

    await waitFor(() => {
      expect(mockCreateModule).toHaveBeenCalledWith({
        title: 'Module Test Complet',
        description: 'Description complète du module de test',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 90,
        thematics: 'Finance de base',
        imageUrl: null,
      });
    });

    // onClose est appelé via onSuccess dans le hook
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('ne soumet pas si les champs obligatoires sont vides', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    await user.click(screen.getByText('Créer le module'));

    expect(mockCreateModule).not.toHaveBeenCalled();
  });

  it('ferme le dialog au clic sur le bouton Annuler', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    await user.click(screen.getByText('Annuler'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('ferme le dialog au clic sur le bouton de fermeture (X)', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Fermer');
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('ferme le dialog au clic sur le backdrop', async () => {
    const user = userEvent.setup();

    const { container } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const backdrop = container.querySelector('.bg-black/50') as HTMLElement;
    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('ne permet pas la fermeture quand isCreating est true', async () => {
    const user = userEvent.setup();

    mockedUseCreateModule.mockReturnValue({
      createModule: mockCreateModule,
      isCreating: true,
    });

    const { container } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Fermer');
    await user.click(closeButton);

    const backdrop = container.querySelector('.bg-black/50') as HTMLElement;
    await user.click(backdrop);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('ferme le dialog en appuyant sur Echap quand isCreating est false', () => {
    const { container } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const wrapper = container.firstChild as HTMLElement;
    fireEvent.keyDown(wrapper, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('met à jour le nom de fichier affiché après sélection dune image', async () => {
    const user = userEvent.setup();

    const { container } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['(test)'], 'image-test.png', { type: 'image/png' });

    await user.upload(fileInput, file);

    expect(screen.getByText('image-test.png')).toBeInTheDocument();
  });

  it('affiche tous les niveaux de difficulté dans le select', () => {
    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    expect(screen.getByRole('option', { name: 'Débutant' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Intermédiaire' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Avancé' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Expert' })).toBeInTheDocument();
  });

  it('permet de changer le niveau de difficulté', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const difficultySelect = screen.getByLabelText(/Difficulté/) as HTMLSelectElement;

    await user.selectOptions(difficultySelect, DifficultyLevel.ADVANCED);

    expect(difficultySelect.value).toBe(DifficultyLevel.ADVANCED);
  });

  it('affiche les messages derreur pour le titre manquant', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    // Remplir uniquement la description pour déclencher l'erreur sur le titre
    await user.type(screen.getByLabelText(/Description/), 'Description test');
    await user.click(screen.getByText('Créer le module'));

    await waitFor(() => {
      expect(screen.getByText(/Le titre est requis/i)).toBeInTheDocument();
    });
  });

  it('affiche les messages derreur pour la description manquante', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    // Remplir uniquement le titre pour déclencher l'erreur sur la description
    await user.type(screen.getByLabelText(/Titre/), 'Titre test');
    await user.click(screen.getByText('Créer le module'));

    await waitFor(() => {
      expect(screen.getByText(/La description est requise/i)).toBeInTheDocument();
    });
  });

  it('réinitialise le formulaire après une soumission réussie', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    // Remplir le formulaire
    await user.type(screen.getByLabelText(/Titre/), 'Module Test');
    await user.type(screen.getByLabelText(/Description/), 'Description test');

    // Soumettre
    await user.click(screen.getByText('Créer le module'));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });

    // Réouvrir le dialog
    mockOnClose.mockClear();
    rerender(<ModuleDialog isOpen onClose={mockOnClose} />);

    // Vérifier que les champs sont vides
    const titleInput = screen.getByLabelText(/Titre/) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Description/) as HTMLTextAreaElement;

    expect(titleInput.value).toBe('');
    expect(descInput.value).toBe('');
  });

  it('réinitialise le formulaire et limage quand le dialog est fermé puis réouvert', async () => {
    const user = userEvent.setup();

    const { container, rerender } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    // Remplir le formulaire et ajouter une image
    await user.type(screen.getByLabelText(/Titre/), 'Module Test');

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['(test)'], 'test-image.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    expect(screen.getByText('test-image.png')).toBeInTheDocument();

    // Fermer le dialog
    rerender(<ModuleDialog isOpen={false} onClose={mockOnClose} />);

    // Réouvrir le dialog
    rerender(<ModuleDialog isOpen onClose={mockOnClose} />);

    // Vérifier que le formulaire est vide et que l'image est réinitialisée
    const titleInput = screen.getByLabelText(/Titre/) as HTMLInputElement;
    expect(titleInput.value).toBe('');
    expect(screen.getByText('Cliquez pour télécharger une image')).toBeInTheDocument();
    expect(screen.queryByText('test-image.png')).not.toBeInTheDocument();
  });

  it('affiche le texte daide pour limage', () => {
    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    expect(screen.getByText('JPG, PNG, GIF (max 5MB)')).toBeInTheDocument();
  });

  it('affiche les placeholders corrects', () => {
    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    expect(
      screen.getByPlaceholderText('Ex: Introduction à la finance personnelle')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description détaillée du module')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Finance de base')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
  });

  it('désactive tous les champs et boutons quand isCreating est true', () => {
    mockedUseCreateModule.mockReturnValue({
      createModule: mockCreateModule,
      isCreating: true,
    });

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    expect(screen.getByLabelText(/Titre/)).toBeDisabled();
    expect(screen.getByLabelText(/Description/)).toBeDisabled();
    expect(screen.getByLabelText(/Thématiques/)).toBeDisabled();
    expect(screen.getByLabelText(/Difficulté/)).toBeDisabled();
    expect(screen.getByLabelText(/Durée estimée/)).toBeDisabled();
    expect(screen.getByText('Annuler')).toBeDisabled();
    expect(screen.getByText('Création...')).toBeInTheDocument();
  });

  it('affiche "Création..." sur le bouton de soumission quand isCreating est true', () => {
    mockedUseCreateModule.mockReturnValue({
      createModule: mockCreateModule,
      isCreating: true,
    });

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    expect(screen.getByText('Création...')).toBeInTheDocument();
    expect(screen.queryByText('Créer le module')).not.toBeInTheDocument();
  });

  it('ne ferme pas avec Echap quand isCreating est true', () => {
    mockedUseCreateModule.mockReturnValue({
      createModule: mockCreateModule,
      isCreating: true,
    });

    const { container } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const wrapper = container.firstChild as HTMLElement;
    fireEvent.keyDown(wrapper, { key: 'Escape' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('accepte une durée estimée de 0', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/Titre/), 'Module Test');
    await user.type(screen.getByLabelText(/Description/), 'Description test');

    // La durée reste à 0 par défaut
    await user.click(screen.getByText('Créer le module'));

    await waitFor(() => {
      expect(mockCreateModule).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedDuration: 0,
        })
      );
    });
  });

  it('gère correctement la soumission avec tous les champs remplis', async () => {
    const user = userEvent.setup();

    render(<ModuleDialog isOpen onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/Titre/), 'Module Complet');
    await user.type(screen.getByLabelText(/Description/), 'Description complète');
    await user.type(screen.getByLabelText(/Thématiques/), 'Épargne et investissement');

    const difficultySelect = screen.getByLabelText(/Difficulté/);
    await user.selectOptions(difficultySelect, DifficultyLevel.INTERMEDIATE);

    const durationInput = screen.getByLabelText(/Durée estimée/);
    await user.clear(durationInput);
    await user.type(durationInput, '120');

    await user.click(screen.getByText('Créer le module'));

    await waitFor(() => {
      expect(mockCreateModule).toHaveBeenCalledWith({
        title: 'Module Complet',
        description: 'Description complète',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 120,
        thematics: 'Épargne et investissement',
        imageUrl: null,
      });
    });
  });

  it('gère le cas où handlePickFile reçoit undefined', () => {
    const { container } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    // Simuler un changement sans fichier (comme quand l'utilisateur annule la sélection)
    fireEvent.change(fileInput, { target: { files: [] } });

    // Vérifier que l'interface n'a pas changé
    expect(screen.getByText('Cliquez pour télécharger une image')).toBeInTheDocument();
  });

  it('affiche le backdrop avec les bonnes classes CSS', () => {
    const { container } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const backdrop = container.querySelector('.bg-black\\/50');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass('absolute', 'inset-0', 'bg-black/50', 'cursor-default');
  });

  it('affiche le modal avec les bonnes classes de style', () => {
    const { container } = render(<ModuleDialog isOpen onClose={mockOnClose} />);

    const modal = container.querySelector('.bg-white');
    expect(modal).toHaveClass('relative', 'w-full', 'max-w-lg', 'bg-white', 'h-auto');
  });
});

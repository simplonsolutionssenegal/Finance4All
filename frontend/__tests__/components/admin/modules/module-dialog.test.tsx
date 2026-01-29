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
});

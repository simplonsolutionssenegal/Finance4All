/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModuleEditDialog from '@/components/admin/modules/module-edit-dialog';
import { useMediaUrl } from '@/hooks/module/media/useMedia';
import { useUpdateModule } from '@/hooks/module/useUpdateModule';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import type { Module } from '@/types/modules/module';

jest.mock('@/hooks/module/useUpdateModule', () => ({
  useUpdateModule: jest.fn(),
}));

jest.mock('@/hooks/module/media/useMedia', () => ({
  useMediaUrl: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  X: (props: any) => <svg data-testid='icon-x' {...props} />,
  Trash2: (props: any) => <svg data-testid='icon-trash2' {...props} />,
  ChevronDown: (props: any) => <svg data-testid='icon-chevron-down' {...props} />,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock('@/lib/constants/module-constants', () => ({
  DIFFICULTY_LABELS: {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
    EXPERT: 'Expert',
  },
}));

const mockedUseUpdateModule = useUpdateModule as unknown as jest.Mock;
const mockedUseMediaUrl = useMediaUrl as unknown as jest.Mock;

describe('ModuleEditDialog', () => {
  const mockModule: Module = {
    id: 'module-123',
    title: 'Module Initial',
    description: 'Description initiale du module',
    thematics: 'Finance',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 30,
    status: ModuleStatus.DRAFT,
    imageMediaId: 'media-456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lessons: [],
    quizzes: [],
  };

  const onOpenChange = jest.fn();
  const onUpdated = jest.fn();
  const updateModuleSpy = jest.fn();

  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api/v1';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();

    mockedUseUpdateModule.mockImplementation(({ onSuccess }: { onSuccess?: () => void }) => ({
      isUpdating: false,
      updateModule: (payload: any) => {
        updateModuleSpy(payload);
        onSuccess?.();
      },
    }));

    mockedUseMediaUrl.mockReturnValue({
      url: 'http://example.com/image.jpg',
      loading: false,
    });
  });

  it('ne rend rien quand open=false', () => {
    const { container } = render(
      <ModuleEditDialog open={false} onOpenChange={onOpenChange} module={mockModule} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('rend le dialog quand open=true', () => {
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);
    expect(screen.getByText('Modifier le module')).toBeInTheDocument();
    expect(screen.getByText(/Modifiez les informations du module/i)).toBeInTheDocument();
  });

  it('affiche les valeurs initiales du module dans les champs', () => {
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    expect(screen.getByLabelText(/Titre/i)).toHaveValue('Module Initial');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Description initiale du module');
    expect(screen.getByLabelText(/Catégorie/i)).toHaveValue('Finance');
    expect(screen.getByLabelText(/Difficulté/i)).toHaveValue(DifficultyLevel.BEGINNER);
    expect(screen.getByLabelText(/Durée/i)).toHaveValue(30);
  });

  it("affiche l'image existante du module", () => {
    mockedUseMediaUrl.mockReturnValue({
      url: 'http://example.com/existing.jpg',
      loading: false,
    });

    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    const image = screen.getByAltText('Module Initial');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'http://example.com/existing.jpg');
  });

  it("reset les valeurs du formulaire quand le dialog s'ouvre", () => {
    const { rerender } = render(
      <ModuleEditDialog open={false} onOpenChange={onOpenChange} module={mockModule} />
    );

    rerender(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    expect(screen.getByLabelText(/Titre/i)).toHaveValue('Module Initial');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Description initiale du module');
  });

  it('ferme le dialog via le bouton Annuler', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('ferme le dialog via le bouton X', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.click(screen.getByRole('button', { name: /Fermer/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('ferme le dialog via le backdrop', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    const backdrop = screen
      .getByRole('button', { name: /Fermer/i })
      .parentElement?.querySelector('button.bg-black\\/40');
    if (backdrop) {
      await user.click(backdrop);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('ne ferme pas le dialog quand isUpdating=true', async () => {
    const user = userEvent.setup();
    mockedUseUpdateModule.mockReturnValue({
      isUpdating: true,
      updateModule: jest.fn(),
    });

    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Fermer/i }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('désactive les champs et affiche "Mise à jour..." quand isUpdating=true', () => {
    mockedUseUpdateModule.mockReturnValue({
      isUpdating: true,
      updateModule: jest.fn(),
    });

    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    expect(screen.getByLabelText(/Titre/i)).toBeDisabled();
    expect(screen.getByLabelText(/Description/i)).toBeDisabled();
    expect(screen.getByLabelText(/Catégorie/i)).toBeDisabled();
    expect(screen.getByLabelText(/Difficulté/i)).toBeDisabled();
    expect(screen.getByLabelText(/Durée/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Annuler/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Fermer/i })).toBeDisabled();

    expect(screen.getByText('Mise à jour...')).toBeInTheDocument();
  });

  it('soumet les modifications avec succès', async () => {
    const user = userEvent.setup();
    render(
      <ModuleEditDialog
        open={true}
        onOpenChange={onOpenChange}
        module={mockModule}
        onUpdated={onUpdated}
      />
    );

    await user.clear(screen.getByLabelText(/Titre/i));
    await user.type(screen.getByLabelText(/Titre/i), 'Module Modifié');

    await user.clear(screen.getByLabelText(/Description/i));
    await user.type(screen.getByLabelText(/Description/i), 'Nouvelle description très longue');

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          title: 'Module Modifié',
          description: 'Nouvelle description très longue',
        }),
      });
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onUpdated).toHaveBeenCalled();
  });

  it('soumet avec modification de la catégorie', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.clear(screen.getByLabelText(/Catégorie/i));
    await user.type(screen.getByLabelText(/Catégorie/i), 'Épargne');

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          thematics: 'Épargne',
        }),
      });
    });
  });

  it('soumet avec modification du niveau de difficulté', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.selectOptions(screen.getByLabelText(/Difficulté/i), DifficultyLevel.ADVANCED);

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          difficultyLevel: DifficultyLevel.ADVANCED,
        }),
      });
    });
  });

  it('soumet avec modification de la durée', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    const durationInput = screen.getByLabelText(/Durée/i);
    await user.clear(durationInput);
    await user.type(durationInput, '45');

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          estimatedDuration: 45,
        }),
      });
    });
  });

  it("affiche le nom du fichier après sélection d'une nouvelle image", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />
    );

    const file = new File(['image content'], 'new-image.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    expect(input.files?.[0]).toBe(file);
    expect(input.files?.[0]?.name).toBe('new-image.png');
  });

  it('affiche un aperçu de la nouvelle image sélectionnée', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />
    );

    const file = new File(['image content'], 'preview.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    global.URL.createObjectURL = jest.fn(() => 'blob:preview-url');

    await user.upload(input, file);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      const previewImage = images.find(img => img.getAttribute('src')?.includes('blob:'));
      expect(previewImage).toBeInTheDocument();
    });
  });

  it("supprime l'image existante", async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    const deleteButton = screen.getByRole('button', { name: /Supprimer l'image/i });
    await user.click(deleteButton);

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          imageMediaId: null,
        }),
      });
    });
  });

  it('upload une nouvelle image et soumet', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />
    );

    const file = new File(['content'], 'new-upload.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'new-media-789' } }),
    });

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/media',
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          imageMediaId: 'new-media-789',
        }),
      });
    });
  });

  it("gère l'erreur d'upload d'image", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />
    );

    const file = new File(['content'], 'error-image.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Erreur d'upload" }),
    });

    await user.upload(input, file);

    await expect(async () => {
      await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));
    }).rejects.toThrow();
  });

  it("ne soumet pas d'imageMediaId si l'image n'est pas modifiée", async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.clear(screen.getByLabelText(/Titre/i));
    await user.type(screen.getByLabelText(/Titre/i), 'Nouveau titre');

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.not.objectContaining({
          imageMediaId: expect.anything(),
        }),
      });
    });
  });

  it("annule la suppression d'image en sélectionnant une nouvelle image", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />
    );

    // Supprime l'image
    const deleteButton = screen.getByRole('button', { name: /Supprimer l'image/i });
    await user.click(deleteButton);

    // Sélectionne une nouvelle image
    const file = new File(['content'], 'new-image.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'replaced-media-999' } }),
    });

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          imageMediaId: 'replaced-media-999',
        }),
      });
    });
  });

  it('gère un module sans image existante', () => {
    mockedUseMediaUrl.mockReturnValue({
      url: null,
      loading: false,
    });

    const moduleWithoutImage = { ...mockModule, imageMediaId: null };

    render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={moduleWithoutImage} />
    );

    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);
  });

  it('ne valide pas un titre trop court', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.clear(screen.getByLabelText(/Titre/i));
    await user.type(screen.getByLabelText(/Titre/i), 'AB');

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).not.toHaveBeenCalled();
    });
  });

  it('ne valide pas une description trop courte', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.clear(screen.getByLabelText(/Description/i));
    await user.type(screen.getByLabelText(/Description/i), 'Court');

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).not.toHaveBeenCalled();
    });
  });

  it('ne valide pas une durée inférieure à 5 minutes', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    const durationInput = screen.getByLabelText(/Durée/i);
    await user.clear(durationInput);
    await user.type(durationInput, '2');

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).not.toHaveBeenCalled();
    });
  });

  it("affiche les informations d'aide pour l'image", () => {
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    expect(screen.getByText('Formats acceptés: JPG, PNG, GIF (max 5MB)')).toBeInTheDocument();
  });

  it("reset l'état de l'image quand le dialog se rouvre", () => {
    const { rerender } = render(
      <ModuleEditDialog open={false} onOpenChange={onOpenChange} module={mockModule} />
    );

    rerender(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    const images = screen.queryAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it("libère l'URL de l'objet blob lors du démontage", () => {
    const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL');

    const { unmount } = render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />
    );

    unmount();

    // Le cleanup doit être appelé
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('soumet tous les champs modifiés ensemble', async () => {
    const user = userEvent.setup();
    render(<ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />);

    await user.clear(screen.getByLabelText(/Titre/i));
    await user.type(screen.getByLabelText(/Titre/i), 'Titre Complet Modifié');

    await user.clear(screen.getByLabelText(/Description/i));
    await user.type(
      screen.getByLabelText(/Description/i),
      'Description complète modifiée avec beaucoup de texte'
    );

    await user.clear(screen.getByLabelText(/Catégorie/i));
    await user.type(screen.getByLabelText(/Catégorie/i), 'Investissement');

    await user.selectOptions(screen.getByLabelText(/Difficulté/i), DifficultyLevel.EXPERT);

    const durationInput = screen.getByLabelText(/Durée/i);
    await user.clear(durationInput);
    await user.type(durationInput, '60');

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: {
          title: 'Titre Complet Modifié',
          description: 'Description complète modifiée avec beaucoup de texte',
          thematics: 'Investissement',
          difficultyLevel: DifficultyLevel.EXPERT,
          estimatedDuration: 60,
          status: ModuleStatus.DRAFT,
        },
      });
    });
  });
});

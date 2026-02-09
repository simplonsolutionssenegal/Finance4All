/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModuleEditDialog from '@/components/admin/modules/module-edit-dialog';
import { useDeleteMedia } from '@/hooks/media/useDeleteMedia';
import { useMediaUrl } from '@/hooks/module/media/useMedia';
import { useUpdateModule } from '@/hooks/module/useUpdateModule';
import type { Module } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

jest.mock('@/hooks/module/useUpdateModule', () => ({
  useUpdateModule: jest.fn(),
}));

jest.mock('@/hooks/media/useDeleteMedia', () => ({
  useDeleteMedia: jest.fn(),
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
const mockedUseDeleteMedia = useDeleteMedia as unknown as jest.Mock;
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

  const deleteMediaAsyncSpy = jest.fn();

  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api/v1';
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // fetch mock (upload image)
    (global as any).fetch = jest.fn();

    // delete media hook mock
    mockedUseDeleteMedia.mockReturnValue({
      deleteMediaAsync: deleteMediaAsyncSpy,
      isDeleting: false,
      deleteMedia: jest.fn(),
      isSuccess: false,
      isError: false,
      error: null,
    });

    // update module hook mock
    mockedUseUpdateModule.mockImplementation(
      ({ onSuccess }: { onSuccess?: () => void | Promise<void> }) => ({
        isUpdating: false,
        updateModule: async (payload: any) => {
          updateModuleSpy(payload);
          const ret = onSuccess?.();
          if (ret instanceof Promise) await ret;
        },
      })
    );

    // existing image url
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

  it("supprime l'image existante: update imageMediaId=null puis DELETE /media/:id", async () => {
    const user = userEvent.setup();
    deleteMediaAsyncSpy.mockResolvedValue({ success: true });

    render(
      <ModuleEditDialog
        open={true}
        onOpenChange={onOpenChange}
        module={mockModule}
        onUpdated={onUpdated}
      />
    );

    // clique sur le trash du preview (aria-label "Supprimer l’image")
    await user.click(screen.getByRole('button', { name: /Supprimer l’image/i }));

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          imageMediaId: null,
        }),
      });
    });

    await waitFor(() => {
      expect(deleteMediaAsyncSpy).toHaveBeenCalledWith({ mediaId: 'media-456' });
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onUpdated).toHaveBeenCalled();
  });

  it("remplace l'image: upload -> update imageMediaId=newId puis DELETE ancienne image", async () => {
    const user = userEvent.setup();
    deleteMediaAsyncSpy.mockResolvedValue({ success: true });

    const { container } = render(
      <ModuleEditDialog
        open={true}
        onOpenChange={onOpenChange}
        module={mockModule}
        onUpdated={onUpdated}
      />
    );

    const file = new File(['content'], 'new-upload.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    // upload success
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'new-media-789' } }),
    });

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/media',
        expect.objectContaining({ method: 'POST' })
      );
    });

    await waitFor(() => {
      expect(updateModuleSpy).toHaveBeenCalledWith({
        id: 'module-123',
        data: expect.objectContaining({
          imageMediaId: 'new-media-789',
        }),
      });
    });

    // suppression ancienne image après succès update
    await waitFor(() => {
      expect(deleteMediaAsyncSpy).toHaveBeenCalledWith({ mediaId: 'media-456' });
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

    await expect(
      user.click(screen.getByRole('button', { name: /Mettre à jour/i }))
    ).rejects.toThrow(/Upload image échoué|Erreur d'upload/i);
  });

  it('libère l’URL de preview (revokeObjectURL) quand un blob a été créé', async () => {
    const user = userEvent.setup();
    const revokeSpy = jest.spyOn(URL, 'revokeObjectURL');

    // createObjectURL doit renvoyer un blob
    global.URL.createObjectURL = jest.fn(() => 'blob:preview-url');

    const { container, unmount } = render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={mockModule} />
    );

    const file = new File(['content'], 'preview.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    unmount();

    expect(revokeSpy).toHaveBeenCalledWith('blob:preview-url');
  });

  it('gère un module sans image existante (pas de preview)', () => {
    mockedUseMediaUrl.mockReturnValue({ url: null, loading: false });

    const moduleWithoutImage = { ...mockModule, imageMediaId: null };

    render(
      <ModuleEditDialog open={true} onOpenChange={onOpenChange} module={moduleWithoutImage} />
    );

    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });
});

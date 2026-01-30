/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModuleDialog from '@/components/admin/modules/module-dialog';
import { useCreateModule } from '@/hooks/module/useCreateModule';
import { DifficultyLevel } from '@/types/modules/module';

jest.mock('@/hooks/module/useCreateModule', () => ({
  useCreateModule: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  X: (props: any) => <svg data-testid='icon-x' {...props} />,
  Upload: (props: any) => <svg data-testid='icon-upload' {...props} />,
}));

jest.mock('@/lib/constants/module-constants', () => ({
  DIFFICULTY_LABELS: {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
    EXPERT: 'Expert',
  },
}));

const mockedUseCreateModule = useCreateModule as unknown as jest.Mock;

describe('ModuleDialog', () => {
  const onClose = jest.fn();
  const createModuleSpy = jest.fn();

  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api/v1';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();

    mockedUseCreateModule.mockImplementation(({ onSuccess }: { onSuccess?: () => void }) => ({
      isCreating: false,
      createModule: (payload: any) => {
        createModuleSpy(payload);
        onSuccess?.();
      },
    }));
  });

  async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/Titre/i), 'Module Test');
    await user.type(screen.getByLabelText(/Description/i), 'Description suffisamment longue');
    await user.type(screen.getByLabelText(/Thématiques/i), 'Finance');
    const duration = screen.getByLabelText(/Durée estimée/i);
    await user.clear(duration);
    // IMPORTANT: ton zod impose min 5 (vu dans ton DOM: "La durée minimale est de 5 minutes")
    await user.type(duration, '10');
  }

  it('ne rend rien quand isOpen=false', () => {
    const { container } = render(<ModuleDialog isOpen={false} onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('rend le dialog quand isOpen=true', () => {
    render(<ModuleDialog isOpen onClose={onClose} />);
    expect(screen.getByText('Nouveau module')).toBeInTheDocument();
    expect(screen.getByText(/Créez un nouveau module/i)).toBeInTheDocument();
  });

  it('affiche les champs principaux et les valeurs par défaut', () => {
    render(<ModuleDialog isOpen onClose={onClose} />);

    expect(screen.getByLabelText(/Titre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Thématiques/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Difficulté/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Durée estimée/i)).toBeInTheDocument();
    expect(screen.getByText('JPG, PNG, GIF (max 5MB)')).toBeInTheDocument();

    const difficultySelect = screen.getByLabelText(/Difficulté/i) as HTMLSelectElement;
    expect(difficultySelect.value).toBe(DifficultyLevel.BEGINNER);
  });

  it('ferme via bouton Annuler', async () => {
    const user = userEvent.setup();
    render(<ModuleDialog isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ferme via bouton X', async () => {
    const user = userEvent.setup();
    render(<ModuleDialog isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /Fermer/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ferme via backdrop', async () => {
    const user = userEvent.setup();
    render(<ModuleDialog isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /Fermer le dialog/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ferme au clavier avec Escape quand isCreating=false', () => {
    const { container } = render(<ModuleDialog isOpen onClose={onClose} />);
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ne ferme pas quand isCreating=true (backdrop, X, Escape)', async () => {
    const user = userEvent.setup();

    mockedUseCreateModule.mockReturnValue({
      isCreating: true,
      createModule: jest.fn(),
    });

    const { container } = render(<ModuleDialog isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /Fermer/i }));
    await user.click(screen.getByRole('button', { name: /Fermer le dialog/i }));
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('désactive les champs et affiche "Création..." quand isCreating=true', () => {
    mockedUseCreateModule.mockReturnValue({
      isCreating: true,
      createModule: jest.fn(),
    });

    render(<ModuleDialog isOpen onClose={onClose} />);

    expect(screen.getByLabelText(/Titre/i)).toBeDisabled();
    expect(screen.getByLabelText(/Description/i)).toBeDisabled();
    expect(screen.getByLabelText(/Thématiques/i)).toBeDisabled();
    expect(screen.getByLabelText(/Difficulté/i)).toBeDisabled();
    expect(screen.getByLabelText(/Durée estimée/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Annuler/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Fermer le dialog/i })).toBeDisabled();

    expect(screen.getByText('Création...')).toBeInTheDocument();
  });

  it('ne soumet pas si formulaire invalide (ex: durée < 5)', async () => {
    const user = userEvent.setup();
    render(<ModuleDialog isOpen onClose={onClose} />);

    await user.type(screen.getByLabelText(/Titre/i), 'Module Test');
    await user.type(screen.getByLabelText(/Description/i), 'Description suffisamment longue');
    await user.type(screen.getByLabelText(/Thématiques/i), 'Finance');

    const duration = screen.getByLabelText(/Durée estimée/i);
    await user.clear(duration);
    await user.type(duration, '2'); // invalide selon ton schema

    await user.click(screen.getByRole('button', { name: /Créer le module/i }));

    await waitFor(() => {
      expect(createModuleSpy).not.toHaveBeenCalled();
      expect((global as any).fetch).not.toHaveBeenCalled();
    });
  });

  it('soumet sans image : createModule appelé avec imageMediaId=null', async () => {
    const user = userEvent.setup();
    render(<ModuleDialog isOpen onClose={onClose} />);

    await fillValidForm(user);

    await user.click(screen.getByRole('button', { name: /Créer le module/i }));

    await waitFor(() => {
      expect(createModuleSpy).toHaveBeenCalledWith({
        title: 'Module Test',
        description: 'Description suffisamment longue',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 10,
        thematics: 'Finance',
        imageMediaId: null,
      });
    });

    // onClose déclenché via onSuccess du hook mocké
    expect(onClose).toHaveBeenCalled();
  });

  it('affiche le nom du fichier après sélection', async () => {
    const user = userEvent.setup();
    const { container } = render(<ModuleDialog isOpen onClose={onClose} />);

    const input = container.querySelector('#moduleImage') as HTMLInputElement;
    const file = new File(['test'], 'image.png', { type: 'image/png' });

    await user.upload(input, file);

    expect(screen.getByText('image.png')).toBeInTheDocument();
  });

  it('upload image OK : appelle fetch puis createModule avec imageMediaId', async () => {
    const user = userEvent.setup();
    const { container } = render(<ModuleDialog isOpen onClose={onClose} />);

    // mock fetch success avec wrapper data
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'media-123' } }),
    });

    await fillValidForm(user);

    const input = container.querySelector('#moduleImage') as HTMLInputElement;
    const file = new File(['test'], 'module.png', { type: 'image/png' });
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /Créer le module/i }));

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/media',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    await waitFor(() => {
      expect(createModuleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          imageMediaId: 'media-123',
        })
      );
    });
  });

  it('upload image OK (sans data wrapper) : utilise json direct (id)', async () => {
    const user = userEvent.setup();
    const { container } = render(<ModuleDialog isOpen onClose={onClose} />);

    // mock fetch success sans data
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'media-direct-456' }),
    });

    await fillValidForm(user);

    const input = container.querySelector('#moduleImage') as HTMLInputElement;
    const file = new File(['test'], 'module.png', { type: 'image/png' });
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /Créer le module/i }));

    await waitFor(() => {
      expect(createModuleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          imageMediaId: 'media-direct-456',
        })
      );
    });
  });

  it('upload image KO (res.ok=false) : ne doit pas appeler createModule', async () => {
    const user = userEvent.setup();
    const { container } = render(<ModuleDialog isOpen onClose={onClose} />);

    // IMPORTANT: on évite que l’erreur fasse échouer le test via logs
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (global as any).fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Erreur upload' }),
    });

    await fillValidForm(user);

    const input = container.querySelector('#moduleImage') as HTMLInputElement;
    const file = new File(['test'], 'module.png', { type: 'image/png' });
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /Créer le module/i }));

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalled();
      expect(createModuleSpy).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('upload image KO (json parsing fail) : ne doit pas appeler createModule', async () => {
    const user = userEvent.setup();
    const { container } = render(<ModuleDialog isOpen onClose={onClose} />);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (global as any).fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await fillValidForm(user);

    const input = container.querySelector('#moduleImage') as HTMLInputElement;
    const file = new File(['test'], 'module.png', { type: 'image/png' });
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /Créer le module/i }));

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalled();
      expect(createModuleSpy).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('reset quand on ferme (isOpen passe à false) puis réouvre', async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<ModuleDialog isOpen onClose={onClose} />);

    await fillValidForm(user);

    const input = container.querySelector('#moduleImage') as HTMLInputElement;
    await user.upload(input, new File(['test'], 'reset.png', { type: 'image/png' }));
    expect(screen.getByText('reset.png')).toBeInTheDocument();

    // fermer
    rerender(<ModuleDialog isOpen={false} onClose={onClose} />);
    // réouvrir
    rerender(<ModuleDialog isOpen onClose={onClose} />);

    expect((screen.getByLabelText(/Titre/i) as HTMLInputElement).value).toBe('');
    expect(screen.queryByText('reset.png')).not.toBeInTheDocument();
    expect(screen.getByText('Cliquez pour télécharger une image')).toBeInTheDocument();
  });
});

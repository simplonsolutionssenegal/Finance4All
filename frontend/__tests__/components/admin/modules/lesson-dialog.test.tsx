// __tests__/components/admin/modules/lesson-dialog.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import LessonDialog from '@/components/admin/modules/lesson-dialog';
import { LessonStatus } from '@/types/modules/Lesson';

// Mocks
jest.mock('@/hooks/lesson/useCreateLesson', () => ({
  useCreateLesson: jest.fn(),
}));

jest.mock('@/hooks/media/useUploadMedia', () => ({
  useUploadMedia: jest.fn(),
}));

jest.mock('@/components/admin/modules/ResourcePickerDialog', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='resource-picker-dialog' data-open={props.open ? '1' : '0'}>
      <button type='button' onClick={() => props.onPick('VIDEO')}>
        pick-video
      </button>
      <button type='button' onClick={() => props.onPick('PAGE')}>
        pick-page
      </button>
      <button type='button' onClick={() => props.onPick('PDF')}>
        pick-pdf
      </button>
      <button type='button' onClick={() => props.onOpenChange(false)}>
        close-picker
      </button>
    </div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant, type }: any) => (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid='dialog'>{children}</div> : null),
  DialogContent: ({ children, className }: any) => (
    <div className={className} data-testid='dialog-content'>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
}));

jest.mock('@/components/ui/input', () => {
  const React = require('react') as typeof import('react');
  return {
    Input: React.forwardRef<HTMLInputElement, any>((props, ref) => <input ref={ref} {...props} />),
  };
});

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => <label className={className}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid='select' data-value={value}>
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => <div className={className}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children, onValueChange }: any) => (
    <div>
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, { onClick: () => onValueChange?.(child.props.value) })
      )}
    </div>
  ),
  SelectItem: ({ children, value, onClick }: any) => (
    <button type='button' onClick={onClick} data-value={value}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: any) => <div data-testid='accordion'>{children}</div>,
  AccordionItem: ({ children, value }: any) => (
    <div data-testid='accordion-item' data-value={value}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children }: any) => <div>{children}</div>,
  AccordionContent: ({ children }: any) => <div>{children}</div>,
}));

describe('LessonDialog (global)', () => {
  const mockCreateLesson = jest.fn();
  const mockOnOpenChange = jest.fn();
  const mockOnCreated = jest.fn();
  const mockUploadMedia = jest.fn();

  const { useCreateLesson } = require('@/hooks/lesson/useCreateLesson');
  const { useUploadMedia } = require('@/hooks/media/useUploadMedia');

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    moduleId: 'module-123',
    nextOrder: 1,
    onCreated: mockOnCreated,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // randomUUID (si besoin)
    // @ts-expect-error
    if (!global.crypto) global.crypto = {};
    // @ts-expect-error
    if (!global.crypto.randomUUID) global.crypto.randomUUID = () => 'uuid-1';

    useCreateLesson.mockReturnValue({
      createLesson: mockCreateLesson,
      isCreating: false,
    });

    useUploadMedia.mockReturnValue({
      mutateAsync: mockUploadMedia,
      isPending: false,
    });
  });

  describe('Rendu', () => {
    it('affiche le dialog quand open=true', () => {
      render(<LessonDialog {...defaultProps} />);
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Nouvelle leçon')).toBeInTheDocument();
    });

    it('ne rend rien quand open=false', () => {
      render(<LessonDialog {...defaultProps} open={false} />);
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('statut initial DRAFT et 0 chapitre', () => {
      render(<LessonDialog {...defaultProps} />);
      expect(screen.getByTestId('select')).toHaveAttribute('data-value', LessonStatus.DRAFT);
      expect(screen.getByText(/0 chapitre\(s\)/i)).toBeInTheDocument();
    });
  });

  describe('Champs', () => {
    it('met à jour titre + description', () => {
      render(<LessonDialog {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
        target: { value: 'Nouvelle leçon' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
        {
          target: { value: 'Desc' },
        }
      );

      expect(screen.getByPlaceholderText('Ex: Introduction au budget familial')).toHaveValue(
        'Nouvelle leçon'
      );
      expect(
        screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...')
      ).toHaveValue('Desc');
    });

    it('met à jour la durée (number)', () => {
      render(<LessonDialog {...defaultProps} />);
      const durationInput = screen.getByPlaceholderText('Ex: 15');

      fireEvent.change(durationInput, { target: { value: '30' } });

      // ✅ la valeur devient un number dans ton composant
      expect(durationInput).toHaveValue(30);
      expect(screen.getByText('Durée totale : 30 min')).toBeInTheDocument();
    });
    it('initialise les chapitres: noMedia=true si mediaId absent', () => {
      render(
        <LessonDialog
          {...defaultProps}
          chapters={[
            { id: 'c1', title: 'T1', description: 'D1', mediaId: 'media-ok' } as any,
            { id: 'c2', title: 'T2', description: 'D2', mediaId: '' } as any,
          ]}
        />
      );

      // 2 chapitres => 2 checkbox "Aucun média"
      const checks = screen.getAllByRole('checkbox');
      expect(checks).toHaveLength(2);

      // Chapitre 1: mediaId présent => noMedia false
      expect(checks[0]).not.toBeChecked();

      // Chapitre 2: mediaId vide => noMedia true
      expect(checks[1]).toBeChecked();
    });
    it('pick-pdf: met accept=application/pdf et déclenche click() sur input file', () => {
      jest.useFakeTimers();

      const clickSpy = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

      render(<LessonDialog {...defaultProps} />);

      // ajouter chapitre
      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));

      // ouvrir picker puis choisir PDF (déclenche setAccept + setTimeout(click))
      fireEvent.click(screen.getByText('Ajouter une ressource'));
      fireEvent.click(screen.getByText('pick-pdf'));

      // exécuter le setTimeout
      jest.runOnlyPendingTimers();

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeTruthy();

      // ✅ accept doit être mis à jour
      expect(fileInput).toHaveAttribute('accept', 'application/pdf');

      // ✅ click appelé (grâce au forwardRef)
      expect(clickSpy).toHaveBeenCalled();

      clickSpy.mockRestore();
      jest.useRealTimers();
    });
    it('genId fallback: fonctionne si crypto.randomUUID est absent', () => {
      const previousCrypto = (global as any).crypto;

      try {
        // force l’absence de randomUUID
        (global as any).crypto = {};

        render(<LessonDialog {...defaultProps} />);

        // doit ajouter un chapitre sans crash (utilise le fallback Date.now + Math.random)
        fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
        expect(screen.getByText('Chapitre 1')).toBeInTheDocument();
      } finally {
        (global as any).crypto = previousCrypto;
      }
    });

    it('change le statut (DRAFT -> PUBLISHED)', () => {
      render(<LessonDialog {...defaultProps} />);

      expect(screen.getByTestId('select')).toHaveAttribute('data-value', LessonStatus.DRAFT);

      fireEvent.click(screen.getByText('Publié').closest('button')!);

      expect(screen.getByTestId('select')).toHaveAttribute('data-value', LessonStatus.PUBLISHED);
      expect(screen.getByText('Pour publier, ajoute au moins 1 chapitre.')).toBeInTheDocument();
    });
  });

  describe('Chapitres', () => {
    it('affiche l’état vide + ajoute le premier chapitre', () => {
      render(<LessonDialog {...defaultProps} />);

      expect(screen.getByText(/Organisez votre leçon en chapitres/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
      expect(screen.getByText('Chapitre 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Titre de chapitre')).toBeInTheDocument();
    });

    it('empêche d’ajouter un nouveau chapitre si un chapitre est invalide', () => {
      render(<LessonDialog {...defaultProps} />);

      // Ajouter premier chapitre (il est invalide)
      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));

      // Le bouton "Ajouter un chapitre" est désactivé quand canAddNewChapter=false
      const addBtn = screen.getByRole('button', { name: /Ajouter un chapitre/i });

      // ✅ on vérifie que c’est bien désactivé (comportement attendu)
      expect(addBtn).toBeDisabled();

      // ✅ et on vérifie le message global d’invalidité chapitres (toujours affiché si invalid)
      expect(
        screen.getByText(/Chaque chapitre doit avoir un titre \+ description/i)
      ).toBeInTheDocument();
    });

    it('ajoute un 2ème chapitre si le 1er est valide (noMedia)', () => {
      render(<LessonDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));

      fireEvent.change(screen.getByPlaceholderText('Titre de chapitre'), {
        target: { value: 'Chap 1' },
      });
      fireEvent.change(screen.getByPlaceholderText('Description de chapitre ...'), {
        target: { value: 'Desc 1' },
      });

      fireEvent.click(screen.getByRole('checkbox')); // Aucun média

      fireEvent.click(screen.getByText('Ajouter un chapitre'));

      expect(screen.getByText('Chapitre 2')).toBeInTheDocument();
    });

    it('supprime un chapitre', () => {
      render(<LessonDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
      expect(screen.getByText('Chapitre 1')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Supprimer le chapitre'));
      expect(screen.queryByText('Chapitre 1')).not.toBeInTheDocument();
    });
  });

  describe('Ressources', () => {
    it('ouvre le ResourcePickerDialog', () => {
      render(<LessonDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));

      const picker = screen.getByTestId('resource-picker-dialog');
      expect(picker).toHaveAttribute('data-open', '0');

      fireEvent.click(screen.getByText('Ajouter une ressource'));
      expect(picker).toHaveAttribute('data-open', '1');
    });

    it('PAGE => chapitre sans média', () => {
      render(<LessonDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
      fireEvent.click(screen.getByText('Ajouter une ressource'));
      fireEvent.click(screen.getByText('pick-page'));

      expect(screen.getByText('Ce chapitre sera créé sans média.')).toBeInTheDocument();
    });

    it('upload VIDEO => appelle mutateAsync + affiche mediaId', async () => {
      mockUploadMedia.mockResolvedValueOnce({ id: 'media-123', originalName: 'test-video.mp4' });

      render(<LessonDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
      fireEvent.click(screen.getByText('Ajouter une ressource'));
      fireEvent.click(screen.getByText('pick-video'));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeTruthy();

      const file = new File(['video'], 'test-video.mp4', { type: 'video/mp4' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => expect(mockUploadMedia).toHaveBeenCalledTimes(1));

      const callArg = mockUploadMedia.mock.calls[0][0];
      expect(callArg).toEqual(
        expect.objectContaining({
          file,
          metadata: expect.objectContaining({
            moduleId: 'module-123',
            chapterTempId: expect.any(String),
          }),
        })
      );

      await waitFor(() => {
        expect(screen.getByText(/media-123/i)).toBeInTheDocument();
        expect(screen.getByText(/fichier : test-video\.mp4/i)).toBeInTheDocument();
      });
    });

    it('upload erreur => affiche le message', async () => {
      mockUploadMedia.mockRejectedValueOnce(new Error('Upload failed'));

      render(<LessonDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
      fireEvent.click(screen.getByText('Ajouter une ressource'));
      fireEvent.click(screen.getByText('pick-video'));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['x'], 'bad.mp4', { type: 'video/mp4' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
      });
    });

    it('retire la ressource', async () => {
      mockUploadMedia.mockResolvedValueOnce({ id: 'media-999', originalName: 'support.pdf' });

      render(<LessonDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
      fireEvent.click(screen.getByText('Ajouter une ressource'));
      fireEvent.click(screen.getByText('pick-pdf'));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['pdf'], 'support.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/media-999/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retirer la ressource'));

      expect(screen.getByText(/\(pas encore\)/i)).toBeInTheDocument();
    });
  });

  describe('Validation & Submit', () => {
    it('désactive le bouton créer si champs requis vides', () => {
      render(<LessonDialog {...defaultProps} />);
      expect(screen.getByText('Créer la leçon').closest('button')).toBeDisabled();
    });

    it('soumet createLesson avec un chapitre noMedia', () => {
      render(<LessonDialog {...defaultProps} />);

      // Remplir leçon
      fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
        target: { value: 'Test leçon' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
        {
          target: { value: 'Description test' },
        }
      );
      fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '45' } });

      // Chapitre
      fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
      fireEvent.change(screen.getByPlaceholderText('Titre de chapitre'), {
        target: { value: 'Chapitre 1' },
      });
      fireEvent.change(screen.getByPlaceholderText('Description de chapitre ...'), {
        target: { value: 'Description chapitre' },
      });
      fireEvent.click(screen.getByRole('checkbox')); // noMedia

      fireEvent.click(screen.getByText('Créer la leçon'));

      expect(mockCreateLesson).toHaveBeenCalledWith({
        moduleId: 'module-123',
        payload: {
          title: 'Test leçon',
          description: 'Description test',
          duration: 45,
          order: 1,
          status: LessonStatus.DRAFT,
          chapters: [
            {
              title: 'Chapitre 1',
              description: 'Description chapitre',
              order: 0,
            },
          ],
        },
      });
    });
  });

  describe('Dialog / reset / cancel', () => {
    it('reset les champs à la réouverture', () => {
      const { rerender } = render(<LessonDialog {...defaultProps} open={false} />);

      rerender(<LessonDialog {...defaultProps} open={true} />);
      fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
        target: { value: 'AAAA' },
      });

      rerender(<LessonDialog {...defaultProps} open={false} />);
      rerender(<LessonDialog {...defaultProps} open={true} />);

      expect(screen.getByPlaceholderText('Ex: Introduction au budget familial')).toHaveValue('');
    });

    it('Annuler => onOpenChange(false)', () => {
      render(<LessonDialog {...defaultProps} />);
      fireEvent.click(screen.getByText('Annuler'));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

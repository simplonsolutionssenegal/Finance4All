// frontend/__tests__/components/admin/modules/lesson-dialog.test.tsx

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import LessonDialog from '@/components/admin/modules/lesson-dialog';
import { useCreateLesson } from '@/hooks/lesson/useCreateLesson';
import { LessonStatus } from '@/types/modules/Lesson';

// --- Mocks ---
jest.mock('@/hooks/lesson/useCreateLesson', () => ({
  useCreateLesson: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, type, variant }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      type={type}
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

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => <label className={className}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid='select' data-value={value}>
      {React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => <div className={className}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children, value, onValueChange }: any) => (
    <div>
      {React.Children.map(children, child =>
        React.cloneElement(child, { onClick: () => onValueChange?.(child.props.value) })
      )}
    </div>
  ),
  SelectItem: ({ children, value, onClick }: any) => (
    <button onClick={onClick} data-value={value}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children, value, onValueChange }: any) => (
    <div data-testid='accordion' data-value={value}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOpen: value === child.props.value, onValueChange })
      )}
    </div>
  ),
  AccordionItem: ({ children, value, className, isOpen }: any) => (
    <div className={className} data-accordion-item={value} data-open={isOpen ? '1' : '0'}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children, className, onValueChange }: any) => (
    <button className={className} onClick={onValueChange}>
      {children}
    </button>
  ),
  AccordionContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

describe('LessonDialog', () => {
  const useCreateLessonMock = useCreateLesson as jest.MockedFunction<typeof useCreateLesson>;
  const mockCreateLesson = jest.fn();
  const mockOnOpenChange = jest.fn();
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useCreateLessonMock.mockReturnValue({
      createLesson: mockCreateLesson,
      isCreating: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as any);
  });

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    moduleId: 'module-123',
    nextOrder: 1,
    onCreated: mockOnCreated,
  };

  it('devrait rendre le dialog quand open=true', () => {
    render(<LessonDialog {...defaultProps} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nouvelle leçon')).toBeInTheDocument();
  });

  it('ne devrait pas rendre le dialog quand open=false', () => {
    render(<LessonDialog {...defaultProps} open={false} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('devrait initialiser avec des valeurs par défaut', () => {
    render(<LessonDialog {...defaultProps} />);

    expect(screen.getByText('0 chapitre(s) • 0 min')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Introduction au budget familial')).toHaveValue('');
    expect(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...')
    ).toHaveValue('');
  });

  it('devrait mettre à jour le titre', () => {
    render(<LessonDialog {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('Ex: Introduction au budget familial');
    fireEvent.change(titleInput, { target: { value: 'Ma leçon' } });

    expect(titleInput).toHaveValue('Ma leçon');
  });

  it('devrait mettre à jour la description', () => {
    render(<LessonDialog {...defaultProps} />);

    const descInput = screen.getByPlaceholderText(
      'Décrivez brièvement le contenu de cette leçon...'
    );
    fireEvent.change(descInput, { target: { value: 'Description test' } });

    expect(descInput).toHaveValue('Description test');
  });

  it('devrait mettre à jour la durée', () => {
    render(<LessonDialog {...defaultProps} />);

    const durationInput = screen.getByPlaceholderText('Ex: 15');
    fireEvent.change(durationInput, { target: { value: '30' } });

    expect(durationInput).toHaveValue(30);
    expect(screen.getByText('0 chapitre(s) • 30 min')).toBeInTheDocument();
  });

  it('devrait changer le statut', () => {
    render(<LessonDialog {...defaultProps} />);

    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('data-value', LessonStatus.DRAFT);

    const publishedOption = screen.getByText('Publié').closest('button');
    fireEvent.click(publishedOption!);

    expect(select).toHaveAttribute('data-value', LessonStatus.PUBLISHED);
  });

  it('devrait afficher le message vide quand aucun chapitre', () => {
    render(<LessonDialog {...defaultProps} />);

    expect(
      screen.getByText('Organisez votre leçon en chapitres pour une meilleure structure')
    ).toBeInTheDocument();
  });

  it('devrait ajouter un premier chapitre', () => {
    render(<LessonDialog {...defaultProps} />);

    const addButton = screen.getByText('Ajouter le premier chapitre');
    fireEvent.click(addButton);

    expect(screen.getByText('Chapitre 1')).toBeInTheDocument();
    expect(screen.getByText('1 chapitre(s) • 0 min')).toBeInTheDocument();
  });

  it('devrait ajouter plusieurs chapitres', () => {
    render(<LessonDialog {...defaultProps} />);

    // Ajouter le premier chapitre
    fireEvent.click(screen.getByText('Ajouter le premier chapitre'));

    // Remplir le premier chapitre
    const titleInputs = screen.getAllByPlaceholderText('Titre de chapitre');
    fireEvent.change(titleInputs[0], { target: { value: 'Chapitre 1' } });

    const descInputs = screen.getAllByPlaceholderText('Description de chapitre ...');
    fireEvent.change(descInputs[0], { target: { value: 'Description 1' } });

    const mediaInputs = screen.getAllByPlaceholderText('Ex: media-energie-004');
    fireEvent.change(mediaInputs[0], { target: { value: 'media-1' } });

    // Ajouter un deuxième chapitre
    fireEvent.click(screen.getByText('Ajouter un chapitre'));

    expect(screen.getByText('Chapitre 2')).toBeInTheDocument();
    expect(screen.getByText('2 chapitre(s) • 0 min')).toBeInTheDocument();
  });

  it("devrait empêcher l'ajout de chapitre si le précédent est incomplet", () => {
    render(<LessonDialog {...defaultProps} />);

    // Ajouter le premier chapitre
    fireEvent.click(screen.getByText('Ajouter le premier chapitre'));

    // Ne pas le remplir et essayer d'ajouter un autre
    const addButton = screen.getByText('Ajouter un chapitre');
    fireEvent.click(addButton);

    expect(
      screen.getByText("Veuillez renseigner tous les chapitres avant d'en ajouter un nouveau.")
    ).toBeInTheDocument();
  });

  it('devrait supprimer un chapitre', () => {
    render(<LessonDialog {...defaultProps} />);

    // Ajouter un chapitre
    fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
    expect(screen.getByText('Chapitre 1')).toBeInTheDocument();

    // Supprimer le chapitre
    const deleteButton = screen.getByLabelText('Supprimer le chapitre');
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Chapitre 1')).not.toBeInTheDocument();
    expect(screen.getByText('0 chapitre(s) • 0 min')).toBeInTheDocument();
  });

  it("devrait mettre à jour les champs d'un chapitre", () => {
    render(<LessonDialog {...defaultProps} />);

    // Ajouter un chapitre
    fireEvent.click(screen.getByText('Ajouter le premier chapitre'));

    // Remplir les champs
    const titleInput = screen.getByPlaceholderText('Titre de chapitre');
    fireEvent.change(titleInput, { target: { value: 'Mon chapitre' } });
    expect(titleInput).toHaveValue('Mon chapitre');

    const descInput = screen.getByPlaceholderText('Description de chapitre ...');
    fireEvent.change(descInput, { target: { value: 'Ma description' } });
    expect(descInput).toHaveValue('Ma description');

    const mediaInput = screen.getByPlaceholderText('Ex: media-energie-004');
    fireEvent.change(mediaInput, { target: { value: 'media-123' } });
    expect(mediaInput).toHaveValue('media-123');
  });

  it('devrait désactiver le bouton de création si les champs requis sont vides', () => {
    render(<LessonDialog {...defaultProps} />);

    const createButton = screen.getByText('Créer la leçon').closest('button');
    expect(createButton).toBeDisabled();
  });

  it('devrait activer le bouton quand tous les champs sont valides', () => {
    render(<LessonDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
      {
        target: { value: 'Description' },
      }
    );
    fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '30' } });

    const createButton = screen.getByText('Créer la leçon').closest('button');
    expect(createButton).not.toBeDisabled();
  });

  it('devrait empêcher la publication sans chapitres', () => {
    render(<LessonDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
      {
        target: { value: 'Description' },
      }
    );
    fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '30' } });

    // Changer le statut à PUBLISHED
    const publishedOption = screen.getByText('Publié').closest('button');
    fireEvent.click(publishedOption!);

    expect(screen.getByText('Pour publier, ajoute au moins 1 chapitre.')).toBeInTheDocument();

    const createButton = screen.getByText('Créer la leçon').closest('button');
    expect(createButton).toBeDisabled();
  });

  it('devrait permettre la publication avec au moins un chapitre valide', () => {
    render(<LessonDialog {...defaultProps} />);

    // Remplir les champs de base
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
      {
        target: { value: 'Description' },
      }
    );
    fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '30' } });

    // Ajouter un chapitre
    fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
    fireEvent.change(screen.getByPlaceholderText('Titre de chapitre'), {
      target: { value: 'Chapitre 1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Description de chapitre ...'), {
      target: { value: 'Description' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ex: media-energie-004'), {
      target: { value: 'media-1' },
    });

    // Changer le statut à PUBLISHED
    const publishedOption = screen.getByText('Publié').closest('button');
    fireEvent.click(publishedOption!);

    const createButton = screen.getByText('Créer la leçon').closest('button');
    expect(createButton).not.toBeDisabled();
  });

  it('devrait appeler createLesson avec les bonnes données', () => {
    render(<LessonDialog {...defaultProps} />);

    // Remplir les champs
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
      {
        target: { value: 'Description test' },
      }
    );
    fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '45' } });

    // Ajouter un chapitre
    fireEvent.click(screen.getByText('Ajouter le premier chapitre'));
    fireEvent.change(screen.getByPlaceholderText('Titre de chapitre'), {
      target: { value: 'Chapitre 1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Description de chapitre ...'), {
      target: { value: 'Description chapitre' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ex: media-energie-004'), {
      target: { value: 'media-123' },
    });

    // Créer la leçon
    fireEvent.click(screen.getByText('Créer la leçon'));

    expect(mockCreateLesson).toHaveBeenCalledWith({
      moduleId: 'module-123',
      payload: {
        title: 'Ma leçon',
        description: 'Description test',
        duration: 45,
        order: 1,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre 1',
            description: 'Description chapitre',
            mediaId: 'media-123',
            order: 0,
          },
        ],
      },
    });
  });

  it('devrait fermer le dialog après création réussie', () => {
    useCreateLessonMock.mockReturnValue({
      createLesson: (data: any) => {
        mockCreateLesson(data);
        defaultProps.onOpenChange(false);
        defaultProps.onCreated?.();
      },
      isCreating: false,
      isSuccess: true,
      isError: false,
      error: null,
    } as any);

    render(<LessonDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
      {
        target: { value: 'Description' },
      }
    );
    fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '30' } });

    // Créer la leçon
    fireEvent.click(screen.getByText('Créer la leçon'));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnCreated).toHaveBeenCalled();
  });

  it('devrait désactiver le bouton pendant isCreating', () => {
    useCreateLessonMock.mockReturnValue({
      createLesson: mockCreateLesson,
      isCreating: true,
      isSuccess: false,
      isError: false,
      error: null,
    } as any);

    render(<LessonDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
      {
        target: { value: 'Description' },
      }
    );
    fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '30' } });

    const createButton = screen.getByText('Créer la leçon').closest('button');
    expect(createButton).toBeDisabled();
  });

  it("devrait réinitialiser les champs à l'ouverture", () => {
    const { rerender } = render(<LessonDialog {...defaultProps} open={false} />);

    // Ouvrir et remplir
    rerender(<LessonDialog {...defaultProps} open={true} />);
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });

    // Fermer et rouvrir
    rerender(<LessonDialog {...defaultProps} open={false} />);
    rerender(<LessonDialog {...defaultProps} open={true} />);

    const titleInput = screen.getByPlaceholderText('Ex: Introduction au budget familial');
    expect(titleInput).toHaveValue('');
  });

  it('devrait appeler onOpenChange quand on clique sur Annuler', () => {
    render(<LessonDialog {...defaultProps} />);

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('devrait valider que la durée est positive', () => {
    render(<LessonDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
      {
        target: { value: 'Description' },
      }
    );

    // Durée invalide (0)
    fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '0' } });

    const createButton = screen.getByText('Créer la leçon').closest('button');
    expect(createButton).toBeDisabled();
  });

  it('devrait initialiser avec des chapitres existants', () => {
    const initialChapters = [
      {
        id: 'chapter-1',
        title: 'Chapitre existant',
        description: 'Description existante',
        mediaId: 'media-existing',
        order: 0,
      },
    ];

    render(<LessonDialog {...defaultProps} chapters={initialChapters} />);

    expect(screen.getByText('1 chapitre(s) • 0 min')).toBeInTheDocument();
    expect(screen.getByText('Chapitre 1')).toBeInTheDocument();
  });

  it("devrait afficher le message d'erreur pour chapitres invalides", () => {
    render(<LessonDialog {...defaultProps} />);

    // Remplir les champs de base
    fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
      target: { value: 'Ma leçon' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
      {
        target: { value: 'Description' },
      }
    );
    fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '30' } });

    // Ajouter un chapitre incomplet
    fireEvent.click(screen.getByText('Ajouter le premier chapitre'));

    expect(
      screen.getByText('Chaque chapitre doit avoir un titre, une description et un mediaId.')
    ).toBeInTheDocument();
  });
});

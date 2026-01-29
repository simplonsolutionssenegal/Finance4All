// frontend/__tests__/components/admin/modules/quiz-dialog.test.tsx

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import QuizDialog from '@/components/admin/modules/quiz-dialog';
import { useCreateQuiz } from '@/hooks/quiz/useCreateQuiz';
import { TypeQuestion, type QuestionDTO } from '@/types/modules/Question';
import { QuizStatus } from '@/types/modules/Quiz';

// --- Mocks ---
jest.mock('@/hooks/quiz/useCreateQuiz', () => ({
  useCreateQuiz: jest.fn(),
}));

// Mock du composant QuestionDialog
jest.mock('@/components/admin/modules/question-dialog', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='question-dialog' data-open={props.open ? '1' : '0'}>
      <button
        onClick={() => {
          const mockQuestion: QuestionDTO = {
            question: 'Question test',
            type: TypeQuestion.CHOIX_UNIQUE,
            points: 10,
            options: [
              { text: 'Option 1', isCorrect: true },
              { text: 'Option 2', isCorrect: false },
            ],
          };
          props.onAdd(mockQuestion);
        }}
      >
        add-question
      </button>
      <button onClick={() => props.onOpenChange(false)}>close-question</button>
    </div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-variant={variant}>
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
  DialogHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
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

describe('QuizDialog', () => {
  const useCreateQuizMock = useCreateQuiz as jest.MockedFunction<typeof useCreateQuiz>;
  const mockCreateQuiz = jest.fn();
  const mockOnOpenChange = jest.fn();
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useCreateQuizMock.mockReturnValue({
      createQuiz: mockCreateQuiz,
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
    onCreated: mockOnCreated,
  };

  it('devrait rendre le dialog quand open=true', () => {
    render(<QuizDialog {...defaultProps} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nouveau quiz')).toBeInTheDocument();
    expect(screen.getByText('Quiz de module')).toBeInTheDocument();
  });

  it('ne devrait pas rendre le dialog quand open=false', () => {
    render(<QuizDialog {...defaultProps} open={false} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('devrait initialiser les champs avec des valeurs par défaut', () => {
    render(<QuizDialog {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('Ex: Quiz de compréhension');
    const descriptionInput = screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...');
    const scoreInput = screen.getByDisplayValue('70');
    const attemptsInput = screen.getByDisplayValue('3');

    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
    expect(scoreInput).toHaveValue(70);
    expect(attemptsInput).toHaveValue(3);
  });

  it('devrait mettre à jour le titre', () => {
    render(<QuizDialog {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('Ex: Quiz de compréhension');
    fireEvent.change(titleInput, { target: { value: 'Quiz final' } });

    expect(titleInput).toHaveValue('Quiz final');
  });

  it('devrait mettre à jour la description', () => {
    render(<QuizDialog {...defaultProps} />);

    const descriptionInput = screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...');
    fireEvent.change(descriptionInput, { target: { value: 'Description du quiz' } });

    expect(descriptionInput).toHaveValue('Description du quiz');
  });

  it('devrait mettre à jour le score minimum', () => {
    render(<QuizDialog {...defaultProps} />);

    const scoreInput = screen.getByDisplayValue('70');
    fireEvent.change(scoreInput, { target: { value: '80' } });

    expect(scoreInput).toHaveValue(80);
  });

  it('devrait mettre à jour la durée', () => {
    render(<QuizDialog {...defaultProps} />);

    const dureeInput = screen.getByPlaceholderText('Illimité');
    fireEvent.change(dureeInput, { target: { value: '30' } });

    expect(dureeInput).toHaveValue('30');
  });

  it('devrait mettre à jour le nombre de tentatives', () => {
    render(<QuizDialog {...defaultProps} />);

    const attemptsInput = screen.getByDisplayValue('3');
    fireEvent.change(attemptsInput, { target: { value: '2' } });

    expect(attemptsInput).toHaveValue(2);
  });

  it('devrait changer le statut', () => {
    render(<QuizDialog {...defaultProps} />);

    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('data-value', QuizStatus.DRAFT);

    const publishedOption = screen.getByText('Publié').closest('button');
    fireEvent.click(publishedOption!);

    expect(select).toHaveAttribute('data-value', QuizStatus.PUBLISHED);
  });

  it('devrait afficher "Aucune question" quand il n\'y a pas de questions', () => {
    render(<QuizDialog {...defaultProps} />);

    // Vérifier le message "Aucune question"
    expect(screen.getByText(/Aucune question/i)).toBeInTheDocument();

    // Vérifier le footer avec le compteur
    expect(screen.getByText(/0 question • 0 points/)).toBeInTheDocument();

    // Vérifier le badge du compteur dans le header des questions
    const badges = screen.getAllByText('0');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('devrait ouvrir le QuestionDialog', () => {
    render(<QuizDialog {...defaultProps} />);

    const questionDialog = screen.getByTestId('question-dialog');
    expect(questionDialog).toHaveAttribute('data-open', '0');

    const addButton = screen.getByText('Ajouter une question');
    fireEvent.click(addButton);

    expect(questionDialog).toHaveAttribute('data-open', '1');
  });

  it('devrait ajouter une question', () => {
    render(<QuizDialog {...defaultProps} />);

    // Ouvrir le dialog de question
    fireEvent.click(screen.getByText('Ajouter une question'));

    // Ajouter une question
    fireEvent.click(screen.getByText('add-question'));

    // Vérifier que la question est ajoutée
    expect(screen.getByText('Question test')).toBeInTheDocument();
    expect(screen.getByText(/Choix unique • 10 pts • 2 options/)).toBeInTheDocument();
    expect(screen.getByText(/1 question • 10 points/)).toBeInTheDocument();
  });

  it('devrait supprimer une question', () => {
    render(<QuizDialog {...defaultProps} />);

    // Ajouter une question
    fireEvent.click(screen.getByText('Ajouter une question'));
    fireEvent.click(screen.getByText('add-question'));

    expect(screen.getByText('Question test')).toBeInTheDocument();

    // Supprimer la question
    const deleteButton = screen.getByLabelText('Supprimer la question');
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Question test')).not.toBeInTheDocument();
    expect(screen.getByText(/0 question • 0 points/)).toBeInTheDocument();
  });

  it('devrait calculer le total des points correctement', () => {
    render(<QuizDialog {...defaultProps} />);

    // Ajouter deux questions
    fireEvent.click(screen.getByText('Ajouter une question'));
    fireEvent.click(screen.getByText('add-question'));
    fireEvent.click(screen.getByText('add-question'));

    expect(screen.getByText(/2 questions • 20 points/)).toBeInTheDocument();
  });

  it('devrait désactiver le bouton de création si les champs requis sont vides', () => {
    render(<QuizDialog {...defaultProps} />);

    const createButton = screen.getByText('Créer le quiz').closest('button');
    expect(createButton).toBeDisabled();
  });

  it('devrait activer le bouton de création quand les champs sont valides', () => {
    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });

    const createButton = screen.getByText('Créer le quiz').closest('button');
    expect(createButton).not.toBeDisabled();
  });

  it('devrait empêcher la création si status=PUBLISHED sans questions', () => {
    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });

    // Changer le statut à PUBLISHED
    const publishedOption = screen.getByText('Publié').closest('button');
    fireEvent.click(publishedOption!);

    const createButton = screen.getByText('Créer le quiz').closest('button');
    expect(createButton).toBeDisabled();
  });

  it('devrait permettre la création si status=PUBLISHED avec au moins une question', () => {
    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });

    // Ajouter une question
    fireEvent.click(screen.getByText('Ajouter une question'));
    fireEvent.click(screen.getByText('add-question'));

    // Changer le statut à PUBLISHED
    const publishedOption = screen.getByText('Publié').closest('button');
    fireEvent.click(publishedOption!);

    const createButton = screen.getByText('Créer le quiz').closest('button');
    expect(createButton).not.toBeDisabled();
  });

  it('devrait appeler createQuiz avec les bonnes données', () => {
    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });
    fireEvent.change(screen.getByDisplayValue('70'), { target: { value: '80' } });
    fireEvent.change(screen.getByPlaceholderText('Illimité'), { target: { value: '30' } });
    fireEvent.change(screen.getByDisplayValue('3'), { target: { value: '2' } });

    // Ajouter une question
    fireEvent.click(screen.getByText('Ajouter une question'));
    fireEvent.click(screen.getByText('add-question'));

    // Créer le quiz
    const createButton = screen.getByText('Créer le quiz');
    fireEvent.click(createButton);

    expect(mockCreateQuiz).toHaveBeenCalledWith({
      moduleId: 'module-123',
      payload: {
        title: 'Quiz test',
        description: 'Description test',
        status: QuizStatus.DRAFT,
        scoreMinimum: 80,
        duree: 30,
        nombreTentatives: 2,
        questions: [
          {
            question: 'Question test',
            type: 'CHOIX_UNIQUE',
            points: 10,
            options: [
              { text: 'Option 1', isCorrect: true },
              { text: 'Option 2', isCorrect: false },
            ],
          },
        ],
      },
    });
  });

  it('devrait envoyer duree=undefined si le champ est vide', () => {
    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs requis (sans durée)
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });

    // Créer le quiz
    fireEvent.click(screen.getByText('Créer le quiz'));

    expect(mockCreateQuiz).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          duree: undefined,
        }),
      })
    );
  });

  it('devrait fermer le dialog après création réussie', () => {
    useCreateQuizMock.mockReturnValue({
      createQuiz: (data: any) => {
        mockCreateQuiz(data);
        // Simuler le succès immédiatement
        defaultProps.onOpenChange(false);
        defaultProps.onCreated?.();
      },
      isCreating: false,
      isSuccess: true,
      isError: false,
      error: null,
    } as any);

    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });

    // Créer le quiz
    fireEvent.click(screen.getByText('Créer le quiz'));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnCreated).toHaveBeenCalled();
  });

  it('devrait désactiver le bouton de création pendant isCreating', () => {
    useCreateQuizMock.mockReturnValue({
      createQuiz: mockCreateQuiz,
      isCreating: true,
      isSuccess: false,
      isError: false,
      error: null,
    } as any);

    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });

    const createButton = screen.getByText('Créer le quiz').closest('button');
    expect(createButton).toBeDisabled();
  });

  it("devrait réinitialiser les champs quand le dialog s'ouvre", () => {
    const { rerender } = render(<QuizDialog {...defaultProps} open={false} />);

    // Ouvrir et remplir
    rerender(<QuizDialog {...defaultProps} open={true} />);

    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });

    // Fermer et rouvrir
    rerender(<QuizDialog {...defaultProps} open={false} />);
    rerender(<QuizDialog {...defaultProps} open={true} />);

    const titleInput = screen.getByPlaceholderText('Ex: Quiz de compréhension');
    expect(titleInput).toHaveValue('');
  });

  it('devrait appeler onOpenChange quand on clique sur Annuler', () => {
    render(<QuizDialog {...defaultProps} />);

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('devrait valider que scoreMinimum est entre 0 et 100', () => {
    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });

    // Score invalide (> 100)
    fireEvent.change(screen.getByDisplayValue('70'), { target: { value: '150' } });

    const createButton = screen.getByText('Créer le quiz').closest('button');
    expect(createButton).toBeDisabled();
  });

  it('devrait valider que nombreTentatives est entre 1 et 3', () => {
    render(<QuizDialog {...defaultProps} />);

    // Remplir les champs requis
    fireEvent.change(screen.getByPlaceholderText('Ex: Quiz de compréhension'), {
      target: { value: 'Quiz test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...'), {
      target: { value: 'Description test' },
    });

    // Tentatives invalides (> 3)
    fireEvent.change(screen.getByDisplayValue('3'), { target: { value: '5' } });

    const createButton = screen.getByText('Créer le quiz').closest('button');
    expect(createButton).toBeDisabled();
  });
});

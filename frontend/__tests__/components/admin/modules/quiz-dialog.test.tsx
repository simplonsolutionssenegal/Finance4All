import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import QuizDialog from '@/components/admin/modules/quiz-dialog';

// --- mock hook useCreateQuiz ---
const createQuizMock = jest.fn();
let isCreatingMock = false;
let onSuccessFromHook: (() => void) | undefined;

jest.mock('@/hooks/quiz/useCreateQuiz', () => ({
  useCreateQuiz: (opts: { onSuccess?: () => void }) => {
    onSuccessFromHook = opts?.onSuccess;
    return {
      createQuiz: createQuizMock,
      isCreating: isCreatingMock,
    };
  },
}));

// --- mock QuizFormDialog ---
// On expose un bouton pour déclencher onSubmit et onOpenChange
jest.mock('@/components/admin/modules/quiz-form-dialog', () => ({
  __esModule: true,
  default: ({ open, subtitle, submitLabel, onSubmit, onOpenChange }: any) => (
    <div data-testid='quiz-form-dialog'>
      <div data-testid='open'>{String(open)}</div>
      <div data-testid='subtitle'>{subtitle}</div>
      <div data-testid='submitLabel'>{submitLabel}</div>

      <button
        type='button'
        onClick={() =>
          onSubmit({
            title: 'Quiz title',
            description: 'Quiz desc',
            status: 'DRAFT',
            scoreMinimum: 70,
            duree: undefined,
            nombreTentatives: 3,
            questions: [],
          })
        }
      >
        trigger-submit
      </button>

      <button type='button' onClick={() => onOpenChange(false)}>
        trigger-close
      </button>
    </div>
  ),
}));

describe('QuizDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onSuccessFromHook = undefined;
    isCreatingMock = false;
  });

  it('passe les props correctes à QuizFormDialog et submitLabel dépend de isCreating=false', () => {
    render(
      <QuizDialog open={true} onOpenChange={jest.fn()} moduleId='mod-1' onCreated={jest.fn()} />
    );

    expect(screen.getByTestId('open').textContent).toBe('true');
    expect(screen.getByTestId('subtitle').textContent).toBe('Quiz de module');
    expect(screen.getByTestId('submitLabel').textContent).toBe('Créer le quiz');
  });

  it('submitLabel devient "Création…" quand isCreating=true', () => {
    isCreatingMock = true;

    render(
      <QuizDialog open={true} onOpenChange={jest.fn()} moduleId='mod-1' onCreated={jest.fn()} />
    );

    expect(screen.getByTestId('submitLabel').textContent).toBe('Création…');
  });

  it('handleSubmit appelle createQuiz avec moduleId et payload', () => {
    render(
      <QuizDialog open={true} onOpenChange={jest.fn()} moduleId='mod-XYZ' onCreated={jest.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'trigger-submit' }));

    expect(createQuizMock).toHaveBeenCalledTimes(1);
    expect(createQuizMock).toHaveBeenCalledWith({
      moduleId: 'mod-XYZ',
      payload: {
        title: 'Quiz title',
        description: 'Quiz desc',
        status: 'DRAFT',
        scoreMinimum: 70,
        duree: undefined,
        nombreTentatives: 3,
        questions: [],
      },
    });
  });

  it('le onSuccess du hook ferme le dialog et appelle onCreated', () => {
    const onOpenChange = jest.fn();
    const onCreated = jest.fn();

    render(
      <QuizDialog open={true} onOpenChange={onOpenChange} moduleId='mod-1' onCreated={onCreated} />
    );

    // on déclenche manuellement le onSuccess capturé
    expect(typeof onSuccessFromHook).toBe('function');
    onSuccessFromHook?.();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('bloque onOpenChange quand isCreating=true', () => {
    isCreatingMock = true;
    const onOpenChange = jest.fn();

    render(<QuizDialog open={true} onOpenChange={onOpenChange} moduleId='mod-1' />);

    fireEvent.click(screen.getByRole('button', { name: 'trigger-close' }));

    // le wrapper fait: v => !isCreating && onOpenChange(v)
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('autorise onOpenChange quand isCreating=false', () => {
    isCreatingMock = false;
    const onOpenChange = jest.fn();

    render(<QuizDialog open={true} onOpenChange={onOpenChange} moduleId='mod-1' />);

    fireEvent.click(screen.getByRole('button', { name: 'trigger-close' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import QuizDialog from '@/components/admin/modules/quiz-dialog';

const createQuizMock = jest.fn();
const updateQuizMock = jest.fn();
let isCreatingMock = false;
let isUpdatingMock = false;
let onSuccessCreate: (() => void) | undefined;
let onSuccessUpdate: (() => void) | undefined;

jest.mock('@/hooks/quiz/useCreateQuiz', () => ({
  useCreateQuiz: (opts: { onSuccess?: () => void }) => {
    onSuccessCreate = opts?.onSuccess;
    return { createQuiz: createQuizMock, isCreating: isCreatingMock };
  },
}));

jest.mock('@/hooks/quiz/useUpdateQuiz', () => ({
  useUpdateQuiz: (opts: { onSuccess?: () => void }) => {
    onSuccessUpdate = opts?.onSuccess;
    return { updateQuiz: updateQuizMock, isUpdating: isUpdatingMock };
  },
}));

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
    onSuccessCreate = undefined;
    onSuccessUpdate = undefined;
    isCreatingMock = false;
    isUpdatingMock = false;
  });

  it('passes props to QuizFormDialog in create mode', () => {
    render(<QuizDialog open={true} onOpenChange={jest.fn()} moduleId='mod-1' />);

    expect(screen.getByTestId('open').textContent).toBe('true');
    expect(screen.getByTestId('subtitle').textContent).toBe('Quiz de module');
    expect(screen.getByTestId('submitLabel').textContent).toMatch(/Cr/);
  });

  it('submitLabel shows creation and modification loading states', () => {
    isCreatingMock = true;
    const { rerender } = render(
      <QuizDialog open={true} onOpenChange={jest.fn()} moduleId='mod-1' />
    );

    expect(screen.getByTestId('submitLabel').textContent).toMatch(/Cr/);

    isCreatingMock = false;
    isUpdatingMock = true;

    rerender(
      <QuizDialog
        open={true}
        onOpenChange={jest.fn()}
        moduleId='mod-1'
        editingQuiz={{ id: 'q1' } as any}
      />
    );

    expect(screen.getByTestId('submitLabel').textContent).toMatch(/Modification/);
  });

  it('handleSubmit calls createQuiz in create mode', () => {
    render(<QuizDialog open={true} onOpenChange={jest.fn()} moduleId='mod-XYZ' />);

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

  it('handleSubmit calls updateQuiz in edit mode', () => {
    render(
      <QuizDialog
        open={true}
        onOpenChange={jest.fn()}
        moduleId='mod-1'
        editingQuiz={{ id: 'q-edit' } as any}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'trigger-submit' }));

    expect(updateQuizMock).toHaveBeenCalledTimes(1);
    expect(updateQuizMock).toHaveBeenCalledWith({
      quizId: 'q-edit',
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

  it('onSuccess from hooks closes dialog and calls onDone/onCreated', () => {
    const onOpenChange = jest.fn();
    const onDone = jest.fn();
    const onCreated = jest.fn();

    render(
      <QuizDialog
        open={true}
        onOpenChange={onOpenChange}
        moduleId='mod-1'
        onDone={onDone}
        onCreated={onCreated}
      />
    );

    onSuccessCreate?.();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onCreated).toHaveBeenCalledTimes(1);

    onSuccessUpdate?.();
  });

  it('blocks onOpenChange when submitting', () => {
    isCreatingMock = true;
    const onOpenChange = jest.fn();

    render(<QuizDialog open={true} onOpenChange={onOpenChange} moduleId='mod-1' />);

    fireEvent.click(screen.getByRole('button', { name: 'trigger-close' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import QuizList from '@/components/admin/modules/quiz-list';

jest.mock('@/components/admin/modules/Quiz-Item', () => ({
  __esModule: true,
  default: ({ quiz, onEdit, onDelete }: any) => (
    <div data-testid={`quiz-item-${quiz?.id}`}>
      <div>{quiz?.title}</div>
      <button type='button' onClick={() => onEdit?.(quiz)} aria-label={`edit-${quiz?.id}`}>
        edit
      </button>
      <button type='button' onClick={() => onDelete?.(quiz)} aria-label={`delete-${quiz?.id}`}>
        delete
      </button>
    </div>
  ),
}));

describe('QuizList', () => {
  const makeQuiz = (overrides?: Partial<any>) => ({
    id: 'q1',
    title: 'Quiz 1',
    description: 'Desc 1',
    status: 'DRAFT',
    scoreMinimum: 70,
    duree: 1800,
    nombreTentatives: 2,
    questions: [{}, {}],
    ...overrides,
  });

  it('renders empty state without button when quizzes empty and no onCreate', () => {
    render(<QuizList quizzes={[]} />);

    expect(screen.getByText('Aucun quiz pour le moment')).toBeInTheDocument();
    expect(screen.getByText(/Ajoute un quiz/)).toBeInTheDocument();
    expect(screen.queryByText('Nouveau quiz')).not.toBeInTheDocument();
  });

  it('renders empty state with button and calls onCreate', () => {
    const onCreate = jest.fn();
    render(<QuizList quizzes={[]} onCreate={onCreate} />);

    const btn = screen.getByText('Nouveau quiz');
    fireEvent.click(btn);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('deduplicates quizzes by id and wires onEdit/onDelete', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    const quizzes = [
      makeQuiz({ id: 'q1', title: 'Quiz 1' }),
      makeQuiz({ id: 'q1', title: 'Quiz 1 (dup)' }),
      makeQuiz({ id: 'q2', title: 'Quiz 2' }),
    ];

    render(<QuizList quizzes={quizzes as any} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByTestId('quiz-item-q1')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-item-q2')).toBeInTheDocument();
    expect(screen.getAllByTestId('quiz-item-q1')).toHaveLength(1);
    expect(screen.getByText('Quiz 1 (dup)')).toBeInTheDocument();
    expect(screen.queryByText(/^Quiz 1$/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('edit-q1'));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'q1' }));

    fireEvent.click(screen.getByLabelText('delete-q2'));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'q2' }));
  });
});

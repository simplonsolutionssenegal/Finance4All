/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import QuizItem from '@/components/admin/modules/Quiz-Item';

jest.mock('@/components/admin/modules/ConfirmDeleteModal', () => ({
  __esModule: true,
  default: ({ isOpen, onConfirm }: any) =>
    isOpen ? (
      <button type='button' aria-label='confirm-delete-quiz' onClick={onConfirm}>
        confirm-delete
      </button>
    ) : null,
}));

describe('Quiz-Item', () => {
  const baseQuiz = {
    id: 'q1',
    title: 'Quiz 1',
    description: 'Desc',
    status: 'PUBLISHED',
    scoreMinimum: 70,
    duree: 12,
    nombreTentatives: 2,
    questions: [{}, {}],
  } as any;

  it('renders quiz info and status', () => {
    render(<QuizItem quiz={baseQuiz} />);

    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('2 questions')).toBeInTheDocument();
    expect(screen.getByText(/Publi/)).toBeInTheDocument();
    expect(screen.getByText('12 min')).toBeInTheDocument();
  });

  it('handles duration null/undefined and status fallback', () => {
    render(<QuizItem quiz={{ ...baseQuiz, status: 'UNKNOWN', duree: null, questions: 'x' }} />);

    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    expect(screen.getByText(/Illimit/)).toBeInTheDocument();
    expect(screen.getByText('0 questions')).toBeInTheDocument();
  });

  it('calls onEdit and onDelete when actions clicked', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(<QuizItem quiz={baseQuiz} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText('Modifier le quiz'));
    expect(onEdit).toHaveBeenCalledWith(baseQuiz);

    fireEvent.click(screen.getByLabelText('Supprimer le quiz'));
    fireEvent.click(screen.getByLabelText('confirm-delete-quiz'));
    expect(onDelete).toHaveBeenCalledWith(baseQuiz);
  });
});

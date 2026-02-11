/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import LessonItem from '@/components/admin/modules/lesson-item';
import { LessonStatus, type Lesson } from '@/types/modules/Lesson';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/admin/modules/ConfirmDeleteModal', () => ({
  __esModule: true,
  default: ({ isOpen, onConfirm }: any) =>
    isOpen ? (
      <button type='button' aria-label='confirm-delete' onClick={onConfirm}>
        confirm-delete
      </button>
    ) : null,
}));

describe('LessonItem', () => {
  const mockLesson: Lesson = {
    id: 'lesson-1',
    title: 'Introduction a la finance',
    description: 'Bases de la finance personnelle',
    duration: 45,
    order: 1,
    status: LessonStatus.PUBLISHED,
    chapters: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  };

  it('renders base info with displayIndex and duration', () => {
    render(<LessonItem lesson={mockLesson} displayIndex={2} />);

    expect(screen.getByText('Introduction a la finance')).toBeInTheDocument();
    expect(screen.getByText('Bases de la finance personnelle')).toBeInTheDocument();
    expect(screen.getByText('Lecon 2')).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('shows default resourcesCount and status label', () => {
    render(<LessonItem lesson={mockLesson} />);

    expect(screen.getByText('0 ressource')).toBeInTheDocument();
    expect(screen.getByText('Publie')).toBeInTheDocument();
  });

  it('renders status badges for all statuses', () => {
    const draftLesson: Lesson = { ...mockLesson, status: LessonStatus.DRAFT };
    const archivedLesson: Lesson = { ...mockLesson, status: LessonStatus.ARCHIVED };
    const scheduledLesson: Lesson = { ...mockLesson, status: LessonStatus.SCHEDULED };

    const { rerender } = render(<LessonItem lesson={draftLesson} />);
    expect(screen.getByText('Brouillon')).toBeInTheDocument();

    rerender(<LessonItem lesson={archivedLesson} />);
    expect(screen.getByText('Archive')).toBeInTheDocument();

    rerender(<LessonItem lesson={scheduledLesson} />);
    expect(screen.getByText('Programme')).toBeInTheDocument();
  });

  it('renders quiz label when provided', () => {
    render(<LessonItem lesson={mockLesson} quizLabel='Quiz final' />);
    expect(screen.getByText('Quiz final')).toBeInTheDocument();
  });

  it('renders title as link when href is provided', () => {
    render(<LessonItem lesson={mockLesson} href='/lessons/lesson-1' />);
    const link = screen.getByText('Introduction a la finance').closest('a');
    expect(link).toHaveAttribute('href', '/lessons/lesson-1');
  });

  it('shows edit button only when onEdit is provided', () => {
    const onEdit = jest.fn();
    const { rerender } = render(<LessonItem lesson={mockLesson} onEdit={onEdit} />);

    fireEvent.click(screen.getByLabelText('Modifier la lecon'));
    expect(onEdit).toHaveBeenCalledWith(mockLesson);

    rerender(<LessonItem lesson={mockLesson} />);
    expect(screen.queryByLabelText('Modifier la lecon')).not.toBeInTheDocument();
  });

  it('shows delete button and calls onDelete after confirm', () => {
    const onDelete = jest.fn();
    render(<LessonItem lesson={mockLesson} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText('Supprimer la lecon'));
    fireEvent.click(screen.getByLabelText('confirm-delete'));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockLesson);
  });
});

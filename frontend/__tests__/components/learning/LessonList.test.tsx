import { render, screen } from '@testing-library/react';

import LessonList from '@/components/learning/LessonList';
import { LessonStatus, type Lesson, type LessonProgressStatus } from '@/types/learning/lesson';

const createLesson = (overrides: Partial<Lesson>): Lesson => ({
  id: 'lesson-1',
  moduleId: 'module-1',
  title: 'Le?on 1',
  description: 'Description',
  duration: 30,
  order: 1,
  status: LessonStatus.PUBLISHED,
  ...overrides,
});

describe('LessonList', () => {
  it('renders locked lesson with disabled button', () => {
    const lessons = [createLesson({ id: 'lesson-1', order: 1 })];
    const statuses = new Map<string, LessonProgressStatus>([['lesson-1', 'LOCKED']]);

    render(<LessonList moduleId='module-1' lessons={lessons} lessonStatuses={statuses} />);

    const lockedButton = screen.getByRole('button', { name: /verrouill?/i });
    expect(lockedButton).toBeDisabled();
  });

  it('renders available lesson with link and correct label when done', () => {
    const lessons = [createLesson({ id: 'lesson-2', order: 2 })];
    const statuses = new Map<string, LessonProgressStatus>([['lesson-2', 'DONE']]);

    render(<LessonList moduleId='module-1' lessons={lessons} lessonStatuses={statuses} />);

    const link = screen.getByRole('link', { name: /revoir/i });
    expect(link).toHaveAttribute('href', '/learning/module-1/lesson/2');
  });

  it('renders available lesson with continue label when in progress', () => {
    const lessons = [createLesson({ id: 'lesson-3', order: 3 })];
    const statuses = new Map<string, LessonProgressStatus>([['lesson-3', 'CURRENT']]);

    render(<LessonList moduleId='module-1' lessons={lessons} lessonStatuses={statuses} />);

    const link = screen.getByRole('link', { name: /continuer/i });
    expect(link).toHaveAttribute('href', '/learning/module-1/lesson/3');
  });

  it('defaults to locked when status is missing', () => {
    const lessons = [createLesson({ id: 'lesson-4', order: 4 })];
    const statuses = new Map<string, LessonProgressStatus>();

    render(<LessonList moduleId='module-1' lessons={lessons} lessonStatuses={statuses} />);

    const lockedButton = screen.getByRole('button', { name: /verrouillé/i });
    expect(lockedButton).toBeDisabled();
  });
});

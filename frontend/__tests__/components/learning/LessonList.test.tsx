import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LessonList from '@/components/learning/LessonList';
import { LessonStatus, type Lesson, type LessonProgressStatus } from '@/types/learning/lesson';

const pushMock = jest.fn();
const enrollModuleAsyncMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('@/hooks/module/useEnrollModule', () => ({
  useEnrollModule: () => ({
    enrollModuleAsync: enrollModuleAsyncMock,
    isEnrolling: false,
  }),
}));

const createLesson = (overrides: Partial<Lesson>): Lesson => ({
  id: 'lesson-1',
  moduleId: 'module-1',
  title: 'Lecon 1',
  description: 'Description',
  duration: 30,
  order: 1,
  status: LessonStatus.PUBLISHED,
  ...overrides,
});

describe('LessonList', () => {
  beforeEach(() => {
    pushMock.mockClear();
    enrollModuleAsyncMock.mockReset();
    enrollModuleAsyncMock.mockResolvedValue({ success: true });
  });

  it('renders locked lesson without action button', () => {
    const lessons = [createLesson({ id: 'lesson-1', order: 1 })];
    const statuses = new Map<string, LessonProgressStatus>([['lesson-1', 'LOCKED']]);

    render(
      <LessonList
        moduleId='module-1'
        lessons={lessons}
        lessonStatuses={statuses}
        startedLessonIds={new Set()}
      />
    );

    expect(screen.queryByRole('button', { name: /verrouille/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /revoir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continuer/i })).not.toBeInTheDocument();
  });

  it('renders available lesson with correct label when done and navigates after enroll', async () => {
    const lessons = [createLesson({ id: 'lesson-2', order: 2 })];
    const statuses = new Map<string, LessonProgressStatus>([['lesson-2', 'DONE']]);

    render(
      <LessonList
        moduleId='module-1'
        lessons={lessons}
        lessonStatuses={statuses}
        startedLessonIds={new Set()}
      />
    );

    const button = screen.getByRole('button', { name: /revoir/i });
    await userEvent.click(button);

    expect(enrollModuleAsyncMock).toHaveBeenCalledWith({ moduleId: 'module-1' });
    expect(pushMock).toHaveBeenCalledWith('/learning/module-1/lesson/2');
  });

  it('renders available lesson with continue label when in progress and navigates after enroll', async () => {
    const lessons = [createLesson({ id: 'lesson-3', order: 3 })];
    const statuses = new Map<string, LessonProgressStatus>([['lesson-3', 'CURRENT']]);

    render(
      <LessonList
        moduleId='module-1'
        lessons={lessons}
        lessonStatuses={statuses}
        startedLessonIds={new Set(['lesson-3'])}
      />
    );

    const button = screen.getByRole('button', { name: /continuer/i });
    await userEvent.click(button);

    expect(enrollModuleAsyncMock).toHaveBeenCalledWith({ moduleId: 'module-1' });
    expect(pushMock).toHaveBeenCalledWith('/learning/module-1/lesson/3');
  });

  it('defaults to locked when status is missing', () => {
    const lessons = [createLesson({ id: 'lesson-4', order: 4 })];
    const statuses = new Map<string, LessonProgressStatus>();

    render(
      <LessonList
        moduleId='module-1'
        lessons={lessons}
        lessonStatuses={statuses}
        startedLessonIds={new Set()}
      />
    );

    expect(screen.queryByRole('button', { name: /verrouille/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /revoir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continuer/i })).not.toBeInTheDocument();
  });
});

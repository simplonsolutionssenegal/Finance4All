import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModuleTabs from '@/components/learning/ModuleTabs';
import {
  LessonStatus,
  QuizStatus,
  type Lesson,
  type Quiz,
  type LessonProgressStatus,
} from '@/types/learning/lesson';
import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

jest.mock('@/components/learning/LessonList', () => ({
  __esModule: true,
  default: ({ lessons }: { lessons: Lesson[] }) => (
    <div data-testid='lesson-list'>Lessons: {lessons.length}</div>
  ),
}));

jest.mock('@/components/learning/QuizList', () => ({
  __esModule: true,
  default: ({ quizzes }: { quizzes: Quiz[] }) => (
    <div data-testid='quiz-list'>Quizzes: {quizzes.length}</div>
  ),
}));

describe('ModuleTabs', () => {
  it('toggles between lessons and quizzes', async () => {
    const user = userEvent.setup();
    const lessons: Lesson[] = [
      {
        id: 'lesson-1',
        moduleId: 'module-1',
        title: 'L1',
        description: 'Desc',
        duration: 10,
        order: 1,
        status: LessonStatus.PUBLISHED,
      },
    ];
    const quizzes: Quiz[] = [
      {
        id: 'quiz-1',
        moduleId: 'module-1',
        title: 'Q1',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        nombreTentatives: 3,
        questions: [],
      },
    ];
    const lessonStatuses = new Map<string, LessonProgressStatus>([['lesson-1', 'CURRENT']]);
    const quizAvailability = new Map<string, boolean>([['quiz-1', true]]);
    const quizProgressMap = new Map<string, QuizProgressDTO>();

    render(
      <ModuleTabs
        moduleId='module-1'
        lessons={lessons}
        totalLessons={1}
        quizzes={quizzes}
        lessonStatuses={lessonStatuses}
        quizAvailability={quizAvailability}
        quizProgressMap={quizProgressMap}
        startedLessonIds={new Set()}
      />
    );

    expect(screen.getByTestId('lesson-list')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-list')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /quiz/i }));

    expect(screen.getByTestId('quiz-list')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /leçons/i }));
    expect(screen.getByTestId('lesson-list')).toBeInTheDocument();
  });
});

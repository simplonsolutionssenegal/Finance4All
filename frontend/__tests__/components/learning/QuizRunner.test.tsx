import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import QuizRunner from '@/components/learning/QuizRunner';
import { TypeQuestion, type QuestionDTO } from '@/types/learning/lesson';

const submitAttemptMock = jest.fn();
const pushMock = jest.fn();
const progressState = { remainingAttempts: 2, hasPassed: false };

jest.mock('@/hooks/quiz/useSubmitQuizAttempt', () => ({
  useSubmitQuizAttempt: () => ({
    submitAttempt: submitAttemptMock,
    isSubmitting: false,
    error: null,
  }),
}));

jest.mock('@/hooks/quiz/useGetQuizProgress', () => ({
  useGetQuizProgress: () => ({
    progress: progressState,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('QuizRunner', () => {
  beforeEach(() => {
    submitAttemptMock.mockReset();
    pushMock.mockReset();
    progressState.remainingAttempts = 2;
    progressState.hasPassed = false;
  });

  it('requires a selection before submitting and highlights correct answers', async () => {
    const user = userEvent.setup();
    const questions: QuestionDTO[] = [
      {
        question: 'Quelle est la réponse correcte ?',
        type: TypeQuestion.CHOIX_UNIQUE,
        points: 1,
        options: [
          { text: 'Bonne', isCorrect: true },
          { text: 'Mauvaise', isCorrect: false },
        ],
        explication: 'La réponse correcte est la première.',
      },
    ];

    submitAttemptMock.mockResolvedValue({
      success: true,
      data: {
        id: 'attempt-1',
        quizId: 'quiz-1',
        userId: 'user-1',
        attemptNumber: 1,
        earnedPoints: 0,
        totalPoints: 1,
        scorePercent: 0,
        isPassed: false,
        answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        maxAttempts: 3,
        remainingAttempts: 2,
        hasPassedQuiz: false,
      },
    });

    render(
      <QuizRunner
        moduleId='module-1'
        quiz={{
          id: 'quiz-1',
          title: 'Quiz Test',
          description: 'Desc',
          scoreMinimum: 60,
          questions,
        }}
        afterSuccessRedirect='/learning'
      />
    );

    const finishButton = screen.getByRole('button', { name: /terminer/i });
    expect(finishButton).toBeDisabled();

    await user.click(screen.getByLabelText('Mauvaise'));
    expect(finishButton).not.toBeDisabled();

    await user.click(finishButton);

    await waitFor(() => {
      expect(screen.getByText(/quiz non réussi/i)).toBeInTheDocument();
    });

    expect(submitAttemptMock).toHaveBeenCalledWith([
      {
        questionIndex: 0,
        selectedOptionIndexes: [1],
      },
    ]);

    expect(screen.getByText(/bonne réponse/i)).toBeInTheDocument();
    expect(screen.getByText(/votre réponse/i)).toBeInTheDocument();
  });

  it('supports multi-select and prev/next navigation', async () => {
    const user = userEvent.setup();
    const questions: QuestionDTO[] = [
      {
        question: 'Question multiple',
        type: TypeQuestion.CHOIX_MULTIPLE,
        points: 1,
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
        ],
      },
      {
        question: 'Question suivante',
        type: TypeQuestion.CHOIX_UNIQUE,
        points: 1,
        options: [
          { text: 'Option C', isCorrect: true },
          { text: 'Option D', isCorrect: false },
        ],
      },
    ];

    render(
      <QuizRunner
        moduleId='module-1'
        quiz={{
          id: 'quiz-2',
          title: 'Quiz Multi',
          description: 'Desc',
          scoreMinimum: 60,
          questions,
        }}
        afterSuccessRedirect='/learning'
      />
    );

    const nextButton = screen.getByRole('button', { name: /suivant/i });
    expect(nextButton).toBeDisabled();

    await user.click(screen.getByLabelText('Option A'));
    expect(nextButton).not.toBeDisabled();

    await user.click(screen.getByLabelText('Option A'));
    expect(nextButton).toBeDisabled();

    await user.click(screen.getByLabelText('Option B'));
    await user.click(nextButton);

    expect(screen.getByText(/question suivante/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /précédent/i }));
    expect(screen.getByText(/question multiple/i)).toBeInTheDocument();
  });

  it('shows an error message when submission fails', async () => {
    const user = userEvent.setup();
    const questions: QuestionDTO[] = [
      {
        question: 'Question unique',
        type: TypeQuestion.CHOIX_UNIQUE,
        points: 1,
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
        ],
      },
    ];

    submitAttemptMock.mockResolvedValue({
      success: false,
      message: 'Erreur de soumission',
    });

    render(
      <QuizRunner
        moduleId='module-1'
        quiz={{
          id: 'quiz-3',
          title: 'Quiz Erreur',
          description: 'Desc',
          scoreMinimum: 60,
          questions,
        }}
        afterSuccessRedirect='/learning'
      />
    );

    await user.click(screen.getByLabelText('Option A'));
    await user.click(screen.getByRole('button', { name: /terminer/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erreur de soumission');
    });
  });

  it('allows retrying after a failed attempt', async () => {
    const user = userEvent.setup();
    const questions: QuestionDTO[] = [
      {
        question: 'Question unique',
        type: TypeQuestion.CHOIX_UNIQUE,
        points: 1,
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
        ],
      },
    ];

    submitAttemptMock.mockResolvedValue({
      success: true,
      data: {
        id: 'attempt-2',
        quizId: 'quiz-4',
        userId: 'user-1',
        attemptNumber: 1,
        earnedPoints: 0,
        totalPoints: 1,
        scorePercent: 0,
        isPassed: false,
        answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        maxAttempts: 3,
        remainingAttempts: 2,
        hasPassedQuiz: false,
      },
    });

    render(
      <QuizRunner
        moduleId='module-1'
        quiz={{
          id: 'quiz-4',
          title: 'Quiz Retry',
          description: 'Desc',
          scoreMinimum: 60,
          questions,
        }}
        afterSuccessRedirect='/learning'
      />
    );

    await user.click(screen.getByLabelText('Option B'));
    await user.click(screen.getByRole('button', { name: /terminer/i }));

    await waitFor(() => {
      expect(screen.getByText(/quiz non réussi/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /réessayer/i }));

    expect(screen.getByText(/question unique/i)).toBeInTheDocument();
  });

  it('redirects after a successful quiz', async () => {
    const user = userEvent.setup();
    const questions: QuestionDTO[] = [
      {
        question: 'Question unique',
        type: TypeQuestion.CHOIX_UNIQUE,
        points: 1,
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
        ],
      },
    ];

    submitAttemptMock.mockResolvedValue({
      success: true,
      data: {
        id: 'attempt-3',
        quizId: 'quiz-5',
        userId: 'user-1',
        attemptNumber: 1,
        earnedPoints: 1,
        totalPoints: 1,
        scorePercent: 100,
        isPassed: true,
        answers: [{ questionIndex: 0, selectedOptionIndexes: [0] }],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        maxAttempts: 3,
        remainingAttempts: 2,
        hasPassedQuiz: true,
      },
    });

    render(
      <QuizRunner
        moduleId='module-1'
        quiz={{
          id: 'quiz-5',
          title: 'Quiz Passed',
          description: 'Desc',
          scoreMinimum: 60,
          questions,
        }}
        afterSuccessRedirect='/learning'
      />
    );

    await user.click(screen.getByLabelText('Option A'));
    await user.click(screen.getByRole('button', { name: /terminer/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continuer/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /continuer/i }));

    expect(pushMock).toHaveBeenCalledWith('/learning');
  });

  it('shows an empty state when the quiz has no questions', () => {
    render(
      <QuizRunner
        moduleId='module-1'
        quiz={{
          id: 'quiz-empty',
          title: 'Quiz Vide',
          description: 'Desc',
          scoreMinimum: 60,
          questions: [],
        }}
        afterSuccessRedirect='/learning'
      />
    );

    expect(screen.getByText(/aucune question dans ce quiz/i)).toBeInTheDocument();
  });

  it('shows a warning when no attempts are left', () => {
    progressState.remainingAttempts = 0;
    progressState.hasPassed = false;

    render(
      <QuizRunner
        moduleId='module-1'
        quiz={{
          id: 'quiz-no-attempts',
          title: 'Quiz',
          description: 'Desc',
          scoreMinimum: 60,
          questions: [
            {
              question: 'Question unique',
              type: TypeQuestion.CHOIX_UNIQUE,
              points: 1,
              options: [
                { text: 'Option A', isCorrect: true },
                { text: 'Option B', isCorrect: false },
              ],
            },
          ],
        }}
        afterSuccessRedirect='/learning'
      />
    );

    expect(
      screen.getByText(/nombre maximal de tentatives atteint pour ce quiz/i)
    ).toBeInTheDocument();
  });

  it('renders result view for multiple question types', async () => {
    const user = userEvent.setup();
    const questions: QuestionDTO[] = [
      {
        question: 'Question multiple',
        type: TypeQuestion.CHOIX_MULTIPLE,
        points: 1,
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
        ],
      },
      {
        question: 'Question unique',
        type: TypeQuestion.CHOIX_UNIQUE,
        points: 1,
        options: [
          { text: 'Option C', isCorrect: true },
          { text: 'Option D', isCorrect: false },
        ],
      },
    ];

    submitAttemptMock.mockResolvedValue({
      success: true,
      data: {
        id: 'attempt-4',
        quizId: 'quiz-multi',
        userId: 'user-1',
        attemptNumber: 1,
        earnedPoints: 1,
        totalPoints: 2,
        scorePercent: 50,
        isPassed: false,
        answers: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        maxAttempts: 3,
        remainingAttempts: 2,
        hasPassedQuiz: false,
      },
    });

    render(
      <QuizRunner
        moduleId='module-1'
        quiz={{
          id: 'quiz-multi',
          title: 'Quiz Mixte',
          description: 'Desc',
          scoreMinimum: 60,
          questions,
        }}
        afterSuccessRedirect='/learning'
      />
    );

    await user.click(screen.getByLabelText('Option A'));
    await user.click(screen.getByRole('button', { name: /suivant/i }));
    await user.click(screen.getByLabelText('Option C'));
    await user.click(screen.getByRole('button', { name: /terminer/i }));

    await waitFor(() => {
      expect(screen.getByText(/quiz non réussi/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/choix multiple/i)).toBeInTheDocument();
    expect(screen.getByText(/choix unique/i)).toBeInTheDocument();
  });
});

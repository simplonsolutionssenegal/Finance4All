/**
 * @jest-environment jsdom
 */

import { auth } from '@clerk/nextjs/server';
import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';

import QuizPage from '@/app/(auth)/learning/[moduleId]/quiz/[quizId]/page';
import QuizPageClient from '@/components/learning/QuizPageClient';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

jest.mock('@/components/learning/QuizPageClient', () => {
  return jest.fn(() => <div data-testid='quiz-page' />);
});

describe('Quiz page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirige vers /login si non authentifié', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

    await expect(
      QuizPage({ params: Promise.resolve({ moduleId: 'module-1', quizId: 'quiz-1' }) })
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('rend QuizPageClient avec moduleId et quizId', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user-1' });

    const result = await QuizPage({
      params: Promise.resolve({ moduleId: 'module-1', quizId: 'quiz-1' }),
    });

    render(result);

    expect(QuizPageClient).toHaveBeenCalledWith(
      { moduleId: 'module-1', quizId: 'quiz-1' },
      undefined
    );
  });
});

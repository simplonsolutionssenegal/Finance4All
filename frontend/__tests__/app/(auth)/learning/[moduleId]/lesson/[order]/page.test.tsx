/**
 * @jest-environment jsdom
 */

import { auth } from '@clerk/nextjs/server';
import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';

import LessonPage from '@/app/(auth)/learning/[moduleId]/lesson/[order]/page';
import LessonPageClient from '@/components/learning/LessonPageClient';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

jest.mock('@/components/learning/LessonPageClient', () => {
  return jest.fn(() => <div data-testid='lesson-page' />);
});

describe('Lesson page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirige vers /login si non authentifié', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

    await expect(
      LessonPage({ params: Promise.resolve({ moduleId: 'module-1', order: '2' }) })
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('rend LessonPageClient avec moduleId et order', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user-1' });

    const result = await LessonPage({
      params: Promise.resolve({ moduleId: 'module-1', order: '2' }),
    });

    render(result);

    expect(LessonPageClient).toHaveBeenCalledWith({ moduleId: 'module-1', order: 2 }, undefined);
  });

  it('fallback order=1 si order invalide', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user-1' });

    const result = await LessonPage({
      params: Promise.resolve({ moduleId: 'module-1', order: 'abc' }),
    });

    render(result);

    expect(LessonPageClient).toHaveBeenCalledWith({ moduleId: 'module-1', order: 1 }, undefined);
  });
});

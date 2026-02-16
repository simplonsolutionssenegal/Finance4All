/**
 * @jest-environment jsdom
 */

import { auth } from '@clerk/nextjs/server';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';

import ModulePage from '@/app/(auth)/learning/[moduleId]/page';
import ModuleDetailClient from '@/components/learning/ModuleDetailClient';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

jest.mock('@/components/learning/ModuleDetailClient', () => {
  return jest.fn(() => <div data-testid='module-detail' />);
});

describe('Module detail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirige vers /login si non authentifié', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

    await expect(ModulePage({ params: Promise.resolve({ moduleId: 'module-1' }) })).rejects.toThrow(
      'NEXT_REDIRECT'
    );

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('rend ModuleDetailClient avec moduleId quand utilisateur connecté', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user-1' });

    const result = await ModulePage({
      params: Promise.resolve({ moduleId: 'module-1' }),
    });

    render(result);

    expect(ModuleDetailClient).toHaveBeenCalledWith({ moduleId: 'module-1' }, undefined);
    expect(screen.getByTestId('module-detail')).toBeInTheDocument();
  });

  it('affiche Module introuvable quand moduleId est vide', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user-1' });

    const result = await ModulePage({
      params: Promise.resolve({ moduleId: '' }),
    });

    render(result);

    expect(screen.getByText(/Module introuvable/)).toBeInTheDocument();
    expect(ModuleDetailClient).not.toHaveBeenCalled();
  });
});

/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';

import ModulePage from '@/app/(auth)/learning/[moduleId]/page';
import ModuleDetailClient from '@/components/learning/ModuleDetailClient';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/components/learning/ModuleDetailClient', () => {
  return jest.fn(() => <div data-testid='module-detail' />);
});

const { useUser } = require('@clerk/nextjs');
const { useParams } = require('next/navigation');

describe('Module detail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ moduleId: 'module-1' });
  });

  it('redirige vers /login si non authentifié', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: true });

    render(<ModulePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('affiche Chargement quand Clerk n’est pas chargé', () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: false });

    render(<ModulePage />);

    expect(screen.getByText(/Chargement/)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('rend ModuleDetailClient avec moduleId quand utilisateur connecté', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: true,
    });

    render(<ModulePage />);

    expect(ModuleDetailClient).toHaveBeenCalledWith({ moduleId: 'module-1' }, undefined);
    expect(screen.getByTestId('module-detail')).toBeInTheDocument();
  });

  it('affiche Module introuvable quand moduleId est vide', () => {
    (useParams as jest.Mock).mockReturnValue({ moduleId: '' });
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: true,
    });

    render(<ModulePage />);

    expect(screen.getByText(/Module introuvable/)).toBeInTheDocument();
    expect(ModuleDetailClient).not.toHaveBeenCalled();
  });
});

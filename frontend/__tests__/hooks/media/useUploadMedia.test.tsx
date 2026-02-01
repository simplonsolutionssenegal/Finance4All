// __tests__/hooks/media/useUploadMedia.test.tsx
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useUploadMedia } from '@/hooks/media/useUploadMedia';

// ---- Mocks externes ----
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { useAuth } = require('@clerk/nextjs');
const { useLoader } = require('@/contexts/LoaderContext');
const { toast } = require('sonner');

function makeQueryWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function ensureFilePolyfill() {
  if (typeof (global as any).File === 'undefined') {
    class PolyFile extends Blob {
      name: string;
      lastModified: number;
      constructor(parts: any[], name: string, options?: any) {
        super(parts, options);
        this.name = name;
        this.lastModified = Date.now();
      }
    }
    (global as any).File = PolyFile;
  }
}

function mockFetchOnce({ ok, json }: { ok: boolean; json: any }) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => json,
  });
}

describe('useUploadMedia', () => {
  const mockGetToken = jest.fn();
  const showLoader = jest.fn();
  const hideLoader = jest.fn();

  beforeAll(() => {
    ensureFilePolyfill();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();

    useAuth.mockReturnValue({ getToken: mockGetToken });
    useLoader.mockReturnValue({ showLoader, hideLoader });
  });

  it('succès: show/hide loader + toast.success', async () => {
    mockGetToken.mockResolvedValueOnce('token-123');

    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
    const metadata = { moduleId: 'm1', chapterTempId: 'c1' };

    mockFetchOnce({
      ok: true,
      json: {
        success: true,
        data: {
          id: 'media-1',
          filename: 'x',
          originalName: 'test.pdf',
          mimeType: 'application/pdf',
          type: 'PDF',
          size: 123,
          url: 'http://x',
          bucket: 'b',
          path: 'p',
          metadata,
          isTemporary: true,
          expiresAt: null,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      },
    });

    const wrapper = makeQueryWrapper();
    const { result } = renderHook(() => useUploadMedia(), { wrapper });

    await result.current.mutateAsync({ file, metadata });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Fichier uploadé ✅');
  });

  // ✅ ---------------------------
  // ✅ TESTS ERREUR (corrigés)
  // ✅ ---------------------------

  it('erreur: res.ok=false => hideLoader + toast.error, mutateAsync rejette', async () => {
    mockGetToken.mockResolvedValueOnce('token-123');
    const file = new File(['x'], 'bad.pdf', { type: 'application/pdf' });

    mockFetchOnce({
      ok: false,
      json: { success: false, message: 'Bad request' },
    });

    const wrapper = makeQueryWrapper();
    const { result } = renderHook(() => useUploadMedia(), { wrapper });

    await expect(result.current.mutateAsync({ file })).rejects.toThrow('Bad request');

    // React Query peut exécuter onError/hideLoader un poil plus tard => waitFor
    await waitFor(() => expect(showLoader).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(hideLoader).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Upload échoué', {
        description: 'Bad request',
      })
    );
  });

  it('erreur: json.success=false même si ok=true => hideLoader + toast.error', async () => {
    mockGetToken.mockResolvedValueOnce('token-123');
    const file = new File(['x'], 'bad.pdf', { type: 'application/pdf' });

    mockFetchOnce({
      ok: true,
      json: { success: false, message: 'Upload refusé' },
    });

    const wrapper = makeQueryWrapper();
    const { result } = renderHook(() => useUploadMedia(), { wrapper });

    await expect(result.current.mutateAsync({ file })).rejects.toThrow('Upload refusé');

    await waitFor(() => expect(showLoader).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(hideLoader).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Upload échoué', {
        description: 'Upload refusé',
      })
    );
  });

  it('erreur: data manquant => "Réponse upload invalide: data manquant"', async () => {
    mockGetToken.mockResolvedValueOnce('token-123');
    const file = new File(['x'], 'bad.pdf', { type: 'application/pdf' });

    mockFetchOnce({
      ok: true,
      json: { success: true, data: undefined },
    });

    const wrapper = makeQueryWrapper();
    const { result } = renderHook(() => useUploadMedia(), { wrapper });

    await expect(result.current.mutateAsync({ file })).rejects.toThrow(
      'Réponse upload invalide: data manquant'
    );

    await waitFor(() => expect(showLoader).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(hideLoader).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Upload échoué', {
        description: 'Réponse upload invalide: data manquant',
      })
    );
  });
});

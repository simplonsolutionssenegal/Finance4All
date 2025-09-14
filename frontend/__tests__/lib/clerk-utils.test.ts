import { useOrganization } from '@clerk/nextjs';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { useRemoveUserFromOrganization } from '@/lib/clerk-utils';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useOrganization: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

const useOrganizationMock = useOrganization as jest.Mock;
const useLoaderMock = useLoader as jest.Mock;
const toastSuccessMock = toast.success as jest.Mock;
const toastErrorMock = toast.error as jest.Mock;
const fetchMock = global.fetch as jest.Mock;

const mockShowLoader = jest.fn();
const mockHideLoader = jest.fn();

describe('useRemoveUserFromOrganization', () => {
  const userId = 'user_123';
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    useLoaderMock.mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should throw error if no active organization', async () => {
    useOrganizationMock.mockReturnValue({ organization: null });
    const { result } = renderHook(() => useRemoveUserFromOrganization());

    await expect(result.current.removeUser(userId)).rejects.toThrow('Aucune organisation active');
    expect(toastErrorMock).toHaveBeenCalledWith('Aucune organisation active');
    expect(mockShowLoader).not.toHaveBeenCalled();
  });

  it('should handle successful user removal via API', async () => {
    const mockOrganization = { id: 'org_123', removeMember: jest.fn() };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useRemoveUserFromOrganization());
    
    let hookResult;
    await act(async () => {
      hookResult = await result.current.removeUser(userId);
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Utilisateur supprimé avec succès',
      expect.any(Object)
    );
    expect(hookResult).toEqual({ success: true });
  });

  it('should trigger fallback if API response is not ok', async () => {
    const mockOrganization = { id: 'org_123', removeMember: jest.fn().mockResolvedValueOnce({}) };
    const primaryError = { message: 'API error' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => (primaryError),
    });

    const { result } = renderHook(() => useRemoveUserFromOrganization());

    await act(async () => {
      await result.current.removeUser(userId);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockOrganization.removeMember).toHaveBeenCalledWith(userId);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Utilisateur retiré de l'organisation",
      expect.any(Object)
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur lors de la tentative principale de suppression, passage au fallback:", primaryError);
  });

  it('should trigger fallback if API call succeeds but operation fails', async () => {
    const mockOrganization = { id: 'org_123', removeMember: jest.fn().mockResolvedValueOnce({}) };
    const primaryError = { success: false, message: 'Operation failed' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => (primaryError),
    });

    const { result } = renderHook(() => useRemoveUserFromOrganization());

    await act(async () => {
      await result.current.removeUser(userId);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockOrganization.removeMember).toHaveBeenCalledWith(userId);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Utilisateur retiré de l'organisation",
      expect.any(Object)
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur lors de la tentative principale de suppression, passage au fallback:", primaryError);
  });
  
  it('should trigger fallback on network error', async () => {
    const mockOrganization = { id: 'org_123', removeMember: jest.fn().mockResolvedValueOnce({}) };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    const networkError = new Error('Network failure');
    fetchMock.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useRemoveUserFromOrganization());

    await act(async () => {
      await result.current.removeUser(userId);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockOrganization.removeMember).toHaveBeenCalledWith(userId);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur lors de la tentative principale de suppression, passage au fallback:", networkError);
  });

  it('should handle fallback failure', async () => {
    const fallbackError = new Error('Clerk API failed');
    const mockOrganization = { id: 'org_123', removeMember: jest.fn().mockRejectedValue(fallbackError) };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'API error' }),
    });

    const { result } = renderHook(() => useRemoveUserFromOrganization());

    await act(async () => {
      await expect(result.current.removeUser(userId)).rejects.toThrow('Impossible de supprimer l\'utilisateur après plusieurs tentatives.');
    });
    expect(mockHideLoader).toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith(
      'Échec de la suppression',
      expect.any(Object)
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur lors du fallback de suppression:", fallbackError);
  });
});

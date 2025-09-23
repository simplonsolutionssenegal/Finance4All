import { useOrganization, useAuth } from '@clerk/nextjs';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { useRemoveUserFromOrganization, useUpdateUserRole, useCreateUser } from '@/lib/clerk-utils';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useOrganization: jest.fn(),
  useAuth: jest.fn(),
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
const useAuthMock = useAuth as jest.Mock;
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
      json: async () => primaryError,
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
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la tentative principale de suppression, passage au fallback:',
      primaryError
    );
  });

  it('should trigger fallback if API call succeeds but operation fails', async () => {
    const mockOrganization = { id: 'org_123', removeMember: jest.fn().mockResolvedValueOnce({}) };
    const primaryError = { success: false, message: 'Operation failed' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => primaryError,
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
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la tentative principale de suppression, passage au fallback:',
      primaryError
    );
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
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la tentative principale de suppression, passage au fallback:',
      networkError
    );
  });

  it('should handle fallback failure', async () => {
    const fallbackError = new Error('Clerk API failed');
    const mockOrganization = {
      id: 'org_123',
      removeMember: jest.fn().mockRejectedValue(fallbackError),
    };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'API error' }),
    });

    const { result } = renderHook(() => useRemoveUserFromOrganization());

    await act(async () => {
      await expect(result.current.removeUser(userId)).rejects.toThrow(
        "Impossible de supprimer l'utilisateur après plusieurs tentatives."
      );
    });
    expect(mockHideLoader).toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith('Échec de la suppression', expect.any(Object));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors du fallback de suppression:',
      fallbackError
    );
  });

  it('should handle fallback failure when organization is gone', async () => {
    const fallbackError = new Error('Clerk API failed during fallback');
    const mockOrganization = {
      id: 'org_123',
      removeMember: jest.fn().mockRejectedValue(fallbackError),
    };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    const { result } = renderHook(() => useRemoveUserFromOrganization());

    await act(async () => {
      await expect(result.current.removeUser(userId)).rejects.toThrow(
        "Impossible de supprimer l'utilisateur après plusieurs tentatives."
      );
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors du fallback de suppression:',
      fallbackError
    );
  });
});

describe('useUpdateUserRole', () => {
  const userId = 'user_123';
  const newRole = 'org:admin';
  let consoleErrorSpy: jest.SpyInstance;
  const mockGetToken = jest.fn();
  const mockReload = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockReload.mockClear();
    useLoaderMock.mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    });
    useAuthMock.mockReturnValue({
      getToken: mockGetToken,
    });
    mockGetToken.mockResolvedValue('mock_token');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    jest.clearAllTimers();
  });

  it('should throw error if no active organization', async () => {
    useOrganizationMock.mockReturnValue({ organization: null });
    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    await expect(result.current.updateUserRole(userId, newRole)).rejects.toThrow(
      'Aucune organisation active'
    );
    expect(toastErrorMock).toHaveBeenCalledWith('Aucune organisation active');
    expect(mockShowLoader).not.toHaveBeenCalled();
  });

  it('should handle successful role update via API', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    let hookResult;
    await act(async () => {
      hookResult = await result.current.updateUserRole(userId, newRole);
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users/user_123'),
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_token',
        },
        body: JSON.stringify({
          organizationId: 'org_123',
          role: 'org:admin',
        }),
      })
    );
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Rôle mis à jour avec succès',
      expect.objectContaining({
        description: "Le rôle de l'utilisateur a été modifié vers Admin.",
      })
    );
    expect(hookResult).toEqual({ success: true });

    // Fast-forward timers to trigger window.location.reload
    jest.runAllTimers();
    expect(mockReload).toHaveBeenCalled();
  });

  it('should handle member role update correctly', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    await act(async () => {
      await result.current.updateUserRole(userId, 'org:member');
    });

    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Rôle mis à jour avec succès',
      expect.objectContaining({
        description: "Le rôle de l'utilisateur a été modifié vers Member.",
      })
    );
  });

  it('should trigger fallback if API response is not ok', async () => {
    const mockOrganization = {
      id: 'org_123',
      updateMember: jest.fn().mockResolvedValueOnce({}),
    };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'API error' }),
    });

    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    await act(async () => {
      await result.current.updateUserRole(userId, newRole);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockOrganization.updateMember).toHaveBeenCalledWith({
      userId: 'user_123',
      role: 'org:admin',
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Rôle mis à jour avec succès',
      expect.any(Object)
    );
  });

  it('should trigger fallback if API call succeeds but operation fails', async () => {
    const mockOrganization = {
      id: 'org_123',
      updateMember: jest.fn().mockResolvedValueOnce({}),
    };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: 'Operation failed' }),
    });

    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    await act(async () => {
      await result.current.updateUserRole(userId, newRole);
    });

    expect(mockOrganization.updateMember).toHaveBeenCalledWith({
      userId: 'user_123',
      role: 'org:admin',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la tentative principale de mise à jour, passage au fallback:',
      expect.objectContaining({ success: false, message: 'Operation failed' })
    );
  });

  it('should handle network errors by triggering fallback', async () => {
    const mockOrganization = {
      id: 'org_123',
      updateMember: jest.fn().mockResolvedValueOnce({}),
    };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    const networkError = new Error('Network failure');
    fetchMock.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    await act(async () => {
      await result.current.updateUserRole(userId, newRole);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockOrganization.updateMember).toHaveBeenCalledWith({
      userId: 'user_123',
      role: 'org:admin',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la tentative principale de mise à jour, passage au fallback:',
      networkError
    );
  });

  it('should handle fallback failure', async () => {
    const fallbackError = new Error('Clerk API failed');
    const mockOrganization = {
      id: 'org_123',
      updateMember: jest.fn().mockRejectedValue(fallbackError),
    };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'API error' }),
    });

    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    await act(async () => {
      await expect(result.current.updateUserRole(userId, newRole)).rejects.toThrow(
        'Impossible de mettre à jour le rôle après plusieurs tentatives.'
      );
    });

    expect(mockHideLoader).toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith(
      'Échec de la mise à jour',
      expect.objectContaining({
        description: "Impossible de mettre à jour le rôle de l'utilisateur. Veuillez réessayer.",
      })
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors du fallback de mise à jour:',
      fallbackError
    );
  });

  it('should handle fallback failure when organization is gone', async () => {
    const fallbackError = new Error('Clerk API failed during fallback');
    const mockOrganization = {
      id: 'org_123',
      updateMember: jest.fn().mockRejectedValue(fallbackError),
    };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    await act(async () => {
      await expect(result.current.updateUserRole(userId, newRole)).rejects.toThrow(
        'Impossible de mettre à jour le rôle après plusieurs tentatives.'
      );
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors du fallback de mise à jour:',
      fallbackError
    );
  });

  it('should work without auth token', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    mockGetToken.mockResolvedValue(null);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useUpdateUserRole({ reloadFn: mockReload }));

    await act(async () => {
      await result.current.updateUserRole(userId, newRole);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users/user_123'),
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Should not have Authorization header
        },
        body: JSON.stringify({
          organizationId: 'org_123',
          role: 'org:admin',
        }),
      })
    );
  });
});

describe('useCreateUser', () => {
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'org:member',
  };
  let consoleErrorSpy: jest.SpyInstance;
  const mockGetToken = jest.fn();
  const mockReload = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useLoaderMock.mockReturnValue({ showLoader: mockShowLoader, hideLoader: mockHideLoader });
    useAuthMock.mockReturnValue({ getToken: mockGetToken });
    mockGetToken.mockResolvedValue('mock_token');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    jest.clearAllTimers();
  });

  it('should throw error if no active organization', async () => {
    useOrganizationMock.mockReturnValue({ organization: null });
    const { result } = renderHook(() => useCreateUser({ reloadFn: mockReload }));

    await expect(result.current.createUser(userData)).rejects.toThrow('Aucune organisation active');
    expect(toastErrorMock).toHaveBeenCalledWith('Aucune organisation active');
    expect(mockShowLoader).not.toHaveBeenCalled();
  });

  it('should handle successful user creation', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() => useCreateUser({ reloadFn: mockReload }));

    let hookResult;
    await act(async () => {
      hookResult = await result.current.createUser(userData);
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Utilisateur créé avec succès',
      expect.any(Object)
    );
    expect(hookResult).toEqual({ success: true });

    jest.runAllTimers();
    expect(mockReload).toHaveBeenCalled();
  });

  it('should handle API failure', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Invalid data' }),
    });

    const { result } = renderHook(() => useCreateUser({ reloadFn: mockReload }));

    await act(async () => {
      await expect(result.current.createUser(userData)).rejects.toThrow('Invalid data');
    });

    expect(mockHideLoader).toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith('Échec de la création', expect.any(Object));
  });

  it('should handle API success but operation failure', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: 'User already exists' }),
    });

    const { result } = renderHook(() => useCreateUser({ reloadFn: mockReload }));

    await act(async () => {
      await expect(result.current.createUser(userData)).rejects.toThrow('User already exists');
    });

    expect(mockHideLoader).toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith('Échec de la création', expect.any(Object));
  });

  it('should handle non-json error response', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useCreateUser({ reloadFn: mockReload }));

    await act(async () => {
      await expect(result.current.createUser(userData)).rejects.toThrow(
        'Erreur HTTP 500: Internal Server Error'
      );
    });

    expect(mockHideLoader).toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith('Échec de la création', expect.any(Object));
  });

  it('should handle network error', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    const networkError = new Error('Network failure');
    fetchMock.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useCreateUser({ reloadFn: mockReload }));

    await act(async () => {
      await expect(result.current.createUser(userData)).rejects.toThrow('Network failure');
    });

    expect(mockHideLoader).toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith('Échec de la création', expect.any(Object));
  });

  it('should work without auth token', async () => {
    const mockOrganization = { id: 'org_123' };
    useOrganizationMock.mockReturnValue({ organization: mockOrganization });
    mockGetToken.mockResolvedValue(null);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() => useCreateUser({ reloadFn: mockReload }));

    await act(async () => {
      await result.current.createUser(userData);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
});

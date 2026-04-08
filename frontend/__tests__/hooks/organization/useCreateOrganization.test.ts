import { act, renderHook, waitFor } from '@testing-library/react';

import { useCreateOrganization } from '@/hooks/organization/useCreateOrganization';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockToast = require('sonner').toast;

describe('useCreateOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const validData = {
    name: 'Test Org',
    country: 'Sénégal',
    adminFirstName: 'John',
    adminLastName: 'Doe',
    adminEmail: 'john@example.com',
  };

  it('should initialize with isCreating false', () => {
    const { result } = renderHook(() => useCreateOrganization());
    expect(result.current.isCreating).toBe(false);
  });

  it('should create organization successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Organisation créée avec succès',
      data: { organizationId: 'org_123', organizationName: 'Test Org', adminUserId: 'user_123' },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useCreateOrganization({ onSuccess }));

    let createResult: { success: boolean };
    await act(async () => {
      createResult = await result.current.createOrganization(validData);
    });

    expect(createResult!.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validData),
    });
    expect(mockToast.success).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should handle API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Une organisation avec ce nom existe déjà' }),
    });

    const { result } = renderHook(() => useCreateOrganization());
    let createResult: { success: boolean };
    await act(async () => {
      createResult = await result.current.createOrganization(validData);
    });

    expect(createResult!.success).toBe(false);
    expect(mockToast.error).toHaveBeenCalled();
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCreateOrganization());
    let createResult: { success: boolean };
    await act(async () => {
      createResult = await result.current.createOrganization(validData);
    });

    expect(createResult!.success).toBe(false);
    expect(mockToast.error).toHaveBeenCalled();
  });
});

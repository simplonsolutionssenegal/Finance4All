import { act, renderHook } from '@testing-library/react';

import { useAddMember } from '@/hooks/organization/useAddMember';

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue('mock-token'),
  })),
  useOrganization: jest.fn(() => ({
    organization: { id: 'org_123', name: 'Test Org' },
  })),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockToast = require('sonner').toast;
const mockUseOrganization = require('@clerk/nextjs').useOrganization;

describe('useAddMember', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const validData = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: 'org:member',
  };

  it('should initialize with isAdding false', () => {
    const { result } = renderHook(() => useAddMember());
    expect(result.current.isAdding).toBe(false);
  });

  it('should add member successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useAddMember({ onSuccess }));

    let addResult: { success: boolean };
    await act(async () => {
      addResult = await result.current.addMember(validData);
    });

    expect(addResult!.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'org:member',
          organizationId: 'org_123',
        }),
      })
    );
    expect(mockToast.success).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should fail when no organization is active', async () => {
    mockUseOrganization.mockReturnValue({ organization: null });

    const { result } = renderHook(() => useAddMember());

    let addResult: { success: boolean };
    await act(async () => {
      addResult = await result.current.addMember(validData);
    });

    expect(addResult!.success).toBe(false);
    expect(mockToast.error).toHaveBeenCalledWith('Aucune organisation active');
  });

  it('should handle API error', async () => {
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123', name: 'Test Org' },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Email déjà utilisé' }),
    });

    const { result } = renderHook(() => useAddMember());

    let addResult: { success: boolean };
    await act(async () => {
      addResult = await result.current.addMember(validData);
    });

    expect(addResult!.success).toBe(false);
    expect(mockToast.error).toHaveBeenCalled();
  });
});

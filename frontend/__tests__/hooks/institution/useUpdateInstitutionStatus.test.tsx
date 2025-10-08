import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { useUpdateInstitutionStatus } from '@/hooks/institution/useUpdateInstitutionStatus';
import { apiClient } from '@/lib/api-client';

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

jest.mock('@/lib/api-client');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useUpdateInstitutionStatus', () => {
  const mockGetToken = jest.fn().mockResolvedValue('fake-token');
  const mockShowLoader = jest.fn();
  const mockHideLoader = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ getToken: mockGetToken });
    (useLoader as jest.Mock).mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    });
    jest.clearAllMocks();
  });

  describe('activateInstitution', () => {
    it('should handle successful activation', async () => {
      (apiClient as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(
        () => useUpdateInstitutionStatus({ onSuccess: mockOnSuccess }),
        {
          wrapper,
        }
      );

      result.current.activateInstitution('inst-123');

      await waitFor(() => expect(mockShowLoader).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(mockGetToken).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(apiClient).toHaveBeenCalledWith(
          'institutions/inst-123/activate',
          'PATCH',
          'fake-token'
        )
      );
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Institution activée avec succès!')
      );
      await waitFor(() => expect(mockOnSuccess).toHaveBeenCalledTimes(1));
    });

    it('should handle failed activation from API', async () => {
      (apiClient as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Activation failed',
      });

      const { result } = renderHook(() => useUpdateInstitutionStatus(), { wrapper });

      result.current.activateInstitution('inst-123');

      await waitFor(() => expect(mockHideLoader).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
          description: 'Activation failed',
        })
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should handle activation error', async () => {
      const error = new Error('Network error');
      (apiClient as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateInstitutionStatus(), { wrapper });

      result.current.activateInstitution('inst-123');

      await waitFor(() => expect(mockHideLoader).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
          description: 'Network error',
        })
      );
    });
  });

  describe('deactivateInstitution', () => {
    it('should handle successful deactivation', async () => {
      (apiClient as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useUpdateInstitutionStatus(), { wrapper });

      result.current.deactivateInstitution('inst-456');

      await waitFor(() => expect(mockShowLoader).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(mockGetToken).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(apiClient).toHaveBeenCalledWith(
          'institutions/inst-456/desactivate',
          'PATCH',
          'fake-token'
        )
      );
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Institution désactivée avec succès!')
      );
    });

    it('should handle failed deactivation from API', async () => {
      (apiClient as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Deactivation failed',
      });

      const { result } = renderHook(() => useUpdateInstitutionStatus(), { wrapper });

      result.current.deactivateInstitution('inst-456');

      await waitFor(() => expect(mockHideLoader).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
          description: 'Deactivation failed',
        })
      );
    });

    it('should handle deactivation error with default message', async () => {
      const error = new Error(); // Error without a message
      (apiClient as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateInstitutionStatus(), { wrapper });

      result.current.deactivateInstitution('inst-456');

      await waitFor(() => expect(mockHideLoader).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
          description: 'An unexpected error occurred.',
        })
      );
    });
  });

  it('should return correct pending states', () => {
    const { result } = renderHook(() => useUpdateInstitutionStatus(), { wrapper });

    expect(result.current.isActivating).toBe(false);
    expect(result.current.isDeactivating).toBe(false);

    // Note: Testing the pending state is tricky with the immediate resolution in mocks.
    // A more complex setup with delayed mock responses would be needed to assert the true state during the mutation.
    // However, the logic is covered by react-query's own tests. We just check the initial state.
  });
});

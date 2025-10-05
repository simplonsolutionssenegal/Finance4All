import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { ClerkAcceptInvitation } from '@/components/clerk-accept-invitation';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockShowLoader = jest.fn();
const mockHideLoader = jest.fn();
const mockUpdateField = jest.fn();
const mockHasError = jest.fn();
const mockGetError = jest.fn();
const mockSetErrors = jest.fn();
const mockResetForm = jest.fn();

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: () => ({
    isLoading: false,
    showLoader: mockShowLoader,
    hideLoader: mockHideLoader,
  }),
}));

let mockFormState = {
  values: { password: '', confirmPassword: '' },
};

jest.mock('@/hooks/useFormState', () => ({
  useFormState: () => ({
    formState: mockFormState,
    updateField: mockUpdateField,
    hasError: mockHasError,
    getError: mockGetError,
    setErrors: mockSetErrors,
    resetForm: mockResetForm,
  }),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  pathname: '/accept-invitation',
  query: {},
  asPath: '/accept-invitation',
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('ClerkAcceptInvitation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockHasError.mockReturnValue(false);
    mockGetError.mockReturnValue(null);
    mockFormState = { values: { password: '', confirmPassword: '' } };

    // Mock successful invitation fetch
    mockFetch.mockImplementation(url => {
      if (url === '/api/get-invitation') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              invitation: {
                emailAddress: 'test@example.com',
                organizationName: 'Test Organization',
                publicMetadata: {
                  firstName: 'John',
                  lastName: 'Doe',
                },
              },
            }),
        } as unknown as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as unknown as Response);
    });
  });

  const defaultProps = {
    invitationId: 'inv_test123',
    orgId: 'org_test456',
  };

  it('renders the component with required props', () => {
    expect(() => render(<ClerkAcceptInvitation {...defaultProps} />)).not.toThrow();
  });

  it('fetches invitation data on mount', async () => {
    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/get-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: 'inv_test123',
          orgId: 'org_test456',
        }),
      });
    });

    expect(mockShowLoader).toHaveBeenCalled();
    expect(mockHideLoader).toHaveBeenCalled();
  });

  it('renders password input fields after data loads', async () => {
    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirmer le mot de passe')).toBeInTheDocument();
    });
  });

  it('displays organization name when available', async () => {
    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Test Organization/)).toBeInTheDocument();
    });
  });

  it('handles password validation errors', async () => {
    mockHasError.mockImplementation(field => field === 'password');
    mockGetError.mockImplementation(field =>
      field === 'password' ? 'Le mot de passe doit contenir au moins 8 caractères' : null
    );

    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText('Le mot de passe doit contenir au moins 8 caractères')
      ).toBeInTheDocument();
    });
  });

  it('handles confirm password validation errors', async () => {
    mockHasError.mockImplementation(field => field === 'confirmPassword');
    mockGetError.mockImplementation(field =>
      field === 'confirmPassword' ? 'Les mots de passe ne correspondent pas' : null
    );

    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
    });
  });

  it('calls updateField on password change', async () => {
    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });

    expect(mockUpdateField).toHaveBeenCalledWith('password', 'newPassword123');
  });

  it('calls updateField on confirm password change', async () => {
    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Confirmer le mot de passe')).toBeInTheDocument();
    });

    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });

    expect(mockUpdateField).toHaveBeenCalledWith('confirmPassword', 'newPassword123');
  });

  it('submits form with valid data', async () => {
    // Mock valid form state
    mockFormState.values = { password: 'ValidPassword123!', confirmPassword: 'ValidPassword123!' };

    mockFetch.mockImplementation(url => {
      if (url === '/api/get-invitation') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              invitation: {
                emailAddress: 'test@example.com',
                organizationName: 'Test Organization',
                publicMetadata: { firstName: 'John', lastName: 'Doe' },
              },
            }),
        } as unknown as Response);
      }
      if (url === '/api/accept-invitation') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as unknown as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as unknown as Response);
    });

    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    const form = screen.getByRole('button', { name: 'Créer mon compte' }).closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/accept-invitation',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"password":"ValidPassword123!"'),
        })
      );
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'API Error' }),
      } as unknown as Response)
    );

    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Impossible de charger les données de l'invitation/)
      ).toBeInTheDocument();
    });
  });

  it('disables form when invalid', async () => {
    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      const submitButton = screen.getByText('Créer mon compte');
      expect(submitButton).toBeDisabled();
    });
  });

  it('shows email field as disabled', async () => {
    render(<ClerkAcceptInvitation {...defaultProps} />);

    await waitFor(() => {
      const emailInput = screen.getByDisplayValue('test@example.com');
      expect(emailInput).toBeDisabled();
    });
  });

  it('handles missing invitation ID error', async () => {
    render(<ClerkAcceptInvitation invitationId='' orgId='org_test456' />);

    await waitFor(() => {
      expect(screen.getByText(/ID d'invitation manquant/)).toBeInTheDocument();
    });
  });
});

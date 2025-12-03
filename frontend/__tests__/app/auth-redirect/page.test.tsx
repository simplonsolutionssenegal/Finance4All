import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import AuthRedirectPage from '@/app/auth-redirect/page';
import { useGetUserRedirect } from '@/lib/get-user-redirect';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/get-user-redirect', () => ({
  useGetUserRedirect: jest.fn(),
}));

const mockRouterReplace = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseGetUserRedirect = useGetUserRedirect as jest.MockedFunction<typeof useGetUserRedirect>;

describe('AuthRedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      replace: mockRouterReplace,
      push: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
  });

  it('renders loading message', () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: false,
    });

    render(<AuthRedirectPage />);

    expect(screen.getByText('Redirection en cours...')).toBeInTheDocument();
  });

  it('displays loading spinner', () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: false,
    });

    const { container } = render(<AuthRedirectPage />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not redirect when data is not loaded', () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: false,
      userRoles: [],
      hasOrganization: false,
    });

    render(<AuthRedirectPage />);

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('calls router.replace with redirect URL from useGetUserRedirect when loaded', async () => {
    const redirectUrl = '/organisation-dashboard';
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl,
      isLoaded: true,
      userRoles: [],
      hasOrganization: true,
    });

    render(<AuthRedirectPage />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith(redirectUrl);
    });
  });

  it('redirects to beneficiaire-dashboard when user has recipient role', async () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: true,
    });

    render(<AuthRedirectPage />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/beneficiaire-dashboard');
    });
  });

  it('redirects to organisation-dashboard when user has admin role', async () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/organisation-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: true,
    });

    render(<AuthRedirectPage />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/organisation-dashboard');
    });
  });

  it('calls router.replace only once per render when loaded', async () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: false,
    });

    render(<AuthRedirectPage />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledTimes(1);
      expect(mockRouterReplace).toHaveBeenCalledWith('/beneficiaire-dashboard');
    });
  });

  it('redirects when isLoaded changes from false to true', async () => {
    // Initially not loaded
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: false,
      userRoles: [],
      hasOrganization: false,
    });

    const { rerender } = render(<AuthRedirectPage />);

    // Should not redirect when not loaded
    await waitFor(() => {
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    // Clear previous calls
    mockRouterReplace.mockClear();

    // Now loaded
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/organisation-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: true,
    });

    rerender(<AuthRedirectPage />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/organisation-dashboard');
    });
  });

  it('has correct layout structure', () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: false,
    });

    const { container } = render(<AuthRedirectPage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center',
      'bg-gray-50'
    );
  });

  it('has correct text styling', () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: false,
    });

    render(<AuthRedirectPage />);

    const text = screen.getByText('Redirection en cours...');
    expect(text).toHaveClass('text-gray-600', 'text-sm');
  });

  it('calls useGetUserRedirect hook', () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: false,
    });

    render(<AuthRedirectPage />);

    expect(mockUseGetUserRedirect).toHaveBeenCalled();
  });

  it('calls useRouter hook', () => {
    mockUseGetUserRedirect.mockReturnValue({
      redirectUrl: '/beneficiaire-dashboard',
      isLoaded: true,
      userRoles: [],
      hasOrganization: false,
    });

    render(<AuthRedirectPage />);

    expect(mockUseRouter).toHaveBeenCalled();
  });
});

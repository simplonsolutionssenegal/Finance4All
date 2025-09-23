import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LogoutAlert } from '@/components/dashboard/LogoutAlert';
import { useLogout } from '@/hooks/useLogout';

// Mock the useLogout hook
jest.mock('@/hooks/useLogout');
const mockUseLogout = useLogout as jest.MockedFunction<typeof useLogout>;

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  LogOut: () => <div data-testid="log-out-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
}));

describe('LogoutAlert', () => {
  const mockLogout = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLogout.mockReturnValue({
      logout: mockLogout,
      isLoading: false,
      isUserLoaded: true,
      hasActiveSession: true,
    });
  });

  it('should not render when isOpen is false', () => {
    render(<LogoutAlert isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('should display correct title and description', () => {
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Confirmer la déconnexion')).toBeInTheDocument();
    expect(screen.getByText(/Êtes-vous sûr de vouloir vous déconnecter/)).toBeInTheDocument();
  });

  it('should display alert triangle icon', () => {
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
  });

  it('should render cancel and logout buttons', () => {
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se déconnecter/i })).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);
    
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    const logoutButton = screen.getByRole('button', { name: /se déconnecter/i });
    await user.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should call onClose after successful logout', async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);
    
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    const logoutButton = screen.getByRole('button', { name: /se déconnecter/i });
    await user.click(logoutButton);
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable buttons when loading', () => {
    mockUseLogout.mockReturnValue({
      logout: mockLogout,
      isLoading: true,
      isUserLoaded: true,
      hasActiveSession: true,
    });
    
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    const logoutButton = screen.getByRole('button', { name: /déconnexion/i });
    
    expect(cancelButton).toBeDisabled();
    expect(logoutButton).toBeDisabled();
  });

  it('should show loading text when loading', () => {
    mockUseLogout.mockReturnValue({
      logout: mockLogout,
      isLoading: true,
      isUserLoaded: true,
      hasActiveSession: true,
    });
    
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Déconnexion...')).toBeInTheDocument();
  });

  it('should prevent closing dialog when loading', async () => {
    const user = userEvent.setup();
    mockUseLogout.mockReturnValue({
      logout: mockLogout,
      isLoading: true,
      isUserLoaded: true,
      hasActiveSession: true,
    });
    
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    // Try to click cancel button when loading
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);
    
    // Should not call onClose when loading
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle logout error gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockLogout.mockRejectedValue(new Error('Logout failed'));
    
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    const logoutButton = screen.getByRole('button', { name: /se déconnecter/i });
    await user.click(logoutButton);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de la déconnexion:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('should display logout icon in logout button', () => {
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('log-out-icon')).toBeInTheDocument();
  });

  it('should have correct styling for title and icon', () => {
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    const title = screen.getByText('Confirmer la déconnexion');
    
    expect(title).toHaveClass('text-red-600');
  });

  it('should have correct styling for logout button text and icon', () => {
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    const logoutButton = screen.getByRole('button', { name: /se déconnecter/i });
    
    expect(logoutButton.querySelector('span')).toHaveClass('text-red-600');
  });

  it('should handle dialog overlay click when not loading', async () => {
    const user = userEvent.setup();
    
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    mockUseLogout.mockReturnValue({
      logout: mockLogout,
      isLoading: true,
      isUserLoaded: true,
      hasActiveSession: true,
    });
    
    // Re-render with loading state
    render(<LogoutAlert isOpen={true} onClose={mockOnClose} />);
    
    // Try to close via cancel button
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);
    
    // Should not close when loading
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

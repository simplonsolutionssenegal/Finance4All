import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RoleEditModal from '@/components/users/RoleEditModal';
import type OrganizationUser from '@/types/OrganizationUser';

const mockUpdateUserRole = jest.fn();

jest.mock('@/lib/clerk-utils', () => ({
  useUpdateUserRole: () => ({
    updateUserRole: mockUpdateUserRole,
  }),
}));

// Mock Dialog to suppress accessibility warnings
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid='dialog' onBlur={onOpenChange}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className }: any) => (
    <div data-testid='dialog-content' className={className} aria-describedby='dialog-description'>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid='dialog-header'>{children}</div>,
  DialogTitle: ({ children, className }: any) => (
    <h2 data-testid='dialog-title' className={className}>
      {children}
    </h2>
  ),
  DialogDescription: ({ children }: any) => (
    <p id='dialog-description' data-testid='dialog-description'>
      {children}
    </p>
  ),
}));

describe('RoleEditModal', () => {
  const mockOnClose = jest.fn();

  const mockUser: OrganizationUser = {
    id: 'user_123',
    fullName: 'John Doe',
    emailAddress: 'john.doe@example.com',
    role: 'org:member',
    status: 'Actif',
    createAt: new Date(),
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with user data', () => {
    render(<RoleEditModal {...defaultProps} />);

    expect(screen.getByText("Modifier le rôle de l'utilisateur")).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('org:member')).toBeInTheDocument();
  });

  it('does not render when user is null', () => {
    render(<RoleEditModal {...defaultProps} user={null} />);

    expect(screen.queryByText("Modifier le rôle de l'utilisateur")).not.toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<RoleEditModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Modifier le rôle de l'utilisateur")).not.toBeInTheDocument();
  });

  it('shows available roles except current role', () => {
    render(<RoleEditModal {...defaultProps} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByText('Member')).not.toBeInTheDocument(); // Current role should not be in options
  });

  it('disables update button when no role is selected', () => {
    render(<RoleEditModal {...defaultProps} />);

    const updateButton = screen.getByText('Mettre à jour');
    expect(updateButton).toBeDisabled();
  });

  it('enables update button when different role is selected', async () => {
    const user = userEvent.setup();
    render(<RoleEditModal {...defaultProps} />);

    const roleSelect = screen.getByLabelText('Nouveau rôle');
    await user.selectOptions(roleSelect, 'org:admin');

    const updateButton = screen.getByText('Mettre à jour');
    expect(updateButton).toBeEnabled();
  });

  it('calls updateUserRole with correct parameters when form is submitted', async () => {
    const user = userEvent.setup();
    mockUpdateUserRole.mockResolvedValue(undefined);

    render(<RoleEditModal {...defaultProps} />);

    const roleSelect = screen.getByLabelText('Nouveau rôle');
    await user.selectOptions(roleSelect, 'org:admin');

    const updateButton = screen.getByText('Mettre à jour');
    await user.click(updateButton);

    expect(mockUpdateUserRole).toHaveBeenCalledWith('user_123', 'org:admin');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles role update errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockUpdateUserRole.mockRejectedValue(new Error('Update failed'));

    render(<RoleEditModal {...defaultProps} />);

    const roleSelect = screen.getByLabelText('Nouveau rôle');
    await user.selectOptions(roleSelect, 'org:admin');

    const updateButton = screen.getByText('Mettre à jour');
    await user.click(updateButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors de la mise à jour du rôle:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('shows loading state during role update', async () => {
    const user = userEvent.setup();
    let resolveUpdate: (() => void) | undefined;
    const updatePromise = new Promise<void>(resolve => {
      resolveUpdate = resolve;
    });
    mockUpdateUserRole.mockReturnValue(updatePromise);

    render(<RoleEditModal {...defaultProps} />);

    const roleSelect = screen.getByLabelText('Nouveau rôle');
    await user.selectOptions(roleSelect, 'org:admin');

    const updateButton = screen.getByText('Mettre à jour');
    await user.click(updateButton);

    expect(screen.getByText('Mise à jour...')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeDisabled();
    expect(roleSelect).toBeDisabled();

    expect(resolveUpdate).toBeDefined();
    if (resolveUpdate) {
      resolveUpdate();
    }
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<RoleEditModal {...defaultProps} />);

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets selected role when user changes', () => {
    const { rerender } = render(<RoleEditModal {...defaultProps} />);

    const newUser = { ...mockUser, id: 'user_456', role: 'org:admin' };
    rerender(<RoleEditModal {...defaultProps} user={newUser} />);

    const roleSelect = screen.getByLabelText('Nouveau rôle');
    expect(roleSelect).toHaveValue('');
  });

  it('shows admin user correctly', () => {
    const adminUser = { ...mockUser, role: 'org:admin' };
    render(<RoleEditModal {...defaultProps} user={adminUser} />);

    expect(screen.getByText('org:admin')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument(); // Should show Member option for admin
    expect(screen.queryByText('Admin')).not.toBeInTheDocument(); // Current role not in options
  });
});

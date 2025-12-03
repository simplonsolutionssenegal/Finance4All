import { useOrganization } from '@clerk/nextjs';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditUserModal from '@/components/users/EditUserModal';
import type OrganizationUser from '@/types/OrganizationUser';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useOrganization: jest.fn(),
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

// Mock Select component - same approach as AddUserModal
const editSelectCallbacks: Array<((value: string) => void) | null> = [];

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => {
    // Store callback in array - only one Select in EditUserModal (role)
    if (onValueChange && !editSelectCallbacks.includes(onValueChange)) {
      editSelectCallbacks.push(onValueChange);
    }
    return (
      <div data-testid='select' data-value={value} data-disabled={disabled}>
        {children}
      </div>
    );
  },
  SelectTrigger: ({ children, id, className }: any) => (
    <div data-testid={`select-trigger-${id}`} className={className} id={id} role='combobox'>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children, className }: any) => (
    <div data-testid='select-content' className={className}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value, className }: any) => {
    const callback = editSelectCallbacks[0] || null;

    return (
      <div
        data-testid={`select-item-${value}`}
        className={className}
        onClick={() => {
          if (!className?.includes('disabled') && callback) {
            callback(value);
          }
        }}
        role='option'
        aria-selected='false'
      >
        {children}
      </div>
    );
  },
}));

const mockUseOrganization = useOrganization as jest.Mock;

const mockUser: OrganizationUser = {
  id: 'user_123',
  fullName: 'John Doe',
  emailAddress: 'john.doe@example.com',
  phoneNumber: '+221 77 123 4567',
  role: 'org:member',
  status: 'active',
  createAt: new Date('2024-01-01'),
  lastActiveAt: new Date('2024-12-01'),
};

describe('EditUserModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdateUser = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onUpdateUser: mockOnUpdateUser,
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    editSelectCallbacks.length = 0;
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
    });
  });

  it('renders when open with user data', async () => {
    render(<EditUserModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Modifier l'utilisateur")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Prénom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Téléphone/)).toBeInTheDocument();
    expect(screen.getByTestId('select-trigger-role')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<EditUserModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Modifier l'utilisateur")).not.toBeInTheDocument();
  });

  it('initializes form fields with user data when modal opens', async () => {
    render(<EditUserModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+221 77 123 4567')).toBeInTheDocument();
    });
  });

  it('handles form input changes', async () => {
    const user = userEvent.setup();
    render(<EditUserModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText('Prénom');
    const lastNameInput = screen.getByLabelText('Nom');
    const emailInput = screen.getByLabelText('Email');
    const phoneInput = screen.getByLabelText('Téléphone');

    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Smith');
    await user.clear(emailInput);
    await user.type(emailInput, 'jane.smith@example.com');
    await user.clear(phoneInput);
    await user.type(phoneInput, '+221 77 999 8888');

    expect(firstNameInput).toHaveValue('Jane');
    expect(lastNameInput).toHaveValue('Smith');
    expect(emailInput).toHaveValue('jane.smith@example.com');
    expect(phoneInput).toHaveValue('+221 77 999 8888');
  });

  it('calls onUpdateUser with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<EditUserModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText('Prénom');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    const submitButton = screen.getByText('Mettre à jour');
    await user.click(submitButton);

    expect(mockOnUpdateUser).toHaveBeenCalledWith({
      userId: 'user_123',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'org:member',
      organizationId: 'org_123',
    });
  });

  it('trims whitespace from input values', async () => {
    const user = userEvent.setup();
    render(<EditUserModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText('Prénom');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, '  Jane  ');

    const submitButton = screen.getByText('Mettre à jour');
    await user.click(submitButton);

    expect(mockOnUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Jane',
      })
    );
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<EditUserModal {...defaultProps} />);

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form when dialog is closed', async () => {
    const { rerender } = render(<EditUserModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Close modal
    rerender(<EditUserModal {...defaultProps} isOpen={false} />);

    // Reopen modal
    rerender(<EditUserModal {...defaultProps} isOpen={true} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });
  });

  it('shows loading state when updating user', () => {
    render(<EditUserModal {...defaultProps} isUpdating={true} />);

    expect(screen.getByText('Mise à jour...')).toBeInTheDocument();
    expect(screen.getByLabelText('Prénom')).toBeDisabled();
    expect(screen.getByLabelText('Nom')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Téléphone')).toBeDisabled();
    expect(screen.getByText('Annuler')).toBeDisabled();
  });

  it('handles user with missing phone number', async () => {
    const userWithoutPhone: OrganizationUser = {
      ...mockUser,
      phoneNumber: undefined,
    };

    render(<EditUserModal {...defaultProps} user={userWithoutPhone} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Téléphone')).toBeInTheDocument();
    });

    const phoneInput = screen.getByLabelText('Téléphone');
    expect(phoneInput).toHaveValue('');
  });

  it('handles user with single name (no last name)', async () => {
    const userWithSingleName: OrganizationUser = {
      ...mockUser,
      fullName: 'John',
    };

    render(<EditUserModal {...defaultProps} user={userWithSingleName} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const lastNameInput = screen.getByLabelText('Nom');
    expect(lastNameInput).toHaveValue('');
  });

  it('does not render when user is null', () => {
    render(<EditUserModal {...defaultProps} user={null} />);

    expect(screen.queryByText("Modifier l'utilisateur")).not.toBeInTheDocument();
  });

  it('disables submit button when role is not selected', async () => {
    mockUseOrganization.mockReturnValue({
      organization: null,
    });

    render(<EditUserModal {...defaultProps} />);

    await waitFor(() => {
      const submitButton = screen.getByText('Mettre à jour');
      expect(submitButton).toBeDisabled();
    });
  });

  it('handles role change correctly', async () => {
    const user = userEvent.setup();
    render(<EditUserModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('select-trigger-role')).toBeInTheDocument();
    });

    const roleSelect = screen.getByTestId('select');

    // Click on the role select item for admin
    const adminRoleItem = screen.getByTestId('select-item-org:admin');
    await user.click(adminRoleItem);

    await waitFor(() => {
      expect(roleSelect).toHaveAttribute('data-value', 'org:admin');
    });

    const submitButton = screen.getByText('Mettre à jour');
    await user.click(submitButton);

    expect(mockOnUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'org:admin',
      })
    );
  });
});

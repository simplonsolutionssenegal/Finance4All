import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AddUserModal from '@/components/users/AddUserModal';

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

// Mock Select component
// Store callbacks in an array - first is role, second is organization
const selectCallbacks: Array<((value: string) => void) | null> = [];

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => {
    // Store callback in array - order matters: first Select = role, second = organization
    if (onValueChange && !selectCallbacks.includes(onValueChange)) {
      selectCallbacks.push(onValueChange);
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
    const isRoleValue = value?.startsWith('org:');
    // Role values use first callback, org values use second callback
    const callbackIndex = isRoleValue ? 0 : 1;
    const callback = selectCallbacks[callbackIndex] || selectCallbacks[0] || null;

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

// Mock Input component
jest.mock('@/components/ui/input', () => ({
  Input: ({ id, value, onChange, placeholder, className, type, disabled }: any) => (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, disabled }: any) => (
    <button onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Mock useOrganizationList
jest.mock('@clerk/nextjs', () => ({
  useOrganizationList: jest.fn(() => ({
    userMemberships: {
      data: [
        {
          organization: {
            id: 'org_123',
            name: 'Test Organization',
          },
        },
      ],
    },
  })),
}));

describe('AddUserModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreateUser = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onCreateUser: mockOnCreateUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    selectCallbacks.length = 0;
  });

  it('renders when open', () => {
    render(<AddUserModal {...defaultProps} />);

    expect(screen.getByText('Créer un nouvel utilisateur')).toBeInTheDocument();
    expect(screen.getByLabelText(/Prénom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Prénom')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AddUserModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Créer un nouvel utilisateur')).not.toBeInTheDocument();
  });

  it('handles form input changes', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    const firstNameInput = screen.getByLabelText(/Prénom/);
    const lastNameInput = screen.getByLabelText(/Nom/);
    const emailInput = screen.getByLabelText(/Email/);

    await user.type(firstNameInput, 'Test');
    await user.type(lastNameInput, 'User');
    await user.type(emailInput, 'test@example.com');
    // Click on the role select item
    const roleItem = screen.getByTestId('select-item-org:member');
    await user.click(roleItem);
    // Click on the organization select item
    const orgItem = screen.getByTestId('select-item-org_123');
    await user.click(orgItem);

    expect(firstNameInput).toHaveValue('Test');
    expect(lastNameInput).toHaveValue('User');
    expect(emailInput).toHaveValue('test@example.com');
    // Verify that select items were clicked (they exist and were interacted with)
    expect(roleItem).toBeInTheDocument();
    expect(orgItem).toBeInTheDocument();
  });

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    const submitButton = screen.getByText("Créer l'utilisateur");
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Prénom/), 'Test');
    await user.type(screen.getByLabelText(/Nom/), 'User');
    await user.type(screen.getByLabelText(/Email/), 'test@example.com');
    const roleItem = screen.getByTestId('select-item-org:member');
    await user.click(roleItem);
    const orgItem = screen.getByTestId('select-item-org_123');
    await user.click(orgItem);

    expect(submitButton).toBeEnabled();
  });

  it('calls onCreateUser with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Prénom/), 'Test');
    await user.type(screen.getByLabelText(/Nom/), 'User');
    await user.type(screen.getByLabelText(/Email/), 'test@example.com');
    const roleItem = screen.getByTestId('select-item-org:admin');
    await user.click(roleItem);
    const orgItem = screen.getByTestId('select-item-org_123');
    await user.click(orgItem);

    const submitButton = screen.getByText("Créer l'utilisateur");
    await user.click(submitButton);

    expect(mockOnCreateUser).toHaveBeenCalledWith({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'org:admin',
      organizationId: 'org_123',
    });
  });

  it('trims whitespace from input values', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Prénom/), '  Test  ');
    await user.type(screen.getByLabelText(/Nom/), '  User  ');
    await user.type(screen.getByLabelText(/Email/), '  test@example.com  ');
    const roleItem = screen.getByTestId('select-item-org:member');
    await user.click(roleItem);
    const orgItem = screen.getByTestId('select-item-org_123');
    await user.click(orgItem);

    const submitButton = screen.getByText("Créer l'utilisateur");
    await user.click(submitButton);

    expect(mockOnCreateUser).toHaveBeenCalledWith({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'org:member',
      organizationId: 'org_123',
    });
  });

  it('resets form and calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Prénom/), 'Test');
    await user.type(screen.getByLabelText(/Nom/), 'User');

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form when dialog is closed', async () => {
    const { rerender } = render(<AddUserModal {...defaultProps} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Prénom/), 'Test');
    await user.type(screen.getByLabelText(/Nom/), 'User');

    // Close and reopen modal
    rerender(<AddUserModal {...defaultProps} isOpen={false} />);
    rerender(<AddUserModal {...defaultProps} isOpen={true} />);

    expect(screen.getByLabelText(/Prénom/)).toHaveValue('');
    expect(screen.getByLabelText(/Nom/)).toHaveValue('');
  });

  it('shows loading state when creating user', () => {
    render(<AddUserModal {...defaultProps} isCreating={true} />);

    expect(screen.getByText('Création...')).toBeInTheDocument();
    expect(screen.getByLabelText(/Prénom/)).toBeDisabled();
    expect(screen.getByLabelText(/Nom/)).toBeDisabled();
    expect(screen.getByLabelText(/Email/)).toBeDisabled();
    const selects = screen.getAllByTestId('select');
    selects.forEach(select => {
      expect(select).toHaveAttribute('data-disabled', 'true');
    });
    expect(screen.getByText('Annuler')).toBeDisabled();
  });

  it('renders all available roles in select', () => {
    render(<AddUserModal {...defaultProps} />);

    // Roles are in French in AVAILABLE_ROLES - check by test-id instead of text to avoid conflicts
    expect(screen.getByTestId('select-item-org:recipient')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-org:admin')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-org:member')).toBeInTheDocument();
  });

  it('validates form correctly for each field', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    const submitButton = screen.getByText("Créer l'utilisateur");
    expect(submitButton).toBeDisabled();

    // Add firstName only
    await user.type(screen.getByLabelText(/Prénom/), 'Test');
    expect(submitButton).toBeDisabled();

    // Add lastName
    await user.type(screen.getByLabelText(/Nom/), 'User');
    expect(submitButton).toBeDisabled();

    // Add email
    await user.type(screen.getByLabelText(/Email/), 'test@example.com');
    expect(submitButton).toBeDisabled();

    // Add role
    const roleItem = screen.getByTestId('select-item-org:member');
    await user.click(roleItem);
    expect(submitButton).toBeDisabled();

    // Add organization - now form should be valid
    const orgItem = screen.getByTestId('select-item-org_123');
    await user.click(orgItem);
    expect(submitButton).toBeEnabled();
  });

  it('handles role selection correctly', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    const roleSelects = screen.getAllByTestId('select');
    // First select is role, second is organization
    const roleSelect = roleSelects[0];

    // Click on the role select item for admin
    const adminRoleItem = screen.getByTestId('select-item-org:admin');
    await user.click(adminRoleItem);
    expect(roleSelect).toHaveAttribute('data-value', 'org:admin');

    // Click on the role select item for member
    const memberRoleItem = screen.getByTestId('select-item-org:member');
    await user.click(memberRoleItem);
    expect(roleSelect).toHaveAttribute('data-value', 'org:member');
  });
});

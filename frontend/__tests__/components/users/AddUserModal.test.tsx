import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AddUserModal from '@/components/users/AddUserModal';

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
  });

  it('renders when open', () => {
    render(<AddUserModal {...defaultProps} />);

    expect(screen.getByText('Ajouter un nouvel utilisateur')).toBeInTheDocument();
    expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Rôle')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AddUserModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Ajouter un nouvel utilisateur')).not.toBeInTheDocument();
  });

  it('handles form input changes', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    const firstNameInput = screen.getByPlaceholderText('John');
    const lastNameInput = screen.getByPlaceholderText('DOE');
    const emailInput = screen.getByPlaceholderText('john.doe@email.com');
    const roleSelect = screen.getByLabelText('Rôle');

    await user.type(firstNameInput, 'Test');
    await user.type(lastNameInput, 'User');
    await user.type(emailInput, 'test@example.com');
    await user.selectOptions(roleSelect, 'org:member');

    expect(firstNameInput).toHaveValue('Test');
    expect(lastNameInput).toHaveValue('User');
    expect(emailInput).toHaveValue('test@example.com');
    expect(roleSelect).toHaveValue('org:member');
  });

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    const submitButton = screen.getByText('Enregistrer');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText('Prénom'), 'Test');
    await user.type(screen.getByLabelText('Nom'), 'User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.selectOptions(screen.getByLabelText('Rôle'), 'org:member');

    expect(submitButton).toBeEnabled();
  });

  it('calls onCreateUser with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Prénom'), 'Test');
    await user.type(screen.getByLabelText('Nom'), 'User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.selectOptions(screen.getByLabelText('Rôle'), 'org:admin');

    const submitButton = screen.getByText('Enregistrer');
    await user.click(submitButton);

    expect(mockOnCreateUser).toHaveBeenCalledWith({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'org:admin',
    });
  });

  it('trims whitespace from input values', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Prénom'), '  Test  ');
    await user.type(screen.getByLabelText('Nom'), '  User  ');
    await user.type(screen.getByLabelText('Email'), '  test@example.com  ');
    await user.selectOptions(screen.getByLabelText('Rôle'), 'org:member');

    const submitButton = screen.getByText('Enregistrer');
    await user.click(submitButton);

    expect(mockOnCreateUser).toHaveBeenCalledWith({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'org:member',
    });
  });

  it('resets form and calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Prénom'), 'Test');
    await user.type(screen.getByLabelText('Nom'), 'User');

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form when dialog is closed', async () => {
    const { rerender } = render(<AddUserModal {...defaultProps} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Prénom'), 'Test');
    await user.type(screen.getByLabelText('Nom'), 'User');

    // Close and reopen modal
    rerender(<AddUserModal {...defaultProps} isOpen={false} />);
    rerender(<AddUserModal {...defaultProps} isOpen={true} />);

    expect(screen.getByLabelText('Prénom')).toHaveValue('');
    expect(screen.getByLabelText('Nom')).toHaveValue('');
  });

  it('shows loading state when creating user', () => {
    render(<AddUserModal {...defaultProps} isCreating={true} />);

    expect(screen.getByText('Création...')).toBeInTheDocument();
    expect(screen.getByLabelText('Prénom')).toBeDisabled();
    expect(screen.getByLabelText('Nom')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Rôle')).toBeDisabled();
    expect(screen.getByText('Annuler')).toBeDisabled();
  });

  it('renders all available roles in select', () => {
    render(<AddUserModal {...defaultProps} />);

    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Sélectionner')).toBeInTheDocument();
  });

  it('validates form correctly for each field', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    const submitButton = screen.getByText('Enregistrer');
    expect(submitButton).toBeDisabled();

    // Add firstName only
    await user.type(screen.getByLabelText('Prénom'), 'Test');
    expect(submitButton).toBeDisabled();

    // Add lastName
    await user.type(screen.getByLabelText('Nom'), 'User');
    expect(submitButton).toBeDisabled();

    // Add email
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    expect(submitButton).toBeDisabled();

    // Add role - now form should be valid
    await user.selectOptions(screen.getByLabelText('Rôle'), 'org:member');
    expect(submitButton).toBeEnabled();
  });

  it('handles role selection correctly', async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    const roleSelect = screen.getByLabelText('Rôle');

    await user.selectOptions(roleSelect, 'org:admin');
    expect(roleSelect).toHaveValue('org:admin');

    await user.selectOptions(roleSelect, 'org:member');
    expect(roleSelect).toHaveValue('org:member');
  });
});
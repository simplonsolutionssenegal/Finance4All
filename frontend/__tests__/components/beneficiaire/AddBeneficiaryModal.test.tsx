import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import AddBeneficiaryModal from '@/components/beneficiaire/AddBeneficiaryModal';

// Mock validation module
jest.mock('@/lib/validations/beneficiaire-validations', () => {
  const z = require('zod');

  const createBeneficiarySchema = z.object({
    organizationId: z.string().min(1),
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().startsWith('+').optional().or(z.literal('')),
    generateTempPassword: z.boolean(),
    role: z.literal('org:recipient'),
  });

  const updateBeneficiarySchema = z.object({
    id: z.string().min(1),
    organizationId: z.string().min(1),
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    phone: z.string().startsWith('+').optional().or(z.literal('')),
  });

  return {
    createBeneficiarySchema,
    updateBeneficiarySchema,
    zodErrorsToFieldErrors: (error: any) => {
      const fieldErrors: any = {};
      error.errors.forEach((err: any) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      return fieldErrors;
    },
  };
});

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid='dialog'>{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid='dialog-content'>{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} data-testid={`input-${props.placeholder}`} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('AddBeneficiaryModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    organizationId: 'org_123',
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create mode', () => {
    it('should render create modal with title', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      expect(screen.getByText('Ajouter un bénéficiaire')).toBeInTheDocument();
      expect(screen.getByText(/Créez un nouveau compte/i)).toBeInTheDocument();
    });

    it('should render all required fields', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      expect(screen.getByPlaceholderText('Awa')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Sarr')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email.sn/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/\+221/i)).toBeInTheDocument();
    });

    it('should show temp password checkbox in create mode', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);
    });

    it('should have temp password checked by default', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const checkbox = screen.getByRole('button', { name: /Mot de passe temporaire/i });
      expect(checkbox).toHaveClass('bg-[#F8FCFF]');
    });

    it('should toggle temp password checkbox', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const checkbox = screen.getByRole('button', { name: /Mot de passe temporaire/i });
      fireEvent.click(checkbox);

      expect(checkbox).not.toHaveClass('bg-[#F8FCFF]');
    });
  });

  describe('Edit mode', () => {
    const initialValues = {
      id: 'ben_123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+221771234567',
    };

    it('should render edit modal with title', () => {
      render(
        <AddBeneficiaryModal
          {...defaultProps}
          mode='edit'
          beneficiaryId='ben_123'
          initialValues={initialValues}
        />
      );

      expect(screen.getByText('Modifier un bénéficiaire')).toBeInTheDocument();
      expect(screen.getByText(/Modifiez les informations/i)).toBeInTheDocument();
    });

    it('should populate fields with initial values', () => {
      render(
        <AddBeneficiaryModal
          {...defaultProps}
          mode='edit'
          beneficiaryId='ben_123'
          initialValues={initialValues}
        />
      );

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+221771234567')).toBeInTheDocument();
    });

    it('should disable email field in edit mode', () => {
      render(
        <AddBeneficiaryModal
          {...defaultProps}
          mode='edit'
          beneficiaryId='ben_123'
          initialValues={initialValues}
        />
      );

      const emailInput = screen.getByDisplayValue('john.doe@example.com');
      expect(emailInput).toBeDisabled();
    });

    it('should not show temp password checkbox in edit mode', () => {
      render(
        <AddBeneficiaryModal
          {...defaultProps}
          mode='edit'
          beneficiaryId='ben_123'
          initialValues={initialValues}
        />
      );

      expect(screen.queryByText(/Mot de passe temporaire/i)).not.toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should require firstName', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      expect(saveButton).toBeDisabled();
    });

    it('should require lastName', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const firstNameInput = screen.getByPlaceholderText('Awa');
      fireEvent.change(firstNameInput, { target: { value: 'Test' } });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      expect(saveButton).toBeDisabled();
    });

    it('should require email in create mode', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const firstNameInput = screen.getByPlaceholderText('Awa');
      const lastNameInput = screen.getByPlaceholderText('Sarr');

      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      expect(saveButton).toBeDisabled();
    });

    it('should validate email format', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const firstNameInput = screen.getByPlaceholderText('Awa');
      const lastNameInput = screen.getByPlaceholderText('Sarr');
      const emailInput = screen.getByPlaceholderText(/email.sn/i);

      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      expect(saveButton).toBeDisabled();
    });

    it('should accept valid email', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const firstNameInput = screen.getByPlaceholderText('Awa');
      const lastNameInput = screen.getByPlaceholderText('Sarr');
      const emailInput = screen.getByPlaceholderText(/email.sn/i);

      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should validate phone format', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const firstNameInput = screen.getByPlaceholderText('Awa');
      const lastNameInput = screen.getByPlaceholderText('Sarr');
      const emailInput = screen.getByPlaceholderText(/email.sn/i);
      const phoneInput = screen.getByPlaceholderText(/\+221/i);

      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '123456' } }); // Invalid - no +

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      expect(saveButton).toBeDisabled();
    });

    it('should accept valid phone format', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const firstNameInput = screen.getByPlaceholderText('Awa');
      const lastNameInput = screen.getByPlaceholderText('Sarr');
      const emailInput = screen.getByPlaceholderText(/email.sn/i);
      const phoneInput = screen.getByPlaceholderText(/\+221/i);

      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+221771234567' } });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should allow empty phone field', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const firstNameInput = screen.getByPlaceholderText('Awa');
      const lastNameInput = screen.getByPlaceholderText('Sarr');
      const emailInput = screen.getByPlaceholderText(/email.sn/i);

      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Form submission', () => {
    it('should submit create form with valid data', async () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      fireEvent.change(screen.getByPlaceholderText('Awa'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByPlaceholderText('Sarr'), { target: { value: 'User' } });
      fireEvent.change(screen.getByPlaceholderText(/email.sn/i), {
        target: { value: 'test@example.com' },
      });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          organizationId: 'org_123',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: undefined,
          generateTempPassword: true,
          role: 'org:recipient',
        });
      });
    });

    it('should submit edit form with updated data', async () => {
      render(
        <AddBeneficiaryModal
          {...defaultProps}
          mode='edit'
          beneficiaryId='ben_123'
          initialValues={{
            id: 'ben_123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          }}
        />
      );

      fireEvent.change(screen.getByDisplayValue('John'), { target: { value: 'Jane' } });

      const saveButton = screen.getByRole('button', { name: /Enregistrer/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          id: 'ben_123',
          organizationId: 'org_123',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: undefined,
        });
      });
    });

    it('should trim whitespace from inputs', async () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      fireEvent.change(screen.getByPlaceholderText('Awa'), { target: { value: '  Test  ' } });
      fireEvent.change(screen.getByPlaceholderText('Sarr'), { target: { value: '  User  ' } });
      fireEvent.change(screen.getByPlaceholderText(/email.sn/i), {
        target: { value: '  test@example.com  ' },
      });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
          })
        );
      });
    });

    it('should handle phone with or undefined', async () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      fireEvent.change(screen.getByPlaceholderText('Awa'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByPlaceholderText('Sarr'), { target: { value: 'User' } });
      fireEvent.change(screen.getByPlaceholderText(/email.sn/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/\+221/i), { target: { value: '   ' } });

      const saveButton = screen.getByRole('button', { name: /Créer le compte/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            phone: undefined,
          })
        );
      });
    });
  });

  describe('Modal interactions', () => {
    it('should call onClose when cancel is clicked', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const cancelButton = screen.getByRole('button', { name: /Annuler/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not render when isOpen is false', () => {
      render(<AddBeneficiaryModal {...defaultProps} isOpen={false} mode='create' />);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should reset form when reopened', () => {
      const { rerender } = render(
        <AddBeneficiaryModal {...defaultProps} isOpen={false} mode='create' />
      );

      rerender(<AddBeneficiaryModal {...defaultProps} isOpen={true} mode='create' />);

      expect(screen.getByPlaceholderText('Awa')).toHaveValue('');
      expect(screen.getByPlaceholderText('Sarr')).toHaveValue('');
    });
  });

  describe('Loading states', () => {
    it('should disable fields when isCreating', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' isCreating={true} />);

      expect(screen.getByPlaceholderText('Awa')).toBeDisabled();
      expect(screen.getByPlaceholderText('Sarr')).toBeDisabled();
    });

    it('should disable fields when isUpdating', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='edit' isUpdating={true} />);

      expect(screen.getByPlaceholderText('Awa')).toBeDisabled();
      expect(screen.getByPlaceholderText('Sarr')).toBeDisabled();
    });

    it('should show creating text when isCreating', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' isCreating={true} />);

      expect(screen.getByText('Création...')).toBeInTheDocument();
    });

    it('should show updating text when isUpdating', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='edit' isUpdating={true} />);

      expect(screen.getByText('Mise à jour...')).toBeInTheDocument();
    });
  });

  describe('Organization validation', () => {
    it('should show warning when organizationId is missing', () => {
      render(<AddBeneficiaryModal {...defaultProps} organizationId='' mode='create' />);

      expect(screen.getByText(/Aucune organisation active/i)).toBeInTheDocument();
    });

    it('should not show warning when organizationId is present', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      expect(screen.queryByText(/Aucune organisation active/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle very long input values', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      const longValue = 'a'.repeat(1000);
      fireEvent.change(screen.getByPlaceholderText('Awa'), { target: { value: longValue } });

      expect(screen.getByPlaceholderText('Awa')).toHaveValue(longValue);
    });

    it('should handle special characters in inputs', () => {
      render(<AddBeneficiaryModal {...defaultProps} mode='create' />);

      fireEvent.change(screen.getByPlaceholderText('Awa'), { target: { value: "O'Neill" } });
      fireEvent.change(screen.getByPlaceholderText('Sarr'), { target: { value: 'François-René' } });

      expect(screen.getByPlaceholderText('Awa')).toHaveValue("O'Neill");
      expect(screen.getByPlaceholderText('Sarr')).toHaveValue('François-René');
    });

    it('should not submit without beneficiaryId in edit mode', async () => {
      render(
        <AddBeneficiaryModal
          {...defaultProps}
          mode='edit'
          beneficiaryId=''
          initialValues={{
            id: 'ben_123',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
          }}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Enregistrer/i });

      // Le bouton devrait être désactivé sans beneficiaryId
      expect(saveButton).toBeDisabled();
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import CreateOrganizationModal from '@/components/users/CreateOrganizationModal';

// Mock useCreateOrganization
jest.mock('@/hooks/organization/useCreateOrganization', () => ({
  useCreateOrganization: jest.fn(() => ({
    createOrganization: jest.fn(),
    isCreating: false,
  })),
}));

describe('CreateOrganizationModal', () => {
  const defaultProps = {
    isOpen: false,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render content when closed', () => {
    render(<CreateOrganizationModal {...defaultProps} />);

    expect(screen.queryByText('Créer une organisation partenaire')).not.toBeInTheDocument();
  });

  it('shows step 1 with org name and country fields when opened', () => {
    render(<CreateOrganizationModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText('Créer une organisation partenaire')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom de l'organisation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pays/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse/)).toBeInTheDocument();
    expect(screen.getByText('Suivant')).toBeInTheDocument();
  });

  it('shows step 2 with admin fields after clicking next with valid step 1', async () => {
    render(<CreateOrganizationModal {...defaultProps} isOpen={true} />);

    // Fill step 1 required fields
    const orgNameInput = screen.getByLabelText(/Nom de l'organisation/);
    fireEvent.change(orgNameInput, { target: { value: 'Mon Organisation' } });

    // For the country select, we need to trigger the value change
    // Since Select from shadcn uses Radix, we simulate by clicking trigger then item
    const countryTrigger = screen.getByLabelText(/Pays/);
    fireEvent.click(countryTrigger);

    // Wait for select content and pick a country
    await waitFor(() => {
      const option = screen.getByText('Sénégal');
      fireEvent.click(option);
    });

    // Click next
    const nextButton = screen.getByText('Suivant');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Prénom/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nom \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByText('Créer')).toBeInTheDocument();
    });
  });

  it('validates required fields on step 1', async () => {
    render(<CreateOrganizationModal {...defaultProps} isOpen={true} />);

    const nextButton = screen.getByText('Suivant');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Le nom doit contenir au moins 2 caractères')).toBeInTheDocument();
      expect(screen.getByText('Veuillez sélectionner un pays')).toBeInTheDocument();
    });
  });
});

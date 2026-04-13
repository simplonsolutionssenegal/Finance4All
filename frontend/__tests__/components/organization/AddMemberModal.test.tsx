import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import AddMemberModal from '@/components/organization/AddMemberModal';

// Mock useAddMember
jest.mock('@/hooks/organization/useAddMember', () => ({
  useAddMember: jest.fn(() => ({
    addMember: jest.fn(),
    isAdding: false,
  })),
}));

describe('AddMemberModal', () => {
  const defaultProps = {
    isOpen: false,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render content when closed', () => {
    render(<AddMemberModal {...defaultProps} />);

    expect(screen.queryByText('Ajouter un membre')).not.toBeInTheDocument();
  });

  it('shows form fields when opened', () => {
    render(<AddMemberModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText('Ajouter un membre')).toBeInTheDocument();
    expect(screen.getByLabelText(/Prénom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rôle/)).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(<AddMemberModal {...defaultProps} isOpen={true} />);

    const submitButton = screen.getByText('Ajouter le membre');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Le prénom doit contenir au moins 2 caractères')).toBeInTheDocument();
      expect(screen.getByText('Le nom doit contenir au moins 2 caractères')).toBeInTheDocument();
      expect(screen.getByText('Veuillez saisir une adresse email valide')).toBeInTheDocument();
      expect(screen.getByText('Veuillez sélectionner un rôle')).toBeInTheDocument();
    });
  });
});

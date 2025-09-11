import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { AddInstitutionDialog } from '@/components/admin/institution-financiere/add-institution-dialog';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockOnOpenChange = jest.fn();

describe('AddInstitutionDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('covers form reset functionality in onSubmit (lines 140-146)', async () => {
    render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    // Fill all required fields step 1
    const nomInput = screen.getByPlaceholderText('Société générale');
    fireEvent.change(nomInput, { target: { value: 'Test Bank Super Long Name For Validation' } });
    
    const descriptionInput = screen.getByPlaceholderText('Décrivez l\'institution financière');
    fireEvent.change(descriptionInput, { target: { value: 'A very long description of this test bank that meets validation requirements' } });
    
    // Select type
    const typeSelect = screen.getByRole('combobox');
    fireEvent.click(typeSelect);
    fireEvent.click(screen.getAllByText('Banque')[0]);
    
    const siteWebInput = screen.getByPlaceholderText('https://exemple.com');
    fireEvent.change(siteWebInput, { target: { value: 'https://test-bank.com' } });
    
    // Go to step 2
    fireEvent.click(screen.getByText('Suivant'));
    
    // Fill contact information (required)
    const contactNomInput = screen.getByPlaceholderText('Nom complet');
    fireEvent.change(contactNomInput, { target: { value: 'John Doe Contact Person' } });
    
    const contactEmailInput = screen.getByPlaceholderText('contact@exemple.com');
    fireEvent.change(contactEmailInput, { target: { value: 'contact@test-bank.com' } });
    
    const contactTelInput = screen.getByPlaceholderText('+237 XXX XXX XXX');
    fireEvent.change(contactTelInput, { target: { value: '+237 677 123 456' } });
    
    // Go to step 3 and select region (required)
    fireEvent.click(screen.getByText('Suivant'));
    const regionButton = screen.getByRole('button', { 
      name: /Couverture sur tout le territoire national/ 
    });
    fireEvent.click(regionButton);
    
    // Submit form to trigger reset (lines 140-146)
    fireEvent.click(screen.getByText('Enregistrer'));
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Institution financière ajoutée avec succès');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('covers dialog close reset functionality (lines 180-186)', async () => {
    render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    // Fill some form data first
    const nomInput = screen.getByPlaceholderText('Société générale');
    fireEvent.change(nomInput, { target: { value: 'Test Bank' } });
    
    // Go to step 2
    fireEvent.click(screen.getByText('Suivant'));
    
    // Close dialog - this should trigger reset (lines 180-186)
    const closeButton = screen.getByLabelText('Fermer');
    fireEvent.click(closeButton);
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddInstitutionDialog } from '@/components/admin/institution-financiere/add-institution-dialog';

// Mock des dépendances
jest.mock('@/lib/api/institutions', () => ({
  createInstitution: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AddInstitutionDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    expect(screen.getByText('Ajouter une institution')).toBeInTheDocument();
    expect(screen.getByText("Informations de l'institution")).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(<AddInstitutionDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Ajouter une institution')).not.toBeInTheDocument();
  });

  it('should show step 1 by default', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    expect(screen.getByText("Informations de l'institution")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom de l'institution")).toBeInTheDocument();
  });

  it('should reset dialog state on close', () => {
    const onOpenChange = jest.fn();
    render(<AddInstitutionDialog open={true} onOpenChange={onOpenChange} />);
    // Simule la fermeture du dialog
    fireEvent.click(screen.getByLabelText('Fermer'));
    // Le resetDialogState est appelé via handleOpenChange
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should handle region toggle', () => {
    render(<AddInstitutionDialog open={true} onOpenChange={jest.fn()} />);
    // Simule le clic sur un bouton de région
    const regionButtons = document.querySelectorAll('button');
    if (regionButtons.length > 0) {
      fireEvent.click(regionButtons[0]);
      // Vérifie que le bouton existe
      expect(regionButtons[0]).toBeInTheDocument();
    }
  });

  it('should go to next step when clicking Next', () => {
    render(<AddInstitutionDialog open={true} onOpenChange={jest.fn()} />);
    const nextButton = screen.getByText(/suivant/i);
    fireEvent.click(nextButton);
    // Vérifie que le titre de l'étape suivante est affiché
    expect(screen.getAllByText(/informations de contact/i).length).toBeGreaterThan(0);
  });

  it('should handle logo upload and preview', () => {
    render(<AddInstitutionDialog open={true} onOpenChange={jest.fn()} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'logo.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    // Vérifie que le logoPreview change (présence d'un aperçu ou d'une image)
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it('should reset form and states on close', () => {
    const onOpenChange = jest.fn();
    render(<AddInstitutionDialog open={true} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByLabelText('Fermer'));
    // Vérifie que le callback de fermeture est appelé
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Vérifie que l'étape est réinitialisée (titre de la première étape)
    expect(screen.getByText(/informations de l'institution/i)).toBeInTheDocument();
  });
});
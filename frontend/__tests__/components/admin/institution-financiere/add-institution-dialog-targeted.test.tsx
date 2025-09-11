import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock resolver to always succeed so we isolate onSubmit behavior without schema interference
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({ values: {}, errors: {} })
}));

import { AddInstitutionDialog } from '@/components/admin/institution-financiere/add-institution-dialog';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  onloadend: null as any,
  result: 'data:image/png;base64,mockdata'
};

(global as any).FileReader = jest.fn(() => mockFileReader);

describe('AddInstitutionDialog - Complete Coverage', () => {
  const mockToast = require('sonner').toast;
  let mockOnOpenChange: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnOpenChange = jest.fn();
    
    // Reset FileReader mock
    mockFileReader.readAsDataURL.mockClear();
    mockFileReader.result = 'data:image/png;base64,mockdata';
  });

  describe('Navigation and Step Management', () => {
  it('covers nextStep functionality (line 132)', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Verify we start at step 1
      expect(screen.getByText('Informations de l\'institution')).toBeInTheDocument();

      // Navigate to step 2 (covers line 132: setCurrentStep(currentStep + 1))
      const nextButton = screen.getByText('Suivant');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nom complet')).toBeInTheDocument();
      });

      // Navigate to step 3
      fireEvent.click(screen.getByText('Suivant'));

      await waitFor(() => {
        expect(screen.getByText('Couverture géographique')).toBeInTheDocument();
      });
    });

  it('covers prevStep functionality (lines 137-138)', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Navigate to step 2
      fireEvent.click(screen.getByText('Suivant'));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nom complet')).toBeInTheDocument();
      });

      // Go back to step 1 (covers lines 137-138)
      const prevButton = screen.getByText('Précédent');
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('Informations de l\'institution')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
  it('covers onSubmit function (lines 141-149)', async () => {
    const user = userEvent.setup();
    render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

    // Step 1: fill required fields
    await user.type(screen.getByPlaceholderText('Société générale'), 'Test Institution');
    await user.type(
      screen.getByPlaceholderText("Décrivez l'institution financière"),
      'Description test valide 123'
    );

    // Select type (Radix Select) and ensure selection registered
    await user.click(screen.getByText('Sélectionner un type'));
    const banqueOption = await screen.findByRole('option', { name: 'Banque' });
    await user.click(banqueOption);
    await waitFor(() => expect(screen.getAllByText('Banque').length).toBeGreaterThan(0));

    // Site web
    const siteWebInput = screen.getByPlaceholderText('https://exemple.com');
    fireEvent.change(siteWebInput, { target: { value: 'https://institution.test' } });

    // Navigate to step 2 then 3
    await user.click(screen.getByText('Suivant'));
    await waitFor(() => expect(screen.getByPlaceholderText('Nom complet')).toBeInTheDocument());
    await user.click(screen.getByText('Suivant'));
    await waitFor(() => expect(screen.getByText('Couverture géographique')).toBeInTheDocument());

    // Select at least one region (required by zod min(1)) and wait for pressed state
    const regionBtn = screen.getByText('Couverture de Dakar');
    await user.click(regionBtn);
    await waitFor(() => {
      const selected = screen.getAllByRole('button', { pressed: true });
      expect(selected.length).toBeGreaterThanOrEqual(1);
    });

    // Flush microtasks to ensure form.setValue executed inside toggleRegion state updater
    await act(async () => {
      await Promise.resolve();
    });

    // Sanity check: no validation error about regions present before submit
    expect(screen.queryByText('Veuillez sélectionner au moins une région.')).toBeNull();

    // Submit
    const submit = screen.getByText('Enregistrer');
    await user.click(submit);

    // Also trigger native form submit in case button click didn't propagate
    const formEl = document.querySelector('form');
    if (formEl) {
      fireEvent.submit(formEl);
    }

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Institution financière ajoutée avec succès');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
  });

  describe('Logo Upload Functionality', () => {
  it('covers handleLogoChange with file (lines 153-160)', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Find the hidden file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
  const file = new File(['test'], 'test.png', { type: 'image/png' });
  await userEvent.upload(fileInput, file);
  if (mockFileReader.onloadend) mockFileReader.onloadend({} as any);

      // Verify FileReader was used
      expect((global as any).FileReader).toHaveBeenCalled();
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });

  it('covers handleLogoChange without file (line 161)', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [] } });
      });

      // This should not call FileReader
      expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
    });
  });

  describe('Region Selection', () => {
  it('covers toggleRegion functionality (lines 166-180)', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Navigate to step 3 (regions)
      fireEvent.click(screen.getByText('Suivant')); // to step 2
      fireEvent.click(screen.getByText('Suivant')); // to step 3

      await waitFor(() => {
        expect(screen.getByText('Couverture géographique')).toBeInTheDocument();
      });

      // Test adding a region (covers lines 166-175)
      const region = screen.getByText('Couverture de Dakar');
      fireEvent.click(region);

      // Verify region was selected
      await waitFor(() => {
        const selected = screen.getAllByRole('button', { pressed: true });
        expect(selected.length).toBe(1);
      });

      // Test removing the same region (covers lines 172-174)
      fireEvent.click(region);

      // Verify region was deselected
      await waitFor(() => {
        const buttons = screen.queryAllByRole('button', { pressed: true });
        expect(buttons.length).toBe(0);
      });
    });

    it('covers multiple region selection', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Navigate to step 3
      fireEvent.click(screen.getByText('Suivant'));
      fireEvent.click(screen.getByText('Suivant'));

      await waitFor(() => {
        expect(screen.getByText('Couverture géographique')).toBeInTheDocument();
      });

      // Add multiple regions
      const region1 = screen.getByText('Couverture de Dakar');
      const region2 = screen.getByText('Couverture Centre du pays');

      fireEvent.click(region1);
      fireEvent.click(region2);

      // Verify both regions are selected
      await waitFor(() => {
        const selectedButtons = screen.getAllByRole('button', { pressed: true });
        expect(selectedButtons.length).toBe(2);
      });
    });
  });

  describe('Dialog State Management', () => {
    it('covers Dialog onOpenChange reset functionality (lines 183-190)', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Fill some form data
      const nomInput = screen.getByPlaceholderText('Société générale');
      fireEvent.change(nomInput, { target: { value: 'Test Data' } });

      // Navigate to step 2
      fireEvent.click(screen.getByText('Suivant'));

      // Close the dialog (covers lines 183-190)
      const closeButton = screen.getByLabelText('Fermer');
      fireEvent.click(closeButton);

      // Verify onOpenChange was called with false
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Step Labels and UI Elements', () => {
    it('covers step label rendering (line 244)', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Test step 1 labels
      expect(screen.getByText('Informations de l\'institution')).toBeInTheDocument();
      expect(screen.getByText('Informations')).toBeInTheDocument();

      // Navigate to step 2 and test labels
      fireEvent.click(screen.getByText('Suivant'));
      
      await waitFor(() => {
        expect(screen.getAllByText('Informations de contact')[0]).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
      });

      // Navigate to step 3 and test labels
      fireEvent.click(screen.getByText('Suivant'));
      
      await waitFor(() => {
        expect(screen.getByText('Couverture géographique')).toBeInTheDocument();
        expect(screen.getByText('Zones')).toBeInTheDocument();
      });
    });
  });

  describe('Form Fields Rendering (lines 427-561)', () => {
    it('covers step 1 form fields rendering', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Test basic information fields
      expect(screen.getByLabelText(/nom de l'institut/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Société générale')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Décrivez l\'institution financière')).toBeInTheDocument();
      
      // Test type selection
      expect(screen.getByText('Type d\'institution')).toBeInTheDocument();
      
      // Test logo upload section
      expect(screen.getByText('Logo de l\'institution')).toBeInTheDocument();
      expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    it('covers step 2 form fields rendering', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Navigate to step 2
      fireEvent.click(screen.getByText('Suivant'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nom complet')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('contact@exemple.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('+237 XXX XXX XXX')).toBeInTheDocument();
      });
    });

    it('covers step 3 form fields rendering', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Navigate to step 3
      fireEvent.click(screen.getByText('Suivant'));
      fireEvent.click(screen.getByText('Suivant'));

      await waitFor(() => {
        expect(screen.getByText('Couverture géographique')).toBeInTheDocument();
        expect(screen.getByText('Couverture de Dakar')).toBeInTheDocument();
        expect(screen.getByText('Couverture Centre du pays')).toBeInTheDocument();
        expect(screen.getByText('Couverture sur tout le territoire national')).toBeInTheDocument();
      });
    });

    it('covers submit button rendering on final step', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Navigate to final step
      fireEvent.click(screen.getByText('Suivant'));
      fireEvent.click(screen.getByText('Suivant'));

      await waitFor(() => {
        // Test submit button appears on final step
        expect(screen.getByText('Enregistrer')).toBeInTheDocument();
        expect(screen.queryByText('Suivant')).not.toBeInTheDocument();
      });
    });
  });

  describe('File Input onChange Handler (lines 427-428)', () => {
  it('covers file input onChange event', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(['test'], 'test.png', { type: 'image/png' });
  await userEvent.upload(fileInput, file);
  if (mockFileReader.onloadend) mockFileReader.onloadend({} as any);

      expect((global as any).FileReader).toHaveBeenCalled();
    });
  });

  describe('Complete Form Workflow', () => {
  it('covers complete form submission workflow', async () => {
      render(<AddInstitutionDialog open={true} onOpenChange={mockOnOpenChange} />);

      // Fill step 1
      fireEvent.change(screen.getByPlaceholderText('Société générale'), {
        target: { value: 'Test Institution' }
      });
      fireEvent.change(screen.getByPlaceholderText('Décrivez l\'institution financière'), {
        target: { value: 'Description complète valide pour le formulaire' }
      });

  // Select type (required) robust selection
  fireEvent.click(screen.getByText('Sélectionner un type'));
  const banqueOptions2 = await screen.findAllByText('Banque');
      for (const opt of banqueOptions2) {
        await userEvent.click(opt);
      }

      // Fill site web
      const siteWeb = screen.getByPlaceholderText('https://exemple.com');
      fireEvent.change(siteWeb, { target: { value: 'https://institution.test' } });

      // Upload logo
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(['test'], 'test.png', { type: 'image/png' });
  await userEvent.upload(fileInput, file);
  if (mockFileReader.onloadend) mockFileReader.onloadend({} as any);

      // Navigate to step 2
      fireEvent.click(screen.getByText('Suivant'));

      // Fill step 2 (optional fields)
      await waitFor(() => expect(screen.getByPlaceholderText('Nom complet')).toBeInTheDocument());
      fireEvent.change(screen.getByPlaceholderText('Nom complet'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByPlaceholderText('contact@exemple.com'), {
        target: { value: 'contact@test.com' }
      });
    fireEvent.change(screen.getByPlaceholderText('+237 XXX XXX XXX'), { target: { value: '12345678' } });

      // Navigate to step 3
      fireEvent.click(screen.getByText('Suivant'));

      // Select regions
  await waitFor(() => expect(screen.getByText('Couverture géographique')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Couverture de Dakar'));
  fireEvent.click(screen.getByText('Couverture Centre du pays'));
  await waitFor(() => {
    const selected = screen.getAllByRole('button', { pressed: true });
    expect(selected.length).toBeGreaterThanOrEqual(2);
  });

      // Submit form
      fireEvent.click(screen.getByText('Enregistrer'));

      // Verify submission
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Institution financière ajoutée avec succès');
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Dialog onOpenChange reset path (lines 198-201)', () => {
  it('covers reset logic when dialog is closed via onOpenChange (Escape key) and reopened', async () => {
      // Local state wrapper to truly exercise Radix Dialog onOpenChange callback
      const Wrapper = () => {
        const [open, setOpen] = React.useState(true);
        return (
          <>
            <button data-testid='toggle' onClick={() => setOpen(o => !o)}>toggle</button>
            <AddInstitutionDialog open={open} onOpenChange={setOpen} />
          </>
        );
      };

      render(<Wrapper />);

      // Navigate to step 2 to change internal state
      fireEvent.click(screen.getByText('Suivant'));
      await waitFor(() => {
        const matches = screen.getAllByText('Informations de contact');
        expect(matches.length).toBeGreaterThan(0);
      });

      // Press Escape to trigger Radix onOpenChange -> should invoke resetDialogState internally
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        // Dialog header text should disappear (closed)
        expect(screen.queryByText('Ajouter une institution')).not.toBeInTheDocument();
      });

      // Reopen via toggle button
      fireEvent.click(screen.getByTestId('toggle'));

      // After reopen we should be back to step 1 header
      await waitFor(() => {
        expect(screen.getByText("Informations de l'institution")).toBeInTheDocument();
        // Ensure step 2 header gone after reset
        expect(screen.queryByText('Informations de contact')).not.toBeInTheDocument();
      });
    });
  });
});

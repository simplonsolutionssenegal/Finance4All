// __tests__/components/admin/institution-financiere/add-institution-dialog.cover-branches.test.tsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddInstitutionDialog } from '@/components/admin/institution-financiere/add-institution-dialog';
import type { InstitutionFormValues } from '@/components/admin/institution-financiere/validation-schema';
import { useFormContext } from 'react-hook-form';

// Mock API
jest.mock('@/lib/api/institutions', () => ({
  createInstitution: jest.fn(),
}));

// Mock StepInstitutionInfo : utilise useFormContext pour remplir le formulaire
jest.mock('@/components/admin/institution-financiere/steps/StepInstitutionInfo', () => {
  const React = require('react');
  const { useFormContext } = require('react-hook-form');

  return {
    StepInstitutionInfo: ({ handleLogoChange }: any) => {
      const form = useFormContext();
      return (
        <div>
          <h3>StepInstitutionInfo</h3>
          {/* Couvre L85: handleLogoChange(null) -> setLogoPreview(null) */}
          <button type="button" onClick={() => handleLogoChange(null)}>clear-logo</button>

          {/* Remplir les champs requis pour passer la validation */}
          <button
            type="button"
            onClick={() => {
              form.setValue('nom', 'Banque Test', { shouldDirty: true, shouldValidate: true });
              form.setValue('type', 'Banque', { shouldDirty: true, shouldValidate: true });
              form.setValue('description', 'Une description valide (10+).', { shouldDirty: true, shouldValidate: true });
              form.setValue('siteWeb', 'https://example.com', { shouldDirty: true, shouldValidate: true });
            }}
          >
            fill-valid
          </button>
        </div>
      );
    },
  };
});

// Mock StepRegionsCoverage : expose toggleRegion pour couvrir add/remove (L90–93)
jest.mock('@/components/admin/institution-financiere/steps/StepRegionsCoverage', () => ({
  StepRegionsCoverage: ({ toggleRegion }: any) => (
    <div>
      <h3>StepRegionsCoverage</h3>
      <button type="button" onClick={() => toggleRegion('DAKAR')}>toggle-dakar</button>
    </div>
  ),
}));

describe('AddInstitutionDialog — branches handleLogoChange(null) & toggleRegion add/remove', () => {
  it('couvre L85 et L90–93 puis submit (validation OK)', async () => {
    const { createInstitution } = jest.requireMock('@/lib/api/institutions') as {
      createInstitution: jest.Mock;
    };

    // On capture les valeurs envoyées au submit pour vérifier regionsDesservies
    createInstitution.mockImplementation(async (values: InstitutionFormValues) => {
      expect(values.nom).toBe('Banque Test');
      expect(values.type).toBe('Banque');
      expect(values.description).toMatch(/description valide/i);
      expect(values.siteWeb).toBe('https://example.com');
      // Après add → remove → add, on doit avoir de nouveau 'DAKAR' pour passer la validation min(1)
      expect(values.regionsDesservies).toEqual(['DAKAR']);
      return {
        id: 'ok',
        nom: values.nom,
        type: values.type,
        description: values.description,
        siteWeb: values.siteWeb,
        statut: 'Actif',
        createdAt: new Date().toISOString(),
      };
    });

    const onOpenChange = jest.fn();
    render(<AddInstitutionDialog open={true} onOpenChange={onOpenChange} />);

    // Étape 1 : couvre L85 (logo null)
    fireEvent.click(screen.getByRole('button', { name: /clear-logo/i }));

    // Remplit le formulaire pour passer la validation (nom/type/description/siteWeb)
    fireEvent.click(screen.getByRole('button', { name: /fill-valid/i }));

    // Étape 2
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    await waitFor(() => {
      // le bouton suivant est visible à l’étape 2
      expect(screen.getByRole('button', { name: /suivant/i })).toBeInTheDocument();
    });

    // Étape 3
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
    });

    // L90–93: add → remove → add
    fireEvent.click(screen.getByRole('button', { name: /toggle-dakar/i })); // add
    fireEvent.click(screen.getByRole('button', { name: /toggle-dakar/i })); // remove
    fireEvent.click(screen.getByRole('button', { name: /toggle-dakar/i })); // add à nouveau (validation OK)

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    await waitFor(() => {
      expect(createInstitution).toHaveBeenCalledTimes(1);
    });
  });
});

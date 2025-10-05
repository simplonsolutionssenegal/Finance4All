import React from 'react';
import { render, screen } from '@testing-library/react';

// ⚠️ Chemin vers la page à tester
import InstitutionPage from '@/app/(auth)/institutions/show/page';

// --- Mocks des enfants pour isoler la page ---
// On vérifie que le header est rendu
jest.mock('@/components/institutions/InstituteHeaderProps', () => {
  return function MockInstituteHeader() {
    return <div data-testid='institute-header'>InstituteHeader</div>;
  };
});

// On capture l'ID passé à InstitutionClient
jest.mock('@/components/institutions/InstitutionClient', () => {
  return function MockInstitutionClient(props: { institutionId: string }) {
    return <div data-testid='institution-client'>{props.institutionId}</div>;
  };
});

describe('InstitutionPage (server component)', () => {
  it('rend le header et passe l’ID par défaut quand searchParams.id est absent', () => {
    render(<InstitutionPage searchParams={{}} />);

    // Le header mocké est bien rendu
    expect(screen.getByTestId('institute-header')).toBeInTheDocument();

    // L’ID par défaut est celui codé dans la page
    expect(screen.getByTestId('institution-client')).toHaveTextContent(
      '99e13ab0-b2df-423f-ba5b-c847c1dc0fef'
    );
  });

  it('passe l’ID fourni dans searchParams.id à InstitutionClient', () => {
    const customId = 'abc-123';
    render(<InstitutionPage searchParams={{ id: customId }} />);

    expect(screen.getByTestId('institution-client')).toHaveTextContent(customId);
  });

  it('applique le layout de page (wrapper principaux présents)', () => {
    render(<InstitutionPage searchParams={{}} />);
    // Quelques checks simples sur la structure
    // (tu peux les adapter à ta structure exacte si besoin)
    expect(document.body.querySelector('.min-h-full.bg-gray-50')).toBeTruthy();
    expect(document.body.querySelector('.space-y-6')).toBeTruthy();
  });
});

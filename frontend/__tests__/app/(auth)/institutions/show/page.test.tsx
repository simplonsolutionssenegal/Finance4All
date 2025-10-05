import React from 'react';
import { render, screen } from '@testing-library/react';

// On mocke les sous-composants
jest.mock('@/components/institutions/InstituteHeaderProps', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div data-testid='institute-header'>{name}</div>,
}));

jest.mock('@/components/institutions/InstitutionClient', () => ({
  __esModule: true,
  default: ({ institutionId }: { institutionId: string }) => (
    <div data-testid='institution-client'>{institutionId}</div>
  ),
}));

import InstitutionPage from '@/app/(auth)/institutions/show/page';

describe('InstitutionPage', () => {
  it('rend correctement avec un id passé dans searchParams', async () => {
    const searchParams = Promise.resolve({ id: '12345' });

    // ⚠️ Ici on appelle la fonction async InstitutionPage et on attend son rendu
    const ui = await InstitutionPage({ searchParams });

    render(ui);

    expect(screen.getByTestId('institute-header')).toHaveTextContent('Nom de l’institut');
    expect(screen.getByTestId('institution-client')).toHaveTextContent('12345');
  });

  it('utilise la valeur par défaut quand aucun id n’est fourni', async () => {
    const searchParams = Promise.resolve({});

    const ui = await InstitutionPage({ searchParams });

    render(ui);

    expect(screen.getByTestId('institution-client')).toBeInTheDocument();
  });
});

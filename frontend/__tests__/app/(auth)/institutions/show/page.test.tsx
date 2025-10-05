import React from 'react';
import { render, screen } from '@testing-library/react';

// ⚠️ Mocker les sous-composants pour inspecter les props facilement
jest.mock('@/components/institutions/InstitutionClient', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='institution-client' data-props={JSON.stringify(props)} />
  ),
}));

jest.mock('@/components/institutions/InstituteHeaderProps', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='institute-header' data-props={JSON.stringify(props)} />
  ),
}));

// IMPORTANT: importer le composant APRÈS les mocks
import InstitutionPage from '@/app/(auth)/institutions/show/page';

describe('InstitutionPage', () => {
  const FALLBACK_ID = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';

  it('utilise searchParams.id quand il est fourni', async () => {
    const id = 'custom-id-123';
    const element = await InstitutionPage({ searchParams: { id } });
    render(element);

    const client = screen.getByTestId('institution-client');
    const clientProps = JSON.parse(client.getAttribute('data-props')!);

    expect(clientProps).toEqual(expect.objectContaining({ institutionId: id }));
  });

  it('utilise l’ID par défaut quand searchParams.id est absent', async () => {
    const element = await InstitutionPage({ searchParams: {} });
    render(element);

    const client = screen.getByTestId('institution-client');
    const clientProps = JSON.parse(client.getAttribute('data-props')!);

    expect(clientProps).toEqual(expect.objectContaining({ institutionId: FALLBACK_ID }));
  });

  it('ne modifie pas searchParams (objet gelé) → aucune exception', async () => {
    const frozen = Object.freeze({ id: 'frozen-1' as const });
    // Si la page tentait de muter l’objet, la ligne suivante lèverait.
    await expect(InstitutionPage({ searchParams: frozen as any })).resolves.not.toThrow;

    const element = await InstitutionPage({ searchParams: frozen as any });
    render(element);

    const client = screen.getByTestId('institution-client');
    const clientProps = JSON.parse(client.getAttribute('data-props')!);
    expect(clientProps).toEqual(expect.objectContaining({ institutionId: 'frozen-1' }));
  });
});

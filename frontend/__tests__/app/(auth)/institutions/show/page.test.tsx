// __tests__/app/(auth)/institutions/show/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock des composants enfants
jest.mock('@/components/institutions/InstituteHeaderProps', () => ({
  __esModule: true,
  default: () => <div data-testid='header' />,
}));

const InstitutionClientMock = jest.fn(({ institutionId }: { institutionId: string }) => (
  <div data-testid='client' data-id={institutionId} />
));
jest.mock('@/components/institutions/InstitutionClient', () => ({
  __esModule: true,
  default: (props: any) => InstitutionClientMock(props),
}));

// ⚠️ Import de la page après les mocks
import InstitutionPage from '@/app/(auth)/institutions/show/page';

describe('InstitutionPage (app/(auth)/institutions/show/page.tsx)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passe l’id reçu via searchParams (Promise) à InstitutionClient', async () => {
    const SP_ID = '11111111-2222-4333-8444-555555555555';

    const element = await InstitutionPage({
      searchParams: Promise.resolve({ id: SP_ID }),
    });
    render(element);

    const client = screen.getByTestId('client');
    expect(client).toBeInTheDocument();
    expect(client).toHaveAttribute('data-id', SP_ID);

    // ✅ Un seul argument: les props
    expect(InstitutionClientMock).toHaveBeenCalledTimes(1);
    expect(InstitutionClientMock).toHaveBeenCalledWith(
      expect.objectContaining({ institutionId: SP_ID })
    );
  });

  it('utilise l’UUID par défaut si searchParams est undefined', async () => {
    const DEFAULT_ID = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';

    const element = await InstitutionPage({});
    render(element);

    const client = screen.getByTestId('client');
    expect(client).toHaveAttribute('data-id', DEFAULT_ID);

    expect(InstitutionClientMock).toHaveBeenCalledTimes(1);
    expect(InstitutionClientMock).toHaveBeenCalledWith(
      expect.objectContaining({ institutionId: DEFAULT_ID })
    );
  });

  it('utilise l’UUID par défaut si searchParams résout vers un objet sans id', async () => {
    const DEFAULT_ID = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';

    const element = await InstitutionPage({ searchParams: Promise.resolve({}) });
    render(element);

    const client = screen.getByTestId('client');
    expect(client).toHaveAttribute('data-id', DEFAULT_ID);

    expect(InstitutionClientMock).toHaveBeenCalledTimes(1);
    expect(InstitutionClientMock).toHaveBeenCalledWith(
      expect.objectContaining({ institutionId: DEFAULT_ID })
    );
  });
});

// __tests__/pages/admin/institutions/EditServicePage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';

// 1) Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// 2) Mock du composant enfant pour capturer les props
jest.mock('@/components/admin/institutions/EditServiceComponent', () => ({
  __esModule: true,
  default: jest.fn((props: { institutionId: string; serviceId: string }) => (
    <div data-testid='edit-service-component'>
      institutionId:{props.institutionId} / serviceId:{props.serviceId}
    </div>
  )),
}));

// Récupérer le mock pour inspecter les appels
import MockEditServiceComponent from '@/components/admin/institutions/EditServiceComponent';
import EditServicePage from '@/app/(auth)/institutions/[id]/service/[serviceId]/update/page';

describe('EditServicePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rend EditServiceComponent avec institutionId=params.id et serviceId=params.serviceId', () => {
    (useParams as jest.Mock).mockReturnValue({
      id: 'inst-123',
      serviceId: 'service-456',
    });

    render(<EditServicePage />);

    // Vérifie que le composant enfant est bien rendu
    expect(screen.getByTestId('edit-service-component')).toBeInTheDocument();
    expect(screen.getByText(/institutionId:inst-123/i)).toBeInTheDocument();
    expect(screen.getByText(/serviceId:service-456/i)).toBeInTheDocument();

    // Vérifie que le composant a été appelé avec les bonnes props
    const calls = (MockEditServiceComponent as unknown as jest.Mock).mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toEqual({
      institutionId: 'inst-123',
      serviceId: 'service-456',
    });
  });

  it('appelle useParams() une seule fois', () => {
    (useParams as jest.Mock).mockReturnValue({
      id: 'inst-1',
      serviceId: 'srv-1',
    });

    render(<EditServicePage />);

    expect(useParams).toHaveBeenCalledTimes(1);
  });
});

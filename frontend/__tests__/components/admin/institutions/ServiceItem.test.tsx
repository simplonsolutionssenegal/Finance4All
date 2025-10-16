import { render, screen } from '@testing-library/react';

import ServiceItem from '@/components/admin/institutions/ServiceItem';
import { TypeService, type Service } from '@/types/Service';

const mockService: Service = {
  id: '1',
  name: 'Test Service',
  longName: 'Test Service Long Name',
  type: TypeService.PAIEMENT_MARCHAND,
  frais: {
    montantFixe: 100,
    pourcentage: 1,
    minimum: 50,
    maximum: 200,
  },
  conditionAccess: ['Condition 1', 'Condition 2'],
  plafonds: ['Plafond 1', 'Plafond 2'],
  infrastructureAccess: ['Infra 1', 'Infra 2'],
  institutionId: '1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isGratuit: true,
};

describe('ServiceItem', () => {
  it('renders all service details', () => {
    render(<ServiceItem service={mockService} />);

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Test Service Long Name')).toBeInTheDocument();
    expect(screen.getByText(TypeService.PAIEMENT_MARCHAND)).toBeInTheDocument();
    expect(screen.getByText('100 FCFA fixe, 1%, min: 50 FCFA, max: 200 FCFA')).toBeInTheDocument();
    expect(screen.getByText('Condition 1')).toBeInTheDocument();
    expect(screen.getByText('Condition 2')).toBeInTheDocument();
    expect(screen.getByText('Plafond 1')).toBeInTheDocument();
    expect(screen.getByText('Plafond 2')).toBeInTheDocument();
    expect(screen.getByText('Infra 1')).toBeInTheDocument();
    expect(screen.getByText('Infra 2')).toBeInTheDocument();
  });

  it('formats frais correctly with only fixed amount', () => {
    const serviceWithOnlyFixedFrais: Service = {
      ...mockService,
      frais: { montantFixe: 150 },
    };
    render(<ServiceItem service={serviceWithOnlyFixedFrais} />);
    expect(screen.getByText('150 FCFA fixe')).toBeInTheDocument();
  });

  it('formats frais correctly with only percentage', () => {
    const serviceWithOnlyPercentageFrais: Service = {
      ...mockService,
      frais: { pourcentage: 2.5 },
    };
    render(<ServiceItem service={serviceWithOnlyPercentageFrais} />);
    expect(screen.getByText('2.5%')).toBeInTheDocument();
  });

  it('returns "Aucun frais" when no fees are provided', () => {
    const serviceWithoutFrais: Service = {
      ...mockService,
      frais: {},
    };
    render(<ServiceItem service={serviceWithoutFrais} />);
    expect(screen.getByText('Aucun frais')).toBeInTheDocument();
  });

  it('does not render conditionAccess section if empty', () => {
    const serviceWithoutConditions: Service = {
      ...mockService,
      conditionAccess: [],
    };
    render(<ServiceItem service={serviceWithoutConditions} />);
    expect(screen.queryByText("Conditions d'accès")).not.toBeInTheDocument();
  });

  it('does not render plafonds section if empty', () => {
    const serviceWithoutPlafonds: Service = {
      ...mockService,
      plafonds: [],
    };
    render(<ServiceItem service={serviceWithoutPlafonds} />);
    expect(screen.queryByText('Plafonds')).not.toBeInTheDocument();
  });

  it('does not render infrastructureAccess section if empty', () => {
    const serviceWithoutInfra: Service = {
      ...mockService,
      infrastructureAccess: [],
    };
    render(<ServiceItem service={serviceWithoutInfra} />);
    expect(screen.queryByText("Infrastructure d'accès")).not.toBeInTheDocument();
  });
});

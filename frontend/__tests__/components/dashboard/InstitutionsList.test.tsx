import { render, screen } from '@testing-library/react';

import InstitutionsList from '@/components/dashboard/InstitutionsList';

const mockInstitutions = [
  { id: '1', name: 'Banque Atlantique', geographicZones: ['Senegal'], status: 'ACTIVE' },
  { id: '2', name: 'Ecobank', geographicZones: ['Senegal', 'Cameroun'], status: 'ACTIVE' },
  { id: '3', name: 'SGBS', geographicZones: ['Senegal'], status: 'INACTIVE' },
];

jest.mock('@/hooks/institution/useGetInstitutions', () => ({
  useGetInstitutions: () => ({
    institutions: mockInstitutions,
    isLoading: false,
  }),
}));

describe('InstitutionsList', () => {
  it('renders the title', () => {
    render(<InstitutionsList />);
    expect(screen.getByText('Institutions financieres')).toBeInTheDocument();
  });

  it('renders all institutions', () => {
    render(<InstitutionsList />);
    expect(screen.getByText('Banque Atlantique')).toBeInTheDocument();
    expect(screen.getByText('Ecobank')).toBeInTheDocument();
    expect(screen.getByText('SGBS')).toBeInTheDocument();
  });

  it('renders geographic zones', () => {
    render(<InstitutionsList />);
    const senegalZones = screen.getAllByText('Senegal');
    expect(senegalZones.length).toBe(2); // institutions 1 and 3
    expect(screen.getByText('Senegal, Cameroun')).toBeInTheDocument();
  });

  it('renders status badges', () => {
    render(<InstitutionsList />);
    const activeBadges = screen.getAllByText('Actif');
    const inactiveBadges = screen.getAllByText('Inactif');
    expect(activeBadges.length).toBe(2);
    expect(inactiveBadges.length).toBe(1);
  });

  it('applies correct status styling', () => {
    const { container } = render(<InstitutionsList />);
    const greenDots = container.querySelectorAll('.bg-green-500');
    const grayDots = container.querySelectorAll('.bg-gray-400');
    expect(greenDots.length).toBe(2);
    expect(grayDots.length).toBe(1);
  });
});

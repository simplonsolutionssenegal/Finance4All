import { render, screen } from '@testing-library/react';

import CertificatsPage from '@/app/(auth)/certificats/page';

jest.mock('@/components/certificats/certificats-header-stats', () => ({
  __esModule: true,
  default: ({ items }: { items: Array<{ label: string }> }) => (
    <div data-testid='certificats-header-stats'>stats:{items.length}</div>
  ),
}));

jest.mock('@/components/certificats/certificate-card', () => ({
  __esModule: true,
  default: ({ certificate }: { certificate: { title: string } }) => (
    <div data-testid='certificate-card'>{certificate.title}</div>
  ),
}));

describe('CertificatsPage', () => {
  it('renders title and subtitle', () => {
    render(<CertificatsPage />);

    expect(screen.getByText('Mes Certificats')).toBeInTheDocument();
    expect(screen.getByText('Vos reussites et accomplissements')).toBeInTheDocument();
  });

  it('renders header stats and mocked certificate cards', () => {
    render(<CertificatsPage />);

    expect(screen.getByTestId('certificats-header-stats')).toHaveTextContent('stats:4');
    expect(screen.getAllByTestId('certificate-card')).toHaveLength(3);
  });
});

import { render, screen } from '@testing-library/react';

import CertificatsHeaderStats from '@/components/certificats/certificats-header-stats';
import { CERTIFICAT_HEADER_STATS } from '@/types/utils/certificats-data';

describe('CertificatsHeaderStats', () => {
  it('renders all stats cards', () => {
    render(<CertificatsHeaderStats items={CERTIFICAT_HEADER_STATS} />);

    expect(screen.getByText('Certificats obtenus')).toBeInTheDocument();
    expect(screen.getByText('8/26')).toBeInTheDocument();
    expect(screen.getByText("Temps d'apprentissage")).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});

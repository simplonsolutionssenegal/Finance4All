import { render, screen } from '@testing-library/react';

import CertificateCard from '@/components/certificats/certificate-card';
import type { CertificateItem } from '@/types/utils/certificats-data';

const certificate: CertificateItem = {
  id: 'c1',
  title: 'Expert Mobile Money',
  subtitle: 'Mobile Money avance',
  date: '12 Octobre 2025',
  score: 98,
  level: 'Excellence',
};

describe('CertificateCard', () => {
  it('renders certificate content and actions', () => {
    render(<CertificateCard certificate={certificate} />);

    expect(screen.getByText('Expert Mobile Money')).toBeInTheDocument();
    expect(screen.getByText('Mobile Money avance')).toBeInTheDocument();
    expect(screen.getByText('12 Octobre 2025')).toBeInTheDocument();
    expect(screen.getByText('98/100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /telecharger/i })).toBeInTheDocument();
  });
});

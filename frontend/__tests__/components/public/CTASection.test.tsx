import { render, screen } from '@testing-library/react';

import CTASection from '@/components/public/CTASection';

describe('CTASection', () => {
  it('should render without crashing', () => {
    render(<CTASection />);
    expect(screen.getByText(/Prêt à transformer votre vie financière/)).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<CTASection />);
    expect(screen.getByText(/Prêt à transformer votre vie financière/)).toBeInTheDocument();
  });

  it('should display the description', () => {
    render(<CTASection />);
    expect(screen.getByText(/Rejoignez plus de 10,000 utilisateurs/)).toBeInTheDocument();
  });

  it('should render CTA buttons', () => {
    render(<CTASection />);
    expect(screen.getByText('Créer mon compte gratuit')).toBeInTheDocument();
    expect(screen.getByText('Essayer le comparateur')).toBeInTheDocument();
  });

  it('should display trust indicators', () => {
    render(<CTASection />);
    expect(screen.getByText('Données sécurisées')).toBeInTheDocument();
    expect(screen.getByText(/SN & 🇨🇲 CM/)).toBeInTheDocument();
  });

  it('should have proper section structure', () => {
    const { container } = render(<CTASection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('relative', 'py-32');
  });

  it('should have gradient background', () => {
    const { container } = render(<CTASection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-gradient-primary');
  });
});

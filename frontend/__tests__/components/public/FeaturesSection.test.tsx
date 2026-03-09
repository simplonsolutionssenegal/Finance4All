import { render, screen } from '@testing-library/react';

import FeaturesSection from '@/components/public/FeaturesSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('FeaturesSection', () => {
  it('should render without crashing', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Nos Services')).toBeInTheDocument();
  });

  it('should display section title', () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Tout ce dont vous avez besoin/)).toBeInTheDocument();
    expect(screen.getByText(/pour réussir financièrement/)).toBeInTheDocument();
  });

  it('should display all feature cards', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Éducation financière')).toBeInTheDocument();
    expect(screen.getByText('Comparateur intelligent')).toBeInTheDocument();
    expect(screen.getByText('Simulateur de services')).toBeInTheDocument();
    expect(screen.getByText('Sécurité garantie')).toBeInTheDocument();
  });

  it('should have correct links in feature cards', () => {
    render(<FeaturesSection />);
    const links = screen.getAllByRole('link', { name: /En savoir plus/i });
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute('href', '/modules-formation');
    expect(links[1]).toHaveAttribute('href', '/comparator');
    expect(links[2]).toHaveAttribute('href', '/simulator');
    expect(links[3]).toHaveAttribute('href', '/privacy');
  });

  it('should have proper section structure', () => {
    const { container } = render(<FeaturesSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-32', 'bg-grey-50');
  });
});

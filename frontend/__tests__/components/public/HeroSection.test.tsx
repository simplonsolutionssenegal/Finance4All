import { render, screen } from '@testing-library/react';

import HeroSection from '@/components/public/HeroSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('HeroSection', () => {
  it('should render without crashing', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Prenez le contrôle de/)).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Prenez le contrôle de/)).toBeInTheDocument();
    expect(screen.getByText(/votre avenir financier/)).toBeInTheDocument();
  });

  it('should display the subtitle', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Finance4All vous accompagne dans votre parcours/)).toBeInTheDocument();
  });

  it('should render CTA buttons', () => {
    render(<HeroSection />);
    expect(screen.getByText('Commencer gratuitement')).toBeInTheDocument();
    expect(screen.getByText('Voir le comparateur')).toBeInTheDocument();
  });

  it('should render social proof with user avatars', () => {
    render(<HeroSection />);
    expect(screen.getByText(/utilisateurs satisfaits/)).toBeInTheDocument();
    expect(screen.getByText('10,000+')).toBeInTheDocument();
  });

  it('should render floating cards', () => {
    render(<HeroSection />);
    expect(screen.getByText('Économies')).toBeInTheDocument();
    expect(screen.getByText('+35%')).toBeInTheDocument();
    expect(screen.getByText('Modules complétés')).toBeInTheDocument();
    expect(screen.getByText('12/24')).toBeInTheDocument();
  });

  it('should render hero image', () => {
    render(<HeroSection />);
    const images = screen.getAllByAltText('Finance4All App');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should have proper section structure', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('relative', 'pt-28', 'pb-20');
  });
});

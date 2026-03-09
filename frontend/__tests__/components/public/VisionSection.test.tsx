import { render, screen } from '@testing-library/react';

import VisionSection from '@/components/public/VisionSection';

describe('VisionSection', () => {
  it('should render without crashing', () => {
    render(<VisionSection />);
    expect(screen.getByText('Notre Vision')).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<VisionSection />);
    expect(
      screen.getByText(/Technologie & Innovation au service de l'inclusion financière/)
    ).toBeInTheDocument();
  });

  it('should display vision cards', () => {
    render(<VisionSection />);
    expect(screen.getByText('Décisions éclairées')).toBeInTheDocument();
    expect(screen.getByText('Apprentissage personnalisé')).toBeInTheDocument();
    expect(screen.getByText('Accessible partout')).toBeInTheDocument();
  });

  it('should display the 100% Innovation floating card', () => {
    render(<VisionSection />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Innovation')).toBeInTheDocument();
  });

  it('should have a CTA link to register', () => {
    render(<VisionSection />);
    const link = screen.getByRole('link', { name: /Découvrir la plateforme/i });
    expect(link).toHaveAttribute('href', '/register');
  });

  it('should render the vision image', () => {
    render(<VisionSection />);
    const image = screen.getByAltText('Professionnels africains et technologie financière');
    expect(image).toBeInTheDocument();
  });

  it('should have proper section structure', () => {
    const { container } = render(<VisionSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-32', 'bg-gradient-to-br');
  });
});

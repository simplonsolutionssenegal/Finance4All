import { render, screen } from '@testing-library/react';

import AboutCta from '@/components/public/about/about-cta';
import AboutHero from '@/components/public/about/about-hero';
import AboutMission from '@/components/public/about/about-mission';
import AboutStats from '@/components/public/about/about-stats';
import AboutTimeline from '@/components/public/about/about-timeline';
import AboutValues from '@/components/public/about/about-values';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('About sections', () => {
  it('renders hero content', () => {
    render(<AboutHero />);
    expect(screen.getByText(/Finance pour tous/)).toBeInTheDocument();
    expect(screen.getByText(/plateforme/i)).toBeInTheDocument();
  });

  it('renders stats values', () => {
    render(<AboutStats />);
    expect(screen.getByText('10 000+')).toBeInTheDocument();
    expect(screen.getByText('Note moyenne')).toBeInTheDocument();
  });

  it('renders mission bullets and card info', () => {
    render(<AboutMission />);
    expect(screen.getByText('Nos missions')).toBeInTheDocument();
    expect(screen.getByText(/Démocratiser l'éducation financière en Afrique/i)).toBeInTheDocument();
    expect(screen.getByText('Apprentissage adaptatif')).toBeInTheDocument();
    expect(screen.getByText('2 pays')).toBeInTheDocument();
  });

  it('renders values cards', () => {
    render(<AboutValues />);
    expect(screen.getByText('Nos Valeurs')).toBeInTheDocument();
    expect(screen.getByText('Innovation')).toBeInTheDocument();
    expect(screen.getByText('Transparence')).toBeInTheDocument();
  });

  it('renders timeline entries', () => {
    render(<AboutTimeline />);
    expect(screen.getByText('Notre Parcours')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Expansion au Cameroun')).toBeInTheDocument();
  });

  it('renders about cta with two actions', () => {
    render(<AboutCta />);
    expect(screen.getByText(/Prêt à commencer votre parcours financier/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Créer mon compte gratuit/i })).toHaveAttribute(
      'href',
      '/register'
    );
    expect(screen.getByRole('link', { name: /Découvrir nos modules/i })).toHaveAttribute(
      'href',
      '/modules-formation'
    );
  });
});

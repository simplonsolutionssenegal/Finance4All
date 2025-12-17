import { render, screen } from '@testing-library/react';

import Home from '@/app/page';

jest.mock('@/components/public/layout/header', () => {
  return function MockPublicHeader() {
    return <header data-testid='public-header'>Header</header>;
  };
});

jest.mock('@/components/public/layout/footer', () => {
  return function MockPublicFooter() {
    return <footer data-testid='public-footer'>Footer</footer>;
  };
});

jest.mock('@/components/public/HeroSection', () => {
  return function MockHeroSection() {
    return (
      <section data-testid='hero-section'>
        <h1>
          Prenez le contrôle de <span>votre avenir financier</span>
        </h1>
        <p>
          Finance4All vous accompagne dans votre parcours d&apos;inclusion financière avec des
          outils intelligents, des formations gratuites et un accompagnement personnalisé.
        </p>
        <button>Commencer gratuitement</button>
        <button>Voir le comparateur</button>
      </section>
    );
  };
});

jest.mock('@/components/public/StatsSection', () => {
  return function MockStatsSection() {
    return <section data-testid='stats-section'>Stats</section>;
  };
});

jest.mock('@/components/public/FeaturesSection', () => {
  return function MockFeaturesSection() {
    return <section data-testid='features-section'>Features</section>;
  };
});

jest.mock('@/components/public/EducationSection', () => {
  return function MockEducationSection() {
    return <section data-testid='education-section'>Education</section>;
  };
});

jest.mock('@/components/public/HowItWorks', () => {
  return function MockHowItWorks() {
    return <section data-testid='how-it-works'>How It Works</section>;
  };
});

jest.mock('@/components/public/VisionSection', () => {
  return function MockVisionSection() {
    return <section data-testid='vision-section'>Vision</section>;
  };
});

jest.mock('@/components/public/TestimonialSection', () => {
  return function MockTestimonialSection() {
    return <section data-testid='testimonial-section'>Testimonials</section>;
  };
});

jest.mock('@/components/public/CTASection', () => {
  return function MockCTASection() {
    return (
      <section data-testid='cta-section'>
        <h2>Prêt à transformer votre vie financière ?</h2>
        <button>Créer mon compte gratuit</button>
      </section>
    );
  };
});

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByTestId('public-header')).toBeInTheDocument();
    expect(screen.getByTestId('public-footer')).toBeInTheDocument();
  });

  it('should be a function that returns JSX', () => {
    expect(typeof Home).toBe('function');
    const result = Home();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });

  it('has proper CSS classes for responsive design', () => {
    const { container } = render(<Home />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('has correct structure with header and footer', () => {
    const { container } = render(<Home />);
    expect(container.querySelector('[data-testid="public-header"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="public-footer"]')).toBeInTheDocument();
  });

  it('renders all section components', () => {
    render(<Home />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('stats-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.getByTestId('education-section')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
    expect(screen.getByTestId('vision-section')).toBeInTheDocument();
    expect(screen.getByTestId('testimonial-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
  });

  it('contains all main sections', () => {
    const { container } = render(<Home />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(8);
  });

  it('displays hero section content', () => {
    render(<Home />);
    expect(screen.getByText(/Prenez le contrôle de/)).toBeInTheDocument();
    expect(screen.getByText(/votre avenir financier/)).toBeInTheDocument();
    expect(screen.getByText(/Finance4All vous accompagne dans votre parcours/)).toBeInTheDocument();
  });

  it('displays hero section CTA buttons', () => {
    render(<Home />);
    expect(screen.getByText('Commencer gratuitement')).toBeInTheDocument();
    expect(screen.getByText('Voir le comparateur')).toBeInTheDocument();
  });

  it('displays CTA section content', () => {
    render(<Home />);
    expect(screen.getByText(/Prêt à transformer votre vie financière/)).toBeInTheDocument();
    expect(screen.getByText('Créer mon compte gratuit')).toBeInTheDocument();
  });

  it('renders sections in correct order', () => {
    const { container } = render(<Home />);
    const sections = Array.from(container.querySelectorAll('section'));
    const testIds = sections.map(section => section.getAttribute('data-testid')).filter(Boolean);

    expect(testIds).toEqual([
      'hero-section',
      'stats-section',
      'features-section',
      'education-section',
      'how-it-works',
      'vision-section',
      'testimonial-section',
      'cta-section',
    ]);
  });
});

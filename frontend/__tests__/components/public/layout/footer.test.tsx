import { render, screen } from '@testing-library/react';

import PublicFooter from '@/components/public/layout/footer';

describe('PublicFooter', () => {
  it('should be a function that returns JSX', () => {
    expect(typeof PublicFooter).toBe('function');
    const result = PublicFooter();
    expect(result).toBeDefined();
    expect(result.type).toBe('footer');
    expect(result.props).toBeDefined();
    expect(result.props.className).toContain('bg-gray-900');
  });

  it('should render without crashing', () => {
    render(<PublicFooter />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should display the Finance4All brand section', () => {
    render(<PublicFooter />);
    expect(screen.getByText('Finance4All')).toBeInTheDocument();
    expect(
      screen.getByText('Votre partenaire pour une meilleure gestion financière.')
    ).toBeInTheDocument();
  });

  it('should render Services section with all links', () => {
    render(<PublicFooter />);

    expect(screen.getByText('Services')).toBeInTheDocument();

    const serviceLinks = [
      { text: 'Comparator', href: '/comparator' },
      { text: 'Formation', href: '/formations' },
      { text: 'Conseil', href: '/conseil' },
    ];

    serviceLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should render Support section with all links', () => {
    render(<PublicFooter />);

    expect(screen.getByText('Support')).toBeInTheDocument();

    const supportLinks = [
      { text: 'FAQ', href: '/faq' },
      { text: 'Contact', href: '/contact' },
      { text: 'Aide', href: '/help' },
    ];

    supportLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should render Contact section with contact information', () => {
    render(<PublicFooter />);

    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByText(/\+221 77 123 45 67/)).toBeInTheDocument();
    expect(screen.getByText(/contact@finance4all\.sn/)).toBeInTheDocument();
  });

  it('should render copyright section', () => {
    render(<PublicFooter />);
    expect(screen.getByText('© 2024 Finance4All. Tous droits réservés.')).toBeInTheDocument();
  });

  it('should have proper footer styling', () => {
    render(<PublicFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-gray-900', 'text-white', 'py-16');
  });

  it('should have responsive grid layout', () => {
    render(<PublicFooter />);
    const footer = screen.getByRole('contentinfo');

    // Check main container classes
    const container = footer.querySelector('.max-w-7xl');
    expect(container).toHaveClass('mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    // Check grid layout
    const gridContainer = container?.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-4', 'gap-8');
  });

  it('should style section headings correctly', () => {
    render(<PublicFooter />);

    const brandHeading = screen.getByRole('heading', { name: 'Finance4All' });
    expect(brandHeading).toHaveClass('text-xl', 'font-bold', 'mb-4');

    const servicesHeading = screen.getByRole('heading', { name: 'Services' });
    expect(servicesHeading).toHaveClass('font-bold', 'mb-4');

    const supportHeading = screen.getByRole('heading', { name: 'Support' });
    expect(supportHeading).toHaveClass('font-bold', 'mb-4');

    const contactHeading = screen.getByRole('heading', { name: 'Contact' });
    expect(contactHeading).toHaveClass('font-bold', 'mb-4');
  });

  it('should style links correctly', () => {
    render(<PublicFooter />);

    const serviceLinks = [
      screen.getByRole('link', { name: 'Comparator' }),
      screen.getByRole('link', { name: 'Formation' }),
      screen.getByRole('link', { name: 'Conseil' }),
    ];

    serviceLinks.forEach(link => {
      expect(link.closest('li')).toBeInTheDocument();
      expect(link.closest('ul')).toHaveClass('space-y-2', 'text-sm', 'text-gray-400');
    });
  });

  it('should style brand description correctly', () => {
    render(<PublicFooter />);
    const description = screen.getByText('Votre partenaire pour une meilleure gestion financière.');
    expect(description).toHaveClass('text-gray-400', 'text-sm');
  });

  it('should style contact information correctly', () => {
    render(<PublicFooter />);
    const contactInfo = screen.getByText(/\+221 77 123 45 67/);
    expect(contactInfo).toHaveClass('text-gray-400', 'text-sm');
  });

  it('should have proper copyright section styling', () => {
    render(<PublicFooter />);
    const copyrightSection = screen
      .getByText('© 2024 Finance4All. Tous droits réservés.')
      .closest('div');
    expect(copyrightSection).toHaveClass(
      'border-t',
      'border-gray-800',
      'mt-12',
      'pt-8',
      'text-center',
      'text-gray-400',
      'text-sm'
    );
  });

  it('should render all sections in correct structure', () => {
    render(<PublicFooter />);

    // Check that we have 4 main sections in the grid
    const footer = screen.getByRole('contentinfo');
    const gridContainer = footer.querySelector('.grid');
    const sections = gridContainer?.children;

    expect(sections).toHaveLength(4);
  });

  it('should have accessibility-friendly structure', () => {
    render(<PublicFooter />);

    // Footer should have proper landmark role
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // All section links should be accessible
    const allLinks = [
      'Comparator',
      'Formation',
      'Conseil', // Services
      'FAQ',
      'Contact',
      'Aide', // Support
    ];

    allLinks.forEach(linkText => {
      expect(screen.getByRole('link', { name: linkText })).toBeInTheDocument();
    });
  });

  it('should contain contact information with proper formatting', () => {
    render(<PublicFooter />);

    // Check phone number format
    expect(screen.getByText(/📞 \+221 77 123 45 67/)).toBeInTheDocument();

    // Check email format
    expect(screen.getByText(/📧 contact@finance4all\.sn/)).toBeInTheDocument();
  });

  it('should have proper list structure for navigation links', () => {
    render(<PublicFooter />);

    // Check Services list
    const servicesSection = screen.getByRole('heading', { name: 'Services' }).parentElement;
    const servicesList = servicesSection?.querySelector('ul');
    expect(servicesList).toBeInTheDocument();
    expect(servicesList?.children).toHaveLength(3);

    // Check Support list
    const supportSection = screen.getByRole('heading', { name: 'Support' }).parentElement;
    const supportList = supportSection?.querySelector('ul');
    expect(supportList).toBeInTheDocument();
    expect(supportList?.children).toHaveLength(3);
  });
});

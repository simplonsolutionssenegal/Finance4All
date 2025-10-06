import { render, screen, within } from '@testing-library/react';

import PublicHeader from '@/components/public/layout/header';

describe('PublicHeader', () => {
  it('should be a function that returns JSX', () => {
    expect(typeof PublicHeader).toBe('function');
    const result = PublicHeader();
    expect(result).toBeDefined();
    expect(result.type).toBe('header');
  });

  it('should render without crashing', () => {
    render(<PublicHeader />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should display the Finance4All logo', () => {
    render(<PublicHeader />);
    expect(screen.getByText('Finance4All')).toBeInTheDocument();
  });

  it('should have the correct logo styling', () => {
    render(<PublicHeader />);
    const logo = screen.getByText('Finance4All');
    expect(logo).toHaveClass('text-2xl', 'font-bold', 'text-teal-600');
  });

  it('should render navigation menu with all links', () => {
    render(<PublicHeader />);

    const navLinks = [
      { text: 'Simulateur', href: '/product-simulator' },
      { text: 'Comparateur', href: '/comparator' },
      { text: 'Formation', href: '/formations' },
      { text: 'FAQ', href: '/faq' },
      { text: 'À Propos', href: '/about-us' },
    ];

    navLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should apply correct navigation link styles', () => {
    render(<PublicHeader />);

    const nav = screen.getByRole('navigation');
    const navLinks = within(nav).getAllByRole('link');
    navLinks.forEach(link => {
      expect(link).toHaveClass('text-gray-700', 'hover:text-teal-600');
    });
  });

  it('should render the login button', () => {
    render(<PublicHeader />);
    const loginButton = screen.getByRole('link', { name: 'Se connecter' });
    expect(loginButton).toBeInTheDocument();
  });

  it('should apply correct button styling', () => {
    render(<PublicHeader />);
    const loginButton = screen.getByRole('link', { name: 'Se connecter' });
    expect(loginButton).toHaveClass(
      'bg-teal-600',
      'text-white',
      'px-6',
      'py-2',
      'rounded-lg',
      'hover:bg-teal-700'
    );
  });

  it('should have responsive navigation (hidden on mobile)', () => {
    render(<PublicHeader />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('hidden', 'md:flex');
  });

  it('should have proper header structure', () => {
    render(<PublicHeader />);

    // Check header has correct classes
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-sm');

    // Check container structure
    const container = header.querySelector('.max-w-7xl');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    // Check flex layout
    const flexContainer = container?.querySelector('.flex');
    expect(flexContainer).toHaveClass('justify-between', 'items-center', 'h-16');
  });

  it('should render all navigation links in correct order', () => {
    render(<PublicHeader />);

    const nav = screen.getByRole('navigation');
    const links = within(nav).getAllByRole('link');
    const expectedTexts = ['Simulateur', 'Comparateur', 'Formation', 'FAQ', 'À Propos'];

    expectedTexts.forEach((expectedText, index) => {
      expect(links[index]).toHaveTextContent(expectedText);
    });
  });

  it('should have accessibility-friendly structure', () => {
    render(<PublicHeader />);

    // Header should have proper landmark role
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Navigation should have proper role
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Button should be accessible
    expect(screen.getByRole('link', { name: 'Se connecter' })).toBeInTheDocument();

    // All links should be accessible
    const navLinks = ['Simulateur', 'Comparateur', 'Formation', 'FAQ', 'À Propos'];

    navLinks.forEach(linkText => {
      expect(screen.getByRole('link', { name: linkText })).toBeInTheDocument();
    });
  });
});

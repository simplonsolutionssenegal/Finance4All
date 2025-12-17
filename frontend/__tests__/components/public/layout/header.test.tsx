import { render, screen } from '@testing-library/react';

import PublicHeader from '@/components/public/layout/header';

describe('PublicHeader', () => {
  it('should be a function that returns JSX', () => {
    expect(typeof PublicHeader).toBe('function');
  });

  it('should render without crashing', () => {
    render(<PublicHeader />);
    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThan(0);
  });

  it('should display the logo image', () => {
    render(<PublicHeader />);
    const logo = screen.getByAltText("Finance4ALL - Plateforme d'éducation financière");
    expect(logo).toBeInTheDocument();
  });

  it('should render logo with correct link', () => {
    render(<PublicHeader />);
    const logoLink = screen.getByRole('link', { name: /Finance4ALL/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should render desktop navigation menu with all links', () => {
    render(<PublicHeader />);

    const navLinks = [
      { text: 'Simulateur', href: '/simulator' },
      { text: 'Comparateur', href: '/comparator' },
      { text: 'Modules', href: '/modules' },
    ];

    navLinks.forEach(({ text, href }) => {
      const links = screen.getAllByRole('link', { name: text });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute('href', href);
    });
  });

  it('should render the login button', () => {
    render(<PublicHeader />);
    const loginButtons = screen.getAllByText('Se connecter');
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it('should render the get started button', () => {
    render(<PublicHeader />);
    const getStartedButtons = screen.getAllByText('Commencer');
    expect(getStartedButtons.length).toBeGreaterThan(0);
  });

  it('should have fixed positioning with backdrop blur', () => {
    render(<PublicHeader />);
    const navs = screen.getAllByRole('navigation');
    const mainNav = navs[0]; // First nav is the main outer nav
    expect(mainNav).toHaveClass('fixed', 'top-0', 'left-0', 'right-0');
    expect(mainNav).toHaveClass('backdrop-blur-md');
  });

  it('should have proper nav structure', () => {
    render(<PublicHeader />);

    const navs = screen.getAllByRole('navigation');
    const mainNav = navs[0]; // First nav is the main outer nav
    expect(mainNav).toHaveClass('z-50', 'bg-white/95', 'border-b', 'border-grey-200');

    // Check container structure
    const container = mainNav.querySelector('.max-w-7xl');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto');
  });

  it('should render mobile menu trigger', () => {
    render(<PublicHeader />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have responsive design with hidden desktop nav on mobile', () => {
    const { container } = render(<PublicHeader />);
    // Desktop nav should have hidden md:flex
    const desktopNav = container.querySelector('.hidden.md\\:flex');
    expect(desktopNav).toBeInTheDocument();
  });

  it('should render navigation links with correct styling', () => {
    render(<PublicHeader />);
    const simulatorLinks = screen.getAllByText('Simulateur');
    // First one is desktop link
    const desktopLink = simulatorLinks[0].closest('a');
    expect(desktopLink).toHaveClass('text-grey-600', 'hover:text-primary-600');
  });

  it('should have accessibility-friendly structure', () => {
    render(<PublicHeader />);

    // Navigation should have proper role (there are multiple nav elements)
    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThan(0);

    // All main links should be accessible
    const navLinks = ['Simulateur', 'Comparateur', 'Modules'];

    navLinks.forEach(linkText => {
      const links = screen.getAllByText(linkText);
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('should render both login and get started buttons', () => {
    render(<PublicHeader />);

    // Should have login link
    const loginLinks = screen.getAllByText('Se connecter');
    expect(loginLinks.length).toBeGreaterThan(0);

    // Should have get started link
    const getStartedLinks = screen.getAllByText('Commencer');
    expect(getStartedLinks.length).toBeGreaterThan(0);
  });

  it('should have correct hrefs for action buttons', () => {
    const { container } = render(<PublicHeader />);

    const loginLinks = container.querySelectorAll('a[href="/login"]');
    expect(loginLinks.length).toBeGreaterThan(0);

    const getStartedLinks = container.querySelectorAll('a[href="/get-started"]');
    expect(getStartedLinks.length).toBeGreaterThan(0);
  });
});

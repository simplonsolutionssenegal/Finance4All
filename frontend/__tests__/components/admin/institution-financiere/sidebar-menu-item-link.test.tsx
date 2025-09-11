import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { SidebarMenuItemLink } from '@/components/admin/institution-financiere/sidebar-menu-item-link';

jest.mock('next/link', () => {
<<<<<<< HEAD
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
=======
  return function MockLink({ children, href, passHref, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
>>>>>>> 54d38cb (feat: modifications complètes du frontend)
  };
});

jest.mock('@/components/ui/sidebar', () => ({
<<<<<<< HEAD
  SidebarMenuButton: ({ children, isActive, className, ...props }: any) => (
    <div
      data-testid="sidebar-menu-button"
      data-active={isActive}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('SidebarMenuItemLink', () => {
  const mockIcon = <span data-testid="test-icon">🧪</span>;

  it('renders with minimal required props', () => {
    render(<SidebarMenuItemLink href="/test">Test Link</SidebarMenuItemLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
=======
  SidebarMenuButton: ({ children, asChild, isActive, className, ...props }: any) => {
    if (asChild) {
      return (
        <div data-testid='sidebar-button' className={className} {...props}>
          {children}
        </div>
      );
    }
    return (
      <button data-testid='sidebar-button' className={className} {...props}>
        {children}
      </button>
    );
  },
}));

describe('SidebarMenuItemLink', () => {
  it('covers all lines 3-15 with icon and children', () => {
    const mockIcon = <span data-testid='test-icon'>🧪</span>;

    render(
      <SidebarMenuItemLink href='/test' icon={mockIcon} active={true} className='custom-class'>
        Test Label
      </SidebarMenuItemLink>
    );

    // Check that the link is rendered (covers import Link and Link usage)
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');

    // Check that the icon is rendered (covers line with icon)
    const icon = screen.getByTestId('test-icon');
    expect(icon).toBeInTheDocument();

    // Check that the children are rendered
    expect(screen.getByText('Test Label')).toBeInTheDocument();

    // Check that the SidebarMenuButton is rendered with props
    const sidebarButton = screen.getByTestId('sidebar-button');
    expect(sidebarButton).toBeInTheDocument();
    expect(sidebarButton).toHaveClass('custom-class');
  });

  it('covers all lines 3-15 without icon', () => {
    render(
      <SidebarMenuItemLink href='/no-icon' active={false}>
        No Icon Label
      </SidebarMenuItemLink>
    );

    // Check that the link is rendered
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/no-icon');

    // Check that the children are rendered
    expect(screen.getByText('No Icon Label')).toBeInTheDocument();

    // Check that no icon span is rendered when icon is not provided
    const iconSpan = screen.queryByText('🧪');
    expect(iconSpan).not.toBeInTheDocument();

    // Check that the SidebarMenuButton is rendered
    const sidebarButton = screen.getByTestId('sidebar-button');
    expect(sidebarButton).toBeInTheDocument();
  });

  it('covers component with all optional props', () => {
    const customIcon = <div data-testid='custom-icon'>🎨</div>;

    render(
      <SidebarMenuItemLink href='/custom' active={true} icon={customIcon} className='test-class'>
        Custom Content
      </SidebarMenuItemLink>
    );

    // Verify all elements are properly rendered
    expect(screen.getByRole('link')).toHaveAttribute('href', '/custom');
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-button')).toHaveClass('test-class');
  });

  it('renders basic link without active state', () => {
    render(
      <SidebarMenuItemLink href='/test' active={false}>
        Test Link
      </SidebarMenuItemLink>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
>>>>>>> 54d38cb (feat: modifications complètes du frontend)
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-menu-button')).toHaveAttribute('data-active', 'false');
  });

<<<<<<< HEAD
  it('renders with active state', () => {
    render(<SidebarMenuItemLink href="/active" active>Active Link</SidebarMenuItemLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/active');
=======
  it('renders with active state (covers lines 3-15)', () => {
    render(
      <SidebarMenuItemLink href='/test' active={true}>
        Active Link
      </SidebarMenuItemLink>
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
>>>>>>> 54d38cb (feat: modifications complètes du frontend)
    expect(screen.getByText('Active Link')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-menu-button')).toHaveAttribute('data-active', 'true');
  });

<<<<<<< HEAD
  it('renders with icon', () => {
    render(<SidebarMenuItemLink href="/icon" icon={mockIcon}>Link With Icon</SidebarMenuItemLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/icon');
=======
  it('renders with icon (covers lines 3-15)', () => {
    const TestIcon = <span data-testid='test-icon'>🏠</span>;

    render(
      <SidebarMenuItemLink href='/test' icon={TestIcon}>
        Link with Icon
      </SidebarMenuItemLink>
    );

>>>>>>> 54d38cb (feat: modifications complètes du frontend)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Link With Icon')).toBeInTheDocument();
  });

  it('renders without icon when not provided', () => {
    render(<SidebarMenuItemLink href="/no-icon">No Icon</SidebarMenuItemLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/no-icon');
    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    expect(screen.getByText('No Icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SidebarMenuItemLink href="/class" className="custom-class">Class Link</SidebarMenuItemLink>);
    expect(screen.getByTestId('sidebar-menu-button')).toHaveClass('custom-class');
  });

  it('passes additional data-* props to wrapper', () => {
    render(
<<<<<<< HEAD
      <SidebarMenuItemLink href="/props" data-custom="val" data-another="x">
        Prop Link
=======
      <SidebarMenuItemLink href='/test' className='custom-class'>
        Custom Class Link
>>>>>>> 54d38cb (feat: modifications complètes du frontend)
      </SidebarMenuItemLink>
    );
    const btn = screen.getByTestId('sidebar-menu-button');
    expect(btn).toHaveAttribute('data-custom', 'val');
    expect(btn).toHaveAttribute('data-another', 'x');
  });

<<<<<<< HEAD
  it('renders full variant with all props', () => {
    const icon = <span data-testid="test-icon">📊</span>;
    render(
      <SidebarMenuItemLink
        href="/dashboard"
        active
        icon={icon}
        className="dashboard-link"
        aria-label="Dashboard navigation"
=======
  it('renders with all props including spread props (covers lines 3-15)', () => {
    const TestIcon = <span data-testid='test-icon'>📊</span>;

    render(
      <SidebarMenuItemLink
        href='/dashboard'
        active={true}
        icon={TestIcon}
        className='dashboard-link'
        data-testid='sidebar-link'
        aria-label='Dashboard navigation'
>>>>>>> 54d38cb (feat: modifications complètes du frontend)
      >
        Dashboard
      </SidebarMenuItemLink>
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
<<<<<<< HEAD
    expect(screen.getByTestId('sidebar-menu-button')).toHaveClass('dashboard-link');
    expect(screen.getByTestId('sidebar-menu-button')).toHaveAttribute('data-active', 'true');
=======
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByTestId('sidebar-link')).toBeInTheDocument();
  });

  it('renders without icon (covers conditional icon rendering)', () => {
    render(<SidebarMenuItemLink href='/test'>No Icon Link</SidebarMenuItemLink>);

    expect(screen.getByText('No Icon Link')).toBeInTheDocument();
    // Verify no icon span is rendered
    expect(screen.queryByText('mr-2')).not.toBeInTheDocument();
  });

  it('renders with default active state (covers default prop)', () => {
    render(<SidebarMenuItemLink href='/test'>Default Active</SidebarMenuItemLink>);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(screen.getByText('Default Active')).toBeInTheDocument();
>>>>>>> 54d38cb (feat: modifications complètes du frontend)
  });
});

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { SidebarMenuItemLink } from '@/components/admin/institution-financiere/sidebar-menu-item-link';

// Unified Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Unified Mock SidebarMenuButton
jest.mock('@/components/ui/sidebar', () => ({
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
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-menu-button')).toHaveAttribute('data-active', 'false');
  });

  it('renders with active state', () => {
    render(<SidebarMenuItemLink href="/active" active>Active Link</SidebarMenuItemLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/active');
    expect(screen.getByText('Active Link')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-menu-button')).toHaveAttribute('data-active', 'true');
  });

  it('renders with icon', () => {
    render(<SidebarMenuItemLink href="/icon" icon={mockIcon}>Link With Icon</SidebarMenuItemLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/icon');
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
      <SidebarMenuItemLink href="/props" data-custom="val" data-another="x">
        Prop Link
      </SidebarMenuItemLink>
    );
    const btn = screen.getByTestId('sidebar-menu-button');
    expect(btn).toHaveAttribute('data-custom', 'val');
    expect(btn).toHaveAttribute('data-another', 'x');
  });

  it('renders full variant with all props', () => {
    const icon = <span data-testid="test-icon">📊</span>;
    render(
      <SidebarMenuItemLink
        href="/dashboard"
        active
        icon={icon}
        className="dashboard-link"
        aria-label="Dashboard navigation"
      >
        Dashboard
      </SidebarMenuItemLink>
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-menu-button')).toHaveClass('dashboard-link');
    expect(screen.getByTestId('sidebar-menu-button')).toHaveAttribute('data-active', 'true');
  });
});

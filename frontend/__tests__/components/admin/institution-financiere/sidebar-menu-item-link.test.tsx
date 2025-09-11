import { render, screen } from '@testing-library/react';
import { SidebarMenuItemLink } from '@/components/admin/institution-financiere/sidebar-menu-item-link';
import React from 'react';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock SidebarMenuButton
jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, asChild, isActive, className, ...props }: any) => {
    return (
      <div
        data-testid="sidebar-menu-button"
        data-active={isActive}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  },
}));

describe('SidebarMenuItemLink', () => {
  const mockIcon = <span data-testid="test-icon">Icon</span>;

  it('renders with required props only (covers lines 3-15)', () => {
    render(
      <SidebarMenuItemLink href="/test">
        Test Link
      </SidebarMenuItemLink>
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-menu-button')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-menu-button')).toHaveAttribute('data-active', 'false');
  });

  it('renders with all props including icon', () => {
    render(
      <SidebarMenuItemLink 
        href="/dashboard" 
        active={true}
        icon={mockIcon}
        className="custom-class"
      >
        Dashboard
      </SidebarMenuItemLink>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');

    const menuButton = screen.getByTestId('sidebar-menu-button');
    expect(menuButton).toHaveAttribute('data-active', 'true');
    expect(menuButton).toHaveClass('custom-class');

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders without icon when not provided', () => {
    render(
      <SidebarMenuItemLink href="/no-icon">
        No Icon Link
      </SidebarMenuItemLink>
    );

    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    expect(screen.getByText('No Icon Link')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <SidebarMenuItemLink 
        href="/test" 
        data-custom="test-value"
        title="Test Title"
      >
        Prop Test
      </SidebarMenuItemLink>
    );

    const menuButton = screen.getByTestId('sidebar-menu-button');
    expect(menuButton).toHaveAttribute('data-custom', 'test-value');
    expect(menuButton).toHaveAttribute('title', 'Test Title');
  });
});

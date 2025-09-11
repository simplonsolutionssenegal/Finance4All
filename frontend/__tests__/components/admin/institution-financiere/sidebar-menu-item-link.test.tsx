import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SidebarMenuItemLink } from '@/components/admin/institution-financiere/sidebar-menu-item-link';

// Mock de Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock des composants UI
jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, isActive, className, asChild, ...props }: any) => (
    <button 
      className={className} 
      data-active={isActive} 
      data-as-child={asChild}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('SidebarMenuItemLink', () => {
  it('should render with required props', () => {
    render(
      <SidebarMenuItemLink href="/test">
        Test Link
      </SidebarMenuItemLink>
    );
    
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
  });

  it('should render with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">📄</span>;
    
    render(
      <SidebarMenuItemLink href="/test" icon={<TestIcon />}>
        Test Link with Icon
      </SidebarMenuItemLink>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Link with Icon')).toBeInTheDocument();
  });

  it('should handle active state', () => {
    render(
      <SidebarMenuItemLink href="/test" active={true}>
        Active Link
      </SidebarMenuItemLink>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-active', 'true');
  });

  it('should handle inactive state', () => {
    render(
      <SidebarMenuItemLink href="/test" active={false}>
        Inactive Link
      </SidebarMenuItemLink>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-active', 'false');
  });

  it('should apply custom className', () => {
    render(
      <SidebarMenuItemLink href="/test" className="custom-class">
        Custom Class Link
      </SidebarMenuItemLink>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should render without icon', () => {
    render(
      <SidebarMenuItemLink href="/test">
        Link without Icon
      </SidebarMenuItemLink>
    );
    
    expect(screen.getByText('Link without Icon')).toBeInTheDocument();
    // Vérifier qu'il n'y a pas d'icon span
    const container = screen.getByText('Link without Icon').closest('div');
    expect(container?.querySelector('span')).toBeNull();
  });
});

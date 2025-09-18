import { render, screen } from '@testing-library/react';
import { SidebarMenuItemLink } from '@/components/admin/institution-financiere/sidebar-menu-item-link';
import { SidebarProvider } from '@/components/ui/sidebar';

describe('SidebarMenuItemLink', () => {
  it('should render a link with label and icon', () => {
    render(
      <SidebarProvider>
        <SidebarMenuItemLink href="/test" icon={<span data-testid="icon">Icon</span>}>Test</SidebarMenuItemLink>
      </SidebarProvider>
    );
    const link = screen.getByRole('link', { name: /test/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

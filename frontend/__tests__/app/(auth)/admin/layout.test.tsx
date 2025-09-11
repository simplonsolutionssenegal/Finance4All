import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

// Mock des hooks Next.js
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock du composant SidebarMenuItemLink 
jest.mock('@/components/admin/institution-financiere/sidebar-menu-item-link', () => ({
  SidebarMenuItemLink: ({ children, ...props }: any) => (
    <div data-testid="sidebar-link" {...props}>{children}</div>
  ),
}));

// Mock des composants UI
jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: any) => <div data-testid="sidebar">{children}</div>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: any) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: any) => <div>{children}</div>,
  SidebarMenu: ({ children }: any) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
  SidebarProvider: ({ children }: any) => <div>{children}</div>,
  SidebarTrigger: ({ children }: any) => <button>{children}</button>,
}));

describe('Admin Layout', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/admin');
  });

  test('should render admin layout', () => {
    // Import dynamique du layout
    const AdminLayout = require('@/app/(auth)/admin/layout').default;
    
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

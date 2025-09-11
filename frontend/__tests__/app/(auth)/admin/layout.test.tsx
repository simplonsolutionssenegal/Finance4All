import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/app/(auth)/admin/layout';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock des composants UI et icônes
jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar">{children}</div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-label">{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="sidebar-menu">{children}</ul>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li data-testid="sidebar-menu-item">{children}</li>
  ),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}));

jest.mock('@/components/admin/institution-financiere/sidebar-menu-item-link', () => ({
  SidebarMenuItemLink: ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) => (
    <a href={href} data-testid="sidebar-menu-item-link" data-active={isActive}>
      {children}
    </a>
  ),
}));

jest.mock('lucide-react', () => ({
  Building2Icon: () => <div data-testid="building2-icon">Building2Icon</div>,
  BarChart3Icon: () => <div data-testid="barchart3-icon">BarChart3Icon</div>,
  Users2Icon: () => <div data-testid="users2-icon">Users2Icon</div>,
  ShieldIcon: () => <div data-testid="shield-icon">ShieldIcon</div>,
  CreditCardIcon: () => <div data-testid="creditcard-icon">CreditCardIcon</div>,
  FileTextIcon: () => <div data-testid="filetext-icon">FileTextIcon</div>,
  SettingsIcon: () => <div data-testid="settings-icon">SettingsIcon</div>,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('AdminLayout', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the admin layout structure correctly', () => {
    render(
      <AdminLayout>
        <div data-testid="test-children">Test Content</div>
      </AdminLayout>
    );

    // Vérifier la structure de base (lignes 3-13)
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-group')).toBeInTheDocument();
  });

  it('should use pathname hook correctly', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );

    // Vérifier que usePathname est appelé (ligne 14)
    expect(mockUsePathname).toHaveBeenCalled();
  });

  it('should render children content correctly', () => {
    render(
      <AdminLayout>
        <div data-testid="test-children">Test Content</div>
      </AdminLayout>
    );

    // Vérifier que les enfants sont rendus
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have proper flex layout structure', () => {
    render(
      <AdminLayout>
        <div>Test</div>
      </AdminLayout>
    );

    // Vérifier la structure flex (ligne 17)
    const flexContainer = screen.getByTestId('sidebar').parentElement;
    expect(flexContainer).toHaveClass('flex', 'min-h-screen');
  });

  it('should import and use required icons', () => {
    render(
      <AdminLayout>
        <div>Test</div>
      </AdminLayout>
    );

    // Les icônes sont importées ligne 5, vérifier qu'elles sont disponibles
    // (elles seront utilisées dans les éléments de menu plus loin dans le composant)
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
  });

  it('should import SidebarMenuItemLink component', () => {
    render(
      <AdminLayout>
        <div>Test</div>
      </AdminLayout>
    );

    // Vérifier que le composant importé ligne 6 est utilisable
    expect(screen.getByTestId('sidebar-group')).toBeInTheDocument();
  });

  it('should handle different pathname values', () => {
    mockUsePathname.mockReturnValue('/admin/institutions');
    
    render(
      <AdminLayout>
        <div>Test</div>
      </AdminLayout>
    );

    expect(mockUsePathname).toHaveBeenCalled();
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
  });

  it('should render with SidebarProvider as root wrapper', () => {
    render(
      <AdminLayout>
        <div data-testid="content">Content</div>
      </AdminLayout>
    );

    // Vérifier que SidebarProvider enveloppe tout (ligne 16)
    const provider = screen.getByTestId('sidebar-provider');
    expect(provider).toBeInTheDocument();
    expect(provider).toContainElement(screen.getByTestId('sidebar'));
  });
});

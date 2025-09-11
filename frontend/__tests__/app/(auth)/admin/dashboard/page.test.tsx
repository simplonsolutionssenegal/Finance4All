import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/(auth)/admin/dashboard/page';

// Mock des composants UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='card' className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-content'>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='card-header' className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid='card-title' className={className}>
      {children}
    </h3>
  ),
}));

describe('AdminDashboardPage', () => {
  it('should render the admin dashboard page correctly', () => {
    render(<AdminDashboardPage />);

    // Vérifier le titre principal (ligne 8)
    expect(screen.getByText('Tableau de bord administrateur')).toBeInTheDocument();
    expect(screen.getByText('Tableau de bord administrateur')).toHaveClass(
      'text-3xl',
      'font-bold',
      'mb-6'
    );
  });

  it('should render all dashboard cards with correct content', () => {
    render(<AdminDashboardPage />);

    // Vérifier les cartes de statistiques (lignes 10-13 et plus)
    expect(screen.getByText('Institutions financières')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Produits financiers')).toBeInTheDocument();
    expect(screen.getByText('Comparaisons')).toBeInTheDocument();

    // Vérifier les valeurs numériques
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues).toHaveLength(4); // 4 cartes avec des valeurs à 0
  });

  it('should render statistics descriptions correctly', () => {
    render(<AdminDashboardPage />);

    // Vérifier les descriptions des statistiques
    expect(screen.getByText('0 en attente de validation')).toBeInTheDocument();
    expect(screen.getByText('+0 depuis le mois dernier')).toBeInTheDocument();
    expect(screen.getByText('0 produits actifs')).toBeInTheDocument();
    expect(screen.getByText("0 aujourd'hui")).toBeInTheDocument();
  });

  it('should render the recent activity section', () => {
    render(<AdminDashboardPage />);

    // Vérifier la section d'activité récente
    expect(screen.getByText('Activité récente')).toBeInTheDocument();
    expect(screen.getByText('Aucune activité récente à afficher.')).toBeInTheDocument();
  });

  it('should have correct container structure and CSS classes', () => {
    render(<AdminDashboardPage />);

    // Vérifier la structure du conteneur principal (ligne 7)
    const container = screen.getByText('Tableau de bord administrateur').closest('div');
    expect(container).toHaveClass('container', 'mx-auto');
  });

  it('should render grid layout for dashboard cards', () => {
    render(<AdminDashboardPage />);

    // Vérifier que toutes les cartes sont présentes (lignes 10-13 correspondent au début de la grille)
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(5); // 4 cartes de stats + 1 carte d'activité récente
  });

  it('should render card headers and content correctly', () => {
    render(<AdminDashboardPage />);

    // Vérifier les en-têtes et contenus des cartes
    const cardHeaders = screen.getAllByTestId('card-header');
    const cardContents = screen.getAllByTestId('card-content');
    const cardTitles = screen.getAllByTestId('card-title');

    expect(cardHeaders).toHaveLength(5);
    expect(cardContents).toHaveLength(5);
    expect(cardTitles).toHaveLength(5);
  });

  it('should render with proper responsive grid classes', () => {
    render(<AdminDashboardPage />);

    // Trouver l'élément avec les classes de grille responsive (ligne 10)
    const gridElement = screen.getByText('Institutions financières').closest('div')
      ?.parentElement?.parentElement;
    expect(gridElement).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-4',
      'gap-6',
      'mb-8'
    );
  });
});

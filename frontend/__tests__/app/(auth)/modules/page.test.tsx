// __tests__/app/(auth)/modules/page.test.tsx
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import ModulesPage from '@/app/(auth)/modules/page';
import { LoaderProvider } from '@/contexts/LoaderContext';

// Mock du composant ModulesPageContent car il contient la logique client
jest.mock('@/components/admin/modules/modules-page-content', () => {
  return function MockModulesPageContent() {
    return (
      <div data-testid='modules-page-content'>
        <h1>Modules de formation</h1>
        <div data-testid='modules-list'>Module content here</div>
      </div>
    );
  };
});

describe('ModulesPage', () => {
  // Configuration du QueryClient pour les tests
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Helper function pour le rendu avec les providers nécessaires
  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <LoaderProvider>{component}</LoaderProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait rendre la page des modules avec le contenu', () => {
    renderWithProviders(<ModulesPage />);

    // Vérifie que le contenu de la page est présent
    const pageContent = screen.getByTestId('modules-page-content');
    expect(pageContent).toBeInTheDocument();
  });

  it('devrait afficher le titre de la page', () => {
    renderWithProviders(<ModulesPage />);

    // Vérifie que le titre est présent
    expect(screen.getByText('Modules de formation')).toBeInTheDocument();
  });

  it('devrait rendre la liste des modules', () => {
    renderWithProviders(<ModulesPage />);

    // Vérifie que la liste des modules est présente
    const modulesList = screen.getByTestId('modules-list');
    expect(modulesList).toBeInTheDocument();
  });

  it('devrait rendre le composant sans erreur', () => {
    // Test que le composant se monte sans erreur
    expect(() => renderWithProviders(<ModulesPage />)).not.toThrow();
  });
});

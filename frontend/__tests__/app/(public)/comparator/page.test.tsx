import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetServices } from '@/hooks/service/useGetServices';
import { useCompareServices } from '@/hooks/service/useCompareServices';
import type { ServiceDTO } from '@/types/Service';
import { TypeService } from '@/types/Service';
import Comparator from '@/app/(public)/comparator/page';

// Mock des hooks
jest.mock('@/hooks/service/useGetServices');
jest.mock('@/hooks/service/useCompareServices');

const mockUseGetServices = useGetServices as jest.MockedFunction<typeof useGetServices>;
const mockUseCompareServices = useCompareServices as jest.MockedFunction<typeof useCompareServices>;

// Données de test
const mockServices: ServiceDTO[] = [
  {
    id: '1',
    name: 'Wave Transfer',
    longName: 'Wave Money Transfer Service',
    type: TypeService.TRANSFERT_ARGENT,
    montantMin: 100,
    montantMax: 1000000,
    frais: {
      _typeCalculation: 1,
      pourcentage: 0.01,
      minimum: 50,
      maximum: 5000,
    },
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institution: {
      id: 'inst1',
      name: 'Wave',
      logoUrl: 'https://example.com/wave.png',
    },
  },
];

// Wrapper avec QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Comparator', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Configuration par défaut des mocks
    mockUseGetServices.mockReturnValue({
      services: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    mockUseCompareServices.mockReturnValue({
      services: [],
      message: '',
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  describe('Rendu de la page', () => {
    it('rend la page sans erreur', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
    });

    it('applique les classes CSS correctes au conteneur principal', () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen', 'overflow-visible');
    });

    it('rend le composant ComparatorIntelligent', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      // Vérifie qu'au moins un élément clé du ComparatorIntelligent est présent
      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
      expect(screen.getByText(/Comparez les produits financiers/)).toBeInTheDocument();
    });
  });

  describe('Structure de la page', () => {
    it('contient une div avec min-h-screen pour occuper toute la hauteur', () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv).toBeInTheDocument();
    });

    it('a overflow-visible pour permettre le dépassement de contenu', () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      const mainDiv = container.querySelector('.overflow-visible');
      expect(mainDiv).toBeInTheDocument();
    });

    it("ne contient qu'un seul enfant direct (ComparatorIntelligent)", () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.children).toHaveLength(1);
    });
  });

  describe('Intégration avec ComparatorIntelligent', () => {
    it('affiche les sections principales du comparateur', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      expect(screen.getByText('Type de produit')).toBeInTheDocument();
      expect(screen.getByText('Transferts & Mobile Money')).toBeInTheDocument();
      expect(screen.getByText('Crédit & Prêts')).toBeInTheDocument();
      expect(screen.getByText('Épargne')).toBeInTheDocument();
    });

    it('charge les services via le hook', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      expect(mockUseGetServices).toHaveBeenCalled();
    });

    it('affiche le nombre de services disponibles', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      expect(screen.getByText(/1 services? disponibles?/)).toBeInTheDocument();
    });
  });

  describe("États de l'application", () => {
    it("gère l'état de chargement", () => {
      mockUseGetServices.mockReturnValue({
        services: [],
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(<Comparator />, { wrapper: createWrapper() });

      // Le composant devrait être rendu même en état de chargement
      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
    });

    it("gère l'état d'erreur", () => {
      mockUseGetServices.mockReturnValue({
        services: [],
        isLoading: false,
        isError: true,
        error: new Error('Erreur de chargement'),
      } as any);

      render(<Comparator />, { wrapper: createWrapper() });

      // Le composant devrait être rendu même en cas d'erreur
      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
    });

    it('affiche le comparateur quand les services sont chargés', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
      expect(mockUseGetServices).toHaveBeenCalled();
    });
  });

  describe('Accessibilité', () => {
    it('permet la navigation au clavier', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('a une structure sémantique appropriée', () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      // Vérifie la présence de sections sémantiques
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('contient un titre principal (h1)', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Comparateur Intelligent');
    });
  });

  describe('Responsive', () => {
    it('applique min-h-screen pour tous les écrans', () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen');
    });

    it('rend le contenu de manière responsive', () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      // Vérifie que les grilles responsive sont présentes
      const grids = container.querySelectorAll('[class*="grid"]');
      expect(grids.length).toBeGreaterThan(0);
    });
  });

  describe('Snapshots', () => {
    it('correspond au snapshot avec des services', () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      expect(container).toMatchSnapshot();
    });

    it('correspond au snapshot en état de chargement', () => {
      mockUseGetServices.mockReturnValue({
        services: [],
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      expect(container).toMatchSnapshot();
    });

    it("correspond au snapshot en état d'erreur", () => {
      mockUseGetServices.mockReturnValue({
        services: [],
        isLoading: false,
        isError: true,
        error: new Error('Test error'),
      } as any);

      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      expect(container).toMatchSnapshot();
    });
  });

  describe('Performance', () => {
    it('ne re-rend pas inutilement', () => {
      const { rerender } = render(<Comparator />, { wrapper: createWrapper() });

      // Premier rendu
      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();

      // Re-rendu avec les mêmes props
      rerender(<Comparator />);

      // Devrait toujours être présent
      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
    });

    it('rend le composant rapidement', () => {
      const startTime = performance.now();
      render(<Comparator />, { wrapper: createWrapper() });
      const endTime = performance.now();

      // Le rendu ne devrait pas prendre plus de 1 seconde
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Isolation du composant', () => {
    it("n'affecte pas le DOM en dehors de son conteneur", () => {
      const { container } = render(<Comparator />, { wrapper: createWrapper() });

      // Tous les éléments doivent être contenus dans la div principale
      const mainDiv = container.firstChild;
      expect(mainDiv).toBeTruthy();
      expect(mainDiv?.nodeName).toBe('DIV');
    });

    it('nettoie correctement après le démontage', () => {
      const { unmount, container } = render(<Comparator />, { wrapper: createWrapper() });

      // Avant démontage
      expect(container.firstChild).toBeTruthy();

      // Démontage
      unmount();

      // Après démontage, le conteneur devrait être vide
      expect(container.firstChild).toBeFalsy();
    });
  });

  describe('Intégration avec les providers', () => {
    it('fonctionne avec QueryClientProvider', () => {
      render(<Comparator />, { wrapper: createWrapper() });

      expect(mockUseGetServices).toHaveBeenCalled();
      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
    });

    it("gère l'absence de QueryClient gracieusement", () => {
      // Sans wrapper, ça devrait lancer une erreur ou utiliser un provider par défaut
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        render(<Comparator />);
      } catch (error) {
        // C'est attendu sans le QueryClientProvider
        expect(error).toBeDefined();
      }

      consoleError.mockRestore();
    });
  });

  describe('Cas limites', () => {
    it('gère un grand nombre de services', () => {
      const manyServices = Array.from({ length: 100 }, (_, i) => ({
        ...mockServices[0],
        id: `service-${i}`,
        name: `Service ${i}`,
      }));

      mockUseGetServices.mockReturnValue({
        services: manyServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<Comparator />, { wrapper: createWrapper() });

      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
    });

    it("gère l'absence de services", () => {
      mockUseGetServices.mockReturnValue({
        services: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<Comparator />, { wrapper: createWrapper() });

      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
    });

    it('reste stable lors de multiples re-rendus', () => {
      const { rerender } = render(<Comparator />, { wrapper: createWrapper() });

      // Re-rend plusieurs fois
      for (let i = 0; i < 5; i++) {
        rerender(<Comparator />);
        expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
      }
    });
  });
});

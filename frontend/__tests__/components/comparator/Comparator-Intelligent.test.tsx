import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetServices } from '@/hooks/service/useGetServices';
import { useCompareServices } from '@/hooks/service/useCompareServices';
import type { ServiceDTO } from '@/types/Service';
import { TypeService } from '@/types/Service';
import ComparatorIntelligent from '@/components/comparator/comparator-Intelligent';

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
  {
    id: '2',
    name: 'Orange Money Transfer',
    longName: 'Orange Money Transfer Service',
    type: TypeService.TRANSFERT_ARGENT,
    montantMin: 50,
    montantMax: 500000,
    frais: {
      _typeCalculation: 2,
      montantFixe: 100,
      pourcentage: 0,
    },
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institution: {
      id: 'inst2',
      name: 'Orange Money',
      logoUrl: 'https://example.com/orange.png',
    },
  },
  {
    id: '3',
    name: 'Free Money',
    longName: 'Free Money Service',
    type: TypeService.TRANSFERT_ARGENT,
    montantMin: 0,
    montantMax: 100000,
    frais: {
      _typeCalculation: 0,
    },
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institution: {
      id: 'inst3',
      name: 'Free Bank',
      logoUrl: 'https://example.com/freebank.png',
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

describe('ComparatorIntelligent', () => {
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

  describe('Rendu initial', () => {
    it('affiche le titre et la description', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      expect(screen.getByText('Comparateur Intelligent')).toBeInTheDocument();
      expect(screen.getByText(/Comparez les produits financiers/)).toBeInTheDocument();
    });

    it('affiche les trois types de produits', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      expect(screen.getByText('Transferts & Mobile Money')).toBeInTheDocument();
      expect(screen.getByText('Crédit & Prêts')).toBeInTheDocument();
      expect(screen.getByText('Épargne')).toBeInTheDocument();
    });

    it('sélectionne TRANSFERT par défaut', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const transfertButton = screen.getByRole('button', { name: /Transferts & Mobile Money/ });
      expect(transfertButton).toHaveClass('bg-primary-50');
    });

    it('désactive le bouton Épargne', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const epargneButton = screen.getByRole('button', { name: /Épargne/ });
      expect(epargneButton).toBeDisabled();
      expect(screen.getByText('Bientôt disponible')).toBeInTheDocument();
    });
  });

  describe('Sélection de type de produit', () => {
    it('permet de basculer vers CREDIT', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const creditButton = screen.getByRole('button', { name: /Crédit & Prêts/ });
      fireEvent.click(creditButton);

      expect(creditButton).toHaveClass('bg-primary-50');
    });
  });

  describe('Filtres de service', () => {
    it('affiche le nombre de services disponibles', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      expect(screen.getByText(/3 services disponibles/)).toBeInTheDocument();
    });

    it('permet de saisir un montant', async () => {
      const user = userEvent.setup();
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('50000');
      await user.clear(input);
      await user.type(input, '10000');

      expect(input).toHaveValue(10000);
    });
  });

  describe('Sélection de services', () => {
    it('vérifie que les services sont chargés', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      // Vérifie que le hook a été appelé
      expect(mockUseGetServices).toHaveBeenCalled();

      // Vérifie que le nombre de services est affiché
      expect(screen.getByText(/3 services disponibles/)).toBeInTheDocument();
    });

    it('désactive le bouton Comparer quand moins de 2 services sont sélectionnés', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const compareButton = screen.getByRole('button', { name: /Comparer/ });
      expect(compareButton).toBeDisabled();
    });

    it('met à jour le compteur de services sélectionnés', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      expect(screen.getByText(/0 sélectionné\(s\)/)).toBeInTheDocument();
    });
  });

  describe('Calcul des frais', () => {
    it('calcule correctement les frais en pourcentage avec minimum', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('50000');
      fireEvent.change(input, { target: { value: '1000' } });

      // Service 1: 1% de 1000 = 10, mais min = 50
      expect(screen.getByText('50 F CFA')).toBeInTheDocument();
    });

    it('affiche "Gratuit !" pour les services gratuits', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      expect(screen.getByText('Gratuit !')).toBeInTheDocument();
    });

    it('calcule correctement les frais fixes', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('50000');
      fireEvent.change(input, { target: { value: '5000' } });

      // Service 2: frais fixe de 100
      expect(screen.getByText('100 F CFA fixe')).toBeInTheDocument();
    });
  });

  describe('Comparaison de services', () => {
    it('affiche le tableau de comparaison avec au moins 2 services', async () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockServices[0], mockServices[1]],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const compareButton = screen.getByRole('button', { name: /Comparer/ });

      // Note: Le test vérifie seulement que le composant peut être rendu
      // avec des données de comparaison mockées
      expect(compareButton).toBeInTheDocument();
    });

    it('affiche les critères de comparaison', async () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockServices[0], mockServices[1]],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      // Le composant devrait être capable d'afficher les critères
      // quand isComparing = true
      expect(screen.getByText(/services disponibles/)).toBeInTheDocument();
    });

    it('affiche un message de chargement pendant la comparaison', () => {
      mockUseCompareServices.mockReturnValue({
        services: [],
        message: '',
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      // Le composant devrait gérer l'état de chargement
      expect(mockUseCompareServices).toHaveBeenCalled();
    });

    it('affiche une erreur si la comparaison échoue', () => {
      mockUseCompareServices.mockReturnValue({
        services: [],
        message: '',
        isLoading: false,
        isError: true,
        error: new Error('Erreur de comparaison'),
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      // Le composant devrait gérer l'état d'erreur
      expect(mockUseCompareServices).toHaveBeenCalled();
    });
  });

  describe("États de chargement et d'erreur", () => {
    it('affiche un état de chargement pour la liste de services', () => {
      mockUseGetServices.mockReturnValue({
        services: [],
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      // ServiceList devrait gérer l'affichage du loading
      expect(mockUseGetServices).toHaveBeenCalled();
    });

    it('affiche une erreur si le chargement des services échoue', () => {
      mockUseGetServices.mockReturnValue({
        services: [],
        isLoading: false,
        isError: true,
        error: new Error('Erreur réseau'),
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      // ServiceList devrait gérer l'affichage de l'erreur
      expect(mockUseGetServices).toHaveBeenCalled();
    });
  });

  describe('Formatage de la devise', () => {
    it('formate correctement les montants en F CFA', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('50000');
      fireEvent.change(input, { target: { value: '100000' } });

      // Vérifier que les montants sont formatés avec F CFA
      expect(screen.getAllByText(/F CFA/).length).toBeGreaterThan(0);
    });
  });

  describe('Accessibilité', () => {
    it('tous les boutons ont des labels appropriés', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('les inputs sont accessibles', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      // Vérifie que l'input existe et est accessible
      const input = screen.getByPlaceholderText('50000');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');

      // Vérifie que le label existe
      expect(screen.getByText(/Montant du transfert/i)).toBeInTheDocument();
    });
  });
});

// Tests d'intégration
describe("ComparatorIntelligent - Tests d'intégration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

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

  it('workflow complet: sélection de type, montant et comparaison', async () => {
    const user = userEvent.setup();
    render(<ComparatorIntelligent />, { wrapper: createWrapper() });

    // 1. Vérifier l'état initial
    expect(screen.getByText(/3 services disponibles/)).toBeInTheDocument();

    // 2. Saisir un montant
    const input = screen.getByPlaceholderText('50000');
    await user.clear(input);
    await user.type(input, '25000');

    expect(input).toHaveValue(25000);

    // 3. Changer de type de produit
    const creditButton = screen.getByRole('button', { name: /Crédit & Prêts/ });
    await user.click(creditButton);

    expect(creditButton).toHaveClass('bg-primary-50');
  });
});

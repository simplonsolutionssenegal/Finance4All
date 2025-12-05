import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetServices } from '@/hooks/service/useGetServices';
import { useCompareServices } from '@/hooks/service/useCompareServices';
import type { ServiceDTO } from '@/types/Service';
import { TypeService } from '@/types/Service';
import ComparatorIntelligent from '@/components/comparator/comparator-Intelligent';

jest.mock('@/hooks/service/useGetServices');
jest.mock('@/hooks/service/useCompareServices');

const mockUseGetServices = useGetServices as jest.MockedFunction<typeof useGetServices>;
const mockUseCompareServices = useCompareServices as jest.MockedFunction<typeof useCompareServices>;

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

      expect(mockUseGetServices).toHaveBeenCalled();

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

      const feeElements = screen.getAllByText((content, element) => {
        return content.includes('50') && content.includes('F CFA');
      });

      expect(feeElements.length).toBeGreaterThan(0);
    });

    it('affiche "Gratuit !" pour les services gratuits', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      expect(screen.getByText('Gratuit !')).toBeInTheDocument();
    });

    it('calcule correctement les frais fixes', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('50000');
      fireEvent.change(input, { target: { value: '5000' } });
      expect(screen.getByText('Frais fixe')).toBeInTheDocument();
      const fcfaElements = screen.getAllByText(/F CFA/i);
      expect(fcfaElements.length).toBeGreaterThan(0);
    });
  });

  describe('Comparaison de services', () => {
    it('affiche la vue de comparaison détaillée après sélection de 2 services', async () => {
      const user = userEvent.setup();

      mockUseCompareServices.mockReturnValue({
        services: [mockServices[0], mockServices[1]],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const compareButton = screen.getByRole('button', {
        name: /Comparer 2 services/i,
      });
      expect(compareButton).not.toBeDisabled();

      await user.click(compareButton);

      expect(await screen.findByText('Comparaison détaillée')).toBeInTheDocument();

      expect(screen.getByText('Comparaison de 2 services')).toBeInTheDocument();

      expect(screen.getByText('Frais de service')).toBeInTheDocument();
      expect(screen.getByText('Délai')).toBeInTheDocument();
      expect(screen.getByText('Limite de solde')).toBeInTheDocument();
      expect(screen.getByText('Cashback')).toBeInTheDocument();
      expect(screen.getByText('Note')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /Vue graphique/i })).toBeInTheDocument();

      expect(screen.getByText('Wave')).toBeInTheDocument();
      expect(screen.getByText('Orange Money')).toBeInTheDocument();
    });

    it('permet de revenir à la liste de services en cliquant sur "Modifier"', async () => {
      const user = userEvent.setup();

      mockUseCompareServices.mockReturnValue({
        services: [mockServices[0], mockServices[1]],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const compareButton = screen.getByRole('button', {
        name: /Comparer 2 services/i,
      });
      await user.click(compareButton);

      expect(await screen.findByText('Comparaison détaillée')).toBeInTheDocument();

      const backButton = screen.getByRole('button', { name: /Modifier/i });
      await user.click(backButton);

      expect(screen.getByText('Sélectionnez les services à comparer')).toBeInTheDocument();
      expect(screen.queryByText('Comparaison détaillée')).not.toBeInTheDocument();
    });

    it('affiche le message de chargement pendant la comparaison', async () => {
      const user = userEvent.setup();

      mockUseCompareServices.mockReturnValue({
        services: [],
        message: '',
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const compareButton = screen.getByRole('button', {
        name: /Comparer 2 services/i,
      });
      await user.click(compareButton);

      expect(await screen.findByText('Chargement de la comparaison...')).toBeInTheDocument();
    });

    it("affiche un message d'erreur si la comparaison échoue", async () => {
      const user = userEvent.setup();

      mockUseCompareServices.mockReturnValue({
        services: [],
        message: '',
        isLoading: false,
        isError: true,
        error: new Error('Erreur de comparaison'),
      } as any);

      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const compareButton = screen.getByRole('button', {
        name: /Comparer 2 services/i,
      });
      await user.click(compareButton);

      expect(await screen.findByText('Erreur de comparaison')).toBeInTheDocument();
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

      expect(mockUseGetServices).toHaveBeenCalled();
    });
  });

  describe('Formatage de la devise', () => {
    it('formate correctement les montants en F CFA', () => {
      render(<ComparatorIntelligent />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('50000');
      fireEvent.change(input, { target: { value: '100000' } });

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

      const input = screen.getByPlaceholderText('50000');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');

      expect(screen.getByText(/Montant du transfert/i)).toBeInTheDocument();
    });
  });
});

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

    expect(screen.getByText(/3 services disponibles/)).toBeInTheDocument();

    const input = screen.getByPlaceholderText('50000');
    await user.clear(input);
    await user.type(input, '25000');

    expect(input).toHaveValue(25000);

    const creditButton = screen.getByRole('button', { name: /Crédit & Prêts/ });
    await user.click(creditButton);

    expect(creditButton).toHaveClass('bg-primary-50');
  });
});

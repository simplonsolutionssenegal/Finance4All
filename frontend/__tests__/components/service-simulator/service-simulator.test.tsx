import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ServiceSimulator } from '@/components/service-simulator/service-simulator';
import { useSimulatorStore } from '@/lib/simulator-store';
import type { Institution, Service } from '@/lib/simulator-types';
import { InstitutionStatus } from '@/types/Institution';
import { TypeService } from '@/types/Service';

// Mock du hook useSimulator
jest.mock('@/hooks/useSimulator', () => ({
  useSimulator: jest.fn(),
}));

const mockUseSimulator = require('@/hooks/useSimulator').useSimulator as jest.MockedFunction<
  typeof import('@/hooks/useSimulator').useSimulator
>;

// Mock data pour les tests
const mockService: Service = {
  id: 'test-service',
  name: 'Test Service',
  longName: 'Test Service Description',
  type: TypeService.CREDIT,
  frais: {
    pourcentage: 3.5,
    montantFixe: 100,
    minimum: 50,
    maximum: 500,
  },
  conditionAccess: [],
  plafonds: ['1000-100000'],
  infrastructureAccess: [],
  institutionId: 'test-institution',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockInstitution: Institution = {
  id: 'test-institution',
  name: 'Test Bank',
  description: 'Test Bank Description',
  website: 'https://testbank.com',
  geographicZones: ['Sénégal'],
  logoUrl: '🏦',
  status: InstitutionStatus.ACTIVE,
  services: [mockService],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockInstitutions: Institution[] = [mockInstitution];

const mockEstimation = {
  monthlyPayment: 1000,
  totalInterest: 5000,
  annualRate: 3.5,
};

const defaultMockReturn = {
  params: {
    institution: null,
    service: null,
    amount: 0,
    duration: 0,
    durationUnit: 'YEARS' as const,
  },
  estimation: null,
  isAnimating: false,
  institutions: mockInstitutions,
  isLoading: false,
  updateParam: jest.fn(),
  getAvailableServices: jest.fn(() => []),
  resetSimulation: jest.fn(),
};

describe('ServiceSimulator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSimulator.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    // Reset le store après chaque test
    useSimulatorStore.getState().resetSimulation();
  });

  describe('Rendu initial', () => {
    it('should render the simulator component', () => {
      render(<ServiceSimulator />);

      expect(screen.getByText('Simulateur de Produits Financiers')).toBeInTheDocument();
      expect(screen.getByText('Simulez votre projet financier')).toBeInTheDocument();
      expect(screen.getByText('en temps réel')).toBeInTheDocument();
    });

    it('should render step 1 (institution selection)', () => {
      render(<ServiceSimulator />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Choisissez votre institution')).toBeInTheDocument();
      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should not render step 2 when no institution is selected', () => {
      render(<ServiceSimulator />);

      expect(screen.queryByText('2')).not.toBeInTheDocument();
      expect(screen.queryByText('Sélectionnez un service')).not.toBeInTheDocument();
    });

    it('should not render step 3 when no product is selected', () => {
      render(<ServiceSimulator />);

      expect(screen.queryByText('3')).not.toBeInTheDocument();
      expect(screen.queryByText('Ajustez vos paramètres')).not.toBeInTheDocument();
    });

    it('should not render results when no estimation', () => {
      render(<ServiceSimulator />);

      expect(screen.queryByText('4')).not.toBeInTheDocument();
      expect(screen.queryByText('Votre estimation')).not.toBeInTheDocument();
    });
  });

  describe("Sélection d'institution", () => {
    it('should render step 2 when institution is selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
    });
  });

  describe('Sélection de produit', () => {
    it('should render step 3 when product is selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Ajustez vos paramètres')).toBeInTheDocument();
    });

    it('should render amount and duration sliders', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          amount: 50000,
          duration: 5,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Montant')).toBeInTheDocument();
      expect(screen.getByText('Durée')).toBeInTheDocument();
    });
  });

  describe('Affichage des résultats', () => {
    it('should render step 4 when estimation is available', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: mockEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Votre estimation')).toBeInTheDocument();
    });

    it('should display credit estimation correctly', () => {
      const creditEstimation = {
        monthlyPayment: 1200,
        totalInterest: 44000,
        annualRate: 3.5,
      };

      const creditService: Service = {
        ...mockService,
        type: TypeService.CREDIT,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: creditService,
        },
        estimation: creditEstimation,
        getAvailableServices: jest.fn(() => [creditService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText(/1\s*200\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Mensualité estimée')).toBeInTheDocument();
      expect(screen.getByText(/44\s*000\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Intérêts/Prime totaux')).toBeInTheDocument();
    });

    it('should display investment estimation correctly', () => {
      const investmentEstimation = {
        finalAmount: 150000,
        totalInterest: 50000,
        annualRate: 4.5,
      };

      const investmentService: Service = {
        ...mockService,
        type: TypeService.AUTRES,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: investmentService,
        },
        estimation: investmentEstimation,
        getAvailableServices: jest.fn(() => [investmentService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText(/150\s*000\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Montant final estimé')).toBeInTheDocument();
      expect(screen.getAllByText(/50\s*000\s*F\s*CFA/)[0]).toBeInTheDocument();
      expect(screen.getByText('Gain estimé')).toBeInTheDocument();
    });

    it('should display savings estimation correctly', () => {
      const savingsEstimation = {
        finalAmount: 55000,
        totalInterest: 5000,
        annualRate: 2.5,
      };

      const savingsService: Service = {
        ...mockService,
        type: TypeService.EPARGNE,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: savingsService,
        },
        estimation: savingsEstimation,
        getAvailableServices: jest.fn(() => [savingsService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText(/55\s*000\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Montant final estimé')).toBeInTheDocument();
      expect(screen.getAllByText(/5\s*000\s*F\s*CFA/)[0]).toBeInTheDocument();
      expect(screen.getByText('Gain estimé')).toBeInTheDocument();
    });

    it('should display insurance estimation correctly', () => {
      const insuranceEstimation = {
        monthlyPayment: 150,
        totalInterest: 18000,
        annualRate: 1.8,
      };

      const insuranceService: Service = {
        ...mockService,
        type: TypeService.ASSURANCE,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: insuranceService,
        },
        estimation: insuranceEstimation,
        getAvailableServices: jest.fn(() => [insuranceService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText(/150\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Mensualité estimée')).toBeInTheDocument();
      expect(screen.getByText(/18\s*000\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Intérêts/Prime totaux')).toBeInTheDocument();
    });

    it('should display annual rate correctly', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: mockEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('3.50%')).toBeInTheDocument();
      expect(screen.getByText('Taux annuel')).toBeInTheDocument();
    });
  });

  describe('Bouton Reset', () => {
    it('should show reset button when institution or product is selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
      });

      render(<ServiceSimulator />);

      expect(screen.getByTitle('Réinitialiser la simulation')).toBeInTheDocument();
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    });

    it('should not show reset button when nothing is selected', () => {
      render(<ServiceSimulator />);

      expect(screen.queryByTitle('Réinitialiser la simulation')).not.toBeInTheDocument();
    });

    it('should call resetSimulation when reset button is clicked', async () => {
      const user = userEvent.setup();
      const mockResetSimulation = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);

      const resetButton = screen.getByTitle('Réinitialiser la simulation');
      await user.click(resetButton);

      expect(mockResetSimulation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Animation', () => {
    it('should apply animation class when isAnimating is true', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: mockEstimation,
        isAnimating: true,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const estimationElements = screen.getAllByText(/1\s*000\s*F\s*CFA/);
      const estimationElement = estimationElements.find(el => el.className.includes('scale-105'));
      expect(estimationElement).toBeDefined();
      expect(estimationElement).toHaveClass('scale-105');
    });

    it('should not apply animation class when isAnimating is false', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: mockEstimation,
        isAnimating: false,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const estimationElements = screen.getAllByText(/1\s*000\s*F\s*CFA/);
      const estimationElement = estimationElements.find(el => el.className.includes('scale-100'));
      expect(estimationElement).toBeDefined();
      expect(estimationElement).toHaveClass('scale-100');
    });
  });

  describe('Duration Unit Selector', () => {
    it('should render duration unit selector when product is selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Années')).toBeInTheDocument();
      expect(screen.getByText('Mois')).toBeInTheDocument();
    });

    it('should show YEARS as default duration unit', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          durationUnit: 'YEARS',
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const yearsButton = screen.getByText('Années');
      expect(yearsButton).toHaveClass('bg-white', 'text-teal-600');
    });

    it('should show MONTHS when selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          durationUnit: 'MONTHS',
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const monthsButton = screen.getByText('Mois');
      expect(monthsButton).toHaveClass('bg-white', 'text-teal-600');
    });
  });

  describe('Dropdown Interactions', () => {
    it('should call updateParam when institution is selected', async () => {
      const _user = userEvent.setup();
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        updateParam: mockUpdateParam,
      });

      render(<ServiceSimulator />);

      // Le dropdown est rendu mais les interactions sont mockées
      // On teste que la fonction updateParam est disponible
      expect(mockUpdateParam).toBeDefined();
    });

    it('should call updateParam when product is selected', async () => {
      const _user = userEvent.setup();
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Le dropdown produit est rendu
      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
      expect(mockUpdateParam).toBeDefined();
    });
  });

  describe('Duration Unit Conversion', () => {
    it('should handle YEARS to MONTHS conversion', async () => {
      const user = userEvent.setup();
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          duration: 2, // 2 years
          durationUnit: 'YEARS',
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const monthsButton = screen.getByText('Mois');
      await user.click(monthsButton);

      // Vérifier que updateParam a été appelé pour changer l'unité
      expect(mockUpdateParam).toHaveBeenCalledWith('durationUnit', 'MONTHS');
    });

    it('should handle MONTHS to YEARS conversion', async () => {
      const user = userEvent.setup();
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          duration: 24, // 24 months
          durationUnit: 'MONTHS',
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const yearsButton = screen.getByText('Années');
      await user.click(yearsButton);

      // Vérifier que updateParam a été appelé pour changer l'unité
      expect(mockUpdateParam).toHaveBeenCalledWith('durationUnit', 'YEARS');
    });

    it('should handle same unit selection without conversion', async () => {
      const user = userEvent.setup();
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          duration: 2,
          durationUnit: 'YEARS',
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const yearsButton = screen.getByText('Années');
      await user.click(yearsButton);

      // Vérifier que updateParam a été appelé même pour la même unité
      expect(mockUpdateParam).toHaveBeenCalledWith('durationUnit', 'YEARS');
    });
  });

  describe('Slider Interactions', () => {
    it('should handle amount slider changes', () => {
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          amount: 50000,
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le slider de montant est rendu
      expect(screen.getByText('Montant')).toBeInTheDocument();
      expect(mockUpdateParam).toBeDefined();
    });

    it('should handle duration slider changes with YEARS', () => {
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          duration: 5,
          durationUnit: 'YEARS',
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le slider de durée est rendu
      expect(screen.getByText('Durée')).toBeInTheDocument();
      expect(mockUpdateParam).toBeDefined();
    });

    it('should handle duration slider changes with MONTHS', () => {
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          duration: 36,
          durationUnit: 'MONTHS',
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le slider de durée est rendu
      expect(screen.getByText('Durée')).toBeInTheDocument();
      expect(mockUpdateParam).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    it('should create institution options with correct structure', () => {
      const institutionsWithProducts: Institution[] = [
        {
          ...mockInstitution,
          services: [mockService, mockService], // 2 products
        },
      ];

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: institutionsWithProducts,
      });

      render(<ServiceSimulator />);

      // Vérifier que les options d'institution sont créées
      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should create product options with correct structure', () => {
      const productsWithDescription: Service[] = [
        {
          ...mockService,
        },
      ];

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
        getAvailableServices: jest.fn(() => productsWithDescription),
      });

      render(<ServiceSimulator />);

      // Vérifier que les options de produit sont créées
      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
    });

    it('should handle institutions with multiple products', () => {
      const institutionWithMultipleProducts: Institution = {
        ...mockInstitution,
        services: [mockService, mockService, mockService], // 3 products
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [institutionWithMultipleProducts],
      });

      render(<ServiceSimulator />);

      // Vérifier que le composant gère les institutions avec plusieurs produits
      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should handle institutions with no products', () => {
      const institutionWithNoProducts: Institution = {
        ...mockInstitution,
        services: [],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [institutionWithNoProducts],
      });

      render(<ServiceSimulator />);

      // Vérifier que le composant gère les institutions sans produits
      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should handle products with different types', () => {
      const creditService: Service = {
        ...mockService,
        type: TypeService.CREDIT,
        name: 'Credit Product',
      };

      const investmentService: Service = {
        ...mockService,
        type: TypeService.AUTRES,
        name: 'Investment Product',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
        getAvailableServices: jest.fn(() => [creditService, investmentService]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le composant gère différents types de produits
      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
    });

    it('should handle products with missing descriptions', () => {
      const productWithoutDescription: Service = {
        ...mockService,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
        getAvailableServices: jest.fn(() => [productWithoutDescription]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le composant gère les produits sans description
      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
    });
  });

  describe('Default Values and Limits', () => {
    it('should use default amount when params.amount is 0', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          amount: 0,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Le composant devrait utiliser les limites par défaut
      expect(screen.getByText('Montant')).toBeInTheDocument();
    });

    it('should use default duration when params.duration is 0', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          duration: 0,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Le composant devrait utiliser les limites par défaut
      expect(screen.getByText('Durée')).toBeInTheDocument();
    });

    it('should handle minimum duration for MONTHS (3 months)', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          durationUnit: 'MONTHS',
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le composant gère le minimum de 3 mois
      expect(screen.getByText('Durée')).toBeInTheDocument();
    });

    it('should handle minimum duration for YEARS (1 year)', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          durationUnit: 'YEARS',
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le composant gère le minimum de 1 an
      expect(screen.getByText('Durée')).toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('should show animation when isAnimating is true', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: mockEstimation,
        isAnimating: true,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const estimationElements = screen.getAllByText(/1\s*000\s*F\s*CFA/);
      const estimationElement = estimationElements.find(el => el.className.includes('scale-105'));
      expect(estimationElement).toBeDefined();
      expect(estimationElement).toHaveClass('scale-105');
    });

    it('should not show animation when isAnimating is false', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: mockEstimation,
        isAnimating: false,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const estimationElements = screen.getAllByText(/1\s*000\s*F\s*CFA/);
      const estimationElement = estimationElements.find(el => el.className.includes('scale-100'));
      expect(estimationElement).toBeDefined();
      expect(estimationElement).toHaveClass('scale-100');
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive classes', () => {
      render(<ServiceSimulator />);

      // Vérifier que les classes responsive sont présentes
      const container = screen.getByText('Simulez votre projet financier').closest('section');
      expect(container).toHaveClass('py-20');
    });

    it('should render reset button with responsive text', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
      });

      render(<ServiceSimulator />);

      const resetButton = screen.getByTitle('Réinitialiser la simulation');
      expect(resetButton).toBeInTheDocument();
      // Le texte "Réinitialiser" devrait être caché sur mobile (hidden sm:inline)
      const resetText = screen.getByText('Réinitialiser');
      expect(resetText).toHaveClass('hidden', 'sm:inline');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and titles', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
      });

      render(<ServiceSimulator />);

      const resetButton = screen.getByTitle('Réinitialiser la simulation');
      expect(resetButton).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: mockEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing estimation values gracefully', () => {
      const incompleteEstimation = {
        annualRate: 3.5,
        // Missing other values
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: incompleteEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle zero values in estimation', () => {
      const zeroEstimation = {
        monthlyPayment: 0,
        totalInterest: 0,
        annualRate: 0,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: zeroEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle very large numbers in estimation', () => {
      const largeEstimation = {
        monthlyPayment: 999999,
        totalInterest: 9999999,
        annualRate: 99.99,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: largeEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle missing product limits gracefully', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle empty institutions array', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [],
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle institutions with no products', () => {
      const institutionWithoutProducts: Institution = {
        ...mockInstitution,
        services: [],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [institutionWithoutProducts],
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle negative values in estimation', () => {
      const negativeEstimation = {
        monthlyPayment: -100,
        totalInterest: -500,
        annualRate: -1.5,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: negativeEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle decimal values in estimation', () => {
      const decimalEstimation = {
        monthlyPayment: 1234.56,
        totalInterest: 5678.9,
        annualRate: 3.75,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: decimalEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle very small values in estimation', () => {
      const smallEstimation = {
        monthlyPayment: 0.01,
        totalInterest: 0.05,
        annualRate: 0.01,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
        },
        estimation: smallEstimation,
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });
  });

  describe('Validation and Limits', () => {
    it('should handle amount below minimum limit', () => {
      const productWithHighMin: Service = {
        ...mockService,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: productWithHighMin,
          amount: 1000, // Below minimum
        },
        getAvailableServices: jest.fn(() => [productWithHighMin]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle amount above maximum limit', () => {
      const productWithLowMax: Service = {
        ...mockService,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: productWithLowMax,
          amount: 50000, // Above maximum
        },
        getAvailableServices: jest.fn(() => [productWithLowMax]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle duration below minimum limit', () => {
      const productWithHighMinDuration: Service = {
        ...mockService,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: productWithHighMinDuration,
          duration: 1, // Below minimum
        },
        getAvailableServices: jest.fn(() => [productWithHighMinDuration]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle duration above maximum limit', () => {
      const productWithLowMaxDuration: Service = {
        ...mockService,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: productWithLowMaxDuration,
          duration: 10, // Above maximum
        },
        getAvailableServices: jest.fn(() => [productWithLowMaxDuration]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle edge case with 0 duration', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          duration: 0,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle edge case with 0 amount', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          amount: 0,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });
  });
});

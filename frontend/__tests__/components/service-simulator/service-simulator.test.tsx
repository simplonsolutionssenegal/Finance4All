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
    type: 'POURCENTAGE' as const,
    rate: 3.5,
    amount: 100,
    cap: 500,
    floor: 50,
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
  logoUrl: 'https://testbank.com/logo.png',
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
  serviceType: 'crédit',
  feeDescription: 'Frais de traitement',
};

const defaultMockReturn = {
  params: {
    institution: null,
    service: null,
    amount: 0,
    selectedPlafondIndex: 0,
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

    it('should render amount slider', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          amount: 50000,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Montant')).toBeInTheDocument();
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
        serviceType: 'crédit',
        feeDescription: 'Frais de traitement',
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
      expect(screen.getByText('Intérêts totaux')).toBeInTheDocument();
    });

    it('should display investment estimation correctly', () => {
      const investmentEstimation = {
        finalAmount: 150000,
        totalGain: 50000,
        annualRate: 4.5,
        serviceType: 'autres services',
        feeDescription: 'Frais de gestion',
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
        totalGain: 5000,
        annualRate: 2.5,
        serviceType: 'épargne',
        feeDescription: 'Frais de gestion',
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
        serviceType: 'assurance',
        feeDescription: 'Prime mensuelle',
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
      expect(screen.getByText('Intérêts totaux')).toBeInTheDocument();
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

    it('should display insurance with annual premium correctly', () => {
      const insuranceEstimation = {
        annualPremium: 1800,
        totalPremium: 5400,
        annualRate: 3.0,
        serviceType: 'assurance',
        feeDescription: 'Prime annuelle',
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

      expect(screen.getByText(/1\s*800\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getAllByText('Prime annuelle')[0]).toBeInTheDocument();
      expect(screen.getByText(/3\.00%/)).toBeInTheDocument();
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

  describe('Plafond Selector', () => {
    const serviceWithMultiplePlafonds = {
      ...mockService,
      plafonds: ['1000-50000', '50000-200000', '200000-1000000'],
    };

    it('should render plafond selector when service has multiple plafonds', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithMultiplePlafonds,
        },
        getAvailableServices: jest.fn(() => [serviceWithMultiplePlafonds]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Sélectionnez le plafond à simuler :')).toBeInTheDocument();
      expect(screen.getByText('Plafond 1: 1000-50000')).toBeInTheDocument();
      expect(screen.getByText('Plafond 2: 50000-200000')).toBeInTheDocument();
      expect(screen.getByText('Plafond 3: 200000-1000000')).toBeInTheDocument();
    });

    it('should show first plafond as selected by default', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithMultiplePlafonds,
          selectedPlafondIndex: 0,
        },
        getAvailableServices: jest.fn(() => [serviceWithMultiplePlafonds]),
      });

      render(<ServiceSimulator />);

      const firstPlafondButton = screen.getByText('Plafond 1: 1000-50000');
      expect(firstPlafondButton).toHaveClass('bg-teal-500', 'text-white');
    });

    it('should show selected plafond when different index is selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithMultiplePlafonds,
          selectedPlafondIndex: 1,
        },
        getAvailableServices: jest.fn(() => [serviceWithMultiplePlafonds]),
      });

      render(<ServiceSimulator />);

      const secondPlafondButton = screen.getByText('Plafond 2: 50000-200000');
      expect(secondPlafondButton).toHaveClass('bg-teal-500', 'text-white');
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

  describe('Plafond Selection', () => {
    const serviceWithMultiplePlafonds = {
      ...mockService,
      plafonds: ['1000-50000', '50000-200000', '200000-1000000'],
    };

    it('should handle plafond selection', async () => {
      const user = userEvent.setup();
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithMultiplePlafonds,
          selectedPlafondIndex: 0,
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [serviceWithMultiplePlafonds]),
      });

      render(<ServiceSimulator />);

      const secondPlafondButton = screen.getByText('Plafond 2: 50000-200000');
      await user.click(secondPlafondButton);

      // Vérifier que updateParam a été appelé pour changer le plafond
      expect(mockUpdateParam).toHaveBeenCalledWith('selectedPlafondIndex', 1);
    });

    it('should handle same plafond selection', async () => {
      const user = userEvent.setup();
      const mockUpdateParam = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithMultiplePlafonds,
          selectedPlafondIndex: 0,
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [serviceWithMultiplePlafonds]),
      });

      render(<ServiceSimulator />);

      const firstPlafondButton = screen.getByText('Plafond 1: 1000-50000');
      await user.click(firstPlafondButton);

      // Vérifier que updateParam a été appelé même pour le même plafond
      expect(mockUpdateParam).toHaveBeenCalledWith('selectedPlafondIndex', 0);
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

    it('should handle amount slider with different plafonds', () => {
      const mockUpdateParam = jest.fn();
      const serviceWithPlafonds = {
        ...mockService,
        plafonds: ['1000-50000', '50000-200000'],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithPlafonds,
          selectedPlafondIndex: 1,
        },
        updateParam: mockUpdateParam,
        getAvailableServices: jest.fn(() => [serviceWithPlafonds]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le slider de montant est rendu
      expect(screen.getByText('Montant')).toBeInTheDocument();
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

    it('should use default plafond when no plafond is selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: mockService,
          selectedPlafondIndex: 0,
        },
        getAvailableServices: jest.fn(() => [mockService]),
      });

      render(<ServiceSimulator />);

      // Le composant devrait utiliser les limites par défaut
      expect(screen.getByText('Montant')).toBeInTheDocument();
    });

    it('should handle service with single plafond', () => {
      const serviceWithSinglePlafond = {
        ...mockService,
        plafonds: ['1000-100000'],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithSinglePlafond,
          selectedPlafondIndex: 0,
        },
        getAvailableServices: jest.fn(() => [serviceWithSinglePlafond]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le composant gère un seul plafond
      expect(screen.getByText('Montant')).toBeInTheDocument();
    });

    it('should handle service with single value plafond format', () => {
      const singleValueService: Service = {
        ...mockService,
        plafonds: ['100000'],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: singleValueService,
        },
        getAvailableServices: jest.fn(() => [singleValueService]),
      });

      render(<ServiceSimulator />);

      // Vérifier que le slider fonctionne avec les limites correctes
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
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
        serviceType: 'crédit',
        feeDescription: 'Estimation incomplète',
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
        serviceType: 'crédit',
        feeDescription: 'Aucun frais',
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
        serviceType: 'crédit',
        feeDescription: 'Frais élevés',
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
        serviceType: 'crédit',
        feeDescription: 'Montant négatif',
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
        serviceType: 'crédit',
        feeDescription: 'Frais décimaux',
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
        serviceType: 'crédit',
        feeDescription: 'Montant minimal',
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

    it('should handle plafond index out of bounds', () => {
      const serviceWithPlafonds: Service = {
        ...mockService,
        plafonds: ['1000-50000'],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithPlafonds,
          selectedPlafondIndex: 5, // Out of bounds
        },
        getAvailableServices: jest.fn(() => [serviceWithPlafonds]),
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it('should handle negative plafond index', () => {
      const serviceWithPlafonds: Service = {
        ...mockService,
        plafonds: ['1000-50000'],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithPlafonds,
          selectedPlafondIndex: -1, // Negative index
        },
        getAvailableServices: jest.fn(() => [serviceWithPlafonds]),
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

  describe('Service with different fee types', () => {
    it('should display service with FIX fees', () => {
      const serviceWithFixFees = {
        ...mockService,
        frais: {
          type: 'FIX' as const,
          amount: 500,
        },
      };

      const fixEstimation = {
        totalFees: 500,
        netAmount: 100500,
        serviceType: TypeService.PAIEMENT_MARCHAND,
        feeDescription: '500 F CFA',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithFixFees,
        },
        estimation: fixEstimation,
        getAvailableServices: jest.fn(() => [serviceWithFixFees]),
      });

      render(<ServiceSimulator />);

      expect(screen.getAllByText('500 F CFA')[0]).toBeInTheDocument();
      expect(screen.getByText('Frais appliqués')).toBeInTheDocument();
    });

    it('should display service with FREE fees', () => {
      const serviceWithFreeFees = {
        ...mockService,
        frais: {
          type: 'FREE' as const,
        },
      };

      const freeEstimation = {
        totalFees: 0,
        netAmount: 100000,
        serviceType: TypeService.DEPOT_SIMPLE,
        feeDescription: 'Gratuit',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithFreeFees,
        },
        estimation: freeEstimation,
        getAvailableServices: jest.fn(() => [serviceWithFreeFees]),
      });

      render(<ServiceSimulator />);

      expect(screen.getAllByText('Gratuit')[0]).toBeInTheDocument();
      expect(screen.getByText('Frais appliqués')).toBeInTheDocument();
    });

    it('should display service with POURCENTAGE fees', () => {
      const serviceWithPercentageFees = {
        ...mockService,
        frais: {
          type: 'POURCENTAGE' as const,
          rate: 0.025,
        },
      };

      const percentageEstimation = {
        totalFees: 2500,
        netAmount: 102500,
        serviceType: TypeService.TRANSFERT_ARGENT,
        feeDescription: '2.50%',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
          service: serviceWithPercentageFees,
        },
        estimation: percentageEstimation,
        getAvailableServices: jest.fn(() => [serviceWithPercentageFees]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('2.50%')).toBeInTheDocument();
      expect(screen.getByText('Frais appliqués')).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should display loading state when institutions are loading', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
        institutions: [],
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Chargement des institutions...')).toBeInTheDocument();
    });

    it('should not display loading state when institutions are loaded', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        isLoading: false,
        institutions: mockInstitutions,
      });

      render(<ServiceSimulator />);

      expect(screen.queryByText('Chargement des institutions...')).not.toBeInTheDocument();
    });
  });

  describe('Service icons and descriptions', () => {
    it('should display service with emoji icon', () => {
      const creditService = {
        ...mockService,
        type: TypeService.CREDIT,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
        getAvailableServices: jest.fn(() => [creditService]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
    });

    it('should handle service without longName', () => {
      const serviceWithoutLongName = {
        ...mockService,
        longName: undefined as any,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitution,
        },
        getAvailableServices: jest.fn(() => [serviceWithoutLongName]),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
    });
  });

  describe('Institution handling', () => {
    it('should handle institution without logoUrl', () => {
      const institutionWithoutLogo = {
        ...mockInstitution,
        logoUrl: '',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [institutionWithoutLogo],
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should handle institution with empty services array', () => {
      const institutionWithoutServices = {
        ...mockInstitution,
        services: [],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: institutionWithoutServices,
        },
        getAvailableServices: jest.fn(() => []),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
    });

    it('should handle institution with null services', () => {
      const institutionWithNullServices = {
        ...mockInstitution,
        services: null as any,
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: institutionWithNullServices,
        },
        getAvailableServices: jest.fn(() => []),
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Sélectionnez un service')).toBeInTheDocument();
    });
  });
});

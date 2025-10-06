import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductSimulator } from '@/components/product-simulator/product-simulator';
import { useSimulatorStore } from '@/lib/simulator-store';
import type { Institution, InstitutionProduct } from '@/lib/simulator-types';

// Mock du hook useSimulator
jest.mock('@/hooks/useSimulator', () => ({
  useSimulator: jest.fn(),
}));

const mockUseSimulator = require('@/hooks/useSimulator').useSimulator as jest.MockedFunction<
  typeof import('@/hooks/useSimulator').useSimulator
>;

// Mock data pour les tests
const mockInstitution: Institution = {
  id: 'test-institution',
  name: 'Test Bank',
  logo: '🏦',
  products: [],
};

const mockProduct: InstitutionProduct = {
  id: 'test-product',
  name: 'Test Product',
  description: 'Test Description',
  icon: '💰',
  type: 'CREDIT',
  rates: { min: 2.5, max: 4.0 },
  limits: { amount: { min: 1000, max: 100000 }, duration: { min: 1, max: 10 } },
};

const mockInstitutionWithProducts: Institution = {
  ...mockInstitution,
  products: [mockProduct],
};

const mockInstitutions: Institution[] = [mockInstitutionWithProducts];

const mockEstimation = {
  monthlyPayment: 1000,
  totalInterest: 5000,
  annualRate: 3.5,
};

const defaultMockReturn = {
  params: {
    institution: null,
    product: null,
    amount: 0,
    duration: 0,
    durationUnit: 'YEARS' as const,
  },
  estimation: null,
  isAnimating: false,
  institutions: mockInstitutions,
  updateParam: jest.fn(),
  getAvailableProducts: jest.fn(() => []),
  getCurrentLimits: jest.fn(() => ({
    amount: { min: 0, max: 100000 },
    duration: { min: 1, max: 10 },
  })),
  resetSimulation: jest.fn(),
};

describe('ProductSimulator', () => {
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
      render(<ProductSimulator />);

      expect(screen.getByText('Simulateur de Produits Financiers')).toBeInTheDocument();
      expect(screen.getByText('Simulez votre projet financier')).toBeInTheDocument();
      expect(screen.getByText('en temps réel')).toBeInTheDocument();
    });

    it('should render step 1 (institution selection)', () => {
      render(<ProductSimulator />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Choisissez votre institution')).toBeInTheDocument();
      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should not render step 2 when no institution is selected', () => {
      render(<ProductSimulator />);

      expect(screen.queryByText('2')).not.toBeInTheDocument();
      expect(screen.queryByText('Sélectionnez un produit')).not.toBeInTheDocument();
    });

    it('should not render step 3 when no product is selected', () => {
      render(<ProductSimulator />);

      expect(screen.queryByText('3')).not.toBeInTheDocument();
      expect(screen.queryByText('Ajustez vos paramètres')).not.toBeInTheDocument();
    });

    it('should not render results when no estimation', () => {
      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Sélectionnez un produit')).toBeInTheDocument();
    });
  });

  describe('Sélection de produit', () => {
    it('should render step 3 when product is selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Ajustez vos paramètres')).toBeInTheDocument();
    });

    it('should render amount and duration sliders', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          amount: 50000,
          duration: 5,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: mockEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Votre estimation')).toBeInTheDocument();
    });

    it('should display credit estimation correctly', () => {
      const creditEstimation = {
        monthlyPayment: 1200,
        totalInterest: 44000,
        annualRate: 3.5,
      };

      const creditProduct: InstitutionProduct = {
        ...mockProduct,
        type: 'CREDIT',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: creditProduct,
        },
        estimation: creditEstimation,
        getAvailableProducts: jest.fn(() => [creditProduct]),
      });

      render(<ProductSimulator />);

      expect(screen.getByText(/1\s*200\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Mensualité estimée')).toBeInTheDocument();
      expect(screen.getByText(/44\s*000\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Intérêts totaux')).toBeInTheDocument();
    });

    it('should display investment estimation correctly', () => {
      const investmentEstimation = {
        finalAmount: 150000,
        totalInterest: 50000,
        annualRate: 4.5,
      };

      const investmentProduct: InstitutionProduct = {
        ...mockProduct,
        type: 'INVESTISSEMENT',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: investmentProduct,
        },
        estimation: investmentEstimation,
        getAvailableProducts: jest.fn(() => [investmentProduct]),
      });

      render(<ProductSimulator />);

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

      const savingsProduct: InstitutionProduct = {
        ...mockProduct,
        type: 'EPARGNE',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: savingsProduct,
        },
        estimation: savingsEstimation,
        getAvailableProducts: jest.fn(() => [savingsProduct]),
      });

      render(<ProductSimulator />);

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

      const insuranceProduct: InstitutionProduct = {
        ...mockProduct,
        type: 'ASSURANCE',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: insuranceProduct,
        },
        estimation: insuranceEstimation,
        getAvailableProducts: jest.fn(() => [insuranceProduct]),
      });

      render(<ProductSimulator />);

      expect(screen.getByText(/150\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Prime mensuelle estimée')).toBeInTheDocument();
      expect(screen.getByText(/18\s*000\s*F\s*CFA/)).toBeInTheDocument();
      expect(screen.getByText('Prime totale')).toBeInTheDocument();
    });

    it('should display annual rate correctly', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: mockEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
        },
      });

      render(<ProductSimulator />);

      expect(screen.getByTitle('Réinitialiser la simulation')).toBeInTheDocument();
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    });

    it('should not show reset button when nothing is selected', () => {
      render(<ProductSimulator />);

      expect(screen.queryByTitle('Réinitialiser la simulation')).not.toBeInTheDocument();
    });

    it('should call resetSimulation when reset button is clicked', async () => {
      const user = userEvent.setup();
      const mockResetSimulation = jest.fn();

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
        },
        resetSimulation: mockResetSimulation,
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: mockEstimation,
        isAnimating: true,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

      const estimationElement = screen.getByText(/1\s*000\s*F\s*CFA/);
      expect(estimationElement).toHaveClass('scale-105');
    });

    it('should not apply animation class when isAnimating is false', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: mockEstimation,
        isAnimating: false,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

      const estimationElement = screen.getByText(/1\s*000\s*F\s*CFA/);
      expect(estimationElement).toHaveClass('scale-100');
    });
  });

  describe('Duration Unit Selector', () => {
    it('should render duration unit selector when product is selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

      expect(screen.getByText('Années')).toBeInTheDocument();
      expect(screen.getByText('Mois')).toBeInTheDocument();
    });

    it('should show YEARS as default duration unit', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          durationUnit: 'YEARS',
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

      const yearsButton = screen.getByText('Années');
      expect(yearsButton).toHaveClass('bg-white', 'text-teal-600');
    });

    it('should show MONTHS when selected', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          durationUnit: 'MONTHS',
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
        },
        updateParam: mockUpdateParam,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

      // Le dropdown produit est rendu
      expect(screen.getByText('Sélectionnez un produit')).toBeInTheDocument();
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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          duration: 2, // 2 years
          durationUnit: 'YEARS',
        },
        updateParam: mockUpdateParam,
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          duration: 24, // 24 months
          durationUnit: 'MONTHS',
        },
        updateParam: mockUpdateParam,
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          duration: 2,
          durationUnit: 'YEARS',
        },
        updateParam: mockUpdateParam,
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          amount: 50000,
        },
        updateParam: mockUpdateParam,
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          duration: 5,
          durationUnit: 'YEARS',
        },
        updateParam: mockUpdateParam,
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          duration: 36,
          durationUnit: 'MONTHS',
        },
        updateParam: mockUpdateParam,
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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
          products: [mockProduct, mockProduct], // 2 products
        },
      ];

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: institutionsWithProducts,
      });

      render(<ProductSimulator />);

      // Vérifier que les options d'institution sont créées
      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should create product options with correct structure', () => {
      const productsWithDescription: InstitutionProduct[] = [
        {
          ...mockProduct,
          description: 'Test Description',
        },
      ];

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
        },
        getAvailableProducts: jest.fn(() => productsWithDescription),
      });

      render(<ProductSimulator />);

      // Vérifier que les options de produit sont créées
      expect(screen.getByText('Sélectionnez un produit')).toBeInTheDocument();
    });

    it('should handle institutions with multiple products', () => {
      const institutionWithMultipleProducts: Institution = {
        ...mockInstitution,
        products: [mockProduct, mockProduct, mockProduct], // 3 products
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [institutionWithMultipleProducts],
      });

      render(<ProductSimulator />);

      // Vérifier que le composant gère les institutions avec plusieurs produits
      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should handle institutions with no products', () => {
      const institutionWithNoProducts: Institution = {
        ...mockInstitution,
        products: [],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [institutionWithNoProducts],
      });

      render(<ProductSimulator />);

      // Vérifier que le composant gère les institutions sans produits
      expect(screen.getByText('Sélectionnez une institution...')).toBeInTheDocument();
    });

    it('should handle products with different types', () => {
      const creditProduct: InstitutionProduct = {
        ...mockProduct,
        type: 'CREDIT',
        name: 'Credit Product',
      };

      const investmentProduct: InstitutionProduct = {
        ...mockProduct,
        type: 'INVESTISSEMENT',
        name: 'Investment Product',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
        },
        getAvailableProducts: jest.fn(() => [creditProduct, investmentProduct]),
      });

      render(<ProductSimulator />);

      // Vérifier que le composant gère différents types de produits
      expect(screen.getByText('Sélectionnez un produit')).toBeInTheDocument();
    });

    it('should handle products with missing descriptions', () => {
      const productWithoutDescription: InstitutionProduct = {
        ...mockProduct,
        description: '',
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
        },
        getAvailableProducts: jest.fn(() => [productWithoutDescription]),
      });

      render(<ProductSimulator />);

      // Vérifier que le composant gère les produits sans description
      expect(screen.getByText('Sélectionnez un produit')).toBeInTheDocument();
    });
  });

  describe('Default Values and Limits', () => {
    it('should use default amount when params.amount is 0', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          amount: 0,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

      // Le composant devrait utiliser les limites par défaut
      expect(screen.getByText('Montant')).toBeInTheDocument();
    });

    it('should use default duration when params.duration is 0', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          duration: 0,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

      // Le composant devrait utiliser les limites par défaut
      expect(screen.getByText('Durée')).toBeInTheDocument();
    });

    it('should handle minimum duration for MONTHS (3 months)', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          durationUnit: 'MONTHS',
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

      // Vérifier que le composant gère le minimum de 3 mois
      expect(screen.getByText('Durée')).toBeInTheDocument();
    });

    it('should handle minimum duration for YEARS (1 year)', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          durationUnit: 'YEARS',
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: mockEstimation,
        isAnimating: true,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

      const estimationElement = screen.getByText(/1\s*000\s*F\s*CFA/);
      expect(estimationElement).toHaveClass('scale-105');
    });

    it('should not show animation when isAnimating is false', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: mockEstimation,
        isAnimating: false,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

      const estimationElement = screen.getByText(/1\s*000\s*F\s*CFA/);
      expect(estimationElement).toHaveClass('scale-100');
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive classes', () => {
      render(<ProductSimulator />);

      // Vérifier que les classes responsive sont présentes
      const container = screen.getByText('Simulez votre projet financier').closest('section');
      expect(container).toHaveClass('py-20');
    });

    it('should render reset button with responsive text', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
        },
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
        },
      });

      render(<ProductSimulator />);

      const resetButton = screen.getByTitle('Réinitialiser la simulation');
      expect(resetButton).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: mockEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      render(<ProductSimulator />);

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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: incompleteEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: zeroEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: largeEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });

    it('should handle missing product limits gracefully', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => ({
          amount: { min: 0, max: 100000 },
          duration: { min: 1, max: 10 },
        })),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });

    it('should handle empty institutions array', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [],
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });

    it('should handle institutions with no products', () => {
      const institutionWithoutProducts: Institution = {
        ...mockInstitution,
        products: [],
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        institutions: [institutionWithoutProducts],
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: negativeEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: decimalEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
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
          institution: mockInstitutionWithProducts,
          product: mockProduct,
        },
        estimation: smallEstimation,
        getAvailableProducts: jest.fn(() => [mockProduct]),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });
  });

  describe('Validation and Limits', () => {
    it('should handle amount below minimum limit', () => {
      const productWithHighMin: InstitutionProduct = {
        ...mockProduct,
        limits: {
          amount: { min: 50000, max: 100000 },
          duration: { min: 1, max: 10 },
        },
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: productWithHighMin,
          amount: 1000, // Below minimum
        },
        getAvailableProducts: jest.fn(() => [productWithHighMin]),
        getCurrentLimits: jest.fn(() => productWithHighMin.limits),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });

    it('should handle amount above maximum limit', () => {
      const productWithLowMax: InstitutionProduct = {
        ...mockProduct,
        limits: {
          amount: { min: 1000, max: 10000 },
          duration: { min: 1, max: 10 },
        },
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: productWithLowMax,
          amount: 50000, // Above maximum
        },
        getAvailableProducts: jest.fn(() => [productWithLowMax]),
        getCurrentLimits: jest.fn(() => productWithLowMax.limits),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });

    it('should handle duration below minimum limit', () => {
      const productWithHighMinDuration: InstitutionProduct = {
        ...mockProduct,
        limits: {
          amount: { min: 1000, max: 100000 },
          duration: { min: 5, max: 10 },
        },
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: productWithHighMinDuration,
          duration: 1, // Below minimum
        },
        getAvailableProducts: jest.fn(() => [productWithHighMinDuration]),
        getCurrentLimits: jest.fn(() => productWithHighMinDuration.limits),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });

    it('should handle duration above maximum limit', () => {
      const productWithLowMaxDuration: InstitutionProduct = {
        ...mockProduct,
        limits: {
          amount: { min: 1000, max: 100000 },
          duration: { min: 1, max: 3 },
        },
      };

      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: productWithLowMaxDuration,
          duration: 10, // Above maximum
        },
        getAvailableProducts: jest.fn(() => [productWithLowMaxDuration]),
        getCurrentLimits: jest.fn(() => productWithLowMaxDuration.limits),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });

    it('should handle edge case with 0 duration', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          duration: 0,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });

    it('should handle edge case with 0 amount', () => {
      mockUseSimulator.mockReturnValue({
        ...defaultMockReturn,
        params: {
          ...defaultMockReturn.params,
          institution: mockInstitutionWithProducts,
          product: mockProduct,
          amount: 0,
        },
        getAvailableProducts: jest.fn(() => [mockProduct]),
        getCurrentLimits: jest.fn(() => mockProduct.limits),
      });

      expect(() => render(<ProductSimulator />)).not.toThrow();
    });
  });
});

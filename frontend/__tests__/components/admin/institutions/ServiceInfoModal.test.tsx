// __tests__/components/admin/institutions/ServiceInfoModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ServiceInfoModal from '@/components/admin/institutions/ServiceInfoModal';
import { TypeService, type Service } from '@/types/Service';

// Mock des composants UI
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid='dialog' className={open ? 'open' : 'closed'}>
      <button onClick={onOpenChange} data-testid='dialog-close'>
        Close
      </button>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div data-testid='dialog-content' className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid='dialog-header'>{children}</div>,
  DialogTitle: ({ children, className }: any) => (
    <h1 data-testid='dialog-title' className={className}>
      {children}
    </h1>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid='badge' className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid='separator' />,
}));

// Mock des icônes Lucide
jest.mock('lucide-react', () => ({
  DollarSign: ({ className }: any) => <div data-testid='dollar-sign-icon' className={className} />,
  CheckCircle2: ({ className }: any) => (
    <div data-testid='check-circle-icon' className={className} />
  ),
  AlertCircle: ({ className }: any) => (
    <div data-testid='alert-circle-icon' className={className} />
  ),
  Wifi: ({ className }: any) => <div data-testid='wifi-icon' className={className} />,
}));

describe('ServiceInfoModal', () => {
  const mockService: Service = {
    id: 'service-1',
    name: 'Service de Crédit',
    longName: 'Service de Crédit à la Consommation',
    type: TypeService.CREDIT,
    frais: {
      montantFixe: 5000,
      pourcentage: 2.5,
      minimum: 1000,
      maximum: 100000,
    },
    conditionAccess: ['Age minimum 18 ans', 'Revenus réguliers', "Pièce d'identité valide"],
    plafonds: ['Minimum 100 000 FCFA', 'Maximum 5 000 000 FCFA'],
    infrastructureAccess: ['Agences', 'Mobile Banking', 'Internet Banking'],
    institutionId: 'institution-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    service: mockService,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the modal when open', () => {
      render(<ServiceInfoModal {...defaultProps} />);

      expect(screen.getByTestId('dialog')).toHaveClass('open');
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    it('should not be visible when closed', () => {
      render(<ServiceInfoModal {...defaultProps} isOpen={false} />);

      expect(screen.getByTestId('dialog')).toHaveClass('closed');
    });

    it('should render service name and long name', () => {
      render(<ServiceInfoModal {...defaultProps} />);

      expect(screen.getByText('Service de Crédit')).toBeInTheDocument();
      expect(screen.getByText('Service de Crédit à la Consommation')).toBeInTheDocument();
    });

    it('should render service type badge', () => {
      render(<ServiceInfoModal {...defaultProps} />);

      expect(screen.getByTestId('badge')).toHaveTextContent(TypeService.CREDIT);
    });
  });

  describe('Frais Section', () => {
    it('should render all frais information', () => {
      render(<ServiceInfoModal {...defaultProps} />);

      expect(screen.getByText('Frais du service')).toBeInTheDocument();
      expect(screen.getByTestId('dollar-sign-icon')).toBeInTheDocument();

      // Montant fixe
      expect(screen.getByText('Montant fixe')).toBeInTheDocument();
      expect(screen.getByText('5 000 FCFA')).toBeInTheDocument();

      // Pourcentage
      expect(screen.getByText('Pourcentage')).toBeInTheDocument();
      expect(screen.getByText('2.5%')).toBeInTheDocument();

      // Minimum
      expect(screen.getByText('Montant minimum')).toBeInTheDocument();
      expect(screen.getByText('1 000 FCFA')).toBeInTheDocument();

      // Maximum
      expect(screen.getByText('Montant maximum')).toBeInTheDocument();
      expect(screen.getByText('100 000 FCFA')).toBeInTheDocument();
    });

    it('should handle service with only montantFixe', () => {
      const serviceWithOnlyFixe: Service = {
        ...mockService,
        frais: { montantFixe: 2500 },
      };

      render(<ServiceInfoModal {...defaultProps} service={serviceWithOnlyFixe} />);

      expect(screen.getByText('Montant fixe')).toBeInTheDocument();
      expect(screen.getByText('2 500 FCFA')).toBeInTheDocument();
      expect(screen.queryByText('Pourcentage')).not.toBeInTheDocument();
    });

    it('should handle service with only pourcentage', () => {
      const serviceWithOnlyPourcentage: Service = {
        ...mockService,
        frais: { pourcentage: 1.5 },
      };

      render(<ServiceInfoModal {...defaultProps} service={serviceWithOnlyPourcentage} />);

      expect(screen.getByText('Pourcentage')).toBeInTheDocument();
      expect(screen.getByText('1.5%')).toBeInTheDocument();
      expect(screen.queryByText('Montant fixe')).not.toBeInTheDocument();
    });

    it('should handle empty frais object', () => {
      const serviceWithEmptyFrais: Service = {
        ...mockService,
        frais: {},
      };

      render(<ServiceInfoModal {...defaultProps} service={serviceWithEmptyFrais} />);

      expect(screen.getByText('Frais du service')).toBeInTheDocument();
      expect(screen.queryByText('Montant fixe')).not.toBeInTheDocument();
      expect(screen.queryByText('Pourcentage')).not.toBeInTheDocument();
    });
  });

  describe("Conditions d'accès Section", () => {
    it("should render conditions d'accès when available", () => {
      render(<ServiceInfoModal {...defaultProps} />);

      expect(screen.getByText("Conditions d'accès")).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

      expect(screen.getByText('Age minimum 18 ans')).toBeInTheDocument();
      expect(screen.getByText('Revenus réguliers')).toBeInTheDocument();
      expect(screen.getByText("Pièce d'identité valide")).toBeInTheDocument();

      // Vérifier la numérotation
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not render conditions section when empty', () => {
      const serviceWithoutConditions: Service = {
        ...mockService,
        conditionAccess: [],
      };

      render(<ServiceInfoModal {...defaultProps} service={serviceWithoutConditions} />);

      expect(screen.queryByText("Conditions d'accès")).not.toBeInTheDocument();
    });

    it('should handle single condition', () => {
      const serviceWithSingleCondition: Service = {
        ...mockService,
        conditionAccess: ['Age minimum 21 ans'],
      };

      render(<ServiceInfoModal {...defaultProps} service={serviceWithSingleCondition} />);

      expect(screen.getByText("Conditions d'accès")).toBeInTheDocument();
      expect(screen.getByText('Age minimum 21 ans')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Plafonds Section', () => {
    it('should render plafonds when available', () => {
      render(<ServiceInfoModal {...defaultProps} />);

      expect(screen.getByText('Plafonds')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();

      expect(screen.getByText('Minimum 100 000 FCFA')).toBeInTheDocument();
      expect(screen.getByText('Maximum 5 000 000 FCFA')).toBeInTheDocument();
    });

    it('should not render plafonds section when empty', () => {
      const serviceWithoutPlafonds: Service = {
        ...mockService,
        plafonds: [],
      };

      render(<ServiceInfoModal {...defaultProps} service={serviceWithoutPlafonds} />);

      expect(screen.queryByText('Plafonds')).not.toBeInTheDocument();
    });
  });

  describe("Infrastructure d'accès Section", () => {
    it("should render infrastructure d'accès when available", () => {
      render(<ServiceInfoModal {...defaultProps} />);

      expect(screen.getByText("Canaux d'accès")).toBeInTheDocument();
      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();

      expect(screen.getByText('Agences')).toBeInTheDocument();
      expect(screen.getByText('Mobile Banking')).toBeInTheDocument();
      expect(screen.getByText('Internet Banking')).toBeInTheDocument();
    });

    it('should not render infrastructure section when empty', () => {
      const serviceWithoutInfrastructure: Service = {
        ...mockService,
        infrastructureAccess: [],
      };

      render(<ServiceInfoModal {...defaultProps} service={serviceWithoutInfrastructure} />);

      expect(screen.queryByText("Canaux d'accès")).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when dialog is closed', () => {
      const mockOnClose = jest.fn();
      render(<ServiceInfoModal {...defaultProps} onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId('dialog-close'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Different Service Types', () => {
    it('should render correctly for EPARGNE service', () => {
      const epargneService: Service = {
        ...mockService,
        name: "Service d'Épargne",
        type: TypeService.EPARGNE,
      };

      render(<ServiceInfoModal {...defaultProps} service={epargneService} />);

      expect(screen.getByText("Service d'Épargne")).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toHaveTextContent(TypeService.EPARGNE);
    });

    it('should render correctly for PAIEMENT_MARCHAND service', () => {
      const paiementService: Service = {
        ...mockService,
        name: 'Paiement Marchand',
        type: TypeService.PAIEMENT_MARCHAND,
      };

      render(<ServiceInfoModal {...defaultProps} service={paiementService} />);

      expect(screen.getByText('Paiement Marchand')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toHaveTextContent(TypeService.PAIEMENT_MARCHAND);
    });
  });

  describe('Separators', () => {
    it('should render separators between sections', () => {
      render(<ServiceInfoModal {...defaultProps} />);

      const separators = screen.getAllByTestId('separator');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  describe('Modal Content Styles', () => {
    it('should apply correct CSS classes to modal content', () => {
      render(<ServiceInfoModal {...defaultProps} />);

      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toHaveClass('max-w-3xl', 'max-h-[100vh]', 'overflow-y-auto');
    });

    it('should apply correct CSS classes to dialog title', () => {
      render(<ServiceInfoModal {...defaultProps} />);

      const dialogTitle = screen.getByTestId('dialog-title');
      expect(dialogTitle).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'mb-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle service with minimal data', () => {
      const minimalService: Service = {
        id: 'minimal-service',
        name: 'Minimal Service',
        longName: 'Minimal Service Description',
        type: TypeService.AUTRES,
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        institutionId: 'institution-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(<ServiceInfoModal {...defaultProps} service={minimalService} />);

      expect(screen.getByText('Minimal Service')).toBeInTheDocument();
      expect(screen.getByText('Frais du service')).toBeInTheDocument();
      expect(screen.queryByText("Conditions d'accès")).not.toBeInTheDocument();
      expect(screen.queryByText('Plafonds')).not.toBeInTheDocument();
      expect(screen.queryByText("Canaux d'accès")).not.toBeInTheDocument();
    });

    it('should handle very long service names', () => {
      const longNameService: Service = {
        ...mockService,
        name: "Service de Crédit avec un nom très très très long qui pourrait causer des problèmes d'affichage",
        longName:
          "Description très détaillée du service de crédit avec un nom extrêmement long qui devrait être géré correctement par l'interface utilisateur",
      };

      render(<ServiceInfoModal {...defaultProps} service={longNameService} />);

      expect(screen.getByText(longNameService.name)).toBeInTheDocument();
      expect(screen.getByText(longNameService.longName)).toBeInTheDocument();
    });

    it('should handle large numbers in frais', () => {
      const highAmountService: Service = {
        ...mockService,
        frais: {
          montantFixe: 1000000000, // 1 milliard
          maximum: 9999999999, // Plus de 9 milliards
        },
      };

      render(<ServiceInfoModal {...defaultProps} service={highAmountService} />);

      expect(screen.getByText('1 000 000 000 FCFA')).toBeInTheDocument();
      expect(screen.getByText('9 999 999 999 FCFA')).toBeInTheDocument();
    });
  });
});

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Service } from '@/types/Service';
import { TypeService, TypeCalculation } from '@/types/Service';
import ServiceDetailsModal from '@/components/admin/institutions/ServiceDetailsModal';

// Mock des icônes lucide-react
jest.mock('lucide-react', () => ({
  BadgePercent: ({ className }: { className?: string }) => (
    <span data-testid='badge-percent-icon' className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <span data-testid='info-icon' className={className} />
  ),
  MapPin: ({ className }: { className?: string }) => (
    <span data-testid='map-pin-icon' className={className} />
  ),
  Network: ({ className }: { className?: string }) => (
    <span data-testid='network-icon' className={className} />
  ),
  Shield: ({ className }: { className?: string }) => (
    <span data-testid='shield-icon' className={className} />
  ),
  X: ({ className }: { className?: string }) => <span data-testid='x-icon' className={className} />,
  Wallet: ({ className }: { className?: string }) => (
    <span data-testid='wallet-icon' className={className} />
  ),
}));

// Mock des composants UI
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid='dialog'>{children}</div> : null,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='dialog-content' className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='dialog-header' className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid='dialog-title' className={className}>
      {children}
    </h2>
  ),
  DialogDescription: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <p data-testid='dialog-description' className={className}>
      {children}
    </p>
  ),
  DialogClose: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid='dialog-close'>{children}</div>
  ),
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: { className?: string }) => (
    <hr data-testid='separator' className={className} />
  ),
}));

describe('ServiceDetailsModal', () => {
  const mockOnOpenChange = jest.fn();

  const mockService: Service = {
    id: 'service-123',
    name: "Transfert d'argent",
    longName: "Service de transfert d'argent mobile",
    type: TypeService.TRANSFERT_ARGENT,
    typeFrais: TypeCalculation.POURCENTAGE,
    frais: {
      montantFixe: 100,
      pourcentage: 2,
      minimum: 50,
      maximum: 5000,
    },
    conditionAccess: ["Carte d'identité", 'Numéro de téléphone'],
    plafonds: ['10 000 FCFA/jour', '50 000 FCFA/mois'],
    infrastructureAccess: ['USSD', 'Application mobile', 'Agence'],
    institutionId: 'institution-456',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T15:30:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu conditionnel', () => {
    it('ne rend rien si service est null', () => {
      const { container } = render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('ne rend rien si service est undefined', () => {
      const { container } = render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={undefined} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('ne rend pas le dialog si open est false', () => {
      render(
        <ServiceDetailsModal open={false} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('rend le dialog si open est true et service est défini', () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
  });

  describe('Affichage des informations de base', () => {
    it('affiche le nom du service', () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.getByText("Transfert d'argent")).toBeInTheDocument();
    });

    it('affiche le nom long si présent', () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.getByText("Service de transfert d'argent mobile")).toBeInTheDocument();
    });

    it("n'affiche pas le nom long s'il est vide", () => {
      const serviceWithoutLongName = { ...mockService, longName: '' };
      render(
        <ServiceDetailsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          service={serviceWithoutLongName}
        />
      );
      expect(screen.queryByTestId('dialog-description')).not.toBeInTheDocument();
    });

    it('affiche le type de service', () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.getAllByText("transferts d'argent").length).toBeGreaterThan(0);
    });
  });

  describe('Formatage des frais', () => {
    it('affiche les frais complets avec tous les champs', () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      const fraisText = screen.getAllByText(/100 FCFA fixe · 2% · min: 50 FCFA · max: 5 000 FCFA/);
      expect(fraisText.length).toBeGreaterThan(0);
    });

    it('affiche "Aucun frais" si aucun frais n\'est défini', () => {
      const serviceWithoutFees = { ...mockService, frais: {} };
      render(
        <ServiceDetailsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          service={serviceWithoutFees}
        />
      );
      expect(screen.getAllByText('Aucun frais').length).toBeGreaterThan(0);
    });

    it("affiche seulement le montant fixe si c'est le seul frais", () => {
      const serviceWithFixedFee = { ...mockService, frais: { montantFixe: 250 } };
      render(
        <ServiceDetailsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          service={serviceWithFixedFee}
        />
      );
      expect(screen.getAllByText('250 FCFA fixe').length).toBeGreaterThan(0);
    });

    it("affiche seulement le pourcentage si c'est le seul frais", () => {
      const serviceWithPercentage = { ...mockService, frais: { pourcentage: 1.5 } };
      render(
        <ServiceDetailsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          service={serviceWithPercentage}
        />
      );
      expect(screen.getAllByText('1.5%').length).toBeGreaterThan(0);
    });
  });

  describe('Formatage de la tranche de montants', () => {
    it('affiche la tranche complète avec min et max', () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.getAllByText('50 – 5 000 FCFA').length).toBeGreaterThan(0);
    });

    it('affiche seulement le minimum si max est absent', () => {
      const serviceWithMinOnly = { ...mockService, frais: { minimum: 100 } };
      render(
        <ServiceDetailsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          service={serviceWithMinOnly}
        />
      );
      expect(screen.getAllByText('≥ 100 FCFA').length).toBeGreaterThan(0);
    });

    it('affiche seulement le maximum si min est absent', () => {
      const serviceWithMaxOnly = { ...mockService, frais: { maximum: 10000 } };
      render(
        <ServiceDetailsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          service={serviceWithMaxOnly}
        />
      );
      expect(screen.getAllByText('≤ 10 000 FCFA').length).toBeGreaterThan(0);
    });

    it('affiche "—" si aucun montant n\'est défini', () => {
      const serviceWithoutAmounts = { ...mockService, frais: {} };
      render(
        <ServiceDetailsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          service={serviceWithoutAmounts}
        />
      );
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });

  describe('Affichage des listes', () => {
    it("affiche les conditions d'accès", () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.getByText("Carte d'identité")).toBeInTheDocument();
      expect(screen.getByText('Numéro de téléphone')).toBeInTheDocument();
    });

    it('affiche les plafonds', () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.getByText('10 000 FCFA/jour')).toBeInTheDocument();
      expect(screen.getByText('50 000 FCFA/mois')).toBeInTheDocument();
    });

    it("affiche l'infrastructure d'accès", () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      expect(screen.getByText('USSD')).toBeInTheDocument();
      expect(screen.getByText('Application mobile')).toBeInTheDocument();
      expect(screen.getByText('Agence')).toBeInTheDocument();
    });

    it('affiche "—" si la liste est vide', () => {
      const serviceWithEmptyLists = {
        ...mockService,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };
      render(
        <ServiceDetailsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          service={serviceWithEmptyLists}
        />
      );
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });
  describe('Formatage des nombres', () => {
    it('formate les nombres avec des espaces (format français)', () => {
      render(
        <ServiceDetailsModal open={true} onOpenChange={mockOnOpenChange} service={mockService} />
      );
      // 5000 devrait être formaté comme "5 000"
      expect(screen.getAllByText(/5 000/).length).toBeGreaterThan(0);
    });
  });
});

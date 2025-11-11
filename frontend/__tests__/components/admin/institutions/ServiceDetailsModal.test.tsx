// __tests__/components/admin/institutions/ServiceDetailsModal.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Service } from '@/types/Service';
import { TypeService } from '@/types/Service';
import ServiceDetailsModal from '@/components/admin/institutions/ServiceDetailsModal';

// ---- Mocks ----

// Icônes lucide-react (ajout de TrendingUp pour éviter "Element type is invalid")
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
  Wallet: ({ className }: { className?: string }) => (
    <span data-testid='wallet-icon' className={className} />
  ),
  TrendingUp: ({ className }: { className?: string }) => (
    <span data-testid='trending-up-icon' className={className} />
  ),
}));

// Composants UI shadcn minimaux pour le rendu
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
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: { className?: string }) => (
    <hr data-testid='separator' className={className} />
  ),
}));

// ---- Tests ----

describe('ServiceDetailsModal', () => {
  const onOpenChange = jest.fn();

  const baseService: Service = {
    id: 'service-123',
    name: "Transfert d'argent",
    longName: "Service de transfert d'argent mobile",
    type: TypeService.TRANSFERT_ARGENT,
    montantMin: 50,
    montantMax: 5000,
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
    it('retourne null si service est null', () => {
      const { container } = render(
        <ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('retourne null si service est undefined', () => {
      const { container } = render(
        <ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={undefined} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('ne rend pas le dialog si open=false', () => {
      render(
        <ServiceDetailsModal open={false} onOpenChange={onOpenChange} service={baseService} />
      );
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('rend le dialog si open=true et service défini', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
  });

  describe('Infos de base', () => {
    it('affiche le nom du service', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getByText("Transfert d'argent")).toBeInTheDocument();
    });

    it('affiche le nom long si présent', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getByText("Service de transfert d'argent mobile")).toBeInTheDocument();
    });

    it("n'affiche pas la description si longName est vide", () => {
      const s = { ...baseService, longName: '' };
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={s} />);
      expect(screen.queryByTestId('dialog-description')).not.toBeInTheDocument();
    });

    it('affiche le type (enum string)', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getAllByText("transferts d'argent").length).toBeGreaterThan(0);
    });
  });

  describe('Frais', () => {
    it('affiche tous les frais si présents', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      const rows = screen.getAllByText(/100 FCFA fixe · 2% · min: 50 FCFA · max: 5 000 FCFA/);
      expect(rows.length).toBeGreaterThan(0);
    });

    it("affiche 'Aucun frais' si objet vide", () => {
      const s = { ...baseService, frais: {} };
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={s} />);
      expect(screen.getAllByText('Aucun frais').length).toBeGreaterThan(0);
    });

    it("affiche seulement le montant fixe si c'est le seul champ", () => {
      const s = { ...baseService, frais: { montantFixe: 250 } };
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={s} />);
      expect(screen.getAllByText('250 FCFA fixe').length).toBeGreaterThan(0);
    });

    it("affiche seulement le pourcentage si c'est le seul champ", () => {
      const s = { ...baseService, frais: { pourcentage: 1.5 } };
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={s} />);
      expect(screen.getAllByText('1.5%').length).toBeGreaterThan(0);
    });
  });

  describe('Montants autorisés (amountRange via montantMin/Max)', () => {
    it('affiche la tranche complète min–max', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getAllByText('50 – 5 000 FCFA').length).toBeGreaterThan(0);
    });

    it('affiche seulement ≥ min si max absent', () => {
      const s = { ...baseService, montantMin: 100, montantMax: undefined };
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={s} />);
      expect(screen.getAllByText('≥ 100 FCFA').length).toBeGreaterThan(0);
    });

    it('affiche seulement ≤ max si min absent', () => {
      const s = { ...baseService, montantMin: undefined, montantMax: 10000 };
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={s} />);
      expect(screen.getAllByText('≤ 10 000 FCFA').length).toBeGreaterThan(0);
    });

    it('affiche "Non spécifié" si aucun des deux', () => {
      const s = { ...baseService, montantMin: undefined, montantMax: undefined };
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={s} />);
      expect(screen.getAllByText('Non spécifié').length).toBeGreaterThan(0);
    });
  });

  describe('Listes (ChipList)', () => {
    it("affiche les conditions d'accès", () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getByText("Carte d'identité")).toBeInTheDocument();
      expect(screen.getByText('Numéro de téléphone')).toBeInTheDocument();
    });

    it('affiche les plafonds', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getByText('10 000 FCFA/jour')).toBeInTheDocument();
      expect(screen.getByText('50 000 FCFA/mois')).toBeInTheDocument();
    });

    it("affiche l'infrastructure d'accès", () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getByText('USSD')).toBeInTheDocument();
      expect(screen.getByText('Application mobile')).toBeInTheDocument();
      expect(screen.getByText('Agence')).toBeInTheDocument();
    });

    it('affiche "—" si chaque liste est vide', () => {
      const s = { ...baseService, conditionAccess: [], plafonds: [], infrastructureAccess: [] };
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={s} />);
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });

  describe('Formatage', () => {
    it('formate 5000 → "5 000"', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getAllByText(/5 000/).length).toBeGreaterThan(0);
    });

    it('affiche typeFrais si présent', () => {
      render(<ServiceDetailsModal open={true} onOpenChange={onOpenChange} service={baseService} />);
      expect(screen.getByText('pourcentage')).toBeInTheDocument();
    });
  });
});

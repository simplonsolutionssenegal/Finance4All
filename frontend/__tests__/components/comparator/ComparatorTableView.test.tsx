// ...existing code...
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ServiceDTO } from '@/types/Service';
import { TypeService } from '@/types/Service';
import * as FeeCalculator from '@/components/ui/FeeCalculator';
import * as FormatUtils from '@/lib/format-utils';
import { ComparatorTableView } from '@/components/comparator/ComparatorTableView';

// Mock les modules
jest.mock('@/components/ui/FeeCalculator');
jest.mock('@/lib/format-utils');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

const mockComputeFee = FeeCalculator.computeFee as jest.MockedFunction<
  typeof FeeCalculator.computeFee
>;
const mockFormatCurrency = FormatUtils.formatCurrency as jest.MockedFunction<
  typeof FormatUtils.formatCurrency
>;

const createMockService = (id: string, name: string, instName: string): ServiceDTO => ({
  id,
  name,
  longName: `${name} long`,
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
    id: `inst-${id}`,
    name: instName,
    logoUrl: `https://example.com/${id}.png`,
  },
});

describe('ComparatorTableView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatCurrency.mockImplementation(value => `${value} F CFA`);
    mockComputeFee.mockReturnValue({ value: 1000, label: '1% + min 50' });
  });

  describe('États de chargement et erreur', () => {
    it('affiche le message de chargement quand isLoading est true', () => {
      render(
        <ComparatorTableView
          comparedServices={[]}
          amount={50000}
          isLoading={true}
          isError={false}
        />
      );

      expect(screen.getByText('Chargement de la comparaison...')).toBeInTheDocument();
    });

    it("affiche le message d'erreur par défaut quand isError est true", () => {
      render(
        <ComparatorTableView
          comparedServices={[]}
          amount={50000}
          isLoading={false}
          isError={true}
        />
      );

      expect(screen.getByText('Impossible de charger la comparaison.')).toBeInTheDocument();
    });

    it("affiche un message d'erreur personnalisé quand fourni", () => {
      render(
        <ComparatorTableView
          comparedServices={[]}
          amount={50000}
          isLoading={false}
          isError={true}
          errorMessage='Erreur serveur'
        />
      );

      expect(screen.getByText('Erreur serveur')).toBeInTheDocument();
      expect(screen.queryByText('Impossible de charger la comparaison.')).not.toBeInTheDocument();
    });

    it('ne rend rien quand il y a moins de 2 services', () => {
      const { container } = render(
        <ComparatorTableView
          comparedServices={[createMockService('s1', 'Wave', 'Wave')]}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Rendu du tableau de comparaison', () => {
    it('affiche le tableau avec au moins 2 services', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange Money'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      expect(screen.getByText('Critères')).toBeInTheDocument();
      expect(screen.getByText('Wave')).toBeInTheDocument();
      expect(screen.getByText('Orange Money')).toBeInTheDocument();
    });

    it('affiche tous les critères de comparaison', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange Money'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      expect(screen.getByText('Frais de service')).toBeInTheDocument();
      expect(screen.getByText('Délai')).toBeInTheDocument();
      expect(screen.getByText('Limite de solde')).toBeInTheDocument();
      expect(screen.getByText('Cashback')).toBeInTheDocument();
      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    it('affiche "Instantané" pour le délai de tous les services', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange Money'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const delayElements = screen.getAllByText('Instantané');
      expect(delayElements.length).toBe(services.length);
    });

    it('affiche la note 4.7 / 5 pour tous les services', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange Money'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const ratingElements = screen.getAllByText('4.7 / 5');
      expect(ratingElements.length).toBe(services.length);
    });
  });

  describe('Calcul des frais', () => {
    it('appelle computeFee avec le service et le montant correct', () => {
      // besoin d'au moins 2 services pour que le composant rende
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      expect(mockComputeFee).toHaveBeenCalledWith(services[0], 50000);
      expect(mockComputeFee).toHaveBeenCalledTimes(services.length);
    });

    it('affiche les frais calculés quand le label n\'est pas "Non défini"', () => {
      mockComputeFee.mockReturnValue({ value: 1500, label: '1% + min 50' });

      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const feeValues = screen.getAllByText('1500 F CFA');
      expect(feeValues.length).toBeGreaterThanOrEqual(1);

      const feeLabels = screen.getAllByText('1% + min 50');
      expect(feeLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('affiche "—" quand le label est "Non défini"', () => {
      mockComputeFee.mockReturnValue({ value: 0, label: 'Non défini' });
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('affiche les frais même si amount est 0 quand fee.value > 0 (tolère plusieurs occurrences)', () => {
      mockComputeFee.mockReturnValue({ value: 500, label: 'Frais fixes' });
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={0}
          isLoading={false}
          isError={false}
        />
      );

      const valueEls = screen.getAllByText('500 F CFA');
      expect(valueEls.length).toBeGreaterThanOrEqual(1);
      const labelEls = screen.getAllByText('Frais fixes');
      expect(labelEls.length).toBeGreaterThanOrEqual(1);
    });

    it('formate les frais avec formatCurrency (utilise getAllByText si plusieurs éléments)', () => {
      mockComputeFee.mockReturnValue({ value: 2500.7, label: '1% + min 50' });
      mockFormatCurrency.mockReturnValue('2 501 F CFA');
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      expect(mockFormatCurrency).toHaveBeenCalledWith(2501); // Math.round(2500.7)
      const formattedEls = screen.getAllByText('2 501 F CFA');
      expect(formattedEls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Limite de solde (montantMax)', () => {
    it('affiche le montantMax formaté (robuste aux espaces insécables)', () => {
      // simulate locale formatting producing NBSP or narrow NBSP
      mockFormatCurrency.mockImplementation((v: number) => `${v.toLocaleString()} F CFA`);
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const matches = screen.getAllByText(content => {
        // normalize by removing spaces, NBSPs, narrow NBSPs and thousands separators
        const normalized = content.replace(/[\s\u00A0\u202F,.]/g, '');
        return normalized.includes('1000000');
      });
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('affiche "—" quand montantMax n\'est pas un nombre', () => {
      const service = createMockService('s1', 'Wave', 'Wave');
      service.montantMax = undefined as any;

      const services = [service, createMockService('s2', 'Orange', 'Orange')];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe('Logos et images', () => {
    it('affiche le logo du service avec le bon alt text', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const img = screen.getByAltText('Wave');
      expect(img).toHaveAttribute('src', expect.stringContaining('s1.png'));
    });

    it("affiche l'initial de l'institution quand il n'y a pas de logo", () => {
      const service = createMockService('s1', 'Wave', 'Wave');
      service.institution.logoUrl = null as any;

      const services = [service, createMockService('s2', 'Orange', 'Orange')];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      expect(screen.getByText('W')).toBeInTheDocument();
    });
  });

  describe('Plusieurs services', () => {
    it('affiche le tableau avec 3 services', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange Money'),
        createMockService('s3', 'Free', 'Free Bank'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      expect(screen.getByText('Wave')).toBeInTheDocument();
      expect(screen.getByText('Orange Money')).toBeInTheDocument();
      expect(screen.getByText('Free Bank')).toBeInTheDocument();

      expect(mockComputeFee).toHaveBeenCalledTimes(3); // Une fois par service
    });

    it('affiche les cashback comme "—" pour tous les services', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange Money'),
      ];

      render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const dashes = screen.getAllByText('—');
      // Au moins une pour cashback par service
      expect(dashes.length).toBeGreaterThanOrEqual(services.length);
    });
  });

  describe('Accessibilité', () => {
    it('le tableau est responsif et scrollable', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange Money'),
      ];

      const { container } = render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const overflowContainer = container.querySelector('.overflow-x-auto');
      expect(overflowContainer).toBeInTheDocument();
    });

    it('les icônes ont les bonnes classes Tailwind', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange'),
      ];

      const { container } = render(
        <ComparatorTableView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      const icons = container.querySelectorAll('.text-primary-400');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
// ...existing code...

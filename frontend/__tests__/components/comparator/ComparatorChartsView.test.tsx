import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ServiceDTO } from '@/types/Service';
import { TypeService } from '@/types/Service';
import * as FeeCalculator from '@/components/ui/FeeCalculator';
import { ComparatorChartsView } from '@/components/comparator/ComparatorChartsView';

// 🧊 Mock Recharts pour contrôler le rendu et appeler le formatter de Legend
jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div data-testid='responsive'>{children}</div>,
    BarChart: ({ children }: any) => <div data-testid='bar-chart'>{children}</div>,
    RadarChart: ({ children }: any) => <div data-testid='radar-chart'>{children}</div>,
    CartesianGrid: (props: any) => <div data-testid='cartesian-grid' />,
    XAxis: (props: any) => <div data-testid='x-axis' />,
    YAxis: (props: any) => <div data-testid='y-axis' />,
    PolarGrid: (props: any) => <div data-testid='polar-grid' />,
    PolarAngleAxis: (props: any) => <div data-testid='polar-angle-axis' />,
    PolarRadiusAxis: (props: any) => <div data-testid='polar-radius-axis' />,
    Tooltip: (props: any) => <div data-testid='tooltip' />,
    Legend: ({ formatter }: any) => (
      <div data-testid='legend'>{formatter ? formatter('Wave') : null}</div>
    ),
    Bar: ({ children }: any) => <div data-testid='bar'>{children}</div>,
    Radar: (props: any) => <div data-testid='radar' />,
    Cell: (props: any) => <div data-testid='cell' />,
  };
});

// 🧮 Mock FeeCalculator
jest.mock('@/components/ui/FeeCalculator');

const mockComputeFee = FeeCalculator.computeFee as jest.MockedFunction<
  typeof FeeCalculator.computeFee
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

describe('ComparatorChartsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockComputeFee.mockReturnValue({ value: 1000, label: '1% + min 50' });
  });

  describe('États simples (loading / erreur / pas assez de services)', () => {
    it('affiche le message de chargement quand isLoading est true', () => {
      render(
        <ComparatorChartsView
          comparedServices={[]}
          amount={50000}
          isLoading={true}
          isError={false}
        />
      );

      expect(screen.getByText('Chargement de la visualisation...')).toBeInTheDocument();
    });

    it('affiche le message d’erreur par défaut quand isError est true', () => {
      render(
        <ComparatorChartsView
          comparedServices={[]}
          amount={50000}
          isLoading={false}
          isError={true}
        />
      );

      expect(screen.getByText('Impossible de charger la comparaison.')).toBeInTheDocument();
    });

    it('affiche un message d’erreur personnalisé quand fourni', () => {
      render(
        <ComparatorChartsView
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
      const services = [createMockService('s1', 'Wave', 'Wave')];

      const { container } = render(
        <ComparatorChartsView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Rendu des graphiques', () => {
    const services = [
      createMockService('s1', 'Wave', 'Wave'),
      createMockService('s2', 'Orange', 'Orange Money'),
    ];

    it('affiche les 2 blocs de graphiques (barres + radar)', () => {
      render(
        <ComparatorChartsView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      // Titres des sections
      expect(screen.getByText('Comparaison des frais de transfert')).toBeInTheDocument();
      expect(screen.getByText('Comparaison multi-critères')).toBeInTheDocument();

      // Légendes / textes d’explication
      expect(screen.getByText('Frais (F CFA)')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Score sur 100 pour chaque critère : Coût, Rapidité, Couverture, Fiabilité, Innovation./
        )
      ).toBeInTheDocument();

      // Éléments mockés Recharts bien présents
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('cell').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('radar').length).toBeGreaterThan(0);
    });

    it('appelle computeFee pour chaque service (barres + radar)', () => {
      render(
        <ComparatorChartsView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      // useMemo pour feesChartData + useMemo pour radarData → 2 appels par service
      expect(mockComputeFee).toHaveBeenCalledTimes(services.length * 2);

      // Premier appel au moins avec le bon service et le bon montant
      expect(mockComputeFee).toHaveBeenCalledWith(services[0], 50000);
    });

    it('gère aussi le cas où tous les frais sont identiques (maxFee === minFee)', () => {
      // On force tous les frais au même montant → branche "maxFee === minFee"
      mockComputeFee.mockReturnValue({ value: 2000, label: 'Flat' });

      render(
        <ComparatorChartsView
          comparedServices={services}
          amount={10000}
          isLoading={false}
          isError={false}
        />
      );

      // On ne teste pas les valeurs exactes, juste que ça ne crash pas
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  describe('Légende radar et couleurs', () => {
    it('utilise la map radarLegendColorByName et les classes RADAR_TEXT_COLOR_CLASSES', () => {
      const services = [
        createMockService('s1', 'Wave', 'Wave'),
        createMockService('s2', 'Orange', 'Orange Money'),
      ];

      render(
        <ComparatorChartsView
          comparedServices={services}
          amount={50000}
          isLoading={false}
          isError={false}
        />
      );

      // Notre mock Legend appelle formatter('Wave') et le rend dans un span
      const legend = screen.getByTestId('legend');
      const coloredSpan = legend.querySelector('.text-sky-400');
      expect(coloredSpan).toBeInTheDocument();
      expect(coloredSpan).toHaveTextContent('Wave');
    });
  });
});

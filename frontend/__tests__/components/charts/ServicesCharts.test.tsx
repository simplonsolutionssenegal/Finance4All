import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';

import { ServicesChart } from '@/components/charts/ServicesCharts';
import type { FinancialService } from '@/types/FinancialServices';

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div data-testid='responsive-container' data-width={width} data-height={height}>
      {children}
    </div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid='bar-chart' data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, name }: any) => (
    <div data-testid='bar' data-key={dataKey} data-fill={fill} data-name={name} />
  ),
  XAxis: ({ dataKey }: any) => <div data-testid='x-axis' data-key={dataKey} />,
  YAxis: () => <div data-testid='y-axis' />,
  CartesianGrid: ({ strokeDasharray }: any) => (
    <div data-testid='cartesian-grid' data-stroke={strokeDasharray} />
  ),
  Tooltip: ({ formatter }: any) => <div data-testid='tooltip' data-formatter={!!formatter} />,
  PieChart: ({ children }: any) => <div data-testid='pie-chart'>{children}</div>,
  Pie: ({ children, data, dataKey, outerRadius }: any) => (
    <div
      data-testid='pie'
      data-data={JSON.stringify(data)}
      data-key={dataKey}
      data-radius={outerRadius}
    >
      {children}
    </div>
  ),
  Cell: ({ fill }: any) => <div data-testid='cell' data-fill={fill} />,
  LineChart: ({ children, data }: any) => (
    <div data-testid='line-chart' data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ yAxisId, type, dataKey, stroke, strokeWidth }: any) => (
    <div
      data-testid='line'
      data-yaxis={yAxisId}
      data-type={type}
      data-key={dataKey}
      data-stroke={stroke}
      data-width={strokeWidth}
    />
  ),
}));

const mockServices: FinancialService[] = [
  {
    id: '1',
    designation: 'Epargne Jeune',
    type: 'EPARGNE',
    name: 'Epargne Jeune',
    longName: 'Compte épargne jeune avec intérêts',
    frais: {},
    conditionAccess: ['Avoir entre 16 et 25 ans'],
    plafonds: ['Plafond: 1 000 000 FCFA'],
    infrastructureAccess: ['Agence', 'Application mobile'],
    institutionId: 'inst-1',
    institution: {
      id: 'inst-1',
      name: 'Société Générale',
      description: 'Banque internationale française',
      website: 'https://societegenerale.sn',
      geographicZones: ['Zone Géo A', 'Zone Géo B'],
      logoUrl: 'https://example.com/logo-sg.png',
      status: 'ACTIVE',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    maxAmount: 1000000,
    interestRate: 5.5,
    reimbursement: 'Mensuel',
    status: 'ACTIVE',
    geographicZones: ['Zone Géo A'],
    createdAt: '2024-01-01',
    description: 'Compte épargne pour les jeunes',
    minAmount: 10000,
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    designation: 'Crédit Immobilier Premium',
    type: 'CREDIT',
    name: 'Crédit Immobilier Premium',
    longName: 'Crédit immobilier premium avec taux préférentiel',
    frais: {},
    conditionAccess: ['Revenus stables', 'Apport personnel minimum'],
    plafonds: ['Plafond: 50 000 000 FCFA'],
    infrastructureAccess: ['Agence', 'Application mobile'],
    institutionId: 'inst-2',
    institution: {
      id: 'inst-2',
      name: 'Banque Atlantique',
      description: 'Banque régionale ouest-africaine',
      website: 'https://banqueatlantique.sn',
      geographicZones: ['Zone Géo A', 'Zone Géo B'],
      logoUrl: 'https://example.com/logo-ba.png',
      status: 'ACTIVE',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
    maxAmount: 50000000,
    interestRate: 7.2,
    reimbursement: 'Mensuel',
    status: 'ACTIVE',
    geographicZones: ['Zone Géo A', 'Zone Géo B'],
    createdAt: '2024-01-02',
    description: "Crédit pour l'achat immobilier",
    minAmount: 5000000,
    updatedAt: '2024-01-02',
  },
  {
    id: '3',
    designation: 'Assurance Vie',
    type: 'ASSURANCE',
    name: 'Assurance Vie',
    longName: 'Assurance vie complète avec garantie décès',
    frais: {},
    conditionAccess: ['Être majeur', 'Questionnaire médical'],
    plafonds: ['Plafond: 2 500 000 FCFA'],
    infrastructureAccess: ['Agence', 'Application mobile'],
    institutionId: 'inst-3',
    institution: {
      id: 'inst-3',
      name: 'NSIA',
      description: "Compagnie d'assurance ivoirienne",
      website: 'https://nsia.sn',
      geographicZones: ['Zone Géo A'],
      logoUrl: 'https://example.com/logo-nsia.png',
      status: 'ACTIVE',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03',
    },
    maxAmount: 2500000,
    interestRate: 4.8,
    reimbursement: 'Mensuel',
    status: 'ACTIVE',
    geographicZones: ['Zone Géo A'],
    createdAt: '2024-01-03',
    description: 'Assurance vie complète',
    minAmount: 500000,
    updatedAt: '2024-01-03',
  },
];

describe('ServicesChart', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic rendering', () => {
    it('should render chart container with title', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      expect(screen.getByText('Analyse des Services Financiers')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should apply correct CSS classes to container', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const container = screen.getByText('Analyse des Services Financiers').closest('div');
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-gray-200', 'p-6');
    });

    it('should render title as h3 heading', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const heading = screen.getByText('Analyse des Services Financiers');
      expect(heading.tagName).toBe('H3');
    });
  });

  describe('Empty state', () => {
    it('should show empty message when services array is empty', () => {
      render(<ServicesChart services={[]} chartType='bar' />);

      expect(screen.getByText('Aucun service à afficher')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('should show empty message when services is null', () => {
      render(<ServicesChart services={null as any} chartType='bar' />);

      expect(screen.getByText('Aucun service à afficher')).toBeInTheDocument();
    });

    it('should show empty message when services is undefined', () => {
      render(<ServicesChart services={undefined as any} chartType='bar' />);

      expect(screen.getByText('Aucun service à afficher')).toBeInTheDocument();
    });
  });

  describe('Bar chart rendering', () => {
    it('should render bar chart with correct data', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('bar')).toHaveLength(2); // count and avgAmount bars
    });

    it('should aggregate data by service type', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(3); // EPARGNE, CREDIT, ASSURANCE

      const epargneData = chartData.find((item: any) => item.type === 'EPARGNE');
      expect(epargneData).toBeDefined();
      expect(epargneData.count).toBe(1);
      expect(epargneData.totalAmount).toBe(1000000);
      expect(epargneData.avgAmount).toBe(1000000);
    });

    it('should render bar chart components', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should configure bars with correct colors', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const bars = screen.getAllByTestId('bar');
      const countBar = bars.find(bar => bar.getAttribute('data-key') === 'count');
      const avgAmountBar = bars.find(bar => bar.getAttribute('data-key') === 'avgAmount');

      expect(countBar).toHaveAttribute('data-fill', '#14b8a6');
      expect(avgAmountBar).toHaveAttribute('data-fill', '#f59e0b');
    });

    it('should skip services with missing maxAmount', () => {
      const servicesWithMissing = [mockServices[0], { ...mockServices[1], maxAmount: undefined }];

      render(<ServicesChart services={servicesWithMissing as any} chartType='bar' />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(1); // Only EPARGNE should be included
    });
  });

  describe('Pie chart rendering', () => {
    it('should render pie chart with correct data', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('should aggregate data by service type', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      const pie = screen.getByTestId('pie');
      const chartData = JSON.parse(pie.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(3);

      const epargneData = chartData.find((item: any) => item.name === 'EPARGNE');
      expect(epargneData).toBeDefined();
      expect(epargneData.value).toBe(1);
    });

    it('should render cells with correct colors', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(3);

      expect(cells[0]).toHaveAttribute('data-fill', '#14b8a6');
      expect(cells[1]).toHaveAttribute('data-fill', '#f59e0b');
      expect(cells[2]).toHaveAttribute('data-fill', '#ef4444');
    });

    it('should not render bar or line charts', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });
  });

  describe('Line chart rendering', () => {
    it('should render line chart with correct data', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('line')).toHaveLength(2); // taux and montant lines
    });

    it('should process line chart data correctly', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(3);

      expect(chartData[0].name).toBe('Epargne Je...');
      expect(chartData[0].taux).toBe(5.5);
      expect(chartData[0].montant).toBe(1); // 1000000 / 1000000

      expect(chartData[1].name).toBe('Crédit Imm...');
      expect(chartData[1].taux).toBe(7.2);
      expect(chartData[1].montant).toBe(50); // 50000000 / 1000000
    });

    it('should configure lines with correct properties', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      const lines = screen.getAllByTestId('line');
      const tauxLine = lines.find(line => line.getAttribute('data-key') === 'taux');
      const montantLine = lines.find(line => line.getAttribute('data-key') === 'montant');

      expect(tauxLine).toHaveAttribute('data-yaxis', 'left');
      expect(tauxLine).toHaveAttribute('data-stroke', '#14b8a6');
      expect(tauxLine).toHaveAttribute('data-width', '2');

      expect(montantLine).toHaveAttribute('data-yaxis', 'right');
      expect(montantLine).toHaveAttribute('data-stroke', '#f59e0b');
      expect(montantLine).toHaveAttribute('data-width', '2');
    });

    it('should filter out services with missing data', () => {
      const servicesWithMissing = [
        mockServices[0],
        { ...mockServices[1], interestRate: undefined },
        { ...mockServices[2], maxAmount: undefined },
      ];

      render(<ServicesChart services={servicesWithMissing as any} chartType='line' />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(1); // Only first service should be included
    });

    it('should truncate long designations', () => {
      const longNameService = [
        {
          ...mockServices[0],
          designation: 'This is a very long service name',
        },
      ];

      render(<ServicesChart services={longNameService} chartType='line' />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-data') || '[]');

      expect(chartData[0].name).toBe('This is a ...');
    });
  });

  describe('Chart type switching', () => {
    it('should switch between chart types correctly', () => {
      const { rerender } = render(<ServicesChart services={mockServices} chartType='bar' />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

      rerender(<ServicesChart services={mockServices} chartType='pie' />);
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

      rerender(<ServicesChart services={mockServices} chartType='line' />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Data aggregation', () => {
    it('should aggregate multiple services of same type', () => {
      const multipleServices = [
        mockServices[0],
        { ...mockServices[0], id: '4', maxAmount: 2000000 },
      ];

      render(<ServicesChart services={multipleServices} chartType='bar' />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      const epargneData = chartData.find((item: any) => item.type === 'EPARGNE');
      expect(epargneData.count).toBe(2);
      expect(epargneData.totalAmount).toBe(3000000);
      expect(epargneData.avgAmount).toBe(1500000);
    });
  });

  describe('Responsive container', () => {
    it('should configure responsive container correctly', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
      expect(container).toHaveAttribute('data-height', '300');
    });
  });

  describe('Error handling', () => {
    it('should handle services with invalid types gracefully', () => {
      const invalidServices = [{ ...mockServices[0], type: null } as any];

      expect(() => {
        render(<ServicesChart services={invalidServices} chartType='bar' />);
      }).not.toThrow();
    });

    it('should handle NaN values in amounts', () => {
      const nanService = [{ ...mockServices[0], maxAmount: NaN }];

      expect(() => {
        render(<ServicesChart services={nanService as any} chartType='bar' />);
      }).not.toThrow();
    });
  });
});

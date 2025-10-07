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
  Cell: ({ fill, key }: any) => <div data-testid='cell' data-fill={fill} data-key={key} />,
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
    type: 'Epargne',
    institution: 'Société Générale',
    maxAmount: 1000000,
    interestRate: 5.5,
    reimbursement: 'Mensuel',
    status: 'ACTIF',
    geographicZones: ['Zone Géo A'],
    createdAt: '2024-01-01',
    description: 'Compte épargne pour les jeunes',
    minAmount: 10000,
  },
  {
    id: '2',
    designation: 'Crédit Immobilier Premium',
    type: 'Crédit',
    institution: 'Banque Atlantique',
    maxAmount: 50000000,
    interestRate: 7.2,
    reimbursement: 'Mensuel',
    status: 'ACTIF',
    geographicZones: ['Zone Géo A', 'Zone Géo B'],
    createdAt: '2024-01-02',
    description: "Crédit pour l'achat immobilier",
    minAmount: 5000000,
  },
  {
    id: '3',
    designation: 'Assurance Vie',
    type: 'Assurance',
    institution: 'NSIA',
    maxAmount: 2500000,
    interestRate: 4.8,
    reimbursement: 'Mensuel',
    status: 'ACTIF',
    geographicZones: ['Zone Géo A'],
    createdAt: '2024-01-03',
    description: 'Assurance vie complète',
    minAmount: 500000,
  },
];

describe('ServicesChart', () => {
  describe('Basic rendering', () => {
    it('should render chart container', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      expect(screen.getByText('Analyse des Produits Financiers')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should apply correct CSS classes to container', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const container = screen.getByText('Analyse des Produits Financiers').closest('div');
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-gray-200', 'p-6');
    });
  });

  describe('Bar chart rendering', () => {
    it('should render bar chart for bar chartType', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('bar').length).toBeGreaterThan(0);
    });

    it('should not render pie or line charts for bar chartType', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('should process bar chart data correctly', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(3); // 3 different types

      // Check Epargne type data
      const epargneData = chartData.find((item: any) => item.type === 'Epargne');
      expect(epargneData).toBeDefined();
      expect(epargneData.count).toBe(1);
      expect(epargneData.totalAmount).toBe(1000000);
      expect(epargneData.avgAmount).toBe(1000000);

      // Check Crédit type data
      const creditData = chartData.find((item: any) => item.type === 'Crédit');
      expect(creditData).toBeDefined();
      expect(creditData.count).toBe(1);
      expect(creditData.totalAmount).toBe(50000000);
      expect(creditData.avgAmount).toBe(50000000);

      // Check Assurance type data
      const assuranceData = chartData.find((item: any) => item.type === 'Assurance');
      expect(assuranceData).toBeDefined();
      expect(assuranceData.count).toBe(1);
      expect(assuranceData.totalAmount).toBe(2500000);
      expect(assuranceData.avgAmount).toBe(2500000);
    });

    it('should render bar chart components correctly', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should configure bar chart bars correctly', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const bars = screen.getAllByTestId('bar');
      expect(bars).toHaveLength(2); // count and avgAmount bars

      const countBar = bars.find(bar => bar.getAttribute('data-key') === 'count');
      const avgAmountBar = bars.find(bar => bar.getAttribute('data-key') === 'avgAmount');

      expect(countBar).toBeDefined();
      expect(countBar?.getAttribute('data-fill')).toBe('#14b8a6');
      expect(countBar?.getAttribute('data-name')).toBe('Nombre de produits');

      expect(avgAmountBar).toBeDefined();
      expect(avgAmountBar?.getAttribute('data-fill')).toBe('#f59e0b');
      expect(avgAmountBar?.getAttribute('data-name')).toBe('Montant moyen');
    });
  });

  describe('Pie chart rendering', () => {
    it('should render pie chart for pie chartType', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie')).toBeInTheDocument();
      expect(screen.getAllByTestId('cell').length).toBeGreaterThan(0);
    });

    it('should not render bar or line charts for pie chartType', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('should process pie chart data correctly', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      const pie = screen.getByTestId('pie');
      const chartData = JSON.parse(pie.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(3); // 3 different types

      // Check Epargne type data
      const epargneData = chartData.find((item: any) => item.name === 'Epargne');
      expect(epargneData).toBeDefined();
      expect(epargneData.value).toBe(1);

      // Check Crédit type data
      const creditData = chartData.find((item: any) => item.name === 'Crédit');
      expect(creditData).toBeDefined();
      expect(creditData.value).toBe(1);

      // Check Assurance type data
      const assuranceData = chartData.find((item: any) => item.name === 'Assurance');
      expect(assuranceData).toBeDefined();
      expect(assuranceData.value).toBe(1);
    });

    it('should render pie chart cells with correct colors', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(3); // One for each type

      // Check color assignment
      expect(cells[0]).toHaveAttribute('data-fill', '#14b8a6'); // First color
      expect(cells[1]).toHaveAttribute('data-fill', '#f59e0b'); // Second color
      expect(cells[2]).toHaveAttribute('data-fill', '#ef4444'); // Third color
    });

    it('should configure pie chart correctly', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-key', 'value');
      expect(pie).toHaveAttribute('data-radius', '80');
    });
  });

  describe('Line chart rendering', () => {
    it('should render line chart for line chartType', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('line').length).toBeGreaterThan(0);
    });

    it('should not render bar or pie charts for line chartType', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });

    it('should process line chart data correctly', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(3); // 3 services

      // Check first service data
      expect(chartData[0].name).toBe('Epargne Je...'); // Truncated designation
      expect(chartData[0].taux).toBe(5.5);
      expect(chartData[0].montant).toBe(1); // 1000000 / 1000000

      // Check second service data
      expect(chartData[1].name).toBe('Crédit Imm...'); // Truncated designation
      expect(chartData[1].taux).toBe(7.2);
      expect(chartData[1].montant).toBe(50); // 50000000 / 1000000

      // Check third service data
      expect(chartData[2].name).toBe('Assurance ...'); // Truncated designation
      expect(chartData[2].taux).toBe(4.8);
      expect(chartData[2].montant).toBe(2.5); // 2500000 / 1000000
    });

    it('should render line chart components correctly', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getAllByTestId('y-axis')).toHaveLength(2); // Left and right Y axes
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should configure line chart lines correctly', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      const lines = screen.getAllByTestId('line');
      expect(lines).toHaveLength(2); // taux and montant lines

      const tauxLine = lines.find(line => line.getAttribute('data-key') === 'taux');
      const montantLine = lines.find(line => line.getAttribute('data-key') === 'montant');

      expect(tauxLine).toBeDefined();
      expect(tauxLine?.getAttribute('data-yaxis')).toBe('left');
      expect(tauxLine?.getAttribute('data-stroke')).toBe('#14b8a6');
      expect(tauxLine?.getAttribute('data-width')).toBe('2');

      expect(montantLine).toBeDefined();
      expect(montantLine?.getAttribute('data-yaxis')).toBe('right');
      expect(montantLine?.getAttribute('data-stroke')).toBe('#f59e0b');
      expect(montantLine?.getAttribute('data-width')).toBe('2');
    });
  });

  describe('Data aggregation', () => {
    it('should aggregate multiple services of same type in bar chart', () => {
      const multipleEpargneServices = [
        { ...mockServices[0], id: '4', designation: 'Epargne Senior' },
        { ...mockServices[0], id: '5', designation: 'Epargne Étudiant' },
      ];

      render(<ServicesChart services={multipleEpargneServices} chartType='bar' />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      const epargneData = chartData.find((item: any) => item.type === 'Epargne');
      expect(epargneData.count).toBe(2); // Original + 1 new (only 2 Epargne services)
      expect(epargneData.totalAmount).toBe(2000000); // 1000000 * 2
      expect(epargneData.avgAmount).toBe(1000000); // 2000000 / 2
    });

    it('should handle empty services array', () => {
      render(<ServicesChart services={[]} chartType='bar' />);

      // Should show empty state message instead of chart
      expect(screen.getByText('Aucun service à afficher')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('should handle services with same designation', () => {
      const duplicateServices = [
        mockServices[0],
        { ...mockServices[0], id: '4' }, // Same designation but different ID
      ];

      render(<ServicesChart services={duplicateServices} chartType='line' />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-data') || '[]');

      expect(chartData).toHaveLength(2);
      expect(chartData[0].name).toBe('Epargne Je...');
      expect(chartData[1].name).toBe('Epargne Je...');
    });
  });

  describe('Chart type switching', () => {
    it('should render different charts based on chartType prop', () => {
      const { rerender } = render(<ServicesChart services={mockServices} chartType='bar' />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

      rerender(<ServicesChart services={mockServices} chartType='pie' />);
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

      rerender(<ServicesChart services={mockServices} chartType='line' />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle invalid chartType gracefully', () => {
      // @ts-ignore - Testing invalid prop
      render(<ServicesChart services={mockServices} chartType='invalid' />);

      // Should not render any chart
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip formatting', () => {
    it('should configure bar chart tooltip formatter', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-formatter', 'true');
    });

    it('should configure line chart tooltip formatter', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-formatter', 'true');
    });

    it('should not have formatter for pie chart tooltip', () => {
      render(<ServicesChart services={mockServices} chartType='pie' />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-formatter', 'false');
    });
  });

  describe('Responsive container', () => {
    it('should configure responsive container dimensions', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
      expect(container).toHaveAttribute('data-height', '300');
    });

    it('should maintain responsive container across chart types', () => {
      const { rerender } = render(<ServicesChart services={mockServices} chartType='bar' />);

      let container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
      expect(container).toHaveAttribute('data-height', '300');

      rerender(<ServicesChart services={mockServices} chartType='pie' />);
      container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
      expect(container).toHaveAttribute('data-height', '300');

      rerender(<ServicesChart services={mockServices} chartType='line' />);
      container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
      expect(container).toHaveAttribute('data-height', '300');
    });
  });

  describe('Color handling', () => {
    it('should cycle through colors for pie chart cells', () => {
      const manyServices = Array.from({ length: 7 }, (_, i) => {
        const types: Array<'Epargne' | 'Crédit' | 'Assurance'> = ['Epargne', 'Crédit', 'Assurance'];
        return {
          ...mockServices[0],
          id: `service-${i}`,
          type: types[i % 3],
        };
      });

      render(<ServicesChart services={manyServices} chartType='pie' />);

      const cells = screen.getAllByTestId('cell');

      // Should cycle through the 5 defined colors
      expect(cells[0]).toHaveAttribute('data-fill', '#14b8a6'); // First color
      expect(cells[1]).toHaveAttribute('data-fill', '#f59e0b'); // Second color
      expect(cells[2]).toHaveAttribute('data-fill', '#ef4444'); // Third color (index 2 % 5 = 2)
    });
  });

  describe('Data transformation', () => {
    it('should truncate long service designations in line chart', () => {
      const longNameService = [
        {
          ...mockServices[0],
          designation: 'This is an extremely long service designation that should be truncated',
        },
      ];

      render(<ServicesChart services={longNameService} chartType='line' />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-data') || '[]');

      expect(chartData[0].name).toBe('This is an...'); // Should be truncated to 10 chars + "..."
    });

    it('should handle services with short designations', () => {
      const shortNameService = [
        {
          ...mockServices[0],
          designation: 'Short',
        },
      ];

      render(<ServicesChart services={shortNameService} chartType='line' />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-data') || '[]');

      expect(chartData[0].name).toBe('Short...');
    });

    it('should convert amounts to millions for line chart', () => {
      render(<ServicesChart services={mockServices} chartType='line' />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-data') || '[]');

      // 1000000 / 1000000 = 1
      expect(chartData[0].montant).toBe(1);

      // 50000000 / 1000000 = 50
      expect(chartData[1].montant).toBe(50);

      // 2500000 / 1000000 = 2.5
      expect(chartData[2].montant).toBe(2.5);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed service data gracefully', () => {
      const malformedServices = [
        {
          id: '1',
          designation: '',
          type: 'Epargne' as const,
          institution: '',
          maxAmount: NaN,
          interestRate: Infinity,
          reimbursement: '',
          status: 'ACTIF' as const,
          geographicZones: [],
          createdAt: '',
          description: '',
          minAmount: -1000,
        },
      ];

      expect(() => {
        render(<ServicesChart services={malformedServices} chartType='bar' />);
      }).not.toThrow();
    });

    it('should handle null or undefined services', () => {
      // Test null services
      const { container: nullContainer } = render(
        <ServicesChart services={null as any} chartType='bar' />
      );
      expect(nullContainer).toBeInTheDocument();

      // Clear previous render and test undefined services
      cleanup();

      const { container: undefinedContainer } = render(
        <ServicesChart services={undefined as any} chartType='bar' />
      );
      expect(undefinedContainer).toBeInTheDocument();

      // Should show empty state message
      expect(screen.getByText('Aucun service à afficher')).toBeInTheDocument();
    });

    it('should handle services with missing properties', () => {
      const incompleteServices = [
        {
          id: '1',
          designation: 'Test',
          type: 'Epargne',
          // Missing other properties
        },
      ];

      expect(() => {
        render(<ServicesChart services={incompleteServices as any} chartType='bar' />);
      }).not.toThrow();
    });
  });

  describe('Performance considerations', () => {
    it('should handle large datasets efficiently', () => {
      const manyServices = Array.from({ length: 1000 }, (_, i) => {
        const types: Array<'Epargne' | 'Crédit' | 'Assurance'> = ['Epargne', 'Crédit', 'Assurance'];
        return {
          ...mockServices[0],
          id: `service-${i}`,
          designation: `Service ${i}`,
          type: types[i % 3],
        };
      });

      const { container } = render(<ServicesChart services={manyServices} chartType='bar' />);

      // Should render without performance issues
      expect(container).toBeInTheDocument();

      // Should aggregate correctly
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      // Should have 3 types with aggregated data
      expect(chartData).toHaveLength(3);
    });

    it('should not cause memory leaks with frequent re-renders', () => {
      const { rerender } = render(<ServicesChart services={mockServices} chartType='bar' />);

      // Re-render multiple times with different chart types
      for (let i = 0; i < 10; i++) {
        rerender(
          <ServicesChart
            services={mockServices}
            chartType={i % 3 === 0 ? 'bar' : i % 3 === 1 ? 'pie' : 'line'}
          />
        );
      }

      // Should still work correctly
      expect(screen.getByText('Analyse des Produits Financiers')).toBeInTheDocument();
    });
  });

  describe('Chart title and accessibility', () => {
    it('should render chart title', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      expect(screen.getByText('Analyse des Produits Financiers')).toBeInTheDocument();
    });

    it('should have proper heading level', () => {
      render(<ServicesChart services={mockServices} chartType='bar' />);

      const heading = screen.getByText('Analyse des Produits Financiers');
      expect(heading.tagName).toBe('H3');
    });

    it('should maintain chart title across different chart types', () => {
      const { rerender } = render(<ServicesChart services={mockServices} chartType='bar' />);
      expect(screen.getByText('Analyse des Produits Financiers')).toBeInTheDocument();

      rerender(<ServicesChart services={mockServices} chartType='pie' />);
      expect(screen.getByText('Analyse des Produits Financiers')).toBeInTheDocument();

      rerender(<ServicesChart services={mockServices} chartType='line' />);
      expect(screen.getByText('Analyse des Produits Financiers')).toBeInTheDocument();
    });
  });

  describe('Data calculation accuracy', () => {
    it('should calculate averages correctly in bar chart', () => {
      const servicesWithSameType = [
        { ...mockServices[0], maxAmount: 1000000 },
        { ...mockServices[0], id: '4', designation: 'Another Epargne', maxAmount: 2000000 },
      ];

      render(<ServicesChart services={servicesWithSameType} chartType='bar' />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      const epargneData = chartData.find((item: any) => item.type === 'Epargne');
      expect(epargneData.totalAmount).toBe(3000000); // 1000000 + 2000000
      expect(epargneData.avgAmount).toBe(1500000); // 3000000 / 2
      expect(epargneData.count).toBe(2);
    });

    it('should handle zero amounts correctly', () => {
      const zeroAmountService = [
        {
          ...mockServices[0],
          maxAmount: 0,
        },
      ];

      render(<ServicesChart services={zeroAmountService} chartType='bar' />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      const epargneData = chartData.find((item: any) => item.type === 'Epargne');
      expect(epargneData.totalAmount).toBe(0);
      expect(epargneData.avgAmount).toBe(0);
      expect(epargneData.count).toBe(1);
    });

    it('should handle negative amounts correctly', () => {
      const negativeAmountService = [
        {
          ...mockServices[0],
          maxAmount: -1000000,
        },
      ];

      render(<ServicesChart services={negativeAmountService} chartType='bar' />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');

      const epargneData = chartData.find((item: any) => item.type === 'Epargne');
      expect(epargneData.totalAmount).toBe(-1000000);
      expect(epargneData.avgAmount).toBe(-1000000);
      expect(epargneData.count).toBe(1);
    });
  });
});

import { render, screen } from '@testing-library/react';

import {
  StatCard,
  DonutChart,
  MonthlyProgressLineChart,
} from '@/components/beneficiaire/ChartComponents';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
  PieChart: ({ children }: any) => <div data-testid='pie-chart'>{children}</div>,
  Pie: ({ data, dataKey, nameKey, children }: any) => (
    <div data-testid='pie'>
      <div data-testid='pie-data'>{JSON.stringify(data)}</div>
      <div data-testid='pie-dataKey'>{dataKey}</div>
      {/* nameKey n'est pas passé par ton composant, donc optionnel */}
      {nameKey !== undefined && <div data-testid='pie-nameKey'>{nameKey}</div>}
      {children}
    </div>
  ),

  Cell: ({ fill }: any) => <div data-testid='cell' data-fill={fill} />,
  AreaChart: ({ data, children }: any) => (
    <div data-testid='area-chart'>
      <div data-testid='area-chart-data'>{JSON.stringify(data)}</div>
      {children}
    </div>
  ),
  Area: ({ type, dataKey, stroke, fill }: any) => (
    <div data-testid='area'>
      <div data-testid='area-type'>{type}</div>
      <div data-testid='area-dataKey'>{dataKey}</div>
      <div data-testid='area-stroke'>{stroke}</div>
      <div data-testid='area-fill'>{fill}</div>
    </div>
  ),
  CartesianGrid: ({ strokeDasharray }: any) => (
    <div data-testid='cartesian-grid' data-dasharray={strokeDasharray} />
  ),
  XAxis: ({ dataKey }: any) => <div data-testid='x-axis' data-key={dataKey} />,
  YAxis: () => <div data-testid='y-axis' />,
  Tooltip: ({ content }: any) => <div data-testid='tooltip'>{content && 'CustomTooltip'}</div>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  // utilisés par ChartComponents.tsx
  BarChart3: () => <div data-testid='icon-bar-chart3'>BarChart3</div>,
  Target: () => <div data-testid='icon-target'>Target</div>,

  // utilisés par tes tests StatCard (si tu ajoutes les icônes de tendance ou si tu les gardes)
  TrendingUp: () => <div data-testid='icon-trending-up'>TrendingUp</div>,
  TrendingDown: () => <div data-testid='icon-trending-down'>TrendingDown</div>,
  Minus: () => <div data-testid='icon-minus'>Minus</div>,
}));

describe('StatCard', () => {
  const defaultProps = {
    icon: <div data-testid='custom-icon'>Icon</div>,
    value: '100',
    label: 'Test Metric',
  };

  describe('Basic rendering', () => {
    it('should render with required props', () => {
      render(<StatCard {...defaultProps} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<StatCard {...defaultProps} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render value', () => {
      render(<StatCard {...defaultProps} value='42' />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render label', () => {
      render(<StatCard {...defaultProps} label='Custom Label' />);

      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });
  });

  describe('Trend indicator', () => {
    it('should render positive trend', () => {
      render(<StatCard {...defaultProps} trend='+12%' trendUp={true} />);

      expect(screen.getByText('+12%')).toBeInTheDocument();
      // Le composant n'affiche pas d'icône de tendance, seulement le texte avec couleur
    });

    it('should render negative trend', () => {
      render(<StatCard {...defaultProps} trend='-5%' trendUp={false} />);

      expect(screen.getByText('-5%')).toBeInTheDocument();
      // Le composant n'affiche pas d'icône de tendance, seulement le texte avec couleur
    });

    it('should not render trend when not provided', () => {
      render(<StatCard {...defaultProps} />);

      expect(screen.queryByText(/\+\d+%/)).not.toBeInTheDocument();
      expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
    });
  });

  describe('Progress bar', () => {
    it('should render progress bar when progress is provided', () => {
      const { container } = render(<StatCard {...defaultProps} progress={75} />);

      const progressContainer = container.querySelector('.bg-gray-200');
      expect(progressContainer).toBeInTheDocument();

      // La barre de progression a une classe bg-emerald-500 par défaut
      const progressFill = container.querySelector('.bg-emerald-500');
      expect(progressFill).toBeInTheDocument();
      expect(progressFill).toHaveAttribute('style', 'width: 75%;');
    });

    it('should render progress at 0%', () => {
      const { container } = render(<StatCard {...defaultProps} progress={0} />);

      const progressContainer = container.querySelector('.bg-gray-200');
      expect(progressContainer).toBeInTheDocument();

      const progressFill = container.querySelector('.bg-emerald-500');
      expect(progressFill).toBeInTheDocument();
      expect(progressFill).toHaveAttribute('style', 'width: 0%;');
    });

    it('should render progress at 100%', () => {
      const { container } = render(<StatCard {...defaultProps} progress={100} />);

      const progressContainer = container.querySelector('.bg-gray-200');
      expect(progressContainer).toBeInTheDocument();

      const progressFill = container.querySelector('.bg-emerald-500');
      expect(progressFill).toBeInTheDocument();
      expect(progressFill).toHaveAttribute('style', 'width: 100%;');
    });

    it('should not render progress bar when not provided', () => {
      const { container } = render(<StatCard {...defaultProps} />);

      const progressBar = container.querySelector('.bg-gray-200');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should not render progress bar when showProgress is false', () => {
      const { container } = render(
        <StatCard {...defaultProps} progress={50} showProgress={false} />
      );

      const progressBar = container.querySelector('.bg-gray-200');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should set correct progress width', () => {
      const { container } = render(<StatCard {...defaultProps} progress={50} />);

      const progressFill = container.querySelector('.bg-emerald-500');
      expect(progressFill).toHaveAttribute('style', 'width: 50%;');
    });

    it('should clamp progress above 100%', () => {
      const { container } = render(<StatCard {...defaultProps} progress={150} />);

      const progressFill = container.querySelector('.bg-emerald-500');
      expect(progressFill).toHaveAttribute('style', 'width: 100%;');
    });

    it('should clamp negative progress to 0%', () => {
      const { container } = render(<StatCard {...defaultProps} progress={-10} />);

      const progressFill = container.querySelector('.bg-emerald-500');
      expect(progressFill).toHaveAttribute('style', 'width: 0%;');
    });
  });

  describe('Styling', () => {
    it('should apply card styling', () => {
      const { container } = render(<StatCard {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-2xl', 'shadow-sm');
    });

    it('should apply custom iconBgColor', () => {
      const { container } = render(<StatCard {...defaultProps} iconBgColor='bg-red-100' />);

      const iconContainer = container.querySelector('.bg-red-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply custom iconColor', () => {
      const { container } = render(<StatCard {...defaultProps} iconColor='text-red-600' />);

      const iconContainer = container.querySelector('.text-red-600');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should style value text', () => {
      render(<StatCard {...defaultProps} />);

      const value = screen.getByText('100');
      expect(value).toHaveClass('text-3xl', 'font-bold');
    });

    it('should style label text', () => {
      render(<StatCard {...defaultProps} />);

      const label = screen.getByText('Test Metric');
      expect(label).toHaveClass('text-sm', 'text-gray-600');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long values', () => {
      render(<StatCard {...defaultProps} value='9999999999' />);

      expect(screen.getByText('9999999999')).toBeInTheDocument();
    });

    it('should handle very long labels', () => {
      const longLabel = 'A'.repeat(100);
      render(<StatCard {...defaultProps} label={longLabel} />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle special characters in value', () => {
      render(<StatCard {...defaultProps} value='$1,234.56' />);

      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    });

    it('should handle decimal progress values', () => {
      const { container } = render(<StatCard {...defaultProps} progress={33.33} />);

      const progressFill = container.querySelector('.bg-emerald-500');
      expect(progressFill).toHaveAttribute('style', 'width: 33.33%;');
    });
  });
});

describe('DonutChart', () => {
  const mockData = [
    { name: 'Category A', value: 400, color: '#0ea5e9' },
    { name: 'Category B', value: 300, color: '#22c55e' },
    { name: 'Category C', value: 200, color: '#f59e0b' },
  ];

  describe('Basic rendering', () => {
    it('should render with data', () => {
      render(<DonutChart data={mockData} title='Test Chart' />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<DonutChart data={mockData} title='Distribution Chart' />);

      expect(screen.getByText('Distribution Chart')).toBeInTheDocument();
    });

    it('should render subtitle when provided', () => {
      render(<DonutChart data={mockData} title='Test' subtitle='Test Subtitle' />);

      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should render responsive container', () => {
      render(<DonutChart data={mockData} title='Test' />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render pie components', () => {
      render(<DonutChart data={mockData} title='Test' />);

      const pies = screen.getAllByTestId('pie');
      expect(pies).toHaveLength(2); // Track + Segments
    });

    it('should render default icon when not provided', () => {
      render(<DonutChart data={mockData} title='Test' />);

      expect(screen.getByTestId('icon-target')).toBeInTheDocument();
    });

    it('should render custom icon when provided', () => {
      render(
        <DonutChart
          data={mockData}
          title='Test'
          icon={<div data-testid='custom-icon'>Custom</div>}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-target')).not.toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('should pass data to the segments Pie', () => {
      render(<DonutChart data={mockData} title='Test' />);

      const allPieDataEls = screen.getAllByTestId('pie-data');
      const all = allPieDataEls.map(el => JSON.parse(el.textContent || '[]'));

      // Le deuxième Pie contient les segments (le premier est le track gris)
      const segments = all.find(arr => Array.isArray(arr) && arr.length === mockData.length) || [];

      expect(segments).toHaveLength(3);
      expect(segments[0]).toHaveProperty('name', 'Category A');
      expect(segments[0]).toHaveProperty('value', 400);
      expect(segments[1]).toHaveProperty('name', 'Category B');
      expect(segments[1]).toHaveProperty('value', 300);
      expect(segments[2]).toHaveProperty('name', 'Category C');
      expect(segments[2]).toHaveProperty('value', 200);
    });

    it('should use correct dataKey', () => {
      render(<DonutChart data={mockData} title='Test' />);

      const dataKeys = screen.getAllByTestId('pie-dataKey');
      // Les deux Pie utilisent "value" comme dataKey
      expect(dataKeys[0]).toHaveTextContent('value');
    });

    it('should render cells for each data item', () => {
      render(<DonutChart data={mockData} title='Test' />);

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(mockData.length);
    });

    it('should apply colors to cells', () => {
      render(<DonutChart data={mockData} title='Test' />);

      const cells = screen.getAllByTestId('cell');
      expect(cells[0]).toHaveAttribute('data-fill', '#0ea5e9');
      expect(cells[1]).toHaveAttribute('data-fill', '#22c55e');
      expect(cells[2]).toHaveAttribute('data-fill', '#f59e0b');
    });
  });

  describe('Legend rendering', () => {
    it('should render custom legend', () => {
      render(<DonutChart data={mockData} title='Test' />);

      mockData.forEach(item => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
      });
    });

    it('should render legend with values', () => {
      render(<DonutChart data={mockData} title='Test' />);

      expect(screen.getByText('400')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should render legend with color indicators', () => {
      const { container } = render(<DonutChart data={mockData} title='Test' />);

      const colorIndicators = container.querySelectorAll('[style*="background"]');
      expect(colorIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Empty states', () => {
    it('should handle empty data array', () => {
      render(<DonutChart data={[]} title='Empty Chart' />);

      expect(screen.getByText('Empty Chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const singleData = [{ name: 'Single', value: 100, color: '#000000' }];
      render(<DonutChart data={singleData} title='Single' />);

      // Le titre et la légende contiennent tous les deux "Single"
      const singleTexts = screen.getAllByText('Single');
      expect(singleTexts.length).toBeGreaterThanOrEqual(2); // Au moins le titre et la légende
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply default styling', () => {
      const { container } = render(<DonutChart data={mockData} title='Test' />);

      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-2xl', 'shadow-sm');
    });
  });
});

describe('MonthlyProgressLineChart', () => {
  const mockData = [
    { month: 'Jan', value: 20 },
    { month: 'Feb', value: 35 },
    { month: 'Mar', value: 50 },
    { month: 'Apr', value: 65 },
    { month: 'May', value: 80 },
  ];

  describe('Basic rendering', () => {
    it('should render with data', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Progress' />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Monthly Trend' />);

      expect(screen.getByText('Monthly Trend')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<MonthlyProgressLineChart data={mockData} subtitle='Custom Subtitle' />);

      expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
    });

    it('should render default icon', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('icon-bar-chart3')).toBeInTheDocument();
    });

    it('should render custom icon when provided', () => {
      render(
        <MonthlyProgressLineChart
          data={mockData}
          title='Test'
          icon={<div data-testid='custom-icon'>Custom</div>}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-bar-chart3')).not.toBeInTheDocument();
    });

    it('should render responsive container', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render area chart', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('should pass data to AreaChart', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      const chartData = screen.getByTestId('area-chart-data');
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data).toHaveLength(5);
      expect(data[0]).toHaveProperty('month', 'Jan');
      expect(data[0]).toHaveProperty('value', 20);
    });

    it('should render all data points', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      const chartData = screen.getByTestId('area-chart-data');
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data).toEqual(mockData);
    });
  });

  describe('Chart components', () => {
    it('should render cartesian grid', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should render x-axis', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toBeInTheDocument();
      expect(xAxis).toHaveAttribute('data-key', 'month');
    });

    it('should render y-axis', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should render tooltip', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render area', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('area')).toBeInTheDocument();
    });
  });

  describe('Area configuration', () => {
    it('should use monotone curve type', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('area-type')).toHaveTextContent('monotone');
    });

    it('should use value as dataKey', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('area-dataKey')).toHaveTextContent('value');
    });

    it('should set stroke color', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      const stroke = screen.getByTestId('area-stroke');
      expect(stroke.textContent).toMatch(/#[0-9a-fA-F]{6}/);
    });

    it('should set fill with gradient', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      expect(screen.getByTestId('area-fill')).toBeInTheDocument();
    });
  });

  describe('Empty states', () => {
    it('should handle empty data array', () => {
      render(<MonthlyProgressLineChart data={[]} title='Empty' />);

      expect(screen.getByText('Empty')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const singleData = [{ month: 'Jan', value: 50 }];
      render(<MonthlyProgressLineChart data={singleData} title='Single' />);

      const chartData = screen.getByTestId('area-chart-data');
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data).toHaveLength(1);
    });
  });

  describe('Grid configuration', () => {
    it('should set grid stroke dash array', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      const grid = screen.getByTestId('cartesian-grid');
      expect(grid).toHaveAttribute('data-dasharray');
    });
  });

  describe('Tooltip customization', () => {
    it('should render custom tooltip', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveTextContent('CustomTooltip');
    });
  });

  describe('Edge cases', () => {
    it('should handle very large values', () => {
      const largeData = [{ month: 'Jan', value: 999999 }];
      render(<MonthlyProgressLineChart data={largeData} title='Large' />);

      const chartData = screen.getByTestId('area-chart-data');
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data[0].value).toBe(999999);
    });

    it('should handle negative values', () => {
      const negativeData = [{ month: 'Jan', value: -10 }];
      render(<MonthlyProgressLineChart data={negativeData} title='Negative' />);

      const chartData = screen.getByTestId('area-chart-data');
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data[0].value).toBe(-10);
    });

    it('should handle many data points', () => {
      const manyPoints = Array.from({ length: 100 }, (_, i) => ({
        month: `M${i}`,
        value: i,
      }));

      render(<MonthlyProgressLineChart data={manyPoints} title='Many' />);

      const chartData = screen.getByTestId('area-chart-data');
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data).toHaveLength(100);
    });

    it('should handle special characters in month names', () => {
      const specialData = [{ month: "Jan'24", value: 50 }];
      render(<MonthlyProgressLineChart data={specialData} title='Special' />);

      const chartData = screen.getByTestId('area-chart-data');
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data[0].month).toBe("Jan'24");
    });
  });

  describe('Styling', () => {
    it('should apply container styling', () => {
      const { container } = render(<MonthlyProgressLineChart data={mockData} title='Test' />);

      const chartContainer = container.firstChild;
      expect(chartContainer).toHaveClass('bg-white', 'rounded-2xl');
    });

    it('should style title', () => {
      render(<MonthlyProgressLineChart data={mockData} title='Styled Title' />);

      const title = screen.getByText('Styled Title');
      expect(title).toHaveClass('font-semibold');
    });
  });
});

describe('Chart Components Integration', () => {
  it('should render all components together', () => {
    const mockDonutData = [{ name: 'A', value: 100, color: '#000' }];
    const mockLineData = [{ month: 'Jan', value: 50 }];

    const { container } = render(
      <div>
        <StatCard icon={<div>Icon</div>} value='100' label='Test' />
        <DonutChart data={mockDonutData} title='Donut' />
        <MonthlyProgressLineChart data={mockLineData} title='Line' />
      </div>
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Donut')).toBeInTheDocument();
    expect(screen.getByText('Line')).toBeInTheDocument();
  });

  it('should maintain separate states', () => {
    const mockDonutData1 = [{ name: 'A', value: 100, color: '#000' }];
    const mockDonutData2 = [{ name: 'B', value: 200, color: '#fff' }];

    render(
      <div>
        <DonutChart data={mockDonutData1} title='Chart 1' />
        <DonutChart data={mockDonutData2} title='Chart 2' />
      </div>
    );

    expect(screen.getByText('Chart 1')).toBeInTheDocument();
    expect(screen.getByText('Chart 2')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

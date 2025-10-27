import { render, screen } from '@testing-library/react';
import InstitutionsStats from '@/components/admin/institutions/InstitutionsStats';
import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
import { InstitutionStatus } from '@/types/Institution';

// Mock du hook useGetInstitutions
jest.mock('@/hooks/institution/useGetInstitutions');

// Mock des icônes Lucide
jest.mock('lucide-react', () => ({
  CheckCircle2: (props: any) => <div data-testid='check-circle-icon' {...props} />,
  Ban: (props: any) => <div data-testid='ban-icon' {...props} />,
  Archive: (props: any) => <div data-testid='archive-icon' {...props} />,
  Settings: (props: any) => <div data-testid='settings-icon' {...props} />,
}));

const mockUseGetInstitutions = useGetInstitutions as jest.MockedFunction<typeof useGetInstitutions>;

describe('InstitutionsStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering with default/empty data', () => {
    it('renders without crashing when no data is provided', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('renders all 5 stat cards', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.bg-white');
      expect(cards.length).toBe(5);
    });

    it('displays all card titles correctly', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Actives')).toBeInTheDocument();
      expect(screen.getByText('Inactives')).toBeInTheDocument();
      expect(screen.getByText('Archivées')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('shows 0 for all stats when no institutions exist', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const values = screen.getAllByText('0');
      expect(values.length).toBe(5);
    });
  });

  describe('Data calculation and display', () => {
    it('calculates total from pagination when available', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.ACTIVE, services: [] },
        ],
        pagination: { total: 150, page: 1, limit: 10, totalPages: 15 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('calculates total from institutions length when pagination is not available', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.INACTIVE, services: [] },
          { id: '3', status: InstitutionStatus.PENDING, services: [] },
        ],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('counts active institutions correctly', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '3', status: InstitutionStatus.INACTIVE, services: [] },
        ],
        pagination: { total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('counts inactive institutions correctly', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.INACTIVE, services: [] },
          { id: '3', status: InstitutionStatus.INACTIVE, services: [] },
        ],
        pagination: { total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('counts pending institutions correctly', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.PENDING, services: [] },
          { id: '2', status: InstitutionStatus.ACTIVE, services: [] },
        ],
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const pendingTitle = screen.getByText('En attente');
      const pendingValue = pendingTitle.previousElementSibling as HTMLElement;
      expect(pendingValue).toHaveTextContent('1');
    });

    it('always shows 0 for archived institutions', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [{ id: '1', status: InstitutionStatus.ACTIVE, services: [] }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const archiveCard = screen.getByText('Archivées').closest('.bg-white');
      expect(archiveCard?.querySelector('.text-2xl')).toHaveTextContent('0');
    });
  });

  describe('Services calculation', () => {
    it('handles institutions without services property', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE },
          { id: '2', status: InstitutionStatus.ACTIVE },
        ],
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      expect(() => render(<InstitutionsStats />)).not.toThrow();
    });

    it('handles institutions with null services', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [{ id: '1', status: InstitutionStatus.ACTIVE, services: null }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      expect(() => render(<InstitutionsStats />)).not.toThrow();
    });

    it('handles institutions with empty services array', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [{ id: '1', status: InstitutionStatus.ACTIVE, services: [] }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      expect(() => render(<InstitutionsStats />)).not.toThrow();
    });
  });

  describe('Icons rendering', () => {
    it('renders CheckCircle2 icon for Total card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const checkIcons = screen.getAllByTestId('check-circle-icon');
      expect(checkIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders Ban icon for Inactives card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByTestId('ban-icon')).toBeInTheDocument();
    });

    it('renders Archive icon for Archivées card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    });

    it('renders Settings icon for En attente card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });
  });

  describe('Styling and layout', () => {
    it('uses responsive grid layout', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-5',
        'gap-5'
      );
    });

    it('applies correct badge color for Total card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const totalBadge = screen.getByText('Total').previousElementSibling
        ?.previousElementSibling as HTMLElement;
      expect(totalBadge).toHaveClass('bg-sky-100', 'text-sky-600');
    });

    it('applies correct badge color for Actives card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const activesBadge = screen.getByText('Actives').previousElementSibling
        ?.previousElementSibling as HTMLElement;
      expect(activesBadge).toHaveClass('bg-emerald-100', 'text-emerald-600');
    });

    it('applies correct badge color for Inactives card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const inactivesBadge = screen.getByText('Inactives').previousElementSibling
        ?.previousElementSibling as HTMLElement;
      expect(inactivesBadge).toHaveClass('bg-amber-100', 'text-amber-600');
    });

    it('applies correct badge color for Archivées card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const archivesBadge = screen.getByText('Archivées').previousElementSibling
        ?.previousElementSibling as HTMLElement;
      expect(archivesBadge).toHaveClass('bg-zinc-100', 'text-zinc-600');
    });

    it('applies correct badge color for En attente card', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const pendingBadge = screen.getByText('En attente').previousElementSibling
        ?.previousElementSibling as HTMLElement;
      expect(pendingBadge).toHaveClass('bg-fuchsia-100', 'text-fuchsia-600');
    });

    it('applies card styling with shadow', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.rounded-2xl.bg-white');
      expect(cards.length).toBe(5);
      for (const card of Array.from(cards)) {
        expect(card).toHaveClass('relative', 'overflow-hidden');
      }
    });

    it('applies icon container styling', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const iconContainers = container.querySelectorAll('.h-9.w-9.rounded-xl');
      expect(iconContainers.length).toBe(5);
    });

    it('applies value text styling', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const values = container.querySelectorAll(
        '.text-2xl.font-semibold.tracking-tight.text-slate-800'
      );
      expect(values.length).toBe(5);
    });

    it('applies title text styling', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const titles = container.querySelectorAll('.text-sm.text-slate-500');
      expect(titles.length).toBe(5);
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('handles mixed status institutions', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.INACTIVE, services: [] },
          { id: '3', status: InstitutionStatus.PENDING, services: [] },
          { id: '4', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '5', status: InstitutionStatus.PENDING, services: [] },
        ],
        pagination: { total: 5, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const totalValue = screen.getByText('Total').previousElementSibling as HTMLElement;
      expect(totalValue).toHaveTextContent('5');
      const activesValue = screen.getByText('Actives').previousElementSibling as HTMLElement;
      expect(activesValue).toHaveTextContent('2');
      const pendingValue = screen.getByText('En attente').previousElementSibling as HTMLElement;
      expect(pendingValue).toHaveTextContent('2');
      const inactivesValue = screen.getByText('Inactives').previousElementSibling as HTMLElement;
      expect(inactivesValue).toHaveTextContent('1');
    });

    it('handles large numbers correctly', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: new Array(100).fill(null).map((_, i) => ({
          id: `${i}`,
          status: InstitutionStatus.ACTIVE,
          services: [],
        })),
        pagination: { total: 9999, page: 1, limit: 100, totalPages: 100 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('handles when pagination total is 0', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const values = screen.getAllByText('0');
      expect(values.length).toBe(5);
    });

    it('renders correctly when hook returns null pagination', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [{ id: '1', status: InstitutionStatus.ACTIVE, services: [] }],
        pagination: null,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const totalValue = screen.getByText('Total').previousElementSibling as HTMLElement;
      expect(totalValue).toHaveTextContent('1');
    });
  });

  describe('Component structure', () => {
    it('renders cards in correct order', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const titles = screen.getAllByText(/Total|Actives|Inactives|Archivées|En attente/);
      expect(titles[0]).toHaveTextContent('Total');
      expect(titles[1]).toHaveTextContent('Actives');
      expect(titles[2]).toHaveTextContent('Inactives');
      expect(titles[3]).toHaveTextContent('Archivées');
      expect(titles[4]).toHaveTextContent('En attente');
    });

    it('each card has unique key', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.bg-white');
      const keys = Array.from(cards).map((card, index) => card.textContent);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(5);
    });
  });

  describe('Hook integration', () => {
    it('calls useGetInstitutions with correct parameters', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(mockUseGetInstitutions).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('calls useGetInstitutions hook only once', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(mockUseGetInstitutions).toHaveBeenCalledTimes(1);
    });
  });
});

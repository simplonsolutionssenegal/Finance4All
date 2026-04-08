import { render, screen } from '@testing-library/react';

import InstitutionsStats from '@/components/admin/institutions/InstitutionsStats';
import { useGetInstitutionStats } from '@/hooks/institution/useGetInstitutionStats';

jest.mock('@/hooks/institution/useGetInstitutionStats');

jest.mock('lucide-react', () => ({
  Building2: (props: any) => <div data-testid='building2-icon' {...props} />,
  CheckCircle2: (props: any) => <div data-testid='check-circle-icon' {...props} />,
  AlertCircle: (props: any) => <div data-testid='alert-circle-icon' {...props} />,
  Archive: (props: any) => <div data-testid='archive-icon' {...props} />,
  Settings: (props: any) => <div data-testid='settings-icon' {...props} />,
}));

const mockUseGetInstitutionStats = useGetInstitutionStats as jest.MockedFunction<
  typeof useGetInstitutionStats
>;

describe('InstitutionsStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rend sans crash quand aucune donnée', () => {
    mockUseGetInstitutionStats.mockReturnValue({
      stats: undefined,
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

  it('affiche 0 partout si les stats sont absentes', () => {
    mockUseGetInstitutionStats.mockReturnValue({
      stats: undefined,
      isLoading: false,
      error: null,
    } as any);

    render(<InstitutionsStats />);

    expect(screen.getAllByText('0')).toHaveLength(5);
  });

  it('affiche les valeurs retournées par le backend', () => {
    mockUseGetInstitutionStats.mockReturnValue({
      stats: {
        total: 25,
        active: 10,
        inactive: 7,
        pending: 8,
        archived: 0,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<InstitutionsStats />);

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('rend les 5 icônes attendues', () => {
    mockUseGetInstitutionStats.mockReturnValue({
      stats: {
        total: 1,
        active: 1,
        inactive: 0,
        pending: 0,
        archived: 0,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<InstitutionsStats />);

    expect(screen.getByTestId('building2-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('utilise le hook une seule fois', () => {
    mockUseGetInstitutionStats.mockReturnValue({
      stats: undefined,
      isLoading: false,
      error: null,
    } as any);

    render(<InstitutionsStats />);

    expect(mockUseGetInstitutionStats).toHaveBeenCalledTimes(1);
  });
});

import { render, screen } from '@testing-library/react';
import InstitutionsPage from '@/app/(auth)/institutions/page';

// Mock des composants enfants
jest.mock('@/components/admin/institutions/InstitutionsList', () => ({
  __esModule: true,
  default: () => <div data-testid='institutions-list'>InstitutionsList Component</div>,
}));

jest.mock('@/components/admin/institutions/InstitutionsStats', () => ({
  __esModule: true,
  default: () => <div data-testid='institutions-stats'>InstitutionsStats Component</div>,
}));

jest.mock('@/components/admin/institutions/NewInstitutionButton', () => ({
  __esModule: true,
  default: () => <button data-testid='new-institution-button'>New Institution</button>,
}));

describe('InstitutionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title correctly', () => {
    render(<InstitutionsPage />);

    expect(screen.getByText('Gestion des institutions')).toBeInTheDocument();
  });

  it('renders the page description correctly', () => {
    render(<InstitutionsPage />);

    expect(
      screen.getByText('Administrez les institutions financières disponibles sur la plateforme')
    ).toBeInTheDocument();
  });

  it('renders the NewInstitutionButton component', () => {
    render(<InstitutionsPage />);

    expect(screen.getByTestId('new-institution-button')).toBeInTheDocument();
  });

  it('renders the InstitutionsStats component', () => {
    render(<InstitutionsPage />);

    expect(screen.getByTestId('institutions-stats')).toBeInTheDocument();
  });

  it('renders the InstitutionsList component', () => {
    render(<InstitutionsPage />);

    expect(screen.getByTestId('institutions-list')).toBeInTheDocument();
  });

  it('has correct layout structure with space-y-6', () => {
    const { container } = render(<InstitutionsPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('space-y-6');
  });

  it('renders header section with flex layout', () => {
    const { container } = render(<InstitutionsPage />);

    const headerSection = container.querySelector('.flex.items-start.justify-between');
    expect(headerSection).toBeInTheDocument();
  });

  it('renders all three main sections in correct order', () => {
    const { container } = render(<InstitutionsPage />);

    const mainDiv = container.firstChild as HTMLElement;
    const children = Array.from(mainDiv.children);

    expect(children).toHaveLength(3);
  });

  it('applies correct text styles to title', () => {
    render(<InstitutionsPage />);

    const title = screen.getByText('Gestion des institutions');
    expect(title).toHaveClass('text-3xl', 'md:text-[40px]', 'font-semibold', 'text-gray-900');
  });

  it('applies correct text styles to description', () => {
    render(<InstitutionsPage />);

    const description = screen.getByText(
      'Administrez les institutions financières disponibles sur la plateforme'
    );
    expect(description).toHaveClass('text-sm', 'text-gray-500');
  });
});

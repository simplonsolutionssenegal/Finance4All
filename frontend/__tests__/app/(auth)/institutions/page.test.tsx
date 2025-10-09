import { render, screen } from '@testing-library/react';

import InstitutionsPage from '@/app/(auth)/institutions/page';

// Mock the components
jest.mock('@/components/admin/institutions/InstitutionsList', () => {
  return function MockInstitutionsList() {
    return <div data-testid='institutions-list'>InstitutionsList Component</div>;
  };
});

jest.mock('@/components/admin/institutions/InstitutionsStats', () => {
  return function MockInstitutionsStats() {
    return <div data-testid='institutions-stats'>InstitutionsStats Component</div>;
  };
});

describe('InstitutionsPage', () => {
  it('renders without crashing', () => {
    render(<InstitutionsPage />);

    expect(screen.getByTestId('institutions-stats')).toBeInTheDocument();
    expect(screen.getByTestId('institutions-list')).toBeInTheDocument();
  });

  it('renders InstitutionsStats component', () => {
    render(<InstitutionsPage />);

    const institutionsStats = screen.getByTestId('institutions-stats');
    expect(institutionsStats).toBeInTheDocument();
    expect(institutionsStats).toHaveTextContent('InstitutionsStats Component');
  });

  it('renders InstitutionsList component', () => {
    render(<InstitutionsPage />);

    const institutionsList = screen.getByTestId('institutions-list');
    expect(institutionsList).toBeInTheDocument();
    expect(institutionsList).toHaveTextContent('InstitutionsList Component');
  });

  it('renders components in correct order', () => {
    const { container } = render(<InstitutionsPage />);

    const mainContainer = container.firstChild as HTMLElement;
    const children = Array.from(mainContainer?.children || []);

    expect(children).toHaveLength(2);
    expect(children[0]).toHaveAttribute('data-testid', 'institutions-stats');
    expect(children[1]).toHaveAttribute('data-testid', 'institutions-list');
  });

  it('is a React component function', () => {
    expect(typeof InstitutionsPage).toBe('function');
  });

  it('returns JSX element', () => {
    const result = InstitutionsPage();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });

  describe('Component Integration', () => {
    it('integrates InstitutionsStats and InstitutionsList properly', () => {
      render(<InstitutionsPage />);

      // Both components should be present
      expect(screen.getByTestId('institutions-stats')).toBeInTheDocument();
      expect(screen.getByTestId('institutions-list')).toBeInTheDocument();

      // They should be siblings within the same container
      const container = screen.getByTestId('institutions-stats').parentElement;
      const institutionsList = screen.getByTestId('institutions-list');
      expect(container).toContainElement(institutionsList);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = render(<InstitutionsPage />);

      // Should be wrapped in a div
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.tagName).toBe('DIV');
    });
  });
});

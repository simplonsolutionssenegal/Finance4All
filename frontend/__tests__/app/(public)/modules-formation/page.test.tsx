import { render, screen } from '@testing-library/react';
import ModulesFormationPage from '@/app/(public)/modules-formation/page';

describe('ModulesFormationPage', () => {
  it('should render without crashing', () => {
    render(<ModulesFormationPage />);
    expect(screen.getByText('Modules Formation')).toBeInTheDocument();
  });

  it('should have a main heading', () => {
    render(<ModulesFormationPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Modules Formation');
  });
});

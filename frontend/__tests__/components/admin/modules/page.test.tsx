import { render, screen } from '@testing-library/react';

import ModulesPage from '@/app/(auth)/modules/page';

jest.mock('@/components/admin/modules/modules-page-content', () => ({
  __esModule: true,
  default: () => <div data-testid='modules-page-content'>Modules Content</div>,
}));

describe('Modules page', () => {
  it('renders modules page content', () => {
    render(<ModulesPage />);

    expect(screen.getByTestId('modules-page-content')).toBeInTheDocument();
  });
});

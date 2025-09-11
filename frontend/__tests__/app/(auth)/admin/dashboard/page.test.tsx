import { render, screen } from '@testing-library/react';

// Mock des composants UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

describe('Admin Dashboard Page', () => {
  test('should render dashboard', () => {
    const AdminDashboardPage = require('@/app/(auth)/admin/dashboard/page').default;
    
    render(<AdminDashboardPage />);
    
    expect(screen.getByText('Tableau de bord administrateur')).toBeInTheDocument();
    expect(screen.getAllByTestId('card').length).toBeGreaterThan(4); // At least 4 cards
  });
});

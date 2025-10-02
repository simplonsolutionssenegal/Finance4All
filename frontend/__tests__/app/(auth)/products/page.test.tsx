import { render, screen } from '@testing-library/react';

import ProductsPage from '@/app/(auth)/products/page';

// Mock du composant ProductsTable
jest.mock('@/components/products/ProductsTable', () => {
  return function MockProductsTable() {
    return <div data-testid='products-table'>Products Table Component</div>;
  };
});

describe('ProductsPage', () => {
  it('renders the products page', () => {
    render(<ProductsPage />);

    // Vérifie que le container principal est rendu avec les bonnes classes
    const mainContainer = screen.getByTestId('products-table').parentElement;
    expect(mainContainer).toHaveClass('space-y-6');
  });

  it('renders ProductsTable component', () => {
    render(<ProductsPage />);

    // Vérifie que le composant ProductsTable est présent
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<ProductsPage />);

    // Vérifie la structure du layout
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-full', 'bg-gray-50');

    // Vérifie que la div space-y-6 existe
    const spaceDiv = mainDiv.querySelector('.space-y-6');
    expect(spaceDiv).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<ProductsPage />);
    expect(container).toBeTruthy();
  });
});

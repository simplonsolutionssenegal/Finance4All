import { render, screen } from '@testing-library/react';

import ProductsPage from '@/app/(auth)/products/page';

jest.mock('@/components/products/ProductsHeader', () => () => (
  <div data-testid='products-header'>Header mock</div>
));
jest.mock('@/components/products/ProductsTable', () => () => (
  <div data-testid='products-table'>Table mock</div>
));

describe('ProductsPage', () => {
  it('renders ProductsHeader and ProductsTable', () => {
    render(<ProductsPage />);
    expect(screen.getByTestId('products-header')).toBeInTheDocument();
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });
});

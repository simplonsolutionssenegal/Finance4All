import { render, screen } from '@testing-library/react';

import ProductSimulatorPage from '@/app/product-simulator/page';

// Mock des composants
jest.mock('@/components/product-simulator/product-simulator', () => ({
  ProductSimulator: () => <div data-testid='product-simulator'>Product Simulator</div>,
}));

jest.mock('@/components/public/layout/footer', () => {
  return function MockPublicFooter() {
    return <div data-testid='public-footer'>Public Footer</div>;
  };
});

jest.mock('@/components/public/layout/header', () => {
  return function MockPublicHeader() {
    return <div data-testid='public-header'>Public Header</div>;
  };
});

describe('ProductSimulatorPage', () => {
  it('should render the product simulator page with all components', () => {
    render(<ProductSimulatorPage />);

    // Vérifier que tous les composants sont rendus
    expect(screen.getByTestId('public-header')).toBeInTheDocument();
    expect(screen.getByTestId('product-simulator')).toBeInTheDocument();
    expect(screen.getByTestId('public-footer')).toBeInTheDocument();
  });

  it('should have the correct CSS classes', () => {
    const { container } = render(<ProductSimulatorPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen', 'overflow-visible');
  });

  it('should render in the correct order', () => {
    render(<ProductSimulatorPage />);

    const header = screen.getByTestId('public-header');
    const simulator = screen.getByTestId('product-simulator');
    const footer = screen.getByTestId('public-footer');

    // Vérifier l'ordre des éléments
    expect(header.compareDocumentPosition(simulator)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(simulator.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});

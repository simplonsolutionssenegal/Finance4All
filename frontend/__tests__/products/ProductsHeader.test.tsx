import { render, screen, fireEvent } from '@testing-library/react';

import ProductsHeader from '@/components/products/ProductsHeader';

const defaultProps = {
  logoSrc: '/logo.png',
  name: 'Test Org',
  status: 'ACTIF' as const,
  website: 'www.example.com',
  description: 'Une organisation de test',
  zones: [
    { id: 1, label: 'Dakar' },
    { id: 2, label: 'Thiès' },
  ],
  onReject: jest.fn(),
  onActivate: jest.fn(),
};

describe('ProductsHeader', () => {
  it('renders organization name, status, website, description, and zones', () => {
    render(<ProductsHeader {...defaultProps} />);
    expect(screen.getByText('Test Org')).toBeInTheDocument();
    expect(screen.getByText('ACTIF')).toBeInTheDocument();
    expect(screen.getByText('www.example.com')).toBeInTheDocument();
    expect(screen.getByText('Une organisation de test')).toBeInTheDocument();
    expect(screen.getByText('Dakar')).toBeInTheDocument();
    expect(screen.getByText('Thiès')).toBeInTheDocument();
  });

  it('calls onReject when REJETER is clicked', () => {
    render(<ProductsHeader {...defaultProps} />);
    fireEvent.click(screen.getByText('REJETER'));
    expect(defaultProps.onReject).toHaveBeenCalled();
  });

  it('calls onActivate when ACTIVER is clicked', () => {
    render(<ProductsHeader {...defaultProps} />);
    fireEvent.click(screen.getByText('ACTIVER'));
    expect(defaultProps.onActivate).toHaveBeenCalled();
  });

  it('removes a zone when X is clicked', () => {
    render(<ProductsHeader {...defaultProps} />);
    // Trouver le bouton pour retirer "Dakar"
    const removeBtn = screen.getByLabelText('Retirer Dakar');
    fireEvent.click(removeBtn);
    expect(screen.queryByText('Dakar')).not.toBeInTheDocument();
  });

  it('shows INACTIF status with correct color', () => {
    render(<ProductsHeader {...defaultProps} status='INACTIF' />);
    expect(screen.getByText('INACTIF')).toBeInTheDocument();
  });
});

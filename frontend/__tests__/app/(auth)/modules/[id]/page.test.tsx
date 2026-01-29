/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// ✅ mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// ✅ mock ModuleDetailsComponent (child)
jest.mock('@/components/admin/modules/moduleDetailsComponent', () => ({
  __esModule: true,
  default: ({ moduleId }: any) => (
    <div data-testid='module-details' data-moduleid={moduleId}>
      ModuleDetailsComponent
    </div>
  ),
}));

import { useParams } from 'next/navigation';
import ModuleDetailsPage from '@/app/(auth)/modules/[id]/page';

describe('ModuleDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should read moduleId from params and render ModuleDetailsComponent with it', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'module-123' });

    render(<ModuleDetailsPage />);

    const child = screen.getByTestId('module-details');
    expect(child).toBeInTheDocument();
    expect(child).toHaveAttribute('data-moduleid', 'module-123');
  });

  it('should cast params.id to string (covers type cast path)', () => {
    // même si id n'est pas un string au départ, le code fait `as string`
    (useParams as jest.Mock).mockReturnValue({ id: 999 });

    render(<ModuleDetailsPage />);

    const child = screen.getByTestId('module-details');
    expect(child).toHaveAttribute('data-moduleid', '999');
  });
});

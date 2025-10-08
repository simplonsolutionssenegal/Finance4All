import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';

import InstitutionDetailsPage from '@/app/(auth)/institutions/[id]/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('@/components/admin/institutions/InstitutionDetailsComponent', () => {
  return function MockInstitutionDetailsComponent({ institutionId }: { institutionId: string }) {
    return <div data-testid='institution-details-component' data-id={institutionId} />;
  };
});

describe('InstitutionDetailsPage', () => {
  it('should extract institutionId from params and pass it to InstitutionDetailsComponent', () => {
    const mockId = 'test-institution-id';
    (useParams as jest.Mock).mockReturnValue({ id: mockId });

    render(<InstitutionDetailsPage />);

    const detailsComponent = screen.getByTestId('institution-details-component');
    expect(detailsComponent).toBeInTheDocument();
    expect(detailsComponent).toHaveAttribute('data-id', mockId);
  });
});

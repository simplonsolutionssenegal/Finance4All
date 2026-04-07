import { render, screen } from '@testing-library/react';

import EditServicePage from '@/app/(auth)/institutions/[id]/service/[serviceId]/update/page';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    id: 'institution-1',
    serviceId: 'service-1',
  })),
}));

jest.mock('@/components/admin/institutions/EditServiceComponent', () => ({
  __esModule: true,
  default: ({ institutionId, serviceId }: { institutionId: string; serviceId: string }) => (
    <div data-testid='edit-service-component'>
      {institutionId}:{serviceId}
    </div>
  ),
}));

describe('EditServicePage', () => {
  it('renders edit service component with params', () => {
    render(<EditServicePage />);

    expect(screen.getByTestId('edit-service-component')).toHaveTextContent(
      'institution-1:service-1'
    );
  });
});

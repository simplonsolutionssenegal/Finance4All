// __tests__/components/admin/institutions/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Mock } from 'jest-mock';
import NewServicePage from '@/app/(auth)/institutions/[id]/service/new/page';

jest.mock('next/navigation', () => ({ useParams: jest.fn() }));

const NewServiceComponentMock = jest.fn(({ institutionId }: { institutionId: string }) => (
  <div data-testid='new-service' data-institution-id={institutionId} />
));

jest.mock('@/components/admin/institutions/NewServiceComponent', () => ({
  __esModule: true,
  default: (props: { institutionId: string }) => NewServiceComponentMock(props),
}));

describe('NewServicePage', () => {
  const nextNavMock = jest.requireMock<{ useParams: Mock }>('next/navigation');
  const { useParams } = nextNavMock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passe bien institutionId à NewServiceComponent', () => {
    useParams.mockReturnValue({ id: 'inst-123' });

    render(<NewServicePage />);

    expect(NewServiceComponentMock).toHaveBeenCalledTimes(1);
    expect(NewServiceComponentMock).toHaveBeenCalledWith({ institutionId: 'inst-123' });

    const node = screen.getByTestId('new-service');
    expect(node).toHaveAttribute('data-institution-id', 'inst-123');
  });

  it('gère le cas sans id', () => {
    useParams.mockReturnValue({});
    render(<NewServicePage />);

    expect(NewServiceComponentMock).toHaveBeenCalledTimes(1);
    expect(NewServiceComponentMock).toHaveBeenCalledWith({ institutionId: undefined });

    const node = screen.getByTestId('new-service');
    expect(node).not.toHaveAttribute('data-institution-id');
  });
});

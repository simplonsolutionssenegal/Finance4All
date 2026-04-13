import { render, screen } from '@testing-library/react';

import RecipientDetailPage from '@/app/(auth)/recipients/[id]/page';
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: '123' })),
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

// Mock useBeneficiaries
jest.mock('@/hooks/beneficiary/useBeneficiaries', () => ({
  useBeneficiaries: jest.fn(),
}));

// Mock useBeneficiaryProgressByUserId
jest.mock('@/hooks/beneficiary/useBeneficiaryProgressByUserId', () => ({
  useBeneficiaryProgressByUserId: jest.fn(() => ({
    data: undefined,
    isLoading: false,
  })),
}));

// Mock BeneficiaryDetail
jest.mock('@/components/beneficiaire/BeneficiaryDetail', () => ({
  BeneficiaryDetail: (props: Record<string, unknown>) => (
    <div
      data-testid='beneficiary-detail'
      data-beneficiary-id={String((props.beneficiary as { id: string })?.id)}
    />
  ),
}));

const mockUseBeneficiaries = require('@/hooks/beneficiary/useBeneficiaries')
  .useBeneficiaries as jest.Mock;

const mockBeneficiary = {
  id: '123',
  firstName: 'Amadou',
  lastName: 'Diallo',
  email: 'amadou@example.com',
  phone: '+221770000000',
  status: BeneficiaryStatus.ACTIVE,
  progressPercent: 50,
  createdAt: '2024-06-01T00:00:00Z',
  clerkUserId: 'clerk-user-1',
};

describe('RecipientDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading text while loading', () => {
    mockUseBeneficiaries.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    render(<RecipientDetailPage />);

    expect(screen.getByText(/Chargement des informations du bénéficiaire/)).toBeInTheDocument();
  });

  it('shows error message on error', () => {
    mockUseBeneficiaries.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Network error'),
    });

    render(<RecipientDetailPage />);

    expect(screen.getByText(/Impossible de charger ce bénéficiaire/)).toBeInTheDocument();
  });

  it('shows "introuvable" when beneficiary not found', () => {
    mockUseBeneficiaries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<RecipientDetailPage />);

    expect(screen.getByText(/introuvable/i)).toBeInTheDocument();
  });

  it('renders BeneficiaryDetail with correct props when found', () => {
    mockUseBeneficiaries.mockReturnValue({
      data: [mockBeneficiary],
      isLoading: false,
      error: null,
    });

    render(<RecipientDetailPage />);

    const detail = screen.getByTestId('beneficiary-detail');
    expect(detail).toBeInTheDocument();
    expect(detail).toHaveAttribute('data-beneficiary-id', '123');
  });
});

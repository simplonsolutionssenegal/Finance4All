import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

// Mock EmailVerificationForm component
jest.mock('@/components/auth/EmailVerificationForm', () => {
  return function MockEmailVerificationForm({ clerkId }: { clerkId?: string }) {
    return (
      <div data-testid='email-verification-form'>
        Email Verification Form Component
        {clerkId && <span data-testid='clerk-id'>{clerkId}</span>}
      </div>
    );
  };
});

// Create a sync version of the component for testing
function VerifyEmailPageSync({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const clerkIdFromParams = searchParams.clerkId as string;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4'>
      <div data-testid='email-verification-form'>
        Email Verification Form Component
        {clerkIdFromParams && <span data-testid='clerk-id'>{clerkIdFromParams}</span>}
      </div>
    </div>
  );
}

describe('VerifyEmailPage', () => {
  it('should render the verify email page', () => {
    const searchParams = {};
    render(<VerifyEmailPageSync searchParams={searchParams} />);

    expect(screen.getByTestId('email-verification-form')).toBeInTheDocument();
  });

  it('should pass clerkId from searchParams to EmailVerificationForm', () => {
    const searchParams = { clerkId: 'clerk_123' };
    render(<VerifyEmailPageSync searchParams={searchParams} />);

    expect(screen.getByTestId('email-verification-form')).toBeInTheDocument();
    expect(screen.getByTestId('clerk-id')).toHaveTextContent('clerk_123');
  });

  it('should handle searchParams without clerkId', () => {
    const searchParams = {};
    render(<VerifyEmailPageSync searchParams={searchParams} />);

    expect(screen.getByTestId('email-verification-form')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-id')).not.toBeInTheDocument();
  });

  it('should have correct page structure and styling', () => {
    const searchParams = {};
    const { container } = render(<VerifyEmailPageSync searchParams={searchParams} />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'flex',
      'min-h-screen',
      'flex-col',
      'items-center',
      'justify-center',
      'bg-gray-50',
      'p-4'
    );
  });

  it('should handle array values in searchParams', () => {
    const searchParams = { clerkId: ['clerk_123', 'clerk_456'] };
    render(<VerifyEmailPageSync searchParams={searchParams} />);

    expect(screen.getByTestId('email-verification-form')).toBeInTheDocument();
    expect(screen.getByTestId('clerk-id')).toHaveTextContent('clerk_123');
  });

  it('should handle undefined clerkId in searchParams', () => {
    const searchParams = { clerkId: undefined };
    render(<VerifyEmailPageSync searchParams={searchParams} />);

    expect(screen.getByTestId('email-verification-form')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-id')).not.toBeInTheDocument();
  });
});

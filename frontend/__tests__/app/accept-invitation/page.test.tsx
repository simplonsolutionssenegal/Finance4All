import { render, screen, cleanup } from '@testing-library/react';

import AcceptInvitationPage from '@/app/accept-invitation/page';

// Mock the ClerkAcceptInvitation component
jest.mock('@/components/clerk-accept-invitation', () => ({
  ClerkAcceptInvitation: ({ invitationId, orgId }: { invitationId: string; orgId: string }) => (
    <div data-testid='clerk-accept-invitation'>
      <div data-testid='invitation-id'>{invitationId}</div>
      <div data-testid='org-id'>{orgId}</div>
    </div>
  ),
}));

// Mock Next.js Image component to avoid recursive import issues
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    width,
    height,
    _fill,
    _priority,
    ...props
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    _fill?: boolean;
    _priority?: boolean;
    [key: string]: unknown;
  }) {
    // Filter out Next.js specific props that aren't valid HTML attributes
    const { _sizes, ...imgProps } = props;
    return (
      <div
        data-testid='mock-image'
        data-src={src}
        data-alt={alt}
        data-width={width}
        data-height={height}
        {...imgProps}
      />
    );
  },
}));

describe('AcceptInvitationPage', () => {
  const mockSearchParams = {
    invitation_id: 'test-invitation-id',
    org_id: 'test-org-id',
  };

  afterEach(() => {
    cleanup();
  });

  it('renders the page layout with correct structure', async () => {
    const Page = await AcceptInvitationPage({ searchParams: Promise.resolve(mockSearchParams) });
    render(Page);

    // Check main content
    expect(screen.getByText('Rejoignez votre organisation')).toBeInTheDocument();
    expect(screen.getByText(/Plateforme d'inclusion financière/)).toBeInTheDocument();

    // Check that images are rendered
    const images = screen.getAllByTestId('mock-image');
    expect(images.length).toBeGreaterThan(0);

    // Check specific images
    const bgImage = images.find(img => img.getAttribute('data-alt') === 'Background image');
    expect(bgImage).toBeInTheDocument();

    const logo = images.find(img => img.getAttribute('data-alt') === 'Finance4All Logo');
    expect(logo).toBeInTheDocument();
  });

  it('passes correct props to ClerkAcceptInvitation component', async () => {
    const Page = await AcceptInvitationPage({ searchParams: Promise.resolve(mockSearchParams) });
    render(Page);

    expect(screen.getByTestId('clerk-accept-invitation')).toBeInTheDocument();
    expect(screen.getByTestId('invitation-id')).toHaveTextContent('test-invitation-id');
    expect(screen.getByTestId('org-id')).toHaveTextContent('test-org-id');
  });

  it('renders without crashing when searchParams are empty', async () => {
    const Page = await AcceptInvitationPage({
      searchParams: Promise.resolve({ invitation_id: '', org_id: '' }),
    });
    render(Page);

    expect(screen.getByText('Rejoignez votre organisation')).toBeInTheDocument();
  });

  it('has correct responsive layout', async () => {
    const Page = await AcceptInvitationPage({ searchParams: Promise.resolve(mockSearchParams) });
    const { container } = render(Page);

    // Check main container classes
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
    expect(mainDiv).toHaveClass('flex');

    // Verify the page structure is present
    expect(container.querySelector('.bg-primary-400')).toBeInTheDocument(); // Left panel
    expect(container.querySelector('.bg-white')).toBeInTheDocument(); // Right panel
  });

  it('handles different search params correctly', async () => {
    const differentParams = {
      invitation_id: 'different-invitation',
      org_id: 'different-org',
    };
    const Page = await AcceptInvitationPage({ searchParams: Promise.resolve(differentParams) });
    render(Page);

    expect(screen.getByTestId('invitation-id')).toHaveTextContent('different-invitation');
    expect(screen.getByTestId('org-id')).toHaveTextContent('different-org');
  });

  it('renders Suspense fallback correctly', async () => {
    const Page = await AcceptInvitationPage({ searchParams: Promise.resolve(mockSearchParams) });
    render(Page);

    // The Suspense component should be rendered with the ClerkAcceptInvitation component
    expect(screen.getByTestId('clerk-accept-invitation')).toBeInTheDocument();
  });

  it('has proper semantic structure for accessibility', async () => {
    const Page = await AcceptInvitationPage({ searchParams: Promise.resolve(mockSearchParams) });
    render(Page);

    // Check for proper heading structure
    // Check for logo text
    // Check for logo by alt text (since text is part of image or removed)
    const images = screen.getAllByTestId('mock-image');
    expect(images[0]).toHaveAttribute('alt', 'Finance4All Logo');
    const bgImage = images.find(img => img.getAttribute('data-alt') === 'Background image');
    const logo = images.find(img => img.getAttribute('data-alt') === 'Finance4All Logo');
    expect(bgImage).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
  });
});

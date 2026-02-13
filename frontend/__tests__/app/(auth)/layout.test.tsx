import { render, screen } from '@testing-library/react';

import AuthLayout from '@/app/(auth)/layout';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock Sidebar
jest.mock('@/components/dashboard/Sidebar', () => {
  return function MockSidebar() {
    return <aside>Sidebar</aside>;
  };
});

describe('AuthLayout', () => {
  const mockChildren = <div data-testid='test-children'>Test Content</div>;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  it('renders without crashing', () => {
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('renders children inside main element', () => {
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId('test-children'));
  });

  it('has correct structure with div and main', () => {
    const { container } = render(<AuthLayout>{mockChildren}</AuthLayout>);
    const outerDiv = container.firstChild;
    expect(outerDiv).toBeInTheDocument();
    expect(outerDiv).toHaveClass('h-screen');
  });

  it('main element has flex-1 class', () => {
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex-1');
  });

  it('should be a function that returns JSX', () => {
    expect(typeof AuthLayout).toBe('function');
    const result = AuthLayout({ children: mockChildren });
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });

  it('renders multiple children correctly', () => {
    const multipleChildren = (
      <>
        <div data-testid='child-1'>Child 1</div>
        <div data-testid='child-2'>Child 2</div>
      </>
    );

    render(<AuthLayout>{multipleChildren}</AuthLayout>);
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('renders with empty children', () => {
    render(<AuthLayout>{null}</AuthLayout>);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1');
  });

  it('shows dashboard layout on learning list', () => {
    mockUsePathname.mockReturnValue('/learning');
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('shows dashboard layout on learning module detail', () => {
    mockUsePathname.mockReturnValue('/learning/123');
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('hides dashboard layout on learning lesson detail', () => {
    mockUsePathname.mockReturnValue('/learning/123/lesson/1');
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument();
  });

  it('hides dashboard layout on learning quiz detail', () => {
    mockUsePathname.mockReturnValue('/learning/123/quiz/456');
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument();
  });
});

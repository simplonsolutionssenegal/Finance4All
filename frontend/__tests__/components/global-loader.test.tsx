import { render, screen } from '@testing-library/react';

import { GlobalLoader } from '@/components/global-loader';
import { useLoader } from '@/contexts/LoaderContext';


// Mock the LoaderContext
jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(),
}));

const useLoaderMock = useLoader as jest.Mock;

describe('GlobalLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when loading is false', () => {
    useLoaderMock.mockReturnValue({ isLoading: false });

    const { container } = render(<GlobalLoader />);

    expect(container.firstChild).toBeNull();
  });

  it('should render loader when loading is true', () => {
    useLoaderMock.mockReturnValue({ isLoading: true });

    render(<GlobalLoader />);

    expect(screen.getByText('Chargement en cours...')).toBeInTheDocument();
  });

  it('should render with correct CSS classes when loading', () => {
    useLoaderMock.mockReturnValue({ isLoading: true });

    render(<GlobalLoader />);

    const overlay = screen.getByText('Chargement en cours...').closest('div')?.parentElement;
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-[9999]', 'bg-black/50', 'backdrop-blur-sm');
  });

  it('should render spinner with correct styling', () => {
    useLoaderMock.mockReturnValue({ isLoading: true });

    render(<GlobalLoader />);

    const spinnerContainer = screen.getByText('Chargement en cours...').previousElementSibling;
    expect(spinnerContainer).toHaveClass('relative');

    const staticCircle = spinnerContainer?.firstElementChild;
    const animatedCircle = spinnerContainer?.lastElementChild;

    expect(staticCircle).toHaveClass('h-12', 'w-12', 'rounded-full', 'border-4', 'border-teal-200');
    expect(animatedCircle).toHaveClass(
      'absolute',
      'top-0',
      'h-12',
      'w-12',
      'animate-spin',
      'rounded-full',
      'border-4',
      'border-transparent',
      'border-t-teal-500'
    );
  });

  it('should render loading text with correct styling', () => {
    useLoaderMock.mockReturnValue({ isLoading: true });

    render(<GlobalLoader />);

    const loadingText = screen.getByText('Chargement en cours...');
    expect(loadingText).toHaveClass('text-white', 'font-medium');
  });
});
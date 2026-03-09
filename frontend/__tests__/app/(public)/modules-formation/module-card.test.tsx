import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ModuleCardClient } from '@/app/(public)/modules-formation/module-card';
import { useMediaUrl } from '@/hooks/module/media/useMedia';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt, fill, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  },
}));

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('lucide-react', () => ({
  Clock: (props: any) => <svg data-testid='clock-icon' {...props} />,
  Users: (props: any) => <svg data-testid='users-icon' {...props} />,
  Target: (props: any) => <svg data-testid='target-icon' {...props} />,
  ArrowRight: (props: any) => <svg data-testid='arrow-icon' {...props} />,
  Image: (props: any) => <svg data-testid='fallback-image-icon' {...props} />,
  Sparkle: (props: any) => <svg data-testid='sparkle-icon' {...props} />,
}));

jest.mock('@/hooks/module/media/useMedia', () => ({
  useMediaUrl: jest.fn(),
}));

const mockedUseMediaUrl = useMediaUrl as jest.MockedFunction<typeof useMediaUrl>;

const baseModule = {
  id: 'mod-1',
  title: 'Bases finance',
  description: 'Description module',
  difficultyLevel: DifficultyLevel.BEGINNER,
  estimatedDuration: 9,
  status: ModuleStatus.PUBLISHED,
  imageMediaId: 'media-1',
  lessonCount: 3,
  userStatus: 'AVAILABLE',
  progressPercent: 0,
  thematic: 'Finance Personnelle',
  durationStr: '9 heures',
  inscrits: 120,
  reussite: 87,
} as any;

describe('ModuleCardClient (public)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseMediaUrl.mockReturnValue({
      url: 'https://cdn.example.com/module.jpg',
      loading: false,
    });
  });

  it('renders module content and media image when available', () => {
    render(<ModuleCardClient module={baseModule} />);

    expect(screen.getByText('Bases finance')).toBeInTheDocument();
    expect(screen.getByText('Description module')).toBeInTheDocument();
    expect(screen.getByAltText('Bases finance')).toHaveAttribute(
      'src',
      'https://cdn.example.com/module.jpg'
    );
    expect(screen.getByText('Finance Personnelle')).toBeInTheDocument();
    expect(screen.getByText('Débutant')).toBeInTheDocument();
    expect(screen.getByText('9 heures')).toBeInTheDocument();
  });

  it('renders fallback image icon when media url is missing', () => {
    mockedUseMediaUrl.mockReturnValue({ url: null, loading: false });

    render(<ModuleCardClient module={{ ...baseModule, imageMediaId: null }} />);

    expect(screen.getByTestId('fallback-image-icon')).toBeInTheDocument();
  });

  it('renders difficulty labels for intermediate and advanced', () => {
    const { rerender } = render(
      <ModuleCardClient module={{ ...baseModule, difficultyLevel: DifficultyLevel.INTERMEDIATE }} />
    );
    expect(screen.getByText('Intermédiaire')).toBeInTheDocument();

    rerender(
      <ModuleCardClient module={{ ...baseModule, difficultyLevel: DifficultyLevel.ADVANCED }} />
    );
    expect(screen.getByText('Avancé')).toBeInTheDocument();
  });

  it('falls back to default thematic, duration and stats values', () => {
    render(
      <ModuleCardClient
        module={{
          ...baseModule,
          thematic: undefined,
          durationStr: undefined,
          inscrits: undefined,
          reussite: undefined,
          estimatedDuration: 14,
        }}
      />
    );

    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('14 heures')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('links CTA to register page', () => {
    render(<ModuleCardClient module={baseModule} />);

    const cta = screen.getByRole('link');
    expect(cta).toHaveAttribute('href', '/register');
    expect(screen.getByText('Commencer maintenant')).toBeInTheDocument();
  });
});

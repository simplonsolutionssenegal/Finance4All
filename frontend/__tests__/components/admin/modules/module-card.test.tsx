// __tests__/components/admin/modules/module-card.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import ModuleCard from '@/components/admin/modules/module-card';
import { DifficultyLevel, ModuleStatus, type Module } from '@/types/modules/module';

// Mock de Next.js Image (évite l'avertissement no-img-element)
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt, fill, className, sizes, ...props }: any) {
    return (
      <div
        data-testid='module-image'
        data-src={src}
        data-alt={alt}
        data-fill={fill}
        className={className}
        data-sizes={sizes}
        {...props}
      />
    );
  },
}));

// Mock de Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return (
      <a href={href} data-testid='module-link' {...props}>
        {children}
      </a>
    );
  };
});

// Mock des icônes Lucide
jest.mock('lucide-react', () => ({
  FileText: (props: any) => <svg data-testid='file-text-icon' {...props} />,
  HelpCircle: (props: any) => <svg data-testid='help-circle-icon' {...props} />,
  Clock: (props: any) => <svg data-testid='clock-icon' {...props} />,
  Check: (props: any) => <svg data-testid='check-icon' {...props} />,
}));

// Mock du hook useMediaUrl
jest.mock('@/hooks/module/media/useMedia', () => ({
  useMediaUrl: jest.fn((mediaId: string | null | undefined) => ({
    url: mediaId ? `https://example.com/media/${mediaId}` : null,
    isLoading: false,
    error: null,
  })),
}));

// Type étendu pour les tests incluant les propriétés supplémentaires
type ModuleWithExtras = Module & {
  imageMediaId?: string | null;
  lessonsCount?: number;
  lessons?: Array<{ id: string }>;
  quizzesCount?: number;
  quizzes?: Array<{ id: string }>;
  durationMinutes?: number | string;
};

const createModule = (overrides: Partial<ModuleWithExtras> = {}): ModuleWithExtras => ({
  id: '1',
  title: 'Module de Finance Personnelle',
  description:
    'Apprenez les bases de la gestion financière personnelle avec ce module complet et interactif.',
  thematics: 'Finance de base' as any,
  estimatedDuration: 60,
  status: ModuleStatus.PUBLISHED,
  difficultyLevel: DifficultyLevel.BEGINNER,
  imageMediaId: 'media-123',
  quizzes: [],
  lessons: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('ModuleCard', () => {
  it('ne rend rien si aucune thématique n’est présente', () => {
    const { container } = render(<ModuleCard module={createModule({ thematics: '' as any })} />);

    expect(container.firstChild).toBeNull();
  });

  it('affiche le titre, la description et les chips de base', () => {
    render(<ModuleCard module={createModule()} />);

    expect(screen.getByText('Module de Finance Personnelle')).toBeInTheDocument();
    expect(
      screen.getByText(/Apprenez les bases de la gestion financière personnelle/)
    ).toBeInTheDocument();

    // Chip thématiques
    expect(screen.getByText('Finance de base')).toBeInTheDocument();

    // Chip statut
    expect(screen.getByText(ModuleStatus.PUBLISHED)).toBeInTheDocument();
  });

  it("affiche l'image quand imageMediaId est défini", () => {
    render(<ModuleCard module={createModule({ imageMediaId: 'image-456' })} />);

    const image = screen.getByTestId('module-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('data-src', 'https://example.com/media/image-456');
    expect(image).toHaveAttribute('data-alt', 'Module de Finance Personnelle');
  });

  it("affiche un placeholder quand aucune image n'est fournie", () => {
    const { useMediaUrl } = require('@/hooks/module/media/useMedia');
    useMediaUrl.mockReturnValue({ url: null, isLoading: false, error: null });

    const { container } = render(<ModuleCard module={createModule({ imageMediaId: null })} />);

    // Il doit y avoir au moins un bloc bg-gray-100 plein (placeholder)
    const placeholder = container.querySelector('.bg-gray-100');
    expect(placeholder).toBeInTheDocument();
    expect(screen.queryByTestId('module-image')).not.toBeInTheDocument();
  });

  it('affiche 0 pour leçons et quiz si aucune information n’est fournie', () => {
    render(<ModuleCard module={createModule()} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('formate correctement la durée à partir de estimatedDuration (nombre)', () => {
    render(<ModuleCard module={createModule({ estimatedDuration: 45 })} />);

    expect(screen.getByText('45min')).toBeInTheDocument();
  });

  it('rend les icônes de stats (leçons, quiz, durée)', () => {
    render(<ModuleCard module={createModule()} />);

    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    expect(screen.getByTestId('help-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });
});

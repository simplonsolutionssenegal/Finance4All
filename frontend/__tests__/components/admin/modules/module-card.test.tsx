// __tests__/components/admin/modules/module-card.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import ModuleCard from '@/components/admin/modules/module-card';
import { ModuleStatus, type Module } from '@/types/modules/module';

// Mock de Next.js Image pour éviter les problèmes de layout
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid='module-image' {...props} />;
  };
});

// Mock des icônes Lucide utilisées par le composant
jest.mock('lucide-react', () => ({
  FileText: (props: any) => <svg data-testid='file-text-icon' {...props} />,
  HelpCircle: (props: any) => <svg data-testid='help-circle-icon' {...props} />,
  Clock: (props: any) => <svg data-testid='clock-icon' {...props} />,
  Check: (props: any) => <svg data-testid='check-icon' {...props} />,
}));

const createModule = (overrides: Partial<Module> = {}): Module =>
  ({
    id: '1',
    title: 'Module de Finance Personnelle',
    description:
      'Apprenez les bases de la gestion financière personnelle avec ce module complet et interactif.',
    thematics: 'Finance de base' as any,
    estimatedDuration: 60,
    status: ModuleStatus.PUBLISHED,
    imageUrl: 'https://example.com/module-image.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }) as Module;

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

  it("affiche l'image quand imageUrl est définie", () => {
    render(<ModuleCard module={createModule()} />);

    const image = screen.getByTestId('module-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/module-image.jpg');
    expect(image).toHaveAttribute('alt', 'Module de Finance Personnelle');
  });

  it("affiche un placeholder quand aucune image n'est fournie", () => {
    const { container } = render(<ModuleCard module={createModule({ imageUrl: null as any })} />);

    // Il doit y avoir au moins un bloc bg-gray-100 plein (placeholder)
    const grayBlocks = container.querySelectorAll('.bg-gray-100');
    expect(grayBlocks.length).toBeGreaterThan(0);
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

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { ModulesClient } from '@/app/(public)/modules-formation/modules-client';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

jest.mock('@/app/(public)/modules-formation/module-card', () => ({
  ModuleCardClient: ({ module }: { module: { title: string } }) => (
    <div data-testid='module-card'>{module.title}</div>
  ),
}));

jest.mock('@/mocks/modules-data-mock', () => [
  {
    id: 'm1',
    title: 'Budget familial',
    description: 'Bases du budget',
    difficultyLevel: 'BEGINNER',
    estimatedDuration: 10,
    status: 'PUBLISHED',
    imageMediaId: null,
    lessonCount: 1,
    userStatus: 'AVAILABLE',
    progressPercent: 0,
    thematic: 'Finance Personnelle',
  },
  {
    id: 'm2',
    title: 'Investir malin',
    description: 'Introduction a l investissement',
    difficultyLevel: 'INTERMEDIATE',
    estimatedDuration: 20,
    status: 'PUBLISHED',
    imageMediaId: null,
    lessonCount: 2,
    userStatus: 'AVAILABLE',
    progressPercent: 0,
    thematic: 'Investissement',
  },
]);

jest.mock('@/components/ui/select', () => {
  const React = require('react');

  function Select({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) {
    const itemValues: string[] = [];
    React.Children.forEach(children, (child: any) => {
      if (child?.props?.children) {
        React.Children.forEach(child.props.children, (nested: any) => {
          if (nested?.type?.displayName === 'SelectItem') itemValues.push(nested.props.value);
        });
      }
    });
    return (
      <select
        aria-label='mock-select'
        value={value}
        onChange={e => onValueChange(e.target.value)}
        data-testid='mock-select'
      >
        {itemValues.map(v => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    );
  }

  function SelectItem({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  SelectItem.displayName = 'SelectItem';

  return {
    Select,
    SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectItem,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectValue: () => null,
  };
});

describe('ModulesClient', () => {
  const initialModules = [
    {
      id: 'a1',
      title: 'Epargne locale',
      description: 'Comment epargner chaque mois',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 8,
      status: ModuleStatus.PUBLISHED,
      imageMediaId: null,
      lessonCount: 3,
      userStatus: 'AVAILABLE',
      progressPercent: 0,
      thematic: 'Finance Personnelle',
    },
    {
      id: 'a2',
      title: 'Credit responsable',
      description: 'Utiliser le credit sans risque',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 12,
      status: ModuleStatus.PUBLISHED,
      imageMediaId: null,
      lessonCount: 4,
      userStatus: 'AVAILABLE',
      progressPercent: 0,
      thematic: 'Investissement',
    },
  ] as any;

  it('renders initial modules when provided', () => {
    render(<ModulesClient initialModules={initialModules} />);

    expect(screen.getByText(/2 modules correspondent/i)).toBeInTheDocument();
    expect(screen.getByText('Epargne locale')).toBeInTheDocument();
    expect(screen.getByText('Credit responsable')).toBeInTheDocument();
  });

  it('falls back to mocked modules when initialModules is empty', () => {
    render(<ModulesClient initialModules={[]} />);

    expect(screen.getByText(/2 modules correspondent/i)).toBeInTheDocument();
    expect(screen.getByText('Budget familial')).toBeInTheDocument();
    expect(screen.getByText('Investir malin')).toBeInTheDocument();
  });

  it('filters modules by search input on title/description', () => {
    render(<ModulesClient initialModules={initialModules} />);

    fireEvent.change(screen.getByPlaceholderText(/Rechercher un module/i), {
      target: { value: 'credit' },
    });

    expect(screen.getByText(/1 modules correspondent/i)).toBeInTheDocument();
    expect(screen.queryByText('Epargne locale')).not.toBeInTheDocument();
    expect(screen.getByText('Credit responsable')).toBeInTheDocument();
  });
});

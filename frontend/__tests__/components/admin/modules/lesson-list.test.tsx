/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import LessonList from '@/components/admin/modules/lesson-list';

jest.mock('lucide-react', () => {
  const handler: any = { get: () => (props: any) => <svg {...props} /> };
  return new Proxy({}, handler);
});

jest.mock('@/components/admin/modules/lesson-item', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid={`lesson-item-${props.lesson?.id}`}>
      <div>title:{props.lesson?.title}</div>
      <div>href:{props.href}</div>
      <div>resources:{props.resourcesCount}</div>
      <div>index:{props.displayIndex}</div>
      <button
        type='button'
        onClick={() => props.onEdit?.(props.lesson)}
        aria-label={`edit-${props.lesson?.id}`}
      >
        edit
      </button>
      <button
        type='button'
        onClick={() => props.onDelete?.(props.lesson)}
        aria-label={`delete-${props.lesson?.id}`}
      >
        delete
      </button>
    </div>
  ),
}));

describe('LessonList', () => {
  const moduleId = 'module-123';

  const makeLesson = (overrides?: Partial<any>) => ({
    id: 'lesson-1',
    title: 'Lecon 1',
    description: 'Desc',
    duration: 10,
    order: 1,
    status: 'DRAFT',
    chapters: [],
    ...overrides,
  });

  it('renders empty state when lessons is undefined', () => {
    render(<LessonList lessons={undefined as any} moduleId={moduleId} />);

    expect(screen.getByText('Aucune lecon pour le moment')).toBeInTheDocument();
    expect(screen.getByText('Cree une premiere lecon pour ce module.')).toBeInTheDocument();
    expect(screen.queryByText('Ajouter une lecon')).not.toBeInTheDocument();
  });

  it('renders empty state and calls onCreate when provided', () => {
    const onCreate = jest.fn();
    render(<LessonList lessons={[]} moduleId={moduleId} onCreate={onCreate} />);

    const btn = screen.getByText('Ajouter une lecon');
    fireEvent.click(btn);

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('renders list, computes resourcesCount, and passes displayIndex', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    const lessons = [
      makeLesson({
        id: 'l1',
        title: 'L1',
        chapters: [
          { title: 'c1', description: 'd', order: 0, mediaId: 'm1' },
          { title: 'c2', description: 'd', order: 1, mediaId: '   m2   ' },
          { title: 'c3', description: 'd', order: 2, mediaId: '' },
          { title: 'c4', description: 'd', order: 3 },
          { title: 'c5', description: 'd', order: 4, mediaId: '   ' },
        ],
      }),
      makeLesson({ id: 'l2', title: 'L2', chapters: undefined }),
    ];

    render(
      <LessonList
        lessons={lessons as any}
        moduleId={moduleId}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByTestId('lesson-item-l1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-item-l2')).toBeInTheDocument();

    expect(screen.getByText(`href:/modules/${moduleId}/lessons/l1`)).toBeInTheDocument();
    expect(screen.getByText(`href:/modules/${moduleId}/lessons/l2`)).toBeInTheDocument();

    expect(screen.getByText('resources:2')).toBeInTheDocument();
    expect(screen.getByText('resources:0')).toBeInTheDocument();

    expect(screen.getByText('index:1')).toBeInTheDocument();
    expect(screen.getByText('index:2')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('edit-l1'));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'l1' }));

    fireEvent.click(screen.getByLabelText('delete-l2'));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'l2' }));
  });
});

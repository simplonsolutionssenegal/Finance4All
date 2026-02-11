/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import LessonList from '@/components/admin/modules/lesson-list';

// ✅ Mock icons pour éviter des soucis DOM
jest.mock('lucide-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler: any = { get: () => (props: any) => <svg {...props} /> };
  return new Proxy({}, handler);
});

// ✅ Mock LessonItem pour vérifier props et simuler onEdit
jest.mock('@/components/admin/modules/lesson-item', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid={`lesson-item-${props.lesson?.id}`}>
      <div>title:{props.lesson?.title}</div>
      <div>href:{props.href}</div>
      <div>resources:{props.resourcesCount}</div>
      <button
        type='button'
        onClick={() => props.onEdit?.()}
        aria-label={`edit-${props.lesson?.id}`}
      >
        edit
      </button>
    </div>
  ),
}));

describe('LessonList (100% coverage)', () => {
  const moduleId = 'module-123';

  const makeLesson = (overrides?: Partial<any>) => ({
    id: 'lesson-1',
    title: 'Leçon 1',
    description: 'Desc',
    duration: 10,
    order: 1,
    status: 'DRAFT',
    chapters: [],
    ...overrides,
  });

  it('render empty state when lessons is undefined (covers !lessons branch)', () => {
    render(<LessonList lessons={undefined as any} moduleId={moduleId} />);

    expect(screen.getByText('Aucune leçon pour le moment')).toBeInTheDocument();
    expect(screen.getByText('Crée une première leçon pour ce module.')).toBeInTheDocument();
    expect(screen.queryByText('Ajouter une leçon')).not.toBeInTheDocument();
  });

  it('render empty state when lessons is empty and no onCreate', () => {
    render(<LessonList lessons={[]} moduleId={moduleId} />);

    expect(screen.getByText('Aucune leçon pour le moment')).toBeInTheDocument();
    expect(screen.getByText('Crée une première leçon pour ce module.')).toBeInTheDocument();
    expect(screen.queryByText('Ajouter une leçon')).not.toBeInTheDocument();
  });

  it('render empty state and call onCreate when button clicked (covers onCreate branch)', () => {
    const onCreate = jest.fn();

    render(<LessonList lessons={[]} moduleId={moduleId} onCreate={onCreate} />);

    const btn = screen.getByText('Ajouter une leçon');
    fireEvent.click(btn);

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('render list and compute resourcesCount (covers countLessonResources branches)', () => {
    const onEdit = jest.fn();

    const lessons = [
      // 2 ressources : mediaId non vide + mediaId avec espaces autour
      makeLesson({
        id: 'l1',
        title: 'L1',
        chapters: [
          { title: 'c1', description: 'd', order: 0, mediaId: 'm1' },
          { title: 'c2', description: 'd', order: 1, mediaId: '   m2   ' },
          { title: 'c3', description: 'd', order: 2, mediaId: '' }, // vide
          { title: 'c4', description: 'd', order: 3 }, // undefined
          { title: 'c5', description: 'd', order: 4, mediaId: '   ' }, // spaces only -> trim => ''
        ],
      }),

      // 0 ressource : chapters undefined -> ?? []
      makeLesson({
        id: 'l2',
        title: 'L2',
        chapters: undefined,
      }),
    ];

    render(<LessonList lessons={lessons as any} moduleId={moduleId} onEdit={onEdit} />);

    // rendu items
    expect(screen.getByTestId('lesson-item-l1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-item-l2')).toBeInTheDocument();

    // href correct
    expect(screen.getByText(`href:/modules/${moduleId}/lessons/l1`)).toBeInTheDocument();
    expect(screen.getByText(`href:/modules/${moduleId}/lessons/l2`)).toBeInTheDocument();

    // resourcesCount calculé par countLessonResources
    expect(screen.getByText('resources:2')).toBeInTheDocument(); // l1 => 2
    expect(screen.getByText('resources:0')).toBeInTheDocument(); // l2 => 0

    // click edit => onEdit appelé via closure sur la leçon
    fireEvent.click(screen.getByLabelText('edit-l1'));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'l1', title: 'L1' }));

    fireEvent.click(screen.getByLabelText('edit-l2'));
    expect(onEdit).toHaveBeenCalledTimes(2);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'l2', title: 'L2' }));
  });

  it('render list without onEdit (covers onEdit ? () => onEdit(l) : undefined branch)', () => {
    const lessons = [makeLesson({ id: 'l3', title: 'L3', chapters: [{ mediaId: 'm', order: 0 }] })];

    render(<LessonList lessons={lessons as any} moduleId={moduleId} />);

    expect(screen.getByTestId('lesson-item-l3')).toBeInTheDocument();
    // click edit (mock) => ne doit pas crash
    fireEvent.click(screen.getByLabelText('edit-l3'));
  });
});

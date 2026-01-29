/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import LessonList from '@/components/admin/modules/lesson-list'; // 🔁 adapte si besoin

// ✅ Mock LessonItem pour pouvoir vérifier props et appeler onEdit
jest.mock('@/components/admin/modules/lesson-item', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid={`lesson-item-${props.lesson?.id}`}>
      <div>title:{props.lesson?.title}</div>
      <div>href:{props.href}</div>
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

describe('LessonList', () => {
  const moduleId = 'module-123';

  const makeLesson = (overrides?: Partial<any>) => ({
    id: 'lesson-1',
    title: 'Leçon 1',
    description: 'Desc',
    duration: 10,
    order: 1,
    status: 'DRAFT',
    chapters: [],
    chaptersCount: 0,
    ...overrides,
  });

  it('should render empty state when lessons is empty and no onCreate', () => {
    render(<LessonList lessons={[]} moduleId={moduleId} />);

    expect(screen.getByText('Aucune leçon pour le moment')).toBeInTheDocument();
    expect(screen.getByText('Crée une première leçon pour ce module.')).toBeInTheDocument();

    // bouton absent si onCreate undefined
    expect(screen.queryByText('Ajouter une leçon')).not.toBeInTheDocument();
  });

  it('should render empty state and call onCreate when button clicked', () => {
    const onCreate = jest.fn();

    render(<LessonList lessons={[]} moduleId={moduleId} onCreate={onCreate} />);

    const btn = screen.getByText('Ajouter une leçon');
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('should render LessonItem list with correct href and call onEdit', () => {
    const onEdit = jest.fn();

    const lessons = [makeLesson({ id: 'l1', title: 'L1' }), makeLesson({ id: 'l2', title: 'L2' })];

    render(<LessonList lessons={lessons as any} moduleId={moduleId} onEdit={onEdit} />);

    // 2 items render
    expect(screen.getByTestId('lesson-item-l1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-item-l2')).toBeInTheDocument();

    // href construit
    expect(screen.getByText(`href:/modules/${moduleId}/lessons/l1`)).toBeInTheDocument();
    expect(screen.getByText(`href:/modules/${moduleId}/lessons/l2`)).toBeInTheDocument();

    // click edit -> onEdit appelé avec bonne leçon (via closure)
    fireEvent.click(screen.getByLabelText('edit-l1'));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'l1', title: 'L1' }));

    fireEvent.click(screen.getByLabelText('edit-l2'));
    expect(onEdit).toHaveBeenCalledTimes(2);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'l2', title: 'L2' }));
  });

  it('should render LessonItem list even when onEdit is not provided (onEdit undefined)', () => {
    const lessons = [makeLesson({ id: 'l1', title: 'L1' })];

    render(<LessonList lessons={lessons as any} moduleId={moduleId} />);

    expect(screen.getByTestId('lesson-item-l1')).toBeInTheDocument();

    // clique sur le bouton edit mocké => ne doit pas crash (onEdit optionnel)
    fireEvent.click(screen.getByLabelText('edit-l1'));
  });
});

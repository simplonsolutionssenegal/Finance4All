// frontend/__tests__/components/admin/modules/lesson-item.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import LessonItem from '@/components/admin/modules/lesson-item';
import { LessonStatus, type Lesson } from '@/types/modules/Lesson';

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('LessonItem', () => {
  const mockLesson: Lesson = {
    id: 'lesson-1',
    title: 'Introduction à la finance',
    description: 'Apprenez les bases de la finance personnelle',
    duration: 45,
    order: 1,
    status: LessonStatus.PUBLISHED,
    chapters: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  };

  it('devrait rendre le composant avec les informations de base', () => {
    render(<LessonItem lesson={mockLesson} />);

    expect(screen.getByText('Introduction à la finance')).toBeInTheDocument();
    expect(screen.getByText('Apprenez les bases de la finance personnelle')).toBeInTheDocument();
    expect(screen.getByText('Leçon 1')).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('devrait afficher le nombre de ressources', () => {
    render(<LessonItem lesson={mockLesson} resourcesCount={5} />);

    expect(screen.getByText('5 ressource')).toBeInTheDocument();
  });

  it('devrait afficher 0 ressource par défaut', () => {
    render(<LessonItem lesson={mockLesson} />);

    expect(screen.getByText('0 ressource')).toBeInTheDocument();
  });

  it('devrait afficher le statut PUBLISHED avec icône Check', () => {
    render(<LessonItem lesson={mockLesson} />);

    expect(screen.getByText('Publié')).toBeInTheDocument();

    // Vérifier que le badge a la bonne classe
    const badge = screen.getByText('Publié').closest('span');
    expect(badge).toHaveClass('bg-emerald-100', 'text-emerald-700', 'border-emerald-300');
  });

  it('devrait afficher le statut DRAFT correctement', () => {
    const draftLesson: Lesson = { ...mockLesson, status: LessonStatus.DRAFT };
    render(<LessonItem lesson={draftLesson} />);

    expect(screen.getByText('Brouillon')).toBeInTheDocument();

    const badge = screen.getByText('Brouillon').closest('span');
    expect(badge).toHaveClass('bg-slate-100', 'text-slate-700', 'border-slate-300');
  });

  it('devrait afficher le statut ARCHIVED correctement', () => {
    const archivedLesson: Lesson = { ...mockLesson, status: LessonStatus.ARCHIVED };
    render(<LessonItem lesson={archivedLesson} />);

    expect(screen.getByText('Archivé')).toBeInTheDocument();

    const badge = screen.getByText('Archivé').closest('span');
    expect(badge).toHaveClass('bg-amber-100', 'text-amber-800', 'border-amber-300');
  });

  it('devrait afficher le statut SCHEDULED correctement', () => {
    const scheduledLesson: Lesson = { ...mockLesson, status: LessonStatus.SCHEDULED };
    render(<LessonItem lesson={scheduledLesson} />);

    expect(screen.getByText('Programmé')).toBeInTheDocument();

    const badge = screen.getByText('Programmé').closest('span');
    expect(badge).toHaveClass('bg-indigo-100', 'text-indigo-700', 'border-indigo-300');
  });

  it('devrait afficher un statut inconnu avec le style par défaut', () => {
    const unknownLesson: Lesson = { ...mockLesson, status: 'UNKNOWN' as any };
    render(<LessonItem lesson={unknownLesson} />);

    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();

    const badge = screen.getByText('UNKNOWN').closest('span');
    expect(badge).toHaveClass('bg-slate-100', 'text-slate-700', 'border-slate-300');
  });

  it('devrait afficher le quiz label quand fourni', () => {
    render(<LessonItem lesson={mockLesson} quizLabel='Quiz de validation' />);

    expect(screen.getByText('Quiz de validation')).toBeInTheDocument();
  });

  it('ne devrait pas afficher le quiz label quand null', () => {
    render(<LessonItem lesson={mockLesson} quizLabel={null} />);

    expect(screen.queryByText(/Quiz/)).not.toBeInTheDocument();
  });

  it('ne devrait pas afficher le quiz label par défaut', () => {
    render(<LessonItem lesson={mockLesson} />);

    expect(screen.queryByText(/Quiz/)).not.toBeInTheDocument();
  });

  it('devrait rendre le titre comme lien quand href est fourni', () => {
    render(<LessonItem lesson={mockLesson} href='/lessons/lesson-1' />);

    const link = screen.getByText('Introduction à la finance').closest('a');
    expect(link).toHaveAttribute('href', '/lessons/lesson-1');
  });

  it("devrait rendre le titre comme texte simple quand href n'est pas fourni", () => {
    render(<LessonItem lesson={mockLesson} />);

    const title = screen.getByText('Introduction à la finance');
    expect(title.closest('a')).toBeNull();
  });

  it('devrait afficher le bouton edit quand onEdit est fourni', () => {
    const onEdit = jest.fn();
    render(<LessonItem lesson={mockLesson} onEdit={onEdit} />);

    const editButton = screen.getByLabelText('Modifier la leçon');
    expect(editButton).toBeInTheDocument();
  });

  it("ne devrait pas afficher le bouton edit quand onEdit n'est pas fourni", () => {
    render(<LessonItem lesson={mockLesson} />);

    const editButton = screen.queryByLabelText('Modifier la leçon');
    expect(editButton).not.toBeInTheDocument();
  });

  it('devrait appeler onEdit avec la leçon quand le bouton edit est cliqué', () => {
    const onEdit = jest.fn();
    render(<LessonItem lesson={mockLesson} onEdit={onEdit} />);

    const editButton = screen.getByLabelText('Modifier la leçon');
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockLesson);
  });

  it('devrait formater correctement la durée en minutes', () => {
    const lesson30min: Lesson = { ...mockLesson, duration: 30 };
    render(<LessonItem lesson={lesson30min} />);

    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('devrait arrondir la durée', () => {
    const lessonFloat: Lesson = { ...mockLesson, duration: 45.7 };
    render(<LessonItem lesson={lessonFloat} />);

    expect(screen.getByText('46 min')).toBeInTheDocument();
  });

  it('devrait gérer une durée nulle', () => {
    const lessonNoDuration: Lesson = { ...mockLesson, duration: 0 };
    render(<LessonItem lesson={lessonNoDuration} />);

    expect(screen.getByText('0 min')).toBeInTheDocument();
  });

  it('devrait gérer un order nul', () => {
    const lessonNoOrder: Lesson = { ...mockLesson, order: undefined as any };
    render(<LessonItem lesson={lessonNoOrder} />);

    expect(screen.getByText('Leçon 0')).toBeInTheDocument();
  });

  it('devrait afficher tous les éléments ensemble', () => {
    const onEdit = jest.fn();
    render(
      <LessonItem
        lesson={mockLesson}
        resourcesCount={3}
        quizLabel='Quiz final'
        href='/lessons/lesson-1'
        onEdit={onEdit}
      />
    );

    // Vérifier tous les éléments
    expect(screen.getByText('Introduction à la finance')).toBeInTheDocument();
    expect(screen.getByText('Apprenez les bases de la finance personnelle')).toBeInTheDocument();
    expect(screen.getByText('Leçon 1')).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
    expect(screen.getByText('3 ressource')).toBeInTheDocument();
    expect(screen.getByText('Publié')).toBeInTheDocument();
    expect(screen.getByText('Quiz final')).toBeInTheDocument();
    expect(screen.getByLabelText('Modifier la leçon')).toBeInTheDocument();

    // Vérifier le lien
    const link = screen.getByText('Introduction à la finance').closest('a');
    expect(link).toHaveAttribute('href', '/lessons/lesson-1');
  });

  it('devrait tronquer une longue description', () => {
    const longLesson: Lesson = {
      ...mockLesson,
      description:
        "Ceci est une très longue description qui devrait être tronquée car elle dépasse la limite de caractères autorisée pour l'affichage",
    };
    render(<LessonItem lesson={longLesson} />);

    const description = screen.getByText(/Ceci est une très longue description/);
    expect(description).toHaveClass('line-clamp-1');
  });

  it('devrait tronquer un long titre', () => {
    const longLesson: Lesson = {
      ...mockLesson,
      title: 'Ceci est un très long titre qui devrait être tronqué car il dépasse la limite',
    };
    render(<LessonItem lesson={longLesson} />);

    const title = screen.getByText(/Ceci est un très long titre/);
    expect(title.closest('div')).toHaveClass('truncate');
  });

  it('devrait avoir les bonnes classes CSS pour la structure', () => {
    const { container } = render(<LessonItem lesson={mockLesson} />);

    // Vérifier le conteneur principal
    const mainContainer = container.querySelector('.rounded-2xl.bg-white.shadow-sm');
    expect(mainContainer).toBeInTheDocument();

    // Vérifier l'icône
    const iconContainer = container.querySelector('.h-8.w-8.rounded-xl.bg-sky-50');
    expect(iconContainer).toBeInTheDocument();
  });
});

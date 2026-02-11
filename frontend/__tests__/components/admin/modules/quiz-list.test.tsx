/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import QuizList from '@/components/admin/modules/quiz-list'; // 🔁 adapte si besoin

describe('QuizList', () => {
  const makeQuiz = (overrides?: Partial<any>) => ({
    id: 'q1',
    title: 'Quiz 1',
    description: 'Desc 1',
    status: 'DRAFT',
    scoreMinimum: 70,
    duree: 1800,
    nombreTentatives: 2,
    questions: [{}, {}],
    ...overrides,
  });

  it('should render empty state without button when quizzes empty and no onCreate', () => {
    render(<QuizList quizzes={[]} />);

    expect(screen.getByText('Aucun quiz pour le moment')).toBeInTheDocument();
    expect(
      screen.getByText('Ajoute un quiz pour évaluer les connaissances sur ce module.')
    ).toBeInTheDocument();

    // bouton absent car onCreate undefined
    expect(screen.queryByText('Nouveau quiz')).not.toBeInTheDocument();
  });

  it('should render empty state with button and call onCreate when provided', () => {
    const onCreate = jest.fn();
    render(<QuizList quizzes={[]} onCreate={onCreate} />);

    const btn = screen.getByText('Nouveau quiz');
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('should render list of quizzes when quizzes not empty', () => {
    const quizzes = [
      // PUBLISHED => badge emerald + Check icon + label "Publié"
      makeQuiz({
        id: 'q1',
        status: 'PUBLISHED',
        duree: undefined, // => "Illimité"
        questions: [{}, {}, {}], // => "3 questions"
      }),
      // DRAFT => badge slate + label "Brouillon"
      makeQuiz({
        id: 'q2',
        title: 'Quiz 2',
        status: 'DRAFT',
        duree: null, // => "Illimité"
        questions: 'not-an-array', // branch questionsCount => 0
      }),
      // ARCHIVED => badge amber + label "Archivé"
      makeQuiz({
        id: 'q3',
        title: 'Quiz 3',
        status: 'ARCHIVED',
        duree: 45, // => "45 min"
        questions: [],
      }),
      // default status => badge slate + label fallback = status
      makeQuiz({
        id: 'q4',
        title: 'Quiz 4',
        status: 'UNKNOWN',
        duree: '12.7' as any, // => Math.round(12.7) => "13 min"
      }),
    ];

    render(<QuizList quizzes={quizzes as any} />);

    // 4 items rendus
    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('Quiz 2')).toBeInTheDocument();
    expect(screen.getByText('Quiz 3')).toBeInTheDocument();
    expect(screen.getByText('Quiz 4')).toBeInTheDocument();

    // questionsCount
    expect(screen.getByText('3 questions')).toBeInTheDocument();
    expect(screen.getAllByText('0 questions').length).toBeGreaterThanOrEqual(1);
    // ou si tu veux être strict:
    expect(screen.getAllByText('0 questions')).toHaveLength(2);
    // status labels FR + fallback
    expect(screen.getByText('Publié')).toBeInTheDocument();
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
    expect(screen.getByText('Archivé')).toBeInTheDocument();
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();

    // durationLabel branches
    expect(screen.getAllByText('Illimité').length).toBeGreaterThanOrEqual(2); // q1 (undefined) + q2 (null)
    expect(screen.getByText('45 min')).toBeInTheDocument(); // q3
    expect(screen.getByText('13 min')).toBeInTheDocument(); // q4 (round)

    // Meta texts
    expect(screen.getAllByText(/% requis/).length).toBe(4);
    expect(screen.getAllByText(/tentatives/).length).toBe(4);

    // ✅ Check icon only for PUBLISHED
    // lucide sets aria-hidden=true on svg, so easiest is to check count of badge labels and ensure "Publié" exists.
    // Plus robuste: vérifier qu'il n'y a qu'un seul "Publié" (donc un seul quiz published)
    expect(screen.getAllByText('Publié')).toHaveLength(1);

    // ✅ Couvrir statusBadgeClass switch via classes
    const publishedBadge = screen.getByText('Publié').closest('span');
    expect(publishedBadge?.className).toContain('bg-emerald-100');

    const draftBadge = screen.getByText('Brouillon').closest('span');
    expect(draftBadge?.className).toContain('bg-slate-100');

    const archivedBadge = screen.getByText('Archivé').closest('span');
    expect(archivedBadge?.className).toContain('bg-amber-100');

    const unknownBadge = screen.getByText('UNKNOWN').closest('span');
    expect(unknownBadge?.className).toContain('bg-slate-100');
  });
});

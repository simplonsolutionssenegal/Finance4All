'use client';

import {
  HelpCircle,
  Plus,
  Clock,
  RotateCcw,
  EyeOff,
  Check,
  Award,
  Save,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import QuestionDialog from './question-dialog';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { QuestionDTO } from '@/types/modules/Question';
import { QuizStatus, type Quiz } from '@/types/modules/Quiz';

type QuizDraftBase = Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'totalPoints'>;

export type QuizDraft = Omit<QuizDraftBase, 'duree'> & { duree?: number };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  subtitle?: string;
  submitLabel?: string;

  initial?: Partial<QuizDraft>;
  onSubmit: (quiz: QuizDraft) => void;
};

export default function QuizFormDialog({
  open,
  onOpenChange,
  subtitle = 'Quiz',
  submitLabel = 'Ajouter le quiz',
  initial,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<QuizStatus>(QuizStatus.DRAFT);

  const [scoreMinimum, setScoreMinimum] = useState<number | ''>(70);
  const [duree, setDuree] = useState<string>(''); // '' => illimité
  const [nombreTentatives, setNombreTentatives] = useState<number | ''>(3);

  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

  const questionsCount = questions.length;
  const totalPoints = useMemo(
    () => questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [questions]
  );

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setStatus((initial?.status as QuizStatus) ?? QuizStatus.DRAFT);

    setScoreMinimum(initial?.scoreMinimum ?? 70);
    setDuree(initial?.duree ? String(initial.duree) : '');
    setNombreTentatives(initial?.nombreTentatives ?? 3);

    setQuestions(initial?.questions ?? []);
    setIsQuestionDialogOpen(false);
  }, [open, initial]);

  const canSubmit = useMemo(() => {
    const tOk = title.trim().length > 0;
    const dOk = description.trim().length > 0;

    const score = Number(scoreMinimum);
    const scoreOk = Number.isFinite(score) && score >= 0 && score <= 100;

    const attempts = Number(nombreTentatives);
    const attemptsOk = Number.isFinite(attempts) && attempts >= 1 && attempts <= 3;

    const timeOk = duree.trim() === '' || (Number.isFinite(Number(duree)) && Number(duree) > 0);

    // si publié => au moins 1 question
    const questionsOk = status !== QuizStatus.PUBLISHED || questionsCount > 0;

    return tOk && dOk && scoreOk && attemptsOk && timeOk && questionsOk;
  }, [title, description, scoreMinimum, nombreTentatives, duree, status, questionsCount]);

  const handleSave = () => {
    if (!canSubmit) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      scoreMinimum: Number(scoreMinimum),
      duree: duree.trim() === '' ? undefined : Number(duree),
      nombreTentatives: Number(nombreTentatives),
      questions,
    });

    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='rounded-none p-0 overflow-hidden h-[calc(105vh-2rem)] flex flex-col w-[calc(90vw-2rem)] sm:w-[640px] sm:max-w-none md:left-auto md:right-6 md:translate-x-0'>
          <DialogHeader className='px-4 pt-2 pb-2 border-b border-slate-200 bg-slate-50 shrink-0'>
            <div className='flex items-start justify-between'>
              <div>
                <DialogTitle className='text-lg font-semibold text-slate-900'>
                  Nouveau quiz
                </DialogTitle>
                <p className='mt-0.5 text-sm text-slate-600'>{subtitle}</p>
              </div>
            </div>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto px-6 py-2 space-y-3'>
            <div className='space-y-2'>
              <Label className='text-slate-700'>
                Titre du quiz <span className='text-red-500'>*</span>
              </Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='Ex: Quiz de compréhension'
                className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-slate-700'>
                Description <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Décrivez les objectifs de ce quiz...'
                className='min-h-[90px] bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-slate-700'>Statut</Label>
              <Select value={status} onValueChange={v => setStatus(v as QuizStatus)}>
                <SelectTrigger className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'>
                  <SelectValue placeholder='Choisir un statut' />
                </SelectTrigger>

                <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                  <SelectItem value={QuizStatus.DRAFT} className='text-gray-900'>
                    <span className='inline-flex items-center gap-2'>
                      <EyeOff className='h-3 w-3 text-slate-600' />
                      Brouillon
                    </span>
                  </SelectItem>

                  <SelectItem value={QuizStatus.PUBLISHED} className='text-gray-900'>
                    <span className='inline-flex items-center gap-2'>
                      <Check className='h-3 w-3 text-emerald-600' />
                      Publié
                    </span>
                  </SelectItem>

                  <SelectItem value={QuizStatus.ARCHIVED} className='text-gray-900'>
                    Archivé
                  </SelectItem>
                </SelectContent>
              </Select>

              {status === QuizStatus.PUBLISHED && questionsCount === 0 && (
                <p className='text-xs text-orange-600'>Pour publier, ajoute au moins 1 question.</p>
              )}
            </div>

            <div className='border-t border-slate-200' />

            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-slate-900'>
                <HelpCircle className='h-4 w-4 text-sky-500' />
                <Label className='text-[15px] text-slate-900'>Paramètres du quiz</Label>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-slate-700'>
                  <Award className='h-3 w-3 text-slate-500' />
                  <Label className='text-slate-700'>Score de passage (%)</Label>
                </div>
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={scoreMinimum}
                  onChange={e =>
                    setScoreMinimum(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-slate-700'>
                  <Clock className='h-3 w-3 text-slate-500' />
                  <Label className='text-slate-700'>Temps limite (minutes)</Label>
                </div>
                <Input
                  value={duree}
                  onChange={e => setDuree(e.target.value)}
                  placeholder='Illimité'
                  className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
                />
                <p className='text-xs text-slate-500'>Laissez vide pour un temps illimité</p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-slate-700'>
                  <RotateCcw className='h-3 w-3 text-slate-500' />
                  <Label className='text-slate-700'>Nombre de tentatives</Label>
                </div>
                <Input
                  type='number'
                  min={1}
                  max={3}
                  value={nombreTentatives}
                  onChange={e =>
                    setNombreTentatives(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
                />
              </div>
            </div>

            <div className='border-t border-slate-200' />

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <p className='font-semibold text-slate-900'>Questions</p>
                <span className='inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 px-2.5 text-xs text-slate-700'>
                  {questionsCount}
                </span>
              </div>

              <button
                onClick={() => setIsQuestionDialogOpen(true)}
                className='inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium'
                type='button'
              >
                <Plus className='h-3 w-3' />
                Ajouter une question
              </button>
            </div>

            {questionsCount === 0 ? (
              <div className='rounded-2xl bg-white border border-slate-200 p-10 text-center'>
                <p className='text-sm text-slate-900 font-medium'>Aucune question pour l’instant</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {questions.map((q, idx) => (
                  <div key={idx} className='rounded-xl border border-slate-200 bg-white px-4 py-3'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-slate-900 truncate'>{q.question}</p>
                        <p className='text-xs text-slate-500 mt-1'>
                          {q.type === 'CHOIX_UNIQUE' ? 'Choix unique' : 'Choix multiple'} •{' '}
                          {q.points} pts • {q.options.length} options
                        </p>
                      </div>

                      <button
                        type='button'
                        onClick={() => setQuestions(prev => prev.filter((_, i) => i !== idx))}
                        className='h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center'
                        aria-label='Supprimer la question'
                      >
                        <Trash2 className='h-4 w-4 text-slate-600' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0'>
            <p className='text-sm text-slate-500'>
              {questionsCount} question{questionsCount > 1 ? 's' : ''} • {totalPoints} points
            </p>

            <div className='flex items-center gap-3'>
              <Button variant='outline' className='rounded-xl' onClick={() => onOpenChange(false)}>
                Annuler
              </Button>

              <Button
                className='rounded-xl bg-sky-500 hover:bg-sky-400'
                disabled={!canSubmit}
                onClick={handleSave}
              >
                <Save className='h-4 w-4 mr-2' />
                {submitLabel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuestionDialog
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
        onAdd={q => setQuestions(prev => [...prev, q])}
      />
    </>
  );
}

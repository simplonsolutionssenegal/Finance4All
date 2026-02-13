'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TypeQuestion, type QuestionDTO, type QuestionOption } from '@/types/modules/Question';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  // ✅ si présent => mode édition
  initial?: QuestionDTO | null;

  // ✅ un seul callback pour create/edit
  onSave: (q: QuestionDTO) => void;

  dialogTitle?: string;
  submitLabel?: string;
};

const TYPE_LABEL: Record<TypeQuestion, string> = {
  [TypeQuestion.CHOIX_UNIQUE]: 'Choix unique',
  [TypeQuestion.CHOIX_MULTIPLE]: 'Choix multiple',
};

type OptionForm = QuestionOption & { id: string };

function makeInitialOptions(count = 4): OptionForm[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `opt_${Date.now()}_${i}`,
    text: '',
    isCorrect: false,
  }));
}

function toOptionForms(opts?: QuestionOption[], fallbackCount = 4): OptionForm[] {
  if (!opts || opts.length === 0) return makeInitialOptions(fallbackCount);
  return opts.map((o, i) => ({
    id: `opt_${Date.now()}_${i}`,
    text: o.text ?? '',
    isCorrect: Boolean(o.isCorrect),
  }));
}

export default function QuestionDialog({
  open,
  onOpenChange,
  initial = null,
  onSave,
  dialogTitle,
  submitLabel,
}: Props) {
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<TypeQuestion>(TypeQuestion.CHOIX_UNIQUE);
  const [points, setPoints] = useState<number | ''>(1);
  const [explication, setExplication] = useState('');
  const [options, setOptions] = useState<OptionForm[]>(() => makeInitialOptions(4));

  useEffect(() => {
    if (!open) return;

    setQuestion(initial?.question ?? '');
    setType((initial?.type as TypeQuestion) ?? TypeQuestion.CHOIX_UNIQUE);
    setPoints(initial?.points ?? 1);
    setExplication(initial?.explication ?? '');
    setOptions(toOptionForms(initial?.options, 4));
  }, [open, initial]);

  const correctCount = useMemo(() => options.filter(o => o.isCorrect).length, [options]);

  const canSubmit = useMemo(() => {
    const qOk = question.trim().length > 0;
    const p = Number(points);
    const pOk = Number.isFinite(p) && p > 0;

    const optFilled = options.every(o => o.text.trim().length > 0);
    if (!optFilled) return false;

    if (type === TypeQuestion.CHOIX_UNIQUE) return qOk && pOk && correctCount === 1;
    return qOk && pOk && correctCount >= 2;
  }, [question, points, options, type, correctCount]);

  const selectedCorrectId = useMemo(() => options.find(o => o.isCorrect)?.id ?? '', [options]);

  const setCorrectUniqueById = (id: string) => {
    setOptions(prev => prev.map(o => ({ ...o, isCorrect: o.id === id })));
  };

  const setOptionText = (id: string, text: string) => {
    setOptions(prev => prev.map(o => (o.id === id ? { ...o, text } : o)));
  };

  const setOptionCorrect = (id: string, isCorrect: boolean) => {
    setOptions(prev => prev.map(o => (o.id === id ? { ...o, isCorrect } : o)));
  };

  const addOption = () => {
    setOptions(prev => [
      ...prev,
      { id: `opt_${Date.now()}_${prev.length}`, text: '', isCorrect: false },
    ]);
  };

  const removeOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const handleSave = () => {
    if (!canSubmit) return;

    onSave({
      question: question.trim(),
      type,
      points: Number(points),
      options: options.map(o => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
      explication: explication.trim() ? explication.trim() : undefined,
    });

    onOpenChange(false);
  };

  const isEditing = Boolean(initial);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl p-0 overflow-hidden max-h-[95vh] flex flex-col'>
        <DialogHeader className='px-4 pt-2 pb-2 border-b border-slate-200 bg-slate-50 shrink-0'>
          <div className='flex items-start justify-between'>
            <div>
              <DialogTitle className='text-lg font-semibold text-slate-900'>
                {dialogTitle ?? (isEditing ? 'Modifier la question' : 'Nouvelle question')}
              </DialogTitle>
              <p className='mt-0.5 text-sm text-slate-500'>
                {isEditing
                  ? 'Modifiez la question du quiz.'
                  : 'Créez une nouvelle question pour votre quiz.'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6 py-2 space-y-3'>
          {/* ... ton contenu inchangé (inputs, select, options, explication) ... */}
          {/* Je laisse le reste identique à ton code original, seul handleSave change */}
          <div className='space-y-2'>
            <Label className='text-slate-700'>
              Question <span className='text-red-500'>*</span>
            </Label>
            <Input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder='Quelle est votre question ?'
              className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-slate-700'>
              Type de question <span className='text-red-500'>*</span>
            </Label>

            <Select value={type} onValueChange={v => setType(v as TypeQuestion)}>
              <SelectTrigger className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'>
                <SelectValue placeholder='Choisir un type' />
              </SelectTrigger>

              <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                {Object.values(TypeQuestion).map(v => (
                  <SelectItem key={v} value={v} className='text-gray-900'>
                    {TYPE_LABEL[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className='text-xs text-slate-500'>
              {type === TypeQuestion.CHOIX_UNIQUE
                ? '• Une seule réponse correcte'
                : '• Au moins deux réponses correctes'}
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='text-slate-700'>
              Points <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='number'
              min={1}
              value={points}
              onChange={e => setPoints(e.target.value === '' ? '' : Number(e.target.value))}
              className='w-28 bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
            />
          </div>

          <div className='flex items-center justify-between'>
            <Label className='text-slate-700'>
              Options de réponse <span className='text-red-500'>*</span>
            </Label>

            <button
              onClick={addOption}
              className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50'
              type='button'
            >
              <Plus className='h-4 w-4' />
              Ajouter une option
            </button>
          </div>

          <div className='space-y-3'>
            {type === TypeQuestion.CHOIX_UNIQUE ? (
              <RadioGroup
                value={selectedCorrectId}
                onValueChange={setCorrectUniqueById}
                className='space-y-3'
              >
                {options.map((opt, idx) => (
                  <div key={opt.id} className='flex items-center gap-3'>
                    <RadioGroupItem
                      value={opt.id}
                      aria-label='Réponse correcte'
                      className=' h-3 w-3 rounded-full  text-primary-300 data-[state=checked]:bg-primary-300 data-[state=checked]:border-primary-300 data-[state=checked]:text-primary-300 data-[state=checked]:[&>span]:bg-primary-300  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2'
                    />
                    <Input
                      value={opt.text}
                      onChange={e => setOptionText(opt.id, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
                    />
                    <button
                      type='button'
                      onClick={() => removeOption(opt.id)}
                      className='h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center'
                      aria-label="Supprimer l'option"
                    >
                      <Trash2 className='h-4 w-4 text-slate-500' />
                    </button>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              options.map((opt, idx) => (
                <div key={opt.id} className='flex items-center gap-3'>
                  <Checkbox
                    className='border-primary-300 text-primary-300 data-[state=checked]:bg-primary-300 data-[state=checked]:border-primary-300 data-[state=checked]:text-white focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2'
                    checked={opt.isCorrect}
                    onCheckedChange={checked => setOptionCorrect(opt.id, Boolean(checked))}
                    aria-label='Réponse correcte'
                  />
                  <Input
                    value={opt.text}
                    onChange={e => setOptionText(opt.id, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
                  />
                  <button
                    type='button'
                    onClick={() => removeOption(opt.id)}
                    className='h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center'
                    aria-label="Supprimer l'option"
                  >
                    <Trash2 className='h-4 w-4 text-slate-500' />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className='space-y-2'>
            <Label className='text-slate-700'>Explication (optionnel)</Label>
            <Textarea
              value={explication}
              onChange={e => setExplication(e.target.value)}
              placeholder='Expliquez pourquoi cette réponse est correcte...'
              className='min-h-[90px] bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
            />
          </div>
        </div>

        <div className='px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0'>
          <Button variant='outline' className='rounded-xl' onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            className='rounded-xl bg-sky-500 hover:bg-sky-400'
            disabled={!canSubmit}
            onClick={handleSave}
          >
            {submitLabel ?? (isEditing ? 'Enregistrer' : 'Ajouter la question')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

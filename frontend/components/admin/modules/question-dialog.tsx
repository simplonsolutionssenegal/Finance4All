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
  onAdd: (q: QuestionDTO) => void;
};

const TYPE_LABEL: Record<TypeQuestion, string> = {
  [TypeQuestion.CHOIX_UNIQUE]: 'Choix unique',
  [TypeQuestion.CHOIX_MULTIPLE]: 'Choix multiple',
};

type OptionForm = QuestionOption & { id: string };

function genId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeOption(): OptionForm {
  return { id: genId(), text: '', isCorrect: false };
}

export default function QuestionDialog({ open, onOpenChange, onAdd }: Props) {
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<TypeQuestion>(TypeQuestion.CHOIX_UNIQUE);
  const [points, setPoints] = useState<number | ''>(1);
  const [explication, setExplication] = useState('');
  const [options, setOptions] = useState<OptionForm[]>([
    makeOption(),
    makeOption(),
    makeOption(),
    makeOption(),
  ]);

  useEffect(() => {
    if (!open) return;
    setQuestion('');
    setType(TypeQuestion.CHOIX_UNIQUE);
    setPoints(1);
    setExplication('');
    setOptions([makeOption(), makeOption(), makeOption(), makeOption()]);
  }, [open]);

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

  const selectedCorrectId = useMemo(() => {
    return options.find(o => o.isCorrect)?.id ?? '';
  }, [options]);

  const setCorrectUniqueById = (id: string) => {
    setOptions(prev => prev.map(o => ({ ...o, isCorrect: o.id === id })));
  };

  const setOptionText = (id: string, text: string) => {
    setOptions(prev => prev.map(o => (o.id === id ? { ...o, text } : o)));
  };

  const setOptionCorrect = (id: string, isCorrect: boolean) => {
    setOptions(prev => prev.map(o => (o.id === id ? { ...o, isCorrect } : o)));
  };

  const addOption = () => setOptions(prev => [...prev, makeOption()]);

  const removeOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const handleAdd = () => {
    if (!canSubmit) return;

    onAdd({
      question: question.trim(),
      type,
      points: Number(points),
      options: options.map(o => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
      explication: explication.trim() ? explication.trim() : undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl p-0 overflow-hidden max-h-[95vh] flex flex-col'>
        <DialogHeader className='px-4 pt-2 pb-2 border-b border-slate-200 bg-slate-50 shrink-0'>
          <div className='flex items-start justify-between'>
            <div>
              <DialogTitle className='text-lg font-semibold text-slate-900'>
                Nouvelle question
              </DialogTitle>
              <p className='mt-0.5 text-sm text-slate-500'>
                Créez une nouvelle question pour votre quiz.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6 py-2 space-y-3'>
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

          {/* ✅ Ici on remplace les <input radio/checkbox> par tes composants UI */}
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
                      className='
    h-3 w-3 rounded-full border border-slate-300 bg-white
    data-[state=checked]:bg-primary-300 data-[state=checked]:border
    text-primary-300
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2
     data-[state=checked]:[&>span]:bg-primary-300 
    [&_[data-slot=radio-group-indicator]>svg]:fill-transparent
  '
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
                    checked={opt.isCorrect}
                    className='data-[state=checked]:bg-primary-200 data-[state=checked]:border-primary-200 data-[state=checked]:text-primary-900'
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

            <p className='text-xs text-slate-500'>
              {type === TypeQuestion.CHOIX_UNIQUE
                ? 'Sélectionnez la bonne réponse avec le bouton radio'
                : 'Sélectionnez au moins deux bonnes réponses'}
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='text-slate-700'>Explication (optionnel)</Label>
            <Textarea
              value={explication}
              onChange={e => setExplication(e.target.value)}
              placeholder='Expliquez pourquoi cette réponse est correcte...'
              className='min-h-[90px] bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
            />
            <p className='text-xs text-slate-500'>
              Cette explication sera affichée après que l’apprenant réponde.
            </p>
          </div>
        </div>

        <div className='px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0'>
          <Button variant='outline' className='rounded-xl' onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            className='rounded-xl bg-sky-500 hover:bg-sky-400'
            disabled={!canSubmit}
            onClick={handleAdd}
          >
            Ajouter la question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

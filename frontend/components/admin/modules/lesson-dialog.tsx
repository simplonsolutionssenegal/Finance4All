'use client';

import { Clock, Check, Save, FileText, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
import { useCreateLesson } from '@/hooks/lesson/useCreateLesson';
import { useUploadMedia } from '@/hooks/media/useUploadMedia';
import { LessonStatus, type ChapterDto } from '@/types/modules/Lesson';

import ResourcePickerDialog, { type ResourceKind } from './ResourcePickerDialog';

type LessonDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  moduleId: string;
  nextOrder: number;
  onCreated?: () => void;
  chapters?: ChapterDto[];
};

type ChapterForm = {
  id: string;
  title: string;
  description: string;

  // rempli automatiquement après upload
  mediaId: string;

  // UI helpers
  uploadedName?: string | null;
  uploading?: boolean;
  uploadError?: string | null;
  noMedia?: boolean;
};

function genId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `tmp-${hex}`;
  }

  return `tmp-${Date.now()}`;
}

export default function LessonDialog({
  open,
  onOpenChange,
  moduleId,
  nextOrder,
  onCreated,
  chapters: initialChapters,
}: LessonDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<LessonStatus>(LessonStatus.DRAFT);
  const [duration, setDuration] = useState<number | ''>('');
  const [openChapter, setOpenChapter] = useState<string>('');

  const [chapters, setChapters] = useState<ChapterForm[]>([]);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // popup resource picker
  const [resourcePickerOpen, setResourcePickerOpen] = useState(false);
  const [resourceTargetChapterId, setResourceTargetChapterId] = useState<string | null>(null);

  // file picker
  const [accept, setAccept] = useState<string>('*/*');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const durationLabel = useMemo(() => `${Math.max(0, Number(duration) || 0)} min`, [duration]);

  const { createLesson, isCreating } = useCreateLesson({
    onSuccess: () => {
      onOpenChange(false);
      onCreated?.();
    },
  });

  const uploadMedia = useUploadMedia();

  const updateChapter = (id: string, patch: Partial<ChapterForm>) => {
    setChapters(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addChapter = () => {
    const newId = genId();
    setChapters(prev => [
      ...prev,
      {
        id: newId,
        title: '',
        description: '',
        mediaId: '',
        uploadedName: null,
        uploading: false,
        uploadError: null,
        noMedia: false,
      },
    ]);
    setOpenChapter(newId);
  };

  const removeChapter = (id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
    if (openChapter === id) setOpenChapter('');
  };

  // validation chapitre: titre+desc + (noMedia OU mediaId) + pas d'upload en cours
  const isChapterValid = (c: ChapterForm) => {
    const okText = c.title.trim().length > 0 && c.description.trim().length > 0;
    const okUpload = !c.uploading;
    const okMedia = !!c.noMedia || (!!c.mediaId && c.mediaId.trim().length > 0);
    return okText && okUpload && okMedia;
  };

  const allChaptersValid = chapters.every(isChapterValid);
  const anyUploading = chapters.some(c => !!c.uploading);

  const canAddNewChapter = chapters.length === 0 || allChaptersValid;
  const chaptersOkForPublished = status !== LessonStatus.PUBLISHED || chapters.length > 0;

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    duration !== '' &&
    Number.isFinite(Number(duration)) &&
    Number(duration) > 0 &&
    allChaptersValid &&
    chaptersOkForPublished &&
    !anyUploading;

  useEffect(() => {
    if (!open) return;

    setTitle('');
    setDescription('');
    setStatus(LessonStatus.DRAFT);
    setDuration('');
    setOpenChapter('');
    setChapterError(null);

    const init = (initialChapters ?? []).map((c: any) => ({
      id: c?.id ? String(c.id) : genId(),
      title: c?.title ?? '',
      description: c?.description ?? '',
      mediaId: c?.mediaId ?? '',
      uploadedName: null,
      uploading: false,
      uploadError: null,
      noMedia: !c?.mediaId,
    }));

    setChapters(init);
  }, [open, initialChapters]);

  const handleAddChapter = () => {
    if (!canAddNewChapter) {
      setChapterError('Veuillez compléter les chapitres avant d’en ajouter un nouveau.');
      const firstInvalid = chapters.find(c => !isChapterValid(c));
      if (firstInvalid) setOpenChapter(firstInvalid.id);
      return;
    }

    setChapterError(null);
    addChapter();
  };

  // --- Ressource flow ---
  const openResourcePickerForChapter = (chapterId: string) => {
    setResourceTargetChapterId(chapterId);
    setResourcePickerOpen(true);
  };

  const onPickResourceKind = (kind: ResourceKind) => {
    setResourcePickerOpen(false);

    const chapterId = resourceTargetChapterId;
    setResourceTargetChapterId(null);

    if (!chapterId) return;

    if (kind === 'PAGE') {
      // Pas de fichier à uploader, on marque "noMedia"
      updateChapter(chapterId, {
        noMedia: true,
        mediaId: '',
        uploadedName: 'Page (sans fichier)',
        uploadError: null,
        uploading: false,
      });
      return;
    }

    const acceptByKind: Record<Exclude<ResourceKind, 'PAGE'>, string> = {
      PDF: 'application/pdf',
      AUDIO: 'audio/*',
      IMAGE: 'image/*',
      VIDEO: 'video/*',
    };

    setAccept(acceptByKind[kind]);
    // ouvrir file picker
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFilePicked = async (file: File) => {
    const target = openChapter || chapters[chapters.length - 1]?.id || null;

    if (!target) return;

    updateChapter(target, { uploading: true, uploadError: null, noMedia: false });

    try {
      const media = await uploadMedia.mutateAsync({
        file,
        metadata: { moduleId, chapterTempId: target },
      });

      updateChapter(target, {
        mediaId: media.id,
        uploadedName: media.originalName ?? file.name,
        uploading: false,
        uploadError: null,
        noMedia: false,
      });
    } catch (e) {
      updateChapter(target, {
        uploading: false,
        uploadError: e instanceof Error ? e.message : 'Erreur upload',
      });
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    createLesson({
      moduleId,
      payload: {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        order: nextOrder,
        status,
        chapters: chapters.map((c, idx) => ({
          title: c.title.trim(),
          description: c.description.trim(),
          order: idx,
          // si noMedia => on n'envoie pas mediaId (backend doit accepter)
          ...(c.noMedia ? {} : { mediaId: c.mediaId }),
        })) as any, // ✅ au cas où ChapterDto frontend exige mediaId obligatoire
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Input
        ref={fileInputRef}
        type='file'
        accept={accept}
        className='hidden'
        onChange={async e => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (!file) return;

          await handleFilePicked(file);

          input.value = '';
        }}
      />

      {/* popup picker */}
      <ResourcePickerDialog
        open={resourcePickerOpen}
        onOpenChange={setResourcePickerOpen}
        onPick={onPickResourceKind}
      />

      <DialogContent className='rounded-none p-0 overflow-hidden h-[calc(105vh-2rem)] flex flex-col w-[calc(90vw-2rem)] sm:w-[640px] sm:max-w-none md:left-auto md:right-6 md:translate-x-0'>
        <div className='px-6 pt-4 pb-2 border-b border-slate-200 bg-slate-50'>
          <div className='flex items-start justify-between'>
            <div>
              <DialogTitle className='text-lg text-slate-800'>Nouvelle leçon</DialogTitle>
              <p className='mt-0.5 text-sm text-slate-500'>
                {chapters.length} chapitre(s) • {durationLabel}
              </p>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto px-6 pt-2 pb-4 space-y-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-slate-700'>
                Titre de la leçon <span className='text-red-500'>*</span>
              </Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='Ex: Introduction au budget familial'
                className='bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-slate-700'>
                Description <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Décrivez brièvement le contenu de cette leçon...'
                className='min-h-[80px] bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
              />
            </div>

            {/* ✅ Select status comme avant */}
            <div className='space-y-2'>
              <Label className='text-slate-700'>Statut</Label>
              <Select value={status} onValueChange={v => setStatus(v as LessonStatus)}>
                <SelectTrigger
                  className='bg-[#F8F9FA] data-[placeholder]:text-black/40 data-[placeholder]:font-normal shadow-none transition-all
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                  focus-visible:ring-2 focus-visible:ring-cyan-500'
                >
                  <SelectValue placeholder='Choisir un statut' />
                </SelectTrigger>

                <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                  {Object.entries(LessonStatus).map(([key, value]) => (
                    <SelectItem
                      key={key}
                      value={value}
                      className='group relative pl-3 pr-8 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200 text-gray-900'
                    >
                      <span className='block truncate pr-2'>
                        {value === 'DRAFT'
                          ? 'Brouillon'
                          : value === 'PUBLISHED'
                            ? 'Publié'
                            : value === 'SCHEDULED'
                              ? 'Programmé'
                              : value === 'ARCHIVED'
                                ? 'Archivé'
                                : value}
                      </span>

                      <Check className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-600 opacity-0 group-data-[state=checked]:opacity-100 pointer-events-none flex-shrink-0' />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {status === LessonStatus.PUBLISHED && chapters.length === 0 && (
                <p className='text-xs text-orange-600'>Pour publier, ajoute au moins 1 chapitre.</p>
              )}
            </div>

            {/* Chapitres */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-slate-700'>Chapitre ({chapters.length})</Label>

                {chapters.length > 0 && (
                  <button
                    type='button'
                    onClick={handleAddChapter}
                    disabled={!canAddNewChapter}
                    className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                  >
                    <Plus className='h-3.5 w-3.5' />
                    Ajouter un chapitre
                  </button>
                )}
              </div>

              {chapterError && <p className='text-xs text-orange-600'>{chapterError}</p>}

              {chapters.length === 0 ? (
                <div className='rounded-xl bg-white border border-slate-200 p-10 text-center'>
                  <div className='mx-auto mb-4 h-8 w-8 rounded-2xl bg-slate-50 flex items-center justify-center'>
                    <FileText className='h-6 w-6 text-slate-400' />
                  </div>
                  <p className='text-sm text-slate-900'>
                    Organisez votre leçon en chapitres pour une meilleure structure
                  </p>

                  <button
                    type='button'
                    onClick={handleAddChapter}
                    className='mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
                  >
                    <Plus className='h-3 w-3' />
                    Ajouter le premier chapitre
                  </button>
                </div>
              ) : (
                <Accordion
                  type='single'
                  collapsible
                  value={openChapter}
                  onValueChange={setOpenChapter}
                  className='space-y-3'
                >
                  {chapters.map((c, idx) => (
                    <AccordionItem
                      key={c.id}
                      value={c.id}
                      className='rounded-xl border border-slate-200 bg-white px-4 mb-2 last:border-b'
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <AccordionTrigger className='py-3 hover:no-underline'>
                          <span className='text-sm font-semibold text-slate-800'>
                            Chapitre {idx + 1}
                          </span>
                        </AccordionTrigger>

                        <button
                          type='button'
                          onClick={() => removeChapter(c.id)}
                          className='h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center'
                          aria-label='Supprimer le chapitre'
                        >
                          <Trash2 className='h-4 w-4 text-orange-500' />
                        </button>
                      </div>

                      <AccordionContent className='pb-4'>
                        <div className='space-y-3 p-2'>
                          <Input
                            value={c.title}
                            onChange={e => updateChapter(c.id, { title: e.target.value })}
                            placeholder='Titre de chapitre'
                            className='bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                          />

                          <Textarea
                            value={c.description}
                            onChange={e => updateChapter(c.id, { description: e.target.value })}
                            placeholder='Description de chapitre ...'
                            className='min-h-[70px] bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                          />

                          {/* ✅ Ressource */}
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                              <Label className='text-slate-700 text-sm'>Ressource</Label>

                              <button
                                type='button'
                                onClick={() => openResourcePickerForChapter(c.id)}
                                disabled={!!c.uploading}
                                className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                              >
                                <Upload className='h-4 w-4' />
                                {c.mediaId || c.noMedia ? 'Remplacer' : 'Ajouter une ressource'}
                              </button>
                            </div>

                            <label className='flex items-center gap-2 text-sm text-slate-700'>
                              <input
                                type='checkbox'
                                checked={!!c.noMedia}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  updateChapter(c.id, {
                                    noMedia: checked,
                                    mediaId: checked ? '' : c.mediaId,
                                    uploadedName: checked ? null : (c.uploadedName ?? null),
                                    uploadError: null,
                                  });
                                }}
                              />
                              Aucun média pour ce chapitre
                            </label>

                            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                              {c.noMedia ? (
                                <p className='text-xs text-slate-600'>
                                  Ce chapitre sera créé sans média.
                                </p>
                              ) : (
                                <>
                                  <p className='text-xs text-slate-600'>
                                    Ressource :{' '}
                                    <span className='font-mono break-all'>
                                      {c.mediaId || '(pas encore)'}
                                    </span>
                                  </p>

                                  {!!c.uploadedName && (
                                    <p className='text-xs text-slate-500 mt-1'>
                                      fichier : {c.uploadedName}
                                    </p>
                                  )}

                                  {!!c.uploading && (
                                    <p className='text-xs text-slate-500 mt-2'>Upload en cours…</p>
                                  )}

                                  {!!c.uploadError && (
                                    <p className='text-xs text-red-600 mt-2'>{c.uploadError}</p>
                                  )}

                                  {!!c.mediaId && (
                                    <button
                                      type='button'
                                      onClick={() =>
                                        updateChapter(c.id, {
                                          mediaId: '',
                                          uploadedName: null,
                                          uploadError: null,
                                          noMedia: false,
                                        })
                                      }
                                      className='mt-2 inline-flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900'
                                    >
                                      <X className='h-3.5 w-3.5' />
                                      Retirer la ressource
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {!allChaptersValid && (
                <p className='text-xs text-orange-600'>
                  Chaque chapitre doit avoir un titre + description, et une ressource uploadée OU
                  “Aucun média”.
                </p>
              )}
            </div>

            {/* Durée */}
            <div className='space-y-2'>
              <Label className='text-slate-700'>
                Durée (minutes) <span className='text-red-500'>*</span>
              </Label>
              <div className='relative'>
                <Input
                  type='number'
                  min={1}
                  value={duration}
                  onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder='Ex: 15'
                  className='bg-slate-50 border-slate-200 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                />
                <Clock className='h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2' />
              </div>
            </div>
          </div>
        </div>

        <div className='px-6 py-4 border-t border-slate-200 flex items-center justify-between'>
          <p className='text-sm text-slate-500 inline-flex items-center gap-2'>
            <Clock className='h-4 w-4' />
            Durée totale : {durationLabel}
          </p>

          <div className='flex items-center gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='rounded-xl'
            >
              Annuler
            </Button>

            <Button
              type='button'
              onClick={handleSubmit}
              disabled={!canSubmit || isCreating}
              className='rounded-xl bg-sky-500 hover:bg-sky-400'
            >
              <Save className='h-4 w-4 mr-2' />
              Créer la leçon
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

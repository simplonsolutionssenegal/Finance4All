'use client';

import {
  Clock,
  Check,
  Save,
  Plus,
  Trash2,
  Upload,
  X,
  SquareCheckBig,
  LayoutList,
} from 'lucide-react';
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
import { useDeleteMedia } from '@/hooks/media/useDeleteMedia';
import { useUploadMedia } from '@/hooks/media/useUploadMedia';
import { LessonStatus, type ChapterDto } from '@/types/modules/Lesson';

import QuizFormDialog, { type QuizDraft } from './quiz-form-dialog';
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
  title: string;
  description: string;

  // rempli automatiquement après upload
  mediaId: string;
  uploadedName?: string | null;
  uploading?: boolean;
  uploadError?: string | null;
  deleting?: boolean;
  deleteError?: string | null;
  noMedia?: boolean;
  quizzes: QuizDraft[];
};

function statusLabel(v: LessonStatus) {
  return v === LessonStatus.DRAFT
    ? 'Brouillon'
    : v === LessonStatus.PUBLISHED
      ? 'Publié'
      : v === LessonStatus.SCHEDULED
        ? 'Programmé'
        : v === LessonStatus.ARCHIVED
          ? 'Archivé'
          : v;
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
  const [openChapterIndex, setOpenChapterIndex] = useState<number>(-1);

  const [chapters, setChapters] = useState<ChapterForm[]>([]);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // ✅ Quiz fin de leçon (payload.quizzes)
  const [lessonQuizzes, setLessonQuizzes] = useState<QuizDraft[]>([]);
  const [lessonQuizOpen, setLessonQuizOpen] = useState(false);

  // ✅ Quiz chapitre
  const [chapterQuizOpen, setChapterQuizOpen] = useState(false);
  const [targetChapterIdx, setTargetChapterIdx] = useState<number | null>(null);

  // popup resource picker
  const [resourcePickerOpen, setResourcePickerOpen] = useState(false);
  const [resourceTargetChapterIndex, setResourceTargetChapterIndex] = useState<number | null>(null);

  // file picker
  const [accept, setAccept] = useState<string>('*/*');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // pour savoir sur quel chapitre appliquer l'upload après choix du fichier
  const [pendingUploadChapterIndex, setPendingUploadChapterIndex] = useState<number | null>(null);

  const durationLabel = useMemo(() => `${Math.max(0, Number(duration) || 0)} min`, [duration]);

  const resourcesCount = useMemo(() => {
    return chapters.filter(c => !c.noMedia && !!c.mediaId).length;
  }, [chapters]);

  const { createLesson, isCreating } = useCreateLesson({
    onSuccess: () => {
      onOpenChange(false);
      onCreated?.();
    },
  });

  const uploadMedia = useUploadMedia();
  const { deleteMediaAsync } = useDeleteMedia();

  const updateChapter = (index: number, patch: Partial<ChapterForm>) => {
    setChapters(prev => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const addChapter = () => {
    setChapters(prev => [
      ...prev,
      {
        title: '',
        description: '',
        mediaId: '',
        uploadedName: null,
        uploading: false,
        uploadError: null,
        deleting: false,
        deleteError: null,
        noMedia: false,
        quizzes: [],
      },
    ]);
    setOpenChapterIndex(chapters.length);
  };

  const removeChapter = (index: number) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
    if (openChapterIndex === index) setOpenChapterIndex(-1);
    else if (openChapterIndex > index) setOpenChapterIndex(openChapterIndex - 1);
  };

  // validation chapitre: titre+desc + (noMedia OU mediaId) + pas d'upload/suppression en cours
  const isChapterValid = (c: ChapterForm) => {
    const okText = c.title.trim().length > 0 && c.description.trim().length > 0;
    const okBusy = !c.uploading && !c.deleting;
    const okMedia = !!c.noMedia || (!!c.mediaId && c.mediaId.trim().length > 0);
    return okText && okBusy && okMedia;
  };

  const allChaptersValid = chapters.every(isChapterValid);
  const anyBusy = chapters.some(c => !!c.uploading || !!c.deleting);

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
    !anyBusy;

  useEffect(() => {
    if (!open) return;

    setTitle('');
    setDescription('');
    setStatus(LessonStatus.DRAFT);
    setDuration('');
    setOpenChapterIndex(-1);
    setChapterError(null);

    // reset quizzes
    setLessonQuizzes([]);
    setLessonQuizOpen(false);
    setChapterQuizOpen(false);
    setTargetChapterIdx(null);

    const init = (initialChapters ?? []).map((c: any) => ({
      title: c?.title ?? '',
      description: c?.description ?? '',
      mediaId: c?.mediaId ?? '',
      uploadedName: null,
      uploading: false,
      uploadError: null,
      deleting: false,
      deleteError: null,
      noMedia: !c?.mediaId,
      quizzes: [],
    }));

    setChapters(init);
    setAccept('*/*');
    setResourceTargetChapterIndex(null);
    setPendingUploadChapterIndex(null);
  }, [open, initialChapters]);

  const handleAddChapter = () => {
    if (!canAddNewChapter) {
      setChapterError("Veuillez compléter les chapitres avant d'en ajouter un nouveau.");
      const firstInvalidIndex = chapters.findIndex(c => !isChapterValid(c));
      if (firstInvalidIndex !== -1) setOpenChapterIndex(firstInvalidIndex);
      return;
    }

    setChapterError(null);
    addChapter();
  };

  // -------------------------
  // MEDIA: delete / replace
  // -------------------------
  const deleteMediaForChapter = async (chapterIndex: number): Promise<boolean> => {
    const mediaId = chapters[chapterIndex]?.mediaId;
    if (!mediaId) return true;

    updateChapter(chapterIndex, { deleting: true, deleteError: null });

    try {
      const res = await deleteMediaAsync({ mediaId });

      // si ton backend renvoie success=false (sans throw)
      if (res?.success !== true) {
        updateChapter(chapterIndex, {
          deleting: false,
          deleteError: res?.message ?? 'Suppression échouée',
        });
        return false;
      }

      updateChapter(chapterIndex, {
        deleting: false,
        deleteError: null,
      });

      return true;
    } catch (e) {
      updateChapter(chapterIndex, {
        deleting: false,
        deleteError: e instanceof Error ? e.message : 'Suppression échouée',
      });
      return false;
    }
  };

  // ✅ Retirer ressource => delete API + reset state chapitre
  const handleRemoveResource = async (chapterIndex: number) => {
    const mediaId = chapters[chapterIndex]?.mediaId;
    if (!mediaId) return;

    const ok = await deleteMediaForChapter(chapterIndex);
    if (!ok) return;

    updateChapter(chapterIndex, {
      mediaId: '',
      uploadedName: null,
      uploadError: null,
      noMedia: true, // chapitre reste "valide" sans média
    });
  };

  // ✅ Remplacer => si mediaId existant => delete API avant d'ouvrir le picker
  const handleReplaceResource = async (chapterIndex: number) => {
    const c = chapters[chapterIndex];
    if (!c) return;

    // delete avant remplacer si on avait un vrai fichier
    if (c.mediaId && !c.noMedia) {
      const ok = await deleteMediaForChapter(chapterIndex);
      if (!ok) return;

      // on vide l'ancien id localement
      updateChapter(chapterIndex, {
        mediaId: '',
        uploadedName: null,
        uploadError: null,
        noMedia: false,
      });
    }

    // ouvrir picker
    setResourceTargetChapterIndex(chapterIndex);
    setResourcePickerOpen(true);
  };

  // -------------------------
  // UPLOAD flow
  // -------------------------
  const onPickResourceKind = (kind: ResourceKind) => {
    setResourcePickerOpen(false);

    const chapterIndex = resourceTargetChapterIndex;
    setResourceTargetChapterIndex(null);

    if (chapterIndex === null) return;

    if (kind === 'PAGE') {
      updateChapter(chapterIndex, {
        noMedia: true,
        mediaId: '',
        uploadedName: 'Page (sans fichier)',
        uploadError: null,
        deleteError: null,
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
    setPendingUploadChapterIndex(chapterIndex);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFilePicked = async (file: File, chapterIndex: number) => {
    updateChapter(chapterIndex, {
      uploading: true,
      uploadError: null,
      deleteError: null,
      noMedia: false,
    });

    try {
      const media = await uploadMedia.mutateAsync({
        file,
        metadata: { moduleId, chapterIndex: chapterIndex.toString() },
      });

      updateChapter(chapterIndex, {
        mediaId: media.id,
        uploadedName: media.originalName ?? file.name,
        uploading: false,
        uploadError: null,
        noMedia: false,
      });
    } catch (e) {
      updateChapter(chapterIndex, {
        uploading: false,
        uploadError: e instanceof Error ? e.message : 'Erreur upload',
      });
    }
  };

  const handleNoMediaChange = async (chapterIndex: number, checked: boolean) => {
    const c = chapters[chapterIndex];
    if (!c) return;

    // si on coche "aucun média" et qu'il y a un mediaId => on supprime côté API pour éviter orphelin
    if (checked && c.mediaId) {
      const ok = await deleteMediaForChapter(chapterIndex);
      if (!ok) return;

      updateChapter(chapterIndex, {
        noMedia: true,
        mediaId: '',
        uploadedName: null,
        uploadError: null,
      });
      return;
    }

    updateChapter(chapterIndex, {
      noMedia: checked,
      mediaId: checked ? '' : c.mediaId,
      uploadedName: checked ? null : (c.uploadedName ?? null),
      uploadError: null,
      deleteError: null,
    });
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
          ...(c.noMedia ? {} : { mediaId: c.mediaId }),
          quizzes: c.quizzes,
        })),

        quizzes: lessonQuizzes,
      } as any,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* hidden file input */}
      <Input
        ref={fileInputRef}
        type='file'
        accept={accept}
        className='hidden'
        onChange={async e => {
          const input = e.currentTarget as HTMLInputElement;
          const file = input.files?.[0];
          if (!file) return;

          const idx = pendingUploadChapterIndex;
          if (idx !== null) {
            await handleFilePicked(file, idx);
          }

          setPendingUploadChapterIndex(null);
          input.value = '';
        }}
      />

      {/* popup picker */}
      <ResourcePickerDialog
        open={resourcePickerOpen}
        onOpenChange={setResourcePickerOpen}
        onPick={onPickResourceKind}
      />

      {/* Quiz dialogs */}
      <QuizFormDialog
        open={lessonQuizOpen}
        onOpenChange={setLessonQuizOpen}
        subtitle='Quiz de fin de leçon'
        submitLabel='Ajouter le quiz'
        onSubmit={quiz => setLessonQuizzes(prev => [...prev, quiz])}
      />

      <QuizFormDialog
        open={chapterQuizOpen}
        onOpenChange={v => {
          setChapterQuizOpen(v);
          if (!v) setTargetChapterIdx(null);
        }}
        subtitle='Quiz de chapitre'
        submitLabel='Ajouter le quiz'
        onSubmit={quiz => {
          if (targetChapterIdx === null) return;
          const current = chapters[targetChapterIdx]?.quizzes ?? [];
          updateChapter(targetChapterIdx, { quizzes: [...current, quiz] });
        }}
      />

      <DialogContent className='rounded-none p-0 overflow-hidden h-[calc(105vh-2rem)] flex flex-col w-[calc(90vw-2rem)] sm:w-[720px] sm:max-w-none md:left-auto md:right-6 md:translate-x-0'>
        {/* Header */}
        <div className='px-6 pt-4 pb-2 border-b border-slate-200 bg-slate-50'>
          <div className='flex items-start justify-between'>
            <div>
              <DialogTitle className='text-lg text-slate-800'>Nouvelle leçon</DialogTitle>
              <p className='mt-0.5 text-sm text-slate-500'>
                {chapters.length} chapitre • {resourcesCount} ressource • {durationLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-6'>
          {/* Informations générales */}
          <div className='space-y-4'>
            <p className='text-sm font-semibold text-slate-900'>Informations générales</p>

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
                className='min-h-[90px] bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
              />
            </div>

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
                  {Object.values(LessonStatus).map(v => (
                    <SelectItem
                      key={v}
                      value={v}
                      className='group relative pl-3 pr-8 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200 text-gray-900'
                    >
                      <span className='block truncate pr-2'>{statusLabel(v)}</span>
                      <Check className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-600 opacity-0 group-data-[state=checked]:opacity-100 pointer-events-none' />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {status === LessonStatus.PUBLISHED && chapters.length === 0 && (
                <p className='text-xs text-orange-600'>Pour publier, ajoute au moins 1 chapitre.</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-semibold text-slate-900'>Contenu de la leçon</p>
              <button
                type='button'
                onClick={handleAddChapter}
                disabled={!canAddNewChapter}
                className='inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium disabled:opacity-50'
              >
                <Plus className='h-4 w-4' />
                Ajouter un chapitre
              </button>
            </div>

            {chapterError && <p className='text-xs text-orange-600'>{chapterError}</p>}

            {chapters.length === 0 ? (
              <div className='rounded-xl border border-slate-200 bg-white p-5 text-center'>
                <div className='mx-auto mb-4 h-8 w-8 rounded-2xl bg-slate-50 flex items-center justify-center'>
                  <LayoutList className='h-8 w-8 text-slate-400' />
                </div>
                <p className='text-sm text-slate-900'>Aucun chapitre</p>
                <p className='mt-1 text-xs text-slate-500'>
                  Commencez par créer un chapitre pour y ajouter des ressources
                </p>

                <button
                  type='button'
                  onClick={handleAddChapter}
                  className='mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
                >
                  Créer le premier chapitre
                </button>
              </div>
            ) : (
              <Accordion
                type='single'
                collapsible
                value={openChapterIndex >= 0 ? openChapterIndex.toString() : ''}
                onValueChange={v => setOpenChapterIndex(v === '' ? -1 : parseInt(v))}
                className='space-y-3'
              >
                {chapters.map((c, idx) => (
                  <AccordionItem
                    key={idx}
                    value={idx.toString()}
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
                        onClick={() => removeChapter(idx)}
                        className='h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center'
                        aria-label='Supprimer le chapitre'
                      >
                        <Trash2 className='h-4 w-4 text-orange-500' />
                      </button>
                    </div>

                    <AccordionContent className='pb-4'>
                      <div className='space-y-4 p-2'>
                        <Input
                          value={c.title}
                          onChange={e => updateChapter(idx, { title: e.target.value })}
                          placeholder='Titre de chapitre'
                          className='bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                        />

                        <Textarea
                          value={c.description}
                          onChange={e => updateChapter(idx, { description: e.target.value })}
                          placeholder='Description de chapitre ...'
                          className='min-h-[70px] bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                        />

                        {/* Ressource */}
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <Label className='text-slate-700 text-sm'>Ressource</Label>

                            <button
                              type='button'
                              onClick={() => handleReplaceResource(idx)}
                              disabled={!!c.uploading || !!c.deleting}
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
                              onChange={e => handleNoMediaChange(idx, e.target.checked)}
                              disabled={!!c.uploading || !!c.deleting}
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

                                {!!c.deleting && (
                                  <p className='text-xs text-slate-500 mt-2'>
                                    Suppression en cours…
                                  </p>
                                )}

                                {!!c.deleteError && (
                                  <p className='text-xs text-red-600 mt-2'>{c.deleteError}</p>
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
                                    onClick={() => handleRemoveResource(idx)}
                                    disabled={!!c.uploading || !!c.deleting}
                                    className='mt-2 inline-flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 disabled:opacity-50'
                                  >
                                    <X className='h-3.5 w-3.5' />
                                    Retirer la ressource
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className='space-y-2 pt-2'>
                          <div className='flex items-center justify-between'>
                            <Label className='text-slate-700 text-sm'>Quiz du chapitre</Label>

                            <button
                              type='button'
                              onClick={() => {
                                setTargetChapterIdx(idx);
                                setChapterQuizOpen(true);
                              }}
                              className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50'
                            >
                              <Plus className='h-4 w-4' />
                              Ajouter un quiz
                            </button>
                          </div>

                          {c.quizzes.length === 0 ? (
                            <p className='text-xs text-slate-500'>Aucun quiz pour ce chapitre.</p>
                          ) : (
                            <div className='space-y-2'>
                              {c.quizzes.map((qz, qi) => (
                                <div
                                  key={qi}
                                  className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'
                                >
                                  <div className='flex items-start justify-between gap-3'>
                                    <div className='min-w-0'>
                                      <p className='text-sm font-medium text-slate-900 truncate'>
                                        {qz.title}
                                      </p>
                                      <p className='text-xs text-slate-500'>
                                        {qz.questions?.length ?? 0} question(s) • score min{' '}
                                        {qz.scoreMinimum}%
                                      </p>
                                    </div>

                                    <button
                                      type='button'
                                      onClick={() =>
                                        updateChapter(idx, {
                                          quizzes: c.quizzes.filter((_, x) => x !== qi),
                                        })
                                      }
                                      className='h-8 w-8 rounded-lg hover:bg-slate-200 flex items-center justify-center'
                                      aria-label='Supprimer le quiz du chapitre'
                                    >
                                      <Trash2 className='h-4 w-4 text-slate-600' />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {!allChaptersValid && chapters.length > 0 && (
              <p className='text-xs text-orange-600'>
                Chaque chapitre doit avoir un titre + description, et une ressource uploadée OU
                &quot;Aucun média&quot;.
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-semibold text-slate-900'>Quiz de fin de leçon</p>

            {lessonQuizzes.length === 0 ? (
              <div className='rounded-xl border border-slate-200 bg-white p-5 text-center'>
                <div className='mx-auto mb-4 h-8 w-8 rounded-2xl bg-slate-50 flex items-center justify-center'>
                  <SquareCheckBig className='h-8 w-8 text-slate-400' />
                </div>

                <p className='text-sm text-slate-700'>
                  Ajoutez un quiz pour valider les acquis de cette leçon
                </p>

                <button
                  type='button'
                  onClick={() => setLessonQuizOpen(true)}
                  className='mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium'
                >
                  <Plus className='h-4 w-4' />
                  Ajouter un quiz
                </button>
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='flex justify-end'>
                  <button
                    type='button'
                    onClick={() => setLessonQuizOpen(true)}
                    className='inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium'
                  >
                    <Plus className='h-4 w-4' />
                    Ajouter un quiz
                  </button>
                </div>

                {lessonQuizzes.map((q, i) => (
                  <div key={i} className='rounded-xl border border-slate-200 bg-white px-4 py-3'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <p className='text-sm font-semibold text-slate-900 truncate'>{q.title}</p>
                        <p className='text-xs text-slate-500 mt-1'>
                          {q.questions?.length ?? 0} question(s) • score min {q.scoreMinimum}% •
                          tentatives {q.nombreTentatives}
                        </p>
                      </div>

                      <button
                        type='button'
                        onClick={() => setLessonQuizzes(prev => prev.filter((_, idx) => idx !== i))}
                        className='h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center'
                        aria-label='Supprimer le quiz'
                      >
                        <Trash2 className='h-4 w-4 text-slate-600' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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

        {/* Footer */}
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
              disabled={isCreating}
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

'use client';

import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PdfViewerProps = {
  url: string;
  title: string;
  progress?: { currentPosition?: number | null; duration?: number | null } | null;
  updateProgress: (currentPosition: number, duration: number) => void | Promise<void>;
};

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;
const SCALE_STEP = 0.1;

export default function PdfViewer({ url, title, progress, updateProgress }: PdfViewerProps) {
  type PdfRenderTask = { promise: Promise<void>; cancel?: () => void };
  type PdfPage = {
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => PdfRenderTask;
  };
  type PdfDocument = {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PdfPage>;
    destroy?: () => Promise<void> | void;
  };
  type PdfLoadingTask = { promise: Promise<PdfDocument>; destroy?: () => void };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfRef = useRef<PdfDocument | null>(null);
  const loadingTaskRef = useRef<PdfLoadingTask | null>(null);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);
  const hasAppliedProgress = useRef(false);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setErrorMessage(null);
    setNumPages(null);
    setPageNumber(1);
    setScale(1);
    hasAppliedProgress.current = false;

    const load = async () => {
      try {
        const pdfModuleUrl = '/pdfjs/pdf.mjs';
        const pdfjs = await import(/* webpackIgnore: true */ pdfModuleUrl);
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

        const loadingTask = pdfjs.getDocument({ url });
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        if (cancelled) {
          if (doc?.destroy) await doc.destroy();
          return;
        }
        pdfRef.current = doc;
        setNumPages(doc.numPages ?? null);
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Erreur de chargement PDF');
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (renderTaskRef.current?.cancel) {
        renderTaskRef.current.cancel();
      }
      if (loadingTaskRef.current?.destroy) {
        loadingTaskRef.current.destroy();
      }
      if (pdfRef.current?.destroy) {
        pdfRef.current.destroy();
      }
      pdfRef.current = null;
      loadingTaskRef.current = null;
      renderTaskRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (!numPages || hasAppliedProgress.current) return;
    const savedPage = Math.round(progress?.currentPosition ?? 1);
    const clamped = Math.min(Math.max(savedPage, 1), numPages);
    setPageNumber(clamped);
    hasAppliedProgress.current = true;
  }, [numPages, progress]);

  useEffect(() => {
    if (!numPages) return;
    updateProgress(pageNumber, numPages);
  }, [pageNumber, numPages, updateProgress]);

  const renderPage = useCallback(async () => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (renderTaskRef.current?.cancel) {
        renderTaskRef.current.cancel();
      }
      const renderTask = page.render({ canvasContext: context, viewport });
      renderTaskRef.current = renderTask;
      try {
        await renderTask.promise;
      } catch (error) {
        const isCanceled = error instanceof Error && error.name === 'RenderingCancelledException';
        if (!isCanceled) {
          throw error;
        }
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur de rendu PDF');
    }
  }, [pageNumber, scale]);

  useEffect(() => {
    if (status !== 'ready') return;
    void renderPage();
  }, [renderPage, status]);

  const canGoPrev = pageNumber > 1;
  const canGoNext = numPages ? pageNumber < numPages : false;
  const zoomLabel = useMemo(() => `${Math.round(scale * 100)}%`, [scale]);

  if (status === 'error') {
    return (
      <div className='rounded-2xl bg-white p-6 text-center text-sm text-grey-600'>
        Impossible de charger le PDF.
        {errorMessage ? <p className='mt-2 text-xs text-grey-400'>{errorMessage}</p> : null}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/90 px-4 py-2 text-xs text-grey-700 shadow-sm'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
            disabled={!canGoPrev}
            className='inline-flex items-center gap-1 rounded-full border border-grey-200 bg-white px-3 py-1 text-xs text-grey-700 disabled:opacity-50'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Précédent
          </button>
          <button
            type='button'
            onClick={() => setPageNumber(prev => (numPages ? Math.min(numPages, prev + 1) : prev))}
            disabled={!canGoNext}
            className='inline-flex items-center gap-1 rounded-full border border-grey-200 bg-white px-3 py-1 text-xs text-grey-700 disabled:opacity-50'
          >
            Suivant
            <ArrowRight className='h-3.5 w-3.5' />
          </button>
          <span className='text-xs text-grey-600'>
            Page {pageNumber}
            {numPages ? ` / ${numPages}` : ''}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() =>
              setScale(prev => Math.max(MIN_SCALE, Number((prev - SCALE_STEP).toFixed(2))))
            }
            className='inline-flex items-center gap-1 rounded-full border border-grey-200 bg-white px-2 py-1 text-xs text-grey-700'
          >
            <ZoomOut className='h-3.5 w-3.5' />
          </button>
          <span className='text-xs text-grey-600'>{zoomLabel}</span>
          <button
            type='button'
            onClick={() =>
              setScale(prev => Math.min(MAX_SCALE, Number((prev + SCALE_STEP).toFixed(2))))
            }
            className='inline-flex items-center gap-1 rounded-full border border-grey-200 bg-white px-2 py-1 text-xs text-grey-700'
          >
            <ZoomIn className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>

      <div className='max-h-[70vh] overflow-auto rounded-2xl bg-white p-3 shadow-sm'>
        {status === 'loading' && (
          <div className='py-10 text-center text-sm text-grey-500'>Chargement du PDF...</div>
        )}
        <canvas ref={canvasRef} className='mx-auto block h-auto max-w-full' />
        <p className='mt-3 text-xs text-grey-500'>{title}</p>
      </div>
    </div>
  );
}

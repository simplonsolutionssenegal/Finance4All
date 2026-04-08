'use client';

import Hls from 'hls.js';
import { FileAudio, FileImage, FileText, Film } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type JSX, type RefObject } from 'react';

import PdfViewer from '@/components/learning/PdfViewer';
import { useGetMediaById } from '@/hooks/media/useGetMediaById';
import { useGetMediaStream } from '@/hooks/media/useGetMediaStream';
import { useMediaProgress } from '@/hooks/media/useMediaProgress';
import { useStartMediaTranscoding } from '@/hooks/media/useStartMediaTranscoding';
import type { MediaDTO, MediaType } from '@/types/media';

const typeLabels: Record<MediaType, string> = {
  VIDEO: 'Vidéo',
  AUDIO: 'Audio',
  PDF: 'Document',
  IMAGE: 'Image',
};

const typeIcons: Record<MediaType, JSX.Element> = {
  VIDEO: <Film className='h-5 w-5 text-grey-200' />,
  AUDIO: <FileAudio className='h-5 w-5 text-grey-200' />,
  PDF: <FileText className='h-5 w-5 text-grey-200' />,
  IMAGE: <FileImage className='h-5 w-5 text-grey-200' />,
};

const PROGRESS_INTERVAL_MS = 5000;
const MIN_PROGRESS_DELTA = 1;

function MediaFrame({
  media,
  mediaRef,
  fallbackSrc,
  pdfProgress,
  onPdfProgress,
  onLoadedMetadata,
  onTimeUpdate,
  onPause,
  onEnded,
}: {
  media: MediaDTO;
  mediaRef: RefObject<HTMLMediaElement>;
  fallbackSrc?: string;
  pdfProgress?: { currentPosition?: number | null; duration?: number | null } | null;
  onPdfProgress?: (currentPosition: number, duration: number) => void | Promise<void>;
  onLoadedMetadata?: () => void;
  onTimeUpdate?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}) {
  switch (media.type) {
    case 'VIDEO':
      return (
        <video
          ref={mediaRef as RefObject<HTMLVideoElement>}
          controls
          className='h-full w-full object-cover'
          src={fallbackSrc}
          preload='metadata'
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPause={onPause}
          onEnded={onEnded}
        />
      );
    case 'AUDIO':
      return (
        <div className='flex h-full w-full flex-col items-center justify-center gap-4 bg-grey-900 px-6 py-8'>
          <div className='flex items-center gap-2 text-sm text-grey-200'>
            {typeIcons.AUDIO}
            <span>{media.originalName || 'Audio'}</span>
          </div>
          <audio
            ref={mediaRef as RefObject<HTMLAudioElement>}
            controls
            className='w-full max-w-xl'
            src={fallbackSrc}
            preload='metadata'
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            onPause={onPause}
            onEnded={onEnded}
          />
        </div>
      );
    case 'PDF':
      return (
        <PdfViewer
          url={media.url}
          title={media.originalName || 'Document PDF'}
          progress={pdfProgress}
          updateProgress={onPdfProgress ?? (() => undefined)}
        />
      );
    case 'IMAGE':
      return (
        <div className='relative h-full w-full'>
          <Image
            src={media.url}
            alt={media.originalName || 'Image'}
            fill
            sizes='(max-width: 768px) 100vw, 720px'
            className='object-contain'
            unoptimized
          />
        </div>
      );
    default:
      return null;
  }
}

export default function ChapterMedia({ mediaId }: { mediaId?: string | null }) {
  const { media, isLoading, isError } = useGetMediaById(mediaId ?? '');
  const { progress, updateProgress } = useMediaProgress(mediaId);
  const { startTranscoding, isStarting } = useStartMediaTranscoding();

  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [mediaDuration, setMediaDuration] = useState<number | null>(null);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const hasSeekedRef = useRef(false);
  const hasRequestedTranscodingRef = useRef(false);
  const lastSentAtRef = useRef(0);
  const lastPositionRef = useRef(0);

  const isPlayable = media?.type === 'VIDEO' || media?.type === 'AUDIO';
  const {
    stream,
    error: streamErrorDetails,
    refetch: refetchStream,
  } = useGetMediaStream(mediaId, { enabled: isPlayable });
  const streamUrl = stream?.masterPlaylistUrl;
  const streamErrorMessage = streamErrorDetails instanceof Error ? streamErrorDetails.message : '';
  const needsTranscoding = streamErrorMessage.includes('No transcoding job found');
  const streamNotReady = streamErrorMessage.includes('Stream not ready');
  const transcodingInProgress = streamErrorMessage.includes('Transcoding already in progress');
  const isTranscodingFlow =
    needsTranscoding || streamNotReady || transcodingInProgress || isStarting;
  const fallbackSrc = isPlayable && !streamUrl ? media?.url : undefined;

  useEffect(() => {
    hasSeekedRef.current = false;
    hasRequestedTranscodingRef.current = false;
    lastSentAtRef.current = 0;
    lastPositionRef.current = 0;
    setMediaDuration(null);
    setIsMetadataLoaded(false);
  }, [mediaId]);

  useEffect(() => {
    if (!isPlayable || !needsTranscoding || !mediaId) return;
    if (hasRequestedTranscodingRef.current) return;
    hasRequestedTranscodingRef.current = true;
    startTranscoding(mediaId).catch(() => {
      hasRequestedTranscodingRef.current = false;
    });
  }, [isPlayable, needsTranscoding, mediaId, startTranscoding]);

  useEffect(() => {
    if (!isPlayable) return;
    if (streamUrl) return;
    if (!isTranscodingFlow) return;

    const interval = setInterval(() => {
      refetchStream();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlayable, isTranscodingFlow, streamUrl, refetchStream]);

  useEffect(() => {
    if (!isPlayable) return;
    const mediaEl = mediaRef.current;
    if (!mediaEl || !streamUrl) return;

    // HLS will replace the video source; reset seek flag so we re-seek after
    hasSeekedRef.current = false;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(mediaEl);
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (mediaEl.canPlayType('application/vnd.apple.mpegurl')) {
      mediaEl.src = streamUrl;
      mediaEl.load();
    }

    return () => {
      if (mediaEl.src === streamUrl) {
        mediaEl.removeAttribute('src');
      }
    };
  }, [isPlayable, streamUrl]);

  const handleLoadedMetadata = useCallback(() => {
    setIsMetadataLoaded(true);
    const duration = mediaRef.current?.duration;
    if (duration != null && Number.isFinite(duration)) {
      setMediaDuration(duration);
    }
  }, []);

  const sendProgress = useCallback(
    (force = false) => {
      if (!isPlayable) return;
      const mediaEl = mediaRef.current;
      if (!mediaEl) return;
      const now = Date.now();
      if (!force && now - lastSentAtRef.current < PROGRESS_INTERVAL_MS) return;

      const currentPosition = mediaEl.currentTime ?? 0;
      if (!force && Math.abs(currentPosition - lastPositionRef.current) < MIN_PROGRESS_DELTA) {
        return;
      }

      const duration = Number.isFinite(mediaEl.duration) ? mediaEl.duration : (mediaDuration ?? 0);

      lastSentAtRef.current = now;
      lastPositionRef.current = currentPosition;
      updateProgress(currentPosition, duration);
    },
    [isPlayable, mediaDuration, updateProgress]
  );

  const handleTimeUpdate = useCallback(() => {
    sendProgress(false);
  }, [sendProgress]);

  const handlePause = useCallback(() => {
    sendProgress(true);
  }, [sendProgress]);

  const handleEnded = useCallback(() => {
    sendProgress(true);
  }, [sendProgress]);

  useEffect(() => {
    if (!isPlayable || !isMetadataLoaded || !progress) return;
    if (hasSeekedRef.current) return;
    const mediaEl = mediaRef.current;
    if (!mediaEl) return;

    const savedPosition = progress.currentPosition ?? 0;
    if (savedPosition > 0) {
      const duration = Number.isFinite(mediaEl.duration)
        ? mediaEl.duration
        : (mediaDuration ?? savedPosition);
      mediaEl.currentTime = Math.min(savedPosition, duration);
    }
    hasSeekedRef.current = true;
  }, [isPlayable, isMetadataLoaded, progress, mediaDuration]);

  useEffect(() => {
    return () => {
      sendProgress(true);
    };
  }, [sendProgress]);

  if (!mediaId) {
    return (
      <div className='relative overflow-hidden rounded-3xl bg-grey-900'>
        <div className='flex h-full min-h-[260px] w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-grey-800 to-grey-900 px-6 py-10 text-center text-sm text-grey-200'>
          <Film className='h-6 w-6 text-grey-300' />
          <p>Aucun média associé à ce chapitre.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='relative overflow-hidden rounded-3xl bg-grey-900'>
        <div className='h-full min-h-[260px] w-full animate-pulse bg-gradient-to-br from-grey-800 to-grey-900' />
      </div>
    );
  }

  if (isError || !media) {
    return (
      <div className='relative overflow-hidden rounded-3xl bg-grey-900'>
        <div className='flex h-full min-h-[260px] w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-grey-800 to-grey-900 px-6 py-10 text-center text-sm text-grey-200'>
          <Film className='h-6 w-6 text-grey-300' />
          <p>Impossible de charger le média.</p>
        </div>
      </div>
    );
  }

  const isPdf = media.type === 'PDF';
  const mediaContainerClass = isPdf ? 'relative w-full' : 'relative aspect-[16/9] w-full';

  return (
    <div className='relative overflow-hidden rounded-3xl bg-grey-900'>
      <div className='absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white'>
        {typeIcons[media.type]}
        <span>{typeLabels[media.type]}</span>
      </div>
      <div className={mediaContainerClass}>
        <MediaFrame
          media={media}
          mediaRef={mediaRef as RefObject<HTMLMediaElement>}
          fallbackSrc={fallbackSrc}
          pdfProgress={progress}
          onPdfProgress={updateProgress}
          onLoadedMetadata={isPlayable ? handleLoadedMetadata : undefined}
          onTimeUpdate={isPlayable ? handleTimeUpdate : undefined}
          onPause={isPlayable ? handlePause : undefined}
          onEnded={isPlayable ? handleEnded : undefined}
        />
      </div>
    </div>
  );
}

/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import ChapterMedia from '@/components/learning/ChapterMedia';
import type { MediaDTO } from '@/types/media';

jest.mock('hls.js', () => {
  const loadSource = jest.fn();
  const attachMedia = jest.fn();
  const destroy = jest.fn();
  const isSupported = jest.fn(() => true);

  class MockHls {
    loadSource = loadSource;
    attachMedia = attachMedia;
    destroy = destroy;
    static isSupported = isSupported;
  }

  return {
    __esModule: true,
    default: MockHls,
    __mocks: {
      loadSource,
      attachMedia,
      destroy,
      isSupported,
    },
  };
});

const hlsMocks = (
  jest.requireMock('hls.js') as {
    __mocks: {
      loadSource: jest.Mock;
      attachMedia: jest.Mock;
      destroy: jest.Mock;
      isSupported: jest.Mock;
    };
  }
).__mocks;

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    fill: _fill,
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
  }) => <img {...props} />,
}));

jest.mock('@/hooks/media/useGetMediaById', () => ({
  useGetMediaById: jest.fn(),
}));

jest.mock('@/hooks/media/useGetMediaStream', () => ({
  useGetMediaStream: jest.fn(),
}));

jest.mock('@/hooks/media/useMediaProgress', () => ({
  useMediaProgress: jest.fn(),
}));

jest.mock('@/hooks/media/useStartMediaTranscoding', () => ({
  useStartMediaTranscoding: jest.fn(),
}));

jest.mock('@/components/learning/PdfViewer', () => ({
  __esModule: true,
  default: ({ url }: { url: string }) => <div data-testid='pdf-viewer' data-url={url} />,
}));

const mockUseGetMediaById = jest.requireMock('@/hooks/media/useGetMediaById')
  .useGetMediaById as jest.Mock;
const mockUseGetMediaStream = jest.requireMock('@/hooks/media/useGetMediaStream')
  .useGetMediaStream as jest.Mock;
const mockUseMediaProgress = jest.requireMock('@/hooks/media/useMediaProgress')
  .useMediaProgress as jest.Mock;
const mockUseStartMediaTranscoding = jest.requireMock('@/hooks/media/useStartMediaTranscoding')
  .useStartMediaTranscoding as jest.Mock;

const makeMedia = (overrides: Partial<MediaDTO>): MediaDTO => ({
  id: 'media-1',
  filename: 'file',
  originalName: 'Media',
  mimeType: 'video/mp4',
  type: 'VIDEO',
  size: 100,
  url: 'https://cdn.test/media-1',
  bucket: 'media',
  path: 'media-1',
  metadata: null,
  isTemporary: false,
  expiresAt: null,
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
  ...overrides,
});

describe('ChapterMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hlsMocks.isSupported.mockReturnValue(true);

    mockUseGetMediaById.mockReturnValue({
      media: makeMedia({}),
      isLoading: false,
      isError: false,
    });
    mockUseMediaProgress.mockReturnValue({
      progress: null,
      updateProgress: jest.fn(),
    });
    mockUseStartMediaTranscoding.mockReturnValue({
      startTranscoding: jest.fn().mockResolvedValue(null),
      isStarting: false,
    });
    mockUseGetMediaStream.mockReturnValue({
      stream: { masterPlaylistUrl: 'https://cdn.test/master.m3u8' },
      error: null,
      refetch: jest.fn(),
    });
  });

  it('affiche un état vide quand mediaId est absent', () => {
    render(<ChapterMedia />);

    expect(screen.getByText(/Aucun/i)).toBeInTheDocument();
  });

  it('affiche le skeleton de chargement', () => {
    mockUseGetMediaById.mockReturnValue({
      media: null,
      isLoading: true,
      isError: false,
    });

    const { container } = render(<ChapterMedia mediaId='media-1' />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('affiche une erreur si le média ne charge pas', () => {
    mockUseGetMediaById.mockReturnValue({
      media: null,
      isLoading: false,
      isError: true,
    });

    render(<ChapterMedia mediaId='media-1' />);
    expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
  });

  it('rend un PDF via PdfViewer', () => {
    mockUseGetMediaById.mockReturnValue({
      media: makeMedia({ type: 'PDF', url: 'https://cdn.test/doc.pdf' }),
      isLoading: false,
      isError: false,
    });

    render(<ChapterMedia mediaId='media-pdf' />);
    expect(screen.getByTestId('pdf-viewer')).toHaveAttribute(
      'data-url',
      'https://cdn.test/doc.pdf'
    );
  });

  it('rend une image', () => {
    mockUseGetMediaById.mockReturnValue({
      media: makeMedia({ type: 'IMAGE', url: 'https://cdn.test/image.png' }),
      isLoading: false,
      isError: false,
    });

    const { container } = render(<ChapterMedia mediaId='media-img' />);
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('rend un audio', () => {
    mockUseGetMediaById.mockReturnValue({
      media: makeMedia({ type: 'AUDIO', url: 'https://cdn.test/audio.mp3' }),
      isLoading: false,
      isError: false,
    });

    const { container } = render(<ChapterMedia mediaId='media-audio' />);
    expect(container.querySelector('audio')).toBeInTheDocument();
  });

  it('lit une vidéo HLS et met à jour la progression', async () => {
    const updateProgress = jest.fn();
    mockUseMediaProgress.mockReturnValue({
      progress: { currentPosition: 20, duration: 120 },
      updateProgress,
    });

    render(<ChapterMedia mediaId='media-video' />);

    const video = document.querySelector('video') as HTMLVideoElement;
    expect(video).toBeInTheDocument();

    Object.defineProperty(video, 'duration', { value: 120, writable: true });
    Object.defineProperty(video, 'currentTime', { value: 0, writable: true });

    fireEvent.loadedMetadata(video);

    await waitFor(() => expect(video.currentTime).toBe(20));

    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(10000);
    video.currentTime = 40;
    fireEvent.pause(video);

    await waitFor(() => expect(updateProgress).toHaveBeenCalledWith(40, 120));
    await waitFor(() =>
      expect(hlsMocks.loadSource).toHaveBeenCalledWith('https://cdn.test/master.m3u8')
    );
    await waitFor(() => expect(hlsMocks.attachMedia).toHaveBeenCalledWith(video));
    nowSpy.mockRestore();
  });

  it('utilise le fallback HLS natif quand Hls.js n’est pas supporté', async () => {
    hlsMocks.isSupported.mockReturnValue(false);

    Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
      value: jest.fn(() => 'probably'),
      configurable: true,
    });
    const loadSpy = jest.fn();
    Object.defineProperty(HTMLMediaElement.prototype, 'load', {
      value: loadSpy,
      configurable: true,
    });

    const { unmount } = render(<ChapterMedia mediaId='media-video' />);
    const video = document.querySelector('video') as HTMLVideoElement;

    await waitFor(() => expect(video.getAttribute('src')).toBe('https://cdn.test/master.m3u8'));
    expect(loadSpy).toHaveBeenCalled();

    unmount();
  });

  it('lance le transcodage et poll le manifest si nécessaire', async () => {
    jest.useFakeTimers();

    const startTranscoding = jest.fn().mockResolvedValue(null);
    const refetch = jest.fn();
    mockUseGetMediaById.mockReturnValue({
      media: makeMedia({ type: 'VIDEO' }),
      isLoading: false,
      isError: false,
    });
    mockUseGetMediaStream.mockReturnValue({
      stream: null,
      error: new Error('No transcoding job found for media'),
      refetch,
    });
    mockUseStartMediaTranscoding.mockReturnValue({
      startTranscoding,
      isStarting: false,
    });

    render(<ChapterMedia mediaId='media-video' />);

    await waitFor(() => expect(startTranscoding).toHaveBeenCalledWith('media-video'));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(refetch).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

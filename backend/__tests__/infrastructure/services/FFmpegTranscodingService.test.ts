import { FFmpegTranscodingService } from '@/infrastructure/services/FFmpegTranscodingService';
import {
  StreamQuality,
  VIDEO_QUALITY_PRESETS,
  AUDIO_QUALITY_PRESETS,
} from '@/domain/streaming/value-objects/StreamQuality';
import { spawn, type ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import { EventEmitter } from 'events';

jest.mock('child_process');
jest.mock('fs/promises');

describe('FFmpegTranscodingService', () => {
  let service: FFmpegTranscodingService;
  let mockSpawn: jest.MockedFunction<typeof spawn>;
  let mockMkdir: jest.MockedFunction<typeof fs.mkdir>;
  let mockReaddir: jest.MockedFunction<typeof fs.readdir>;

  beforeEach(() => {
    service = new FFmpegTranscodingService();
    mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
    mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    mockReaddir = fs.readdir as jest.MockedFunction<typeof fs.readdir>;

    mockMkdir.mockResolvedValue(undefined);
    mockReaddir.mockResolvedValue([
      'segment000.ts',
      'segment001.ts',
      'segment002.ts',
      'playlist.m3u8',
    ] as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockFFmpegProcess = (): ChildProcess & EventEmitter => {
    const process = new EventEmitter() as ChildProcess & EventEmitter;
    const stdout = new EventEmitter();
    const stderr = new EventEmitter();
    process.stdout = stdout as any;
    process.stderr = stderr as any;
    process.kill = jest.fn();
    return process;
  };

  describe('transcode', () => {
    it('should transcode video successfully', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const transcodePromise = service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output',
        mediaId: 'media-123',
        mediaType: 'VIDEO',
        qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
      });

      // Simulate ffmpeg process
      process.nextTick(() => {
        mockProcess.stderr!.emit('data', Buffer.from('Duration: 00:10:00.00'));
        mockProcess.stdout!.emit('data', Buffer.from('out_time_ms=300000000'));
        mockProcess.emit('close', 0);
      });

      const result = await transcodePromise;

      expect(result.success).toBe(true);
      expect(result.mediaId).toBe('media-123');
      expect(result.variants).toHaveLength(1);
      expect(result.variants[0].quality).toBe(StreamQuality.Q720P);
    });

    it('should transcode audio successfully', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const transcodePromise = service.transcode({
        inputPath: '/input/audio.mp3',
        outputDir: '/output',
        mediaId: 'media-456',
        mediaType: 'AUDIO',
        qualities: [AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_MEDIUM]],
      });

      process.nextTick(() => {
        mockProcess.stderr!.emit('data', Buffer.from('Duration: 00:05:00.00'));
        mockProcess.emit('close', 0);
      });

      const result = await transcodePromise;

      expect(result.success).toBe(true);
      expect(result.mediaId).toBe('media-456');
    });

    it('should handle multiple qualities', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const transcodePromise = service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output',
        mediaId: 'media-789',
        mediaType: 'VIDEO',
        qualities: [
          VIDEO_QUALITY_PRESETS[StreamQuality.Q360P],
          VIDEO_QUALITY_PRESETS[StreamQuality.Q720P],
        ],
      });

      // Simulate two transcoding runs
      process.nextTick(() => {
        mockProcess.stderr!.emit('data', Buffer.from('Duration: 00:10:00.00'));
        mockProcess.emit('close', 0);
      });

      setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await transcodePromise;

      expect(result.success).toBe(true);
      expect(result.variants).toHaveLength(2);
    });

    it('should call onProgress callback', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);
      const onProgress = jest.fn();

      const transcodePromise = service.transcode(
        {
          inputPath: '/input/video.mp4',
          outputDir: '/output',
          mediaId: 'media-123',
          mediaType: 'VIDEO',
          qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
        },
        onProgress
      );

      process.nextTick(() => {
        mockProcess.stderr!.emit('data', Buffer.from('Duration: 00:01:00.00'));
        mockProcess.stdout!.emit('data', Buffer.from('out_time_ms=30000000'));
        mockProcess.emit('close', 0);
      });

      await transcodePromise;

      expect(onProgress).toHaveBeenCalled();
    });

    it('should handle transcoding failure', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const transcodePromise = service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output',
        mediaId: 'media-123',
        mediaType: 'VIDEO',
        qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
      });

      process.nextTick(() => {
        mockProcess.stderr!.emit('data', Buffer.from('Error: Invalid input'));
        mockProcess.emit('close', 1);
      });

      const result = await transcodePromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('FFmpeg exited with code 1');
    });

    it('should handle ffmpeg process error', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const transcodePromise = service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output',
        mediaId: 'media-123',
        mediaType: 'VIDEO',
        qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
      });

      process.nextTick(() => {
        mockProcess.emit('error', new Error('FFmpeg not found'));
      });

      const result = await transcodePromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe('FFmpeg not found');
    });

    it('should create output directory', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const transcodePromise = service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output/media-123',
        mediaId: 'media-123',
        mediaType: 'VIDEO',
        qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
      });

      process.nextTick(() => {
        mockProcess.emit('close', 0);
      });

      await transcodePromise;

      expect(mockMkdir).toHaveBeenCalledWith('/output/media-123', { recursive: true });
    });

    it('should count segments correctly', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);
      mockReaddir.mockResolvedValue([
        'segment000.ts',
        'segment001.ts',
        'segment002.ts',
        'segment003.ts',
        'segment004.ts',
        'playlist.m3u8',
      ] as any);

      const transcodePromise = service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output',
        mediaId: 'media-123',
        mediaType: 'VIDEO',
        qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
      });

      process.nextTick(() => {
        mockProcess.emit('close', 0);
      });

      const result = await transcodePromise;

      expect(result.variants[0].segmentCount).toBe(5);
    });
  });

  describe('probe', () => {
    it('should probe video file successfully', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const probePromise = service.probe('/input/video.mp4');

      process.nextTick(() => {
        mockProcess.stdout!.emit(
          'data',
          Buffer.from(
            JSON.stringify({
              format: { duration: '600.5' },
              streams: [
                { codec_type: 'video', width: 1920, height: 1080 },
                { codec_type: 'audio' },
              ],
            })
          )
        );
        mockProcess.emit('close', 0);
      });

      const result = await probePromise;

      expect(result.duration).toBe(600.5);
      expect(result.hasVideo).toBe(true);
      expect(result.hasAudio).toBe(true);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
    });

    it('should probe audio-only file', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const probePromise = service.probe('/input/audio.mp3');

      process.nextTick(() => {
        mockProcess.stdout!.emit(
          'data',
          Buffer.from(
            JSON.stringify({
              format: { duration: '180.0' },
              streams: [{ codec_type: 'audio' }],
            })
          )
        );
        mockProcess.emit('close', 0);
      });

      const result = await probePromise;

      expect(result.duration).toBe(180);
      expect(result.hasVideo).toBe(false);
      expect(result.hasAudio).toBe(true);
      expect(result.width).toBeUndefined();
      expect(result.height).toBeUndefined();
    });

    it('should handle probe failure', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const probePromise = service.probe('/input/invalid.file');

      process.nextTick(() => {
        mockProcess.emit('close', 1);
      });

      await expect(probePromise).rejects.toThrow('ffprobe failed');
    });

    it('should handle invalid JSON output', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const probePromise = service.probe('/input/video.mp4');

      process.nextTick(() => {
        mockProcess.stdout!.emit('data', Buffer.from('invalid json'));
        mockProcess.emit('close', 0);
      });

      await expect(probePromise).rejects.toThrow();
    });

    it('should handle ffprobe process error', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const probePromise = service.probe('/input/video.mp4');

      process.nextTick(() => {
        mockProcess.emit('error', new Error('ffprobe not found'));
      });

      await expect(probePromise).rejects.toThrow('ffprobe not found');
    });

    it('should handle missing format duration', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const probePromise = service.probe('/input/video.mp4');

      process.nextTick(() => {
        mockProcess.stdout!.emit(
          'data',
          Buffer.from(
            JSON.stringify({
              format: {},
              streams: [{ codec_type: 'video', width: 1280, height: 720 }],
            })
          )
        );
        mockProcess.emit('close', 0);
      });

      const result = await probePromise;

      expect(result.duration).toBe(0);
    });

    it('should handle missing streams', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const probePromise = service.probe('/input/video.mp4');

      process.nextTick(() => {
        mockProcess.stdout!.emit(
          'data',
          Buffer.from(
            JSON.stringify({
              format: { duration: '100' },
            })
          )
        );
        mockProcess.emit('close', 0);
      });

      const result = await probePromise;

      expect(result.hasVideo).toBe(false);
      expect(result.hasAudio).toBe(false);
    });
  });

  describe('cancelJob', () => {
    it('should cancel active job', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      // Start a transcoding job
      const transcodePromise = service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output',
        mediaId: 'media-to-cancel',
        mediaType: 'VIDEO',
        qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
      });

      // Give time for the job to start
      await new Promise(resolve => {
        setTimeout(resolve, 10);
      });

      // Cancel the job
      await service.cancelJob('media-to-cancel');

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');

      // Clean up: emit close event to resolve promise
      mockProcess.emit('close', 0);
      await transcodePromise.catch(() => {});
    });

    it('should handle canceling non-existent job', async () => {
      // Should not throw
      await expect(service.cancelJob('non-existent-media')).resolves.not.toThrow();
    });
  });

  describe('buildFFmpegArgs', () => {
    it('should build correct args for video transcoding', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output',
        mediaId: 'media-123',
        mediaType: 'VIDEO',
        qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
      });

      // Wait for spawn to be called
      await new Promise(resolve => {
        setTimeout(resolve, 10);
      });

      const spawnCall = mockSpawn.mock.calls[0];
      expect(spawnCall[0]).toBe('ffmpeg');

      const args = spawnCall[1];
      expect(args).toContain('-i');
      expect(args).toContain('/input/video.mp4');
      expect(args).toContain('-c:v');
      expect(args).toContain('libx264');
      expect(args).toContain('-f');
      expect(args).toContain('hls');

      // Clean up
      mockProcess.emit('close', 0);
    });

    it('should build correct args for audio transcoding', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      service.transcode({
        inputPath: '/input/audio.mp3',
        outputDir: '/output',
        mediaId: 'media-456',
        mediaType: 'AUDIO',
        qualities: [AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_MEDIUM]],
      });

      await new Promise(resolve => {
        setTimeout(resolve, 10);
      });

      const spawnCall = mockSpawn.mock.calls[0];
      const args = spawnCall[1];

      expect(args).toContain('-vn'); // No video
      expect(args).toContain('-c:a');
      expect(args).toContain('aac');

      // Clean up
      mockProcess.emit('close', 0);
    });
  });

  describe('progress calculation', () => {
    it('should calculate progress correctly during transcoding', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);
      const progressUpdates: number[] = [];

      const transcodePromise = service.transcode(
        {
          inputPath: '/input/video.mp4',
          outputDir: '/output',
          mediaId: 'media-123',
          mediaType: 'VIDEO',
          qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
        },
        progress => {
          progressUpdates.push(progress.progress);
        }
      );

      process.nextTick(() => {
        // Total duration: 60 seconds
        mockProcess.stderr!.emit('data', Buffer.from('Duration: 00:01:00.00'));

        // 30 seconds processed = 50%
        mockProcess.stdout!.emit('data', Buffer.from('out_time_ms=30000000'));

        // 60 seconds processed = 100%
        mockProcess.stdout!.emit('data', Buffer.from('out_time_ms=60000000'));

        mockProcess.emit('close', 0);
      });

      await transcodePromise;

      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    it('should handle duration not being detected yet', async () => {
      const mockProcess = createMockFFmpegProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const transcodePromise = service.transcode({
        inputPath: '/input/video.mp4',
        outputDir: '/output',
        mediaId: 'media-123',
        mediaType: 'VIDEO',
        qualities: [VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]],
      });

      process.nextTick(() => {
        // Progress update before duration is known should be handled
        mockProcess.stdout!.emit('data', Buffer.from('out_time_ms=30000000'));
        mockProcess.emit('close', 0);
      });

      const result = await transcodePromise;

      expect(result.success).toBe(true);
    });
  });
});

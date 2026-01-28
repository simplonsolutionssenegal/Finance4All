import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import type {
  TranscodingServicePort,
  TranscodingInput,
  TranscodingProgress,
  TranscodingResult,
  MediaProbeResult,
} from '@/domain/streaming/ports/out/TranscodingServicePort';
import type { QualityPreset } from '@/domain/streaming/value-objects/StreamQuality';

export class FFmpegTranscodingService implements TranscodingServicePort {
  private activeJobs: Map<string, ChildProcess> = new Map();
  private readonly ffmpegPath: string;
  private readonly ffprobePath: string;

  constructor() {
    this.ffmpegPath = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
    this.ffprobePath = process.env.FFPROBE_PATH || '/usr/bin/ffprobe';
  }

  async transcode(
    input: TranscodingInput,
    onProgress?: (progress: TranscodingProgress) => void
  ): Promise<TranscodingResult> {
    const { inputPath, outputDir, mediaId, mediaType, qualities } = input;

    await fs.mkdir(outputDir, { recursive: true });

    const variants: TranscodingResult['variants'] = [];

    try {
      for (let i = 0; i < qualities.length; i++) {
        const preset = qualities[i];

        if (onProgress) {
          onProgress({
            mediaId,
            progress: (i / qualities.length) * 100,
            currentQuality: preset.quality,
          });
        }

        // eslint-disable-next-line no-await-in-loop -- Sequential transcoding to avoid CPU/memory exhaustion
        const result = await this.transcodeVariant(
          inputPath,
          outputDir,
          mediaId,
          mediaType,
          preset,
          variantProgress => {
            if (onProgress) {
              const overallProgress = ((i + variantProgress / 100) / qualities.length) * 100;
              onProgress({
                mediaId,
                progress: overallProgress,
                currentQuality: preset.quality,
              });
            }
          }
        );

        variants.push(result);
      }

      return {
        mediaId,
        success: true,
        variants,
      };
    } catch (error) {
      console.error('Transcoding failed', { mediaId, error });
      return {
        mediaId,
        success: false,
        variants: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async transcodeVariant(
    inputPath: string,
    outputDir: string,
    mediaId: string,
    mediaType: 'VIDEO' | 'AUDIO',
    preset: QualityPreset,
    onProgress: (progress: number) => void
  ): Promise<TranscodingResult['variants'][0]> {
    const qualityDir = path.join(outputDir, preset.quality.toLowerCase());
    await fs.mkdir(qualityDir, { recursive: true });

    const playlistPath = `${mediaId}/${preset.quality.toLowerCase()}/playlist.m3u8`;
    const segmentPrefix = `${mediaId}/${preset.quality.toLowerCase()}/segment`;
    const segmentPattern = path.join(qualityDir, 'segment%03d.ts');
    const playlistFile = path.join(qualityDir, 'playlist.m3u8');

    const args = this.buildFFmpegArgs(inputPath, playlistFile, segmentPattern, mediaType, preset);

    await this.runFFmpeg(mediaId, args, onProgress);

    const files = await fs.readdir(qualityDir);
    const segmentCount = files.filter(f => f.endsWith('.ts')).length;

    return {
      quality: preset.quality,
      playlistPath,
      segmentPrefix,
      segmentCount,
    };
  }

  private buildFFmpegArgs(
    inputPath: string,
    playlistFile: string,
    segmentPattern: string,
    mediaType: 'VIDEO' | 'AUDIO',
    preset: QualityPreset
  ): string[] {
    const args: string[] = ['-i', inputPath, '-y', '-progress', 'pipe:1'];

    if (mediaType === 'VIDEO' && preset.videoBitrate) {
      args.push(
        '-c:v',
        'libx264',
        '-preset',
        'medium',
        '-b:v',
        `${preset.videoBitrate}k`,
        '-maxrate',
        `${preset.videoBitrate * 1.5}k`,
        '-bufsize',
        `${preset.videoBitrate * 2}k`,
        '-vf',
        `scale=${preset.resolution}:force_original_aspect_ratio=decrease,pad=${preset.resolution}:-1:-1:color=black`,
        '-c:a',
        'aac',
        '-b:a',
        `${preset.audioBitrate}k`,
        '-ar',
        '44100'
      );
    } else {
      args.push('-vn', '-c:a', 'aac', '-b:a', `${preset.audioBitrate}k`, '-ar', '44100');
    }

    args.push(
      '-f',
      'hls',
      '-hls_time',
      '10',
      '-hls_list_size',
      '0',
      '-hls_segment_filename',
      segmentPattern,
      '-hls_playlist_type',
      'vod',
      playlistFile
    );

    return args;
  }

  private runFFmpeg(
    mediaId: string,
    args: string[],
    onProgress: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath, args);
      this.activeJobs.set(mediaId, ffmpeg);

      let duration = 0;
      let stderrOutput = '';

      ffmpeg.stderr.on('data', (data: Buffer) => {
        const output = data.toString();
        stderrOutput += output;

        const durationMatch = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
        if (durationMatch) {
          duration =
            parseInt(durationMatch[1]) * 3600 +
            parseInt(durationMatch[2]) * 60 +
            parseFloat(durationMatch[3]);
        }
      });

      ffmpeg.stdout.on('data', (data: Buffer) => {
        const output = data.toString();

        const timeMatch = output.match(/out_time_ms=(\d+)/);
        if (timeMatch && duration > 0) {
          const currentTime = parseInt(timeMatch[1]) / 1000000;
          const progress = Math.min(100, (currentTime / duration) * 100);
          onProgress(progress);
        }
      });

      ffmpeg.on('close', code => {
        this.activeJobs.delete(mediaId);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderrOutput.slice(-500)}`));
        }
      });

      ffmpeg.on('error', error => {
        this.activeJobs.delete(mediaId);
        reject(error);
      });
    });
  }

  async probe(inputPath: string): Promise<MediaProbeResult> {
    return new Promise((resolve, reject) => {
      const args = [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        inputPath,
      ];

      const ffprobe = spawn(this.ffprobePath, args);
      let output = '';

      ffprobe.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      ffprobe.on('close', code => {
        if (code !== 0) {
          reject(new Error('ffprobe failed'));
          return;
        }

        try {
          const data = JSON.parse(output);
          const videoStream = data.streams?.find(
            (s: { codec_type: string }) => s.codec_type === 'video'
          );
          const audioStream = data.streams?.find(
            (s: { codec_type: string }) => s.codec_type === 'audio'
          );

          resolve({
            duration: parseFloat(data.format?.duration || '0'),
            hasVideo: !!videoStream,
            hasAudio: !!audioStream,
            width: videoStream?.width,
            height: videoStream?.height,
          });
        } catch (error) {
          reject(error);
        }
      });

      ffprobe.on('error', reject);
    });
  }

  async cancelJob(mediaId: string): Promise<void> {
    const process = this.activeJobs.get(mediaId);
    if (process) {
      process.kill('SIGTERM');
      this.activeJobs.delete(mediaId);
    }
  }
}

import { HlsVariant } from '@/domain/streaming/entities/HlsVariant';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';

describe('HlsVariant', () => {
  const mediaId = 'media-123';
  const quality = StreamQuality.Q720P;
  const bandwidth = 2928000;
  const resolution = '1280x720';
  const codecs = 'avc1.4d001f,mp4a.40.2';
  const playlistPath = '/streams/media-123/720p/playlist.m3u8';
  const segmentPrefix = 'segment';
  const segmentDuration = 10.0;

  describe('create', () => {
    it('should create a new HLS variant with all properties', () => {
      const variant = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix,
        segmentDuration
      );

      expect(variant).toBeDefined();
      expect(variant.mediaId).toBe(mediaId);
      expect(variant.quality).toBe(quality);
      expect(variant.bandwidth).toBe(bandwidth);
      expect(variant.resolution).toBe(resolution);
      expect(variant.codecs).toBe(codecs);
      expect(variant.playlistPath).toBe(playlistPath);
      expect(variant.segmentPrefix).toBe(segmentPrefix);
      expect(variant.segmentDuration).toBe(segmentDuration);
      expect(variant.segmentCount).toBe(0);
    });

    it('should create variant with default segment duration', () => {
      const variant = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix
      );

      expect(variant.segmentDuration).toBe(10.0);
    });

    it('should create variant with null resolution (audio only)', () => {
      const audioVariant = HlsVariant.create(
        mediaId,
        StreamQuality.AUDIO_MEDIUM,
        128000,
        null,
        'mp4a.40.2',
        playlistPath,
        segmentPrefix
      );

      expect(audioVariant.resolution).toBeNull();
    });

    it('should generate unique IDs for variants', () => {
      const variant1 = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix
      );
      const variant2 = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix
      );

      expect(variant1.id.getValue()).not.toBe(variant2.id.getValue());
    });
  });

  describe('fromPersistence', () => {
    it('should restore HLS variant from persisted data', () => {
      const persistedData = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        mediaId: 'media-456',
        quality: StreamQuality.Q1080P,
        bandwidth: 5192000,
        resolution: '1920x1080',
        codecs: 'avc1.640028,mp4a.40.2',
        playlistPath: '/streams/media-456/1080p/playlist.m3u8',
        segmentPrefix: 'seg',
        segmentCount: 120,
        segmentDuration: 6.0,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      const variant = HlsVariant.fromPersistence(persistedData);

      expect(variant.id.getValue()).toBe(persistedData.id);
      expect(variant.mediaId).toBe(persistedData.mediaId);
      expect(variant.quality).toBe(persistedData.quality);
      expect(variant.bandwidth).toBe(persistedData.bandwidth);
      expect(variant.resolution).toBe(persistedData.resolution);
      expect(variant.codecs).toBe(persistedData.codecs);
      expect(variant.playlistPath).toBe(persistedData.playlistPath);
      expect(variant.segmentPrefix).toBe(persistedData.segmentPrefix);
      expect(variant.segmentCount).toBe(persistedData.segmentCount);
      expect(variant.segmentDuration).toBe(persistedData.segmentDuration);
    });

    it('should restore variant with null resolution', () => {
      const persistedData = {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        mediaId: 'media-audio',
        quality: StreamQuality.AUDIO_HIGH,
        bandwidth: 256000,
        resolution: null,
        codecs: 'mp4a.40.2',
        playlistPath: '/streams/media-audio/high/playlist.m3u8',
        segmentPrefix: 'segment',
        segmentCount: 60,
        segmentDuration: 10.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const variant = HlsVariant.fromPersistence(persistedData);

      expect(variant.resolution).toBeNull();
    });
  });

  describe('updateSegmentCount', () => {
    it('should update segment count', () => {
      const variant = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix
      );

      variant.updateSegmentCount(100);

      expect(variant.segmentCount).toBe(100);
    });

    it('should update updatedAt timestamp', () => {
      const variant = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix
      );
      const beforeUpdate = variant.updatedAt;

      variant.updateSegmentCount(50);

      expect(variant.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('should allow setting segment count to zero', () => {
      const variant = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix
      );
      variant.updateSegmentCount(100);

      variant.updateSegmentCount(0);

      expect(variant.segmentCount).toBe(0);
    });
  });

  describe('toDTO', () => {
    it('should convert variant to DTO with playlist URL', () => {
      const variant = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix
      );
      const baseStreamUrl = 'https://stream.example.com/api/v1/media/media-123/stream';

      const dto = variant.toDTO(baseStreamUrl);

      expect(dto).toMatchObject({
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
      });
      expect(dto.id).toBeDefined();
      expect(dto.playlistUrl).toBe(`${baseStreamUrl}/q720p/playlist.m3u8`);
    });

    it('should convert audio variant to DTO', () => {
      const audioVariant = HlsVariant.create(
        mediaId,
        StreamQuality.AUDIO_MEDIUM,
        128000,
        null,
        'mp4a.40.2',
        playlistPath,
        segmentPrefix
      );
      const baseStreamUrl = 'https://stream.example.com';

      const dto = audioVariant.toDTO(baseStreamUrl);

      expect(dto.resolution).toBeNull();
      expect(dto.playlistUrl).toBe(`${baseStreamUrl}/audio_medium/playlist.m3u8`);
    });

    it('should generate correct playlist URL for different qualities', () => {
      const qualities = [
        { quality: StreamQuality.Q360P, expected: 'q360p' },
        { quality: StreamQuality.Q480P, expected: 'q480p' },
        { quality: StreamQuality.Q720P, expected: 'q720p' },
        { quality: StreamQuality.Q1080P, expected: 'q1080p' },
        { quality: StreamQuality.AUDIO_LOW, expected: 'audio_low' },
        { quality: StreamQuality.AUDIO_MEDIUM, expected: 'audio_medium' },
        { quality: StreamQuality.AUDIO_HIGH, expected: 'audio_high' },
      ];

      const baseUrl = 'https://example.com';

      for (const { quality: q, expected } of qualities) {
        const variant = HlsVariant.create(
          mediaId,
          q,
          bandwidth,
          resolution,
          codecs,
          playlistPath,
          segmentPrefix
        );

        const dto = variant.toDTO(baseUrl);

        expect(dto.playlistUrl).toBe(`${baseUrl}/${expected}/playlist.m3u8`);
      }
    });
  });

  describe('getters', () => {
    let variant: HlsVariant;

    beforeEach(() => {
      variant = HlsVariant.create(
        mediaId,
        quality,
        bandwidth,
        resolution,
        codecs,
        playlistPath,
        segmentPrefix,
        segmentDuration
      );
    });

    it('should return correct mediaId', () => {
      expect(variant.mediaId).toBe(mediaId);
    });

    it('should return correct quality', () => {
      expect(variant.quality).toBe(quality);
    });

    it('should return correct bandwidth', () => {
      expect(variant.bandwidth).toBe(bandwidth);
    });

    it('should return correct resolution', () => {
      expect(variant.resolution).toBe(resolution);
    });

    it('should return correct codecs', () => {
      expect(variant.codecs).toBe(codecs);
    });

    it('should return correct playlistPath', () => {
      expect(variant.playlistPath).toBe(playlistPath);
    });

    it('should return correct segmentPrefix', () => {
      expect(variant.segmentPrefix).toBe(segmentPrefix);
    });

    it('should return correct segmentCount', () => {
      expect(variant.segmentCount).toBe(0);
    });

    it('should return correct segmentDuration', () => {
      expect(variant.segmentDuration).toBe(segmentDuration);
    });
  });

  describe('different quality presets', () => {
    it('should create 360p variant', () => {
      const variant = HlsVariant.create(
        mediaId,
        StreamQuality.Q360P,
        896000,
        '640x360',
        'avc1.42001f,mp4a.40.2',
        playlistPath,
        segmentPrefix
      );

      expect(variant.quality).toBe(StreamQuality.Q360P);
      expect(variant.resolution).toBe('640x360');
    });

    it('should create 480p variant', () => {
      const variant = HlsVariant.create(
        mediaId,
        StreamQuality.Q480P,
        1528000,
        '854x480',
        'avc1.4d001f,mp4a.40.2',
        playlistPath,
        segmentPrefix
      );

      expect(variant.quality).toBe(StreamQuality.Q480P);
      expect(variant.resolution).toBe('854x480');
    });

    it('should create 1080p variant', () => {
      const variant = HlsVariant.create(
        mediaId,
        StreamQuality.Q1080P,
        5192000,
        '1920x1080',
        'avc1.640028,mp4a.40.2',
        playlistPath,
        segmentPrefix
      );

      expect(variant.quality).toBe(StreamQuality.Q1080P);
      expect(variant.resolution).toBe('1920x1080');
    });

    it('should create audio low variant', () => {
      const variant = HlsVariant.create(
        mediaId,
        StreamQuality.AUDIO_LOW,
        64000,
        null,
        'mp4a.40.2',
        playlistPath,
        segmentPrefix
      );

      expect(variant.quality).toBe(StreamQuality.AUDIO_LOW);
      expect(variant.resolution).toBeNull();
    });

    it('should create audio high variant', () => {
      const variant = HlsVariant.create(
        mediaId,
        StreamQuality.AUDIO_HIGH,
        256000,
        null,
        'mp4a.40.2',
        playlistPath,
        segmentPrefix
      );

      expect(variant.quality).toBe(StreamQuality.AUDIO_HIGH);
      expect(variant.bandwidth).toBe(256000);
    });
  });
});

import { HlsManifestGenerator } from '@/application/streaming/services/HlsManifestGenerator';
import { HlsVariant } from '@/domain/streaming/entities/HlsVariant';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';

describe('HlsManifestGenerator', () => {
  let generator: HlsManifestGenerator;

  beforeEach(() => {
    generator = new HlsManifestGenerator();
  });

  describe('generateMasterPlaylist', () => {
    const baseUrl = 'https://stream.example.com/media/123';

    it('should generate valid master playlist header', () => {
      const variants = [
        HlsVariant.create(
          'media-123',
          StreamQuality.Q720P,
          2928000,
          '1280x720',
          'avc1.4d001f,mp4a.40.2',
          '/streams/720p/playlist.m3u8',
          'segment'
        ),
      ];

      const manifest = generator.generateMasterPlaylist(variants, baseUrl);

      expect(manifest).toContain('#EXTM3U');
      expect(manifest).toContain('#EXT-X-VERSION:3');
    });

    it('should generate playlist with single variant', () => {
      const variants = [
        HlsVariant.create(
          'media-123',
          StreamQuality.Q720P,
          2928000,
          '1280x720',
          'avc1.4d001f,mp4a.40.2',
          '/streams/720p/playlist.m3u8',
          'segment'
        ),
      ];

      const manifest = generator.generateMasterPlaylist(variants, baseUrl);

      expect(manifest).toContain('#EXT-X-STREAM-INF:BANDWIDTH=2928000');
      expect(manifest).toContain('RESOLUTION=1280x720');
      expect(manifest).toContain('CODECS="avc1.4d001f,mp4a.40.2"');
      expect(manifest).toContain(`${baseUrl}/q720p/playlist.m3u8`);
    });

    it('should generate playlist with multiple variants sorted by bandwidth', () => {
      const variants = [
        HlsVariant.create(
          'media-123',
          StreamQuality.Q1080P,
          5192000,
          '1920x1080',
          'avc1.640028,mp4a.40.2',
          '/streams/1080p/playlist.m3u8',
          'segment'
        ),
        HlsVariant.create(
          'media-123',
          StreamQuality.Q360P,
          896000,
          '640x360',
          'avc1.42001f,mp4a.40.2',
          '/streams/360p/playlist.m3u8',
          'segment'
        ),
        HlsVariant.create(
          'media-123',
          StreamQuality.Q720P,
          2928000,
          '1280x720',
          'avc1.4d001f,mp4a.40.2',
          '/streams/720p/playlist.m3u8',
          'segment'
        ),
      ];

      const manifest = generator.generateMasterPlaylist(variants, baseUrl);

      // Verify sorted order (lowest bandwidth first)
      const lines = manifest.split('\n');
      const bandwidthIndices = lines.reduce(
        (acc, line, idx) => {
          if (line.includes('BANDWIDTH=896000')) acc.push({ bandwidth: 896000, idx });
          if (line.includes('BANDWIDTH=2928000')) acc.push({ bandwidth: 2928000, idx });
          if (line.includes('BANDWIDTH=5192000')) acc.push({ bandwidth: 5192000, idx });
          return acc;
        },
        [] as { bandwidth: number; idx: number }[]
      );

      expect(bandwidthIndices[0].bandwidth).toBe(896000);
      expect(bandwidthIndices[1].bandwidth).toBe(2928000);
      expect(bandwidthIndices[2].bandwidth).toBe(5192000);
    });

    it('should handle audio-only variant without resolution', () => {
      const variants = [
        HlsVariant.create(
          'media-123',
          StreamQuality.AUDIO_MEDIUM,
          128000,
          null,
          'mp4a.40.2',
          '/streams/audio/playlist.m3u8',
          'segment'
        ),
      ];

      const manifest = generator.generateMasterPlaylist(variants, baseUrl);

      expect(manifest).toContain('#EXT-X-STREAM-INF:BANDWIDTH=128000');
      expect(manifest).not.toContain('RESOLUTION=');
      expect(manifest).toContain('CODECS="mp4a.40.2"');
    });

    it('should generate empty playlist for no variants', () => {
      const manifest = generator.generateMasterPlaylist([], baseUrl);

      expect(manifest).toContain('#EXTM3U');
      expect(manifest).toContain('#EXT-X-VERSION:3');
      expect(manifest).not.toContain('#EXT-X-STREAM-INF');
    });

    it('should use correct playlist URL format', () => {
      const variants = [
        HlsVariant.create(
          'media-123',
          StreamQuality.Q480P,
          1528000,
          '854x480',
          'avc1.4d001f,mp4a.40.2',
          '/streams/480p/playlist.m3u8',
          'segment'
        ),
      ];

      const manifest = generator.generateMasterPlaylist(variants, baseUrl);

      expect(manifest).toContain(`${baseUrl}/q480p/playlist.m3u8`);
    });
  });

  describe('generateVariantPlaylist', () => {
    const segmentBaseUrl = 'https://stream.example.com/media/123/720p';

    it('should generate valid variant playlist header', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        10.0
      );
      variant.updateSegmentCount(5);

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      expect(manifest).toContain('#EXTM3U');
      expect(manifest).toContain('#EXT-X-VERSION:3');
      expect(manifest).toContain('#EXT-X-TARGETDURATION:10');
      expect(manifest).toContain('#EXT-X-MEDIA-SEQUENCE:0');
      expect(manifest).toContain('#EXT-X-PLAYLIST-TYPE:VOD');
    });

    it('should generate correct number of segments', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        10.0
      );
      variant.updateSegmentCount(5);

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      const segmentMatches = manifest.match(/#EXTINF:/g);
      expect(segmentMatches).toHaveLength(5);
    });

    it('should generate segment URLs with correct format', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        10.0
      );
      variant.updateSegmentCount(3);

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      expect(manifest).toContain(`${segmentBaseUrl}/segment000.ts`);
      expect(manifest).toContain(`${segmentBaseUrl}/segment001.ts`);
      expect(manifest).toContain(`${segmentBaseUrl}/segment002.ts`);
    });

    it('should include segment duration with precision', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        9.5
      );
      variant.updateSegmentCount(2);

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      expect(manifest).toContain('#EXTINF:9.500000,');
    });

    it('should end playlist with EXT-X-ENDLIST', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        10.0
      );
      variant.updateSegmentCount(1);

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      expect(manifest).toContain('#EXT-X-ENDLIST');
    });

    it('should generate empty segment list for zero segments', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        10.0
      );

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      expect(manifest).toContain('#EXTM3U');
      expect(manifest).toContain('#EXT-X-ENDLIST');
      expect(manifest).not.toContain('#EXTINF:');
    });

    it('should calculate target duration correctly', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        9.7 // Should round up to 10
      );
      variant.updateSegmentCount(1);

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      expect(manifest).toContain('#EXT-X-TARGETDURATION:10');
    });

    it('should handle large segment counts', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        10.0
      );
      variant.updateSegmentCount(100);

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      expect(manifest).toContain(`${segmentBaseUrl}/segment000.ts`);
      expect(manifest).toContain(`${segmentBaseUrl}/segment050.ts`);
      expect(manifest).toContain(`${segmentBaseUrl}/segment099.ts`);
    });

    it('should pad segment numbers to 3 digits', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        '/streams/720p/playlist.m3u8',
        'segment',
        10.0
      );
      variant.updateSegmentCount(15);

      const manifest = generator.generateVariantPlaylist(variant, segmentBaseUrl);

      expect(manifest).toContain('segment000.ts');
      expect(manifest).toContain('segment009.ts');
      expect(manifest).toContain('segment010.ts');
      expect(manifest).toContain('segment014.ts');
    });
  });

  describe('buildStreamInfLine', () => {
    it('should build correct STREAM-INF line with resolution', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.Q1080P,
        5192000,
        '1920x1080',
        'avc1.640028,mp4a.40.2',
        '/streams/1080p/playlist.m3u8',
        'segment'
      );

      const manifest = generator.generateMasterPlaylist([variant], 'https://example.com');

      expect(manifest).toContain(
        '#EXT-X-STREAM-INF:BANDWIDTH=5192000,RESOLUTION=1920x1080,CODECS="avc1.640028,mp4a.40.2"'
      );
    });

    it('should build STREAM-INF line without resolution for audio', () => {
      const variant = HlsVariant.create(
        'media-123',
        StreamQuality.AUDIO_HIGH,
        256000,
        null,
        'mp4a.40.2',
        '/streams/audio/playlist.m3u8',
        'segment'
      );

      const manifest = generator.generateMasterPlaylist([variant], 'https://example.com');

      expect(manifest).toContain('#EXT-X-STREAM-INF:BANDWIDTH=256000,CODECS="mp4a.40.2"');
      expect(manifest).not.toContain('RESOLUTION=null');
    });
  });

  describe('integration scenarios', () => {
    it('should generate complete valid HLS manifest for video streaming', () => {
      const baseUrl = 'https://cdn.example.com/media/video-123';
      const variants = [
        HlsVariant.create(
          'video-123',
          StreamQuality.Q360P,
          896000,
          '640x360',
          'avc1.42001f,mp4a.40.2',
          '/360p/playlist.m3u8',
          'seg'
        ),
        HlsVariant.create(
          'video-123',
          StreamQuality.Q720P,
          2928000,
          '1280x720',
          'avc1.4d001f,mp4a.40.2',
          '/720p/playlist.m3u8',
          'seg'
        ),
        HlsVariant.create(
          'video-123',
          StreamQuality.Q1080P,
          5192000,
          '1920x1080',
          'avc1.640028,mp4a.40.2',
          '/1080p/playlist.m3u8',
          'seg'
        ),
      ];

      const masterPlaylist = generator.generateMasterPlaylist(variants, baseUrl);

      // Verify valid M3U8 structure
      expect(masterPlaylist.startsWith('#EXTM3U')).toBe(true);
      expect(masterPlaylist).toContain('#EXT-X-VERSION:3');

      // Verify all variants are present
      expect(masterPlaylist).toContain('BANDWIDTH=896000');
      expect(masterPlaylist).toContain('BANDWIDTH=2928000');
      expect(masterPlaylist).toContain('BANDWIDTH=5192000');
    });

    it('should generate complete valid HLS manifest for audio streaming', () => {
      const baseUrl = 'https://cdn.example.com/media/audio-123';
      const variants = [
        HlsVariant.create(
          'audio-123',
          StreamQuality.AUDIO_LOW,
          64000,
          null,
          'mp4a.40.2',
          '/low/playlist.m3u8',
          'seg'
        ),
        HlsVariant.create(
          'audio-123',
          StreamQuality.AUDIO_MEDIUM,
          128000,
          null,
          'mp4a.40.2',
          '/medium/playlist.m3u8',
          'seg'
        ),
        HlsVariant.create(
          'audio-123',
          StreamQuality.AUDIO_HIGH,
          256000,
          null,
          'mp4a.40.2',
          '/high/playlist.m3u8',
          'seg'
        ),
      ];

      const masterPlaylist = generator.generateMasterPlaylist(variants, baseUrl);

      expect(masterPlaylist).toContain('BANDWIDTH=64000');
      expect(masterPlaylist).toContain('BANDWIDTH=128000');
      expect(masterPlaylist).toContain('BANDWIDTH=256000');
      expect(masterPlaylist).not.toContain('RESOLUTION=');
    });
  });
});

import {
  StreamQuality,
  VIDEO_QUALITY_PRESETS,
  AUDIO_QUALITY_PRESETS,
  isVideoQuality,
  isAudioQuality,
  getQualityPreset,
} from '@/domain/streaming/value-objects/StreamQuality';

describe('StreamQuality', () => {
  describe('enum values', () => {
    it('should have correct video quality values', () => {
      expect(StreamQuality.Q360P).toBe('Q360P');
      expect(StreamQuality.Q480P).toBe('Q480P');
      expect(StreamQuality.Q720P).toBe('Q720P');
      expect(StreamQuality.Q1080P).toBe('Q1080P');
    });

    it('should have correct audio quality values', () => {
      expect(StreamQuality.AUDIO_LOW).toBe('AUDIO_LOW');
      expect(StreamQuality.AUDIO_MEDIUM).toBe('AUDIO_MEDIUM');
      expect(StreamQuality.AUDIO_HIGH).toBe('AUDIO_HIGH');
    });
  });

  describe('VIDEO_QUALITY_PRESETS', () => {
    it('should have preset for Q360P', () => {
      const preset = VIDEO_QUALITY_PRESETS[StreamQuality.Q360P];

      expect(preset).toBeDefined();
      expect(preset.quality).toBe(StreamQuality.Q360P);
      expect(preset.resolution).toBe('640x360');
      expect(preset.videoBitrate).toBe(800);
      expect(preset.audioBitrate).toBe(96);
      expect(preset.bandwidth).toBe(896000);
      expect(preset.codecs).toBe('avc1.42001f,mp4a.40.2');
    });

    it('should have preset for Q480P', () => {
      const preset = VIDEO_QUALITY_PRESETS[StreamQuality.Q480P];

      expect(preset).toBeDefined();
      expect(preset.quality).toBe(StreamQuality.Q480P);
      expect(preset.resolution).toBe('854x480');
      expect(preset.videoBitrate).toBe(1400);
      expect(preset.audioBitrate).toBe(128);
      expect(preset.bandwidth).toBe(1528000);
      expect(preset.codecs).toBe('avc1.4d001f,mp4a.40.2');
    });

    it('should have preset for Q720P', () => {
      const preset = VIDEO_QUALITY_PRESETS[StreamQuality.Q720P];

      expect(preset).toBeDefined();
      expect(preset.quality).toBe(StreamQuality.Q720P);
      expect(preset.resolution).toBe('1280x720');
      expect(preset.videoBitrate).toBe(2800);
      expect(preset.audioBitrate).toBe(128);
      expect(preset.bandwidth).toBe(2928000);
      expect(preset.codecs).toBe('avc1.4d001f,mp4a.40.2');
    });

    it('should have preset for Q1080P', () => {
      const preset = VIDEO_QUALITY_PRESETS[StreamQuality.Q1080P];

      expect(preset).toBeDefined();
      expect(preset.quality).toBe(StreamQuality.Q1080P);
      expect(preset.resolution).toBe('1920x1080');
      expect(preset.videoBitrate).toBe(5000);
      expect(preset.audioBitrate).toBe(192);
      expect(preset.bandwidth).toBe(5192000);
      expect(preset.codecs).toBe('avc1.640028,mp4a.40.2');
    });

    it('should have 4 video quality presets', () => {
      expect(Object.keys(VIDEO_QUALITY_PRESETS)).toHaveLength(4);
    });
  });

  describe('AUDIO_QUALITY_PRESETS', () => {
    it('should have preset for AUDIO_LOW', () => {
      const preset = AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_LOW];

      expect(preset).toBeDefined();
      expect(preset.quality).toBe(StreamQuality.AUDIO_LOW);
      expect(preset.resolution).toBeNull();
      expect(preset.videoBitrate).toBeNull();
      expect(preset.audioBitrate).toBe(64);
      expect(preset.bandwidth).toBe(64000);
      expect(preset.codecs).toBe('mp4a.40.2');
    });

    it('should have preset for AUDIO_MEDIUM', () => {
      const preset = AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_MEDIUM];

      expect(preset).toBeDefined();
      expect(preset.quality).toBe(StreamQuality.AUDIO_MEDIUM);
      expect(preset.resolution).toBeNull();
      expect(preset.videoBitrate).toBeNull();
      expect(preset.audioBitrate).toBe(128);
      expect(preset.bandwidth).toBe(128000);
      expect(preset.codecs).toBe('mp4a.40.2');
    });

    it('should have preset for AUDIO_HIGH', () => {
      const preset = AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_HIGH];

      expect(preset).toBeDefined();
      expect(preset.quality).toBe(StreamQuality.AUDIO_HIGH);
      expect(preset.resolution).toBeNull();
      expect(preset.videoBitrate).toBeNull();
      expect(preset.audioBitrate).toBe(256);
      expect(preset.bandwidth).toBe(256000);
      expect(preset.codecs).toBe('mp4a.40.2');
    });

    it('should have 3 audio quality presets', () => {
      expect(Object.keys(AUDIO_QUALITY_PRESETS)).toHaveLength(3);
    });
  });

  describe('isVideoQuality', () => {
    it('should return true for video qualities', () => {
      expect(isVideoQuality(StreamQuality.Q360P)).toBe(true);
      expect(isVideoQuality(StreamQuality.Q480P)).toBe(true);
      expect(isVideoQuality(StreamQuality.Q720P)).toBe(true);
      expect(isVideoQuality(StreamQuality.Q1080P)).toBe(true);
    });

    it('should return false for audio qualities', () => {
      expect(isVideoQuality(StreamQuality.AUDIO_LOW)).toBe(false);
      expect(isVideoQuality(StreamQuality.AUDIO_MEDIUM)).toBe(false);
      expect(isVideoQuality(StreamQuality.AUDIO_HIGH)).toBe(false);
    });
  });

  describe('isAudioQuality', () => {
    it('should return true for audio qualities', () => {
      expect(isAudioQuality(StreamQuality.AUDIO_LOW)).toBe(true);
      expect(isAudioQuality(StreamQuality.AUDIO_MEDIUM)).toBe(true);
      expect(isAudioQuality(StreamQuality.AUDIO_HIGH)).toBe(true);
    });

    it('should return false for video qualities', () => {
      expect(isAudioQuality(StreamQuality.Q360P)).toBe(false);
      expect(isAudioQuality(StreamQuality.Q480P)).toBe(false);
      expect(isAudioQuality(StreamQuality.Q720P)).toBe(false);
      expect(isAudioQuality(StreamQuality.Q1080P)).toBe(false);
    });
  });

  describe('getQualityPreset', () => {
    it('should return video preset for video quality', () => {
      const preset = getQualityPreset(StreamQuality.Q720P);

      expect(preset).toBeDefined();
      expect(preset).toBe(VIDEO_QUALITY_PRESETS[StreamQuality.Q720P]);
    });

    it('should return audio preset for audio quality', () => {
      const preset = getQualityPreset(StreamQuality.AUDIO_MEDIUM);

      expect(preset).toBeDefined();
      expect(preset).toBe(AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_MEDIUM]);
    });

    it('should return null for invalid quality', () => {
      const preset = getQualityPreset('INVALID_QUALITY' as StreamQuality);

      expect(preset).toBeNull();
    });

    it('should return correct preset for all video qualities', () => {
      const videoQualities = [
        StreamQuality.Q360P,
        StreamQuality.Q480P,
        StreamQuality.Q720P,
        StreamQuality.Q1080P,
      ];

      for (const quality of videoQualities) {
        const preset = getQualityPreset(quality);
        expect(preset).not.toBeNull();
        if (preset) {
          expect(preset.quality).toBe(quality);
          expect(preset.resolution).not.toBeNull();
          expect(preset.videoBitrate).not.toBeNull();
        }
      }
    });

    it('should return correct preset for all audio qualities', () => {
      const audioQualities = [
        StreamQuality.AUDIO_LOW,
        StreamQuality.AUDIO_MEDIUM,
        StreamQuality.AUDIO_HIGH,
      ];

      for (const quality of audioQualities) {
        const preset = getQualityPreset(quality);
        expect(preset).not.toBeNull();
        if (preset) {
          expect(preset.quality).toBe(quality);
          expect(preset.resolution).toBeNull();
          expect(preset.videoBitrate).toBeNull();
        }
      }
    });
  });

  describe('QualityPreset structure', () => {
    it('should have correct structure for video preset', () => {
      const preset = VIDEO_QUALITY_PRESETS[StreamQuality.Q720P];

      expect(preset).toHaveProperty('quality');
      expect(preset).toHaveProperty('resolution');
      expect(preset).toHaveProperty('videoBitrate');
      expect(preset).toHaveProperty('audioBitrate');
      expect(preset).toHaveProperty('bandwidth');
      expect(preset).toHaveProperty('codecs');
    });

    it('should have correct structure for audio preset', () => {
      const preset = AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_MEDIUM];

      expect(preset).toHaveProperty('quality');
      expect(preset).toHaveProperty('resolution');
      expect(preset).toHaveProperty('videoBitrate');
      expect(preset).toHaveProperty('audioBitrate');
      expect(preset).toHaveProperty('bandwidth');
      expect(preset).toHaveProperty('codecs');
    });
  });

  describe('bandwidth calculations', () => {
    it('should have bandwidth proportional to quality for video', () => {
      const b360 = VIDEO_QUALITY_PRESETS[StreamQuality.Q360P].bandwidth;
      const b480 = VIDEO_QUALITY_PRESETS[StreamQuality.Q480P].bandwidth;
      const b720 = VIDEO_QUALITY_PRESETS[StreamQuality.Q720P].bandwidth;
      const b1080 = VIDEO_QUALITY_PRESETS[StreamQuality.Q1080P].bandwidth;

      expect(b360).toBeLessThan(b480);
      expect(b480).toBeLessThan(b720);
      expect(b720).toBeLessThan(b1080);
    });

    it('should have bandwidth proportional to quality for audio', () => {
      const bLow = AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_LOW].bandwidth;
      const bMedium = AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_MEDIUM].bandwidth;
      const bHigh = AUDIO_QUALITY_PRESETS[StreamQuality.AUDIO_HIGH].bandwidth;

      expect(bLow).toBeLessThan(bMedium);
      expect(bMedium).toBeLessThan(bHigh);
    });
  });
});

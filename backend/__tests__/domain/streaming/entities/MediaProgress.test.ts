import { MediaProgress } from '@/domain/streaming/entities/MediaProgress';

describe('MediaProgress', () => {
  const userId = 'user-123';
  const mediaId = 'media-456';
  const duration = 600; // 10 minutes in seconds

  describe('create', () => {
    it('should create a new media progress with default values', () => {
      const progress = MediaProgress.create(userId, mediaId);

      expect(progress).toBeDefined();
      expect(progress.userId).toBe(userId);
      expect(progress.mediaId).toBe(mediaId);
      expect(progress.currentPosition).toBe(0);
      expect(progress.duration).toBe(0);
      expect(progress.completionRate).toBe(0);
      expect(progress.isCompleted).toBe(false);
      expect(progress.lastWatchedAt).toBeInstanceOf(Date);
    });

    it('should create progress with specified duration', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);

      expect(progress.duration).toBe(duration);
    });

    it('should generate unique IDs for different progress entries', () => {
      const progress1 = MediaProgress.create(userId, mediaId);
      const progress2 = MediaProgress.create(userId, mediaId);

      expect(progress1.id).not.toBe(progress2.id);
    });
  });

  describe('fromPersistence', () => {
    it('should restore media progress from persisted data', () => {
      const persistedData = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        userId: 'user-456',
        mediaId: 'media-789',
        currentPosition: 300,
        duration: 600,
        completionRate: 50,
        isCompleted: false,
        lastWatchedAt: new Date('2024-01-15T14:30:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z'),
      };

      const progress = MediaProgress.fromPersistence(persistedData);

      expect(progress.id.getValue()).toBe(persistedData.id);
      expect(progress.userId).toBe(persistedData.userId);
      expect(progress.mediaId).toBe(persistedData.mediaId);
      expect(progress.currentPosition).toBe(persistedData.currentPosition);
      expect(progress.duration).toBe(persistedData.duration);
      expect(progress.completionRate).toBe(persistedData.completionRate);
      expect(progress.isCompleted).toBe(persistedData.isCompleted);
      expect(progress.lastWatchedAt).toEqual(persistedData.lastWatchedAt);
    });

    it('should restore completed progress', () => {
      const persistedData = {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        userId,
        mediaId,
        currentPosition: 600,
        duration: 600,
        completionRate: 100,
        isCompleted: true,
        lastWatchedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const progress = MediaProgress.fromPersistence(persistedData);

      expect(progress.isCompleted).toBe(true);
      expect(progress.completionRate).toBe(100);
    });
  });

  describe('updateProgress', () => {
    it('should update current position and duration', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(150, 600);

      expect(progress.currentPosition).toBe(150);
      expect(progress.duration).toBe(600);
    });

    it('should calculate completion rate correctly', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(300, 600);

      expect(progress.completionRate).toBe(50);
    });

    it('should cap completion rate at 100%', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(700, 600);

      expect(progress.completionRate).toBe(100);
    });

    it('should handle zero duration without division error', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(100, 0);

      expect(progress.completionRate).toBe(0);
    });

    it('should not allow negative position', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(-50, 600);

      expect(progress.currentPosition).toBe(0);
    });

    it('should not allow negative duration', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(100, -600);

      expect(progress.duration).toBe(0);
    });

    it('should update lastWatchedAt timestamp', () => {
      const progress = MediaProgress.create(userId, mediaId);
      const beforeUpdate = new Date();

      progress.updateProgress(100, 600);

      expect(progress.lastWatchedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('should auto-complete when reaching 95% threshold', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(570, 600); // 95%

      expect(progress.isCompleted).toBe(true);
    });

    it('should auto-complete when exceeding 95% threshold', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(580, 600); // 96.67%

      expect(progress.isCompleted).toBe(true);
    });

    it('should not auto-complete below 95% threshold', () => {
      const progress = MediaProgress.create(userId, mediaId);

      progress.updateProgress(560, 600); // 93.33%

      expect(progress.isCompleted).toBe(false);
    });

    it('should not change isCompleted if already completed', () => {
      const progress = MediaProgress.create(userId, mediaId);
      progress.updateProgress(570, 600); // Complete at 95%

      progress.updateProgress(100, 600); // Go back to start

      expect(progress.isCompleted).toBe(true); // Should stay completed
    });
  });

  describe('markAsCompleted', () => {
    it('should mark progress as completed', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);

      progress.markAsCompleted();

      expect(progress.isCompleted).toBe(true);
      expect(progress.completionRate).toBe(100);
    });

    it('should set completion rate to 100%', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      progress.updateProgress(300, 600); // 50%

      progress.markAsCompleted();

      expect(progress.completionRate).toBe(100);
    });

    it('should update updatedAt timestamp', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      const beforeMark = progress.updatedAt;

      // Small delay to ensure timestamp difference
      progress.markAsCompleted();

      expect(progress.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeMark.getTime());
    });
  });

  describe('reset', () => {
    it('should reset position to 0', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      progress.updateProgress(300, 600);

      progress.reset();

      expect(progress.currentPosition).toBe(0);
    });

    it('should reset completion rate to 0', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      progress.updateProgress(300, 600);

      progress.reset();

      expect(progress.completionRate).toBe(0);
    });

    it('should reset isCompleted to false', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      progress.markAsCompleted();

      progress.reset();

      expect(progress.isCompleted).toBe(false);
    });

    it('should preserve duration after reset', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      progress.updateProgress(300, 600);

      progress.reset();

      expect(progress.duration).toBe(600);
    });
  });

  describe('toDTO', () => {
    it('should convert progress to DTO with all properties', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      progress.updateProgress(300, 600);

      const dto = progress.toDTO();

      expect(dto).toMatchObject({
        userId,
        mediaId,
        currentPosition: 300,
        duration: 600,
        completionRate: 50,
        isCompleted: false,
      });
      expect(dto.id).toBeDefined();
      expect(dto.lastWatchedAt).toBeInstanceOf(Date);
    });

    it('should include completed status in DTO', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      progress.markAsCompleted();

      const dto = progress.toDTO();

      expect(dto.isCompleted).toBe(true);
      expect(dto.completionRate).toBe(100);
    });
  });

  describe('getters', () => {
    it('should return correct odId (id value)', () => {
      const progress = MediaProgress.create(userId, mediaId);
      expect(progress.odId).toBe(progress.id.getValue());
    });

    it('should return correct userId', () => {
      const progress = MediaProgress.create(userId, mediaId);
      expect(progress.userId).toBe(userId);
    });

    it('should return correct mediaId', () => {
      const progress = MediaProgress.create(userId, mediaId);
      expect(progress.mediaId).toBe(mediaId);
    });

    it('should return correct currentPosition', () => {
      const progress = MediaProgress.create(userId, mediaId);
      expect(progress.currentPosition).toBe(0);
    });

    it('should return correct duration', () => {
      const progress = MediaProgress.create(userId, mediaId, duration);
      expect(progress.duration).toBe(duration);
    });

    it('should return correct completionRate', () => {
      const progress = MediaProgress.create(userId, mediaId);
      expect(progress.completionRate).toBe(0);
    });

    it('should return correct isCompleted', () => {
      const progress = MediaProgress.create(userId, mediaId);
      expect(progress.isCompleted).toBe(false);
    });

    it('should return correct lastWatchedAt', () => {
      const progress = MediaProgress.create(userId, mediaId);
      expect(progress.lastWatchedAt).toBeInstanceOf(Date);
    });
  });

  describe('completion threshold', () => {
    it('should use 95% as completion threshold', () => {
      const progress = MediaProgress.create(userId, mediaId);

      // 94% should not complete
      progress.updateProgress(564, 600);
      expect(progress.isCompleted).toBe(false);

      // Reset and try 95%
      const progress2 = MediaProgress.create(userId, mediaId);
      progress2.updateProgress(570, 600);
      expect(progress2.isCompleted).toBe(true);
    });
  });
});

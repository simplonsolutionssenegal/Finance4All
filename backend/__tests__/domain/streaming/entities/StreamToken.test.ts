import { StreamToken } from '@/domain/streaming/entities/StreamToken';

describe('StreamToken', () => {
  const userId = 'user-123';
  const mediaId = 'media-456';

  describe('create', () => {
    it('should create a new stream token with default expiry', () => {
      const token = StreamToken.create(userId, mediaId);

      expect(token).toBeDefined();
      expect(token.userId).toBe(userId);
      expect(token.mediaId).toBe(mediaId);
      expect(token.token).toHaveLength(64); // 32 bytes hex = 64 characters
      expect(token.expiresAt).toBeInstanceOf(Date);
    });

    it('should create token with custom expiry time', () => {
      const expiresInSeconds = 7200; // 2 hours
      const beforeCreate = Date.now();

      const token = StreamToken.create(userId, mediaId, expiresInSeconds);

      const expectedExpiry = beforeCreate + expiresInSeconds * 1000;
      expect(token.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiry - 1000);
      expect(token.expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should generate unique tokens for same user and media', () => {
      const token1 = StreamToken.create(userId, mediaId);
      const token2 = StreamToken.create(userId, mediaId);

      expect(token1.token).not.toBe(token2.token);
      expect(token1.id).not.toBe(token2.id);
    });

    it('should generate unique IDs for tokens', () => {
      const token1 = StreamToken.create(userId, mediaId);
      const token2 = StreamToken.create(userId, mediaId);

      expect(token1.id.getValue()).not.toBe(token2.id.getValue());
    });
  });

  describe('fromPersistence', () => {
    it('should restore a stream token from persisted data', () => {
      const persistedData = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        userId: 'user-456',
        mediaId: 'media-789',
        token: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
        expiresAt: new Date('2099-12-31T23:59:59Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
      };

      const streamToken = StreamToken.fromPersistence(persistedData);

      expect(streamToken.id.getValue()).toBe(persistedData.id);
      expect(streamToken.userId).toBe(persistedData.userId);
      expect(streamToken.mediaId).toBe(persistedData.mediaId);
      expect(streamToken.token).toBe(persistedData.token);
      expect(streamToken.expiresAt).toEqual(persistedData.expiresAt);
    });

    it('should correctly restore createdAt timestamp', () => {
      const createdAt = new Date('2024-06-15T10:30:00Z');
      const persistedData = {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        userId,
        mediaId,
        token: 'test-token-abc123def456abc123def456abc123def456abc123def456ab',
        expiresAt: new Date('2099-12-31T23:59:59Z'),
        createdAt,
      };

      const streamToken = StreamToken.fromPersistence(persistedData);

      expect(streamToken.createdAt).toEqual(createdAt);
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired token', () => {
      const token = StreamToken.create(userId, mediaId, 3600);

      expect(token.isExpired).toBe(false);
    });

    it('should return true for expired token', () => {
      const expiredToken = StreamToken.fromPersistence({
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        userId,
        mediaId,
        token: 'test-token-abc123def456abc123def456abc123def456abc123def456ab',
        expiresAt: new Date('2020-01-01T00:00:00Z'),
        createdAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(expiredToken.isExpired).toBe(true);
    });

    it('should correctly detect token that just expired', () => {
      const justExpired = StreamToken.fromPersistence({
        id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        userId,
        mediaId,
        token: 'test-token-abc123def456abc123def456abc123def456abc123def456ab',
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
        createdAt: new Date(),
      });

      expect(justExpired.isExpired).toBe(true);
    });
  });

  describe('isValidForMedia', () => {
    it('should return true for valid token matching media', () => {
      const token = StreamToken.create(userId, mediaId, 3600);

      expect(token.isValidForMedia(mediaId)).toBe(true);
    });

    it('should return false for valid token but different media', () => {
      const token = StreamToken.create(userId, mediaId, 3600);

      expect(token.isValidForMedia('different-media-id')).toBe(false);
    });

    it('should return false for expired token even with matching media', () => {
      const expiredToken = StreamToken.fromPersistence({
        id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        userId,
        mediaId,
        token: 'test-token-abc123def456abc123def456abc123def456abc123def456ab',
        expiresAt: new Date('2020-01-01T00:00:00Z'),
        createdAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(expiredToken.isValidForMedia(mediaId)).toBe(false);
    });

    it('should return false for expired token with different media', () => {
      const expiredToken = StreamToken.fromPersistence({
        id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        userId,
        mediaId,
        token: 'test-token-abc123def456abc123def456abc123def456abc123def456ab',
        expiresAt: new Date('2020-01-01T00:00:00Z'),
        createdAt: new Date('2020-01-01T00:00:00Z'),
      });

      expect(expiredToken.isValidForMedia('different-media')).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should convert token to DTO with token and expiresAt', () => {
      const token = StreamToken.create(userId, mediaId, 3600);

      const dto = token.toDTO();

      expect(dto).toHaveProperty('token');
      expect(dto).toHaveProperty('expiresAt');
      expect(dto.token).toBe(token.token);
      expect(dto.expiresAt).toEqual(token.expiresAt);
    });

    it('should not include sensitive data in DTO', () => {
      const token = StreamToken.create(userId, mediaId);

      const dto = token.toDTO();

      expect(dto).not.toHaveProperty('userId');
      expect(dto).not.toHaveProperty('mediaId');
      expect(dto).not.toHaveProperty('id');
    });
  });

  describe('getters', () => {
    it('should return correct userId', () => {
      const token = StreamToken.create(userId, mediaId);
      expect(token.userId).toBe(userId);
    });

    it('should return correct mediaId', () => {
      const token = StreamToken.create(userId, mediaId);
      expect(token.mediaId).toBe(mediaId);
    });

    it('should return correct token string', () => {
      const token = StreamToken.create(userId, mediaId);
      expect(typeof token.token).toBe('string');
      expect(token.token.length).toBe(64);
    });

    it('should return correct expiresAt date', () => {
      const token = StreamToken.create(userId, mediaId, 3600);
      expect(token.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('token format', () => {
    it('should generate token as hex string', () => {
      const token = StreamToken.create(userId, mediaId);

      expect(token.token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate 32-byte token (64 hex characters)', () => {
      const token = StreamToken.create(userId, mediaId);

      expect(token.token).toHaveLength(64);
    });
  });
});

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
// eslint-disable-next-line no-duplicate-imports
import { NextResponse } from 'next/server';

import { GET } from '@/app/api/beneficiaire/dashboard/stats/route';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      body,
      status: init?.status,
      headers: new Headers(),
    })),
  },
}));

// Mock console.error to avoid noise in tests
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('GET /api/beneficiaire/dashboard/stats', () => {
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {} as NextRequest;
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Authentication checks', () => {
    it('should return 401 when userId is not present', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(auth).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Non autorisé' }, { status: 401 });
    });

    it('should return 401 when userId is undefined', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: undefined });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(auth).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Non autorisé' }, { status: 401 });
    });

    it('should return 401 when auth returns empty object', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({});

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(auth).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Non autorisé' }, { status: 401 });
    });

    it('should return 401 when userId is empty string', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: '' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Non autorisé' }, { status: 401 });
    });
  });

  describe('Successful data retrieval', () => {
    it('should return dashboard stats when user is authenticated', async () => {
      // Arrange
      const mockUserId = 'user_123';
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: mockUserId });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(auth).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
          moduleStats: expect.any(Object),
          monthlyProgress: expect.any(Array),
        })
      );
    });

    it('should return correct stats structure', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats).toHaveProperty('modulesCompleted');
      expect(callArgs.stats).toHaveProperty('learningTime');
      expect(callArgs.stats).toHaveProperty('quizzesPassed');
      expect(callArgs.stats).toHaveProperty('globalProgress');
    });

    it('should return modulesCompleted with current and total', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.modulesCompleted).toHaveProperty('current');
      expect(callArgs.stats.modulesCompleted).toHaveProperty('total');
      expect(typeof callArgs.stats.modulesCompleted.current).toBe('number');
      expect(typeof callArgs.stats.modulesCompleted.total).toBe('number');
    });

    it('should return learningTime as string', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(typeof callArgs.stats.learningTime).toBe('string');
    });

    it('should return quizzesPassed with current and total', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.quizzesPassed).toHaveProperty('current');
      expect(callArgs.stats.quizzesPassed).toHaveProperty('total');
      expect(typeof callArgs.stats.quizzesPassed.current).toBe('number');
      expect(typeof callArgs.stats.quizzesPassed.total).toBe('number');
    });

    it('should return globalProgress as number', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(typeof callArgs.stats.globalProgress).toBe('number');
    });

    it('should return moduleStats with correct structure', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.moduleStats).toHaveProperty('completed');
      expect(callArgs.moduleStats).toHaveProperty('inProgress');
      expect(callArgs.moduleStats).toHaveProperty('notStarted');
      expect(callArgs.moduleStats).toHaveProperty('total');
    });

    it('should return all moduleStats as numbers', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(typeof callArgs.moduleStats.completed).toBe('number');
      expect(typeof callArgs.moduleStats.inProgress).toBe('number');
      expect(typeof callArgs.moduleStats.notStarted).toBe('number');
      expect(typeof callArgs.moduleStats.total).toBe('number');
    });

    it('should return monthlyProgress as array', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(callArgs.monthlyProgress)).toBe(true);
    });

    it('should return monthlyProgress with correct structure', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.monthlyProgress.length).toBeGreaterThan(0);

      callArgs.monthlyProgress.forEach((item: any) => {
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('progress');
        expect(typeof item.month).toBe('string');
        expect(typeof item.progress).toBe('number');
      });
    });

    it('should return 6 months of progress data', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.monthlyProgress).toHaveLength(6);
    });
  });

  describe('Mocked data values', () => {
    beforeEach(() => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });
    });

    it('should return expected modulesCompleted values', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.modulesCompleted.current).toBe(8);
      expect(callArgs.stats.modulesCompleted.total).toBe(26);
    });

    it('should return expected learningTime value', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.learningTime).toBe('24h 30m');
    });

    it('should return expected quizzesPassed values', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.quizzesPassed.current).toBe(12);
      expect(callArgs.stats.quizzesPassed.total).toBe(15);
    });

    it('should return expected globalProgress value', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.globalProgress).toBe(75);
    });

    it('should return expected moduleStats values', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.moduleStats.completed).toBe(8);
      expect(callArgs.moduleStats.inProgress).toBe(5);
      expect(callArgs.moduleStats.notStarted).toBe(13);
      expect(callArgs.moduleStats.total).toBe(26);
    });

    it('should return expected monthlyProgress data', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      const expectedMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
      const expectedProgress = [20, 35, 50, 60, 70, 75];

      callArgs.monthlyProgress.forEach((item: any, index: number) => {
        expect(item.month).toBe(expectedMonths[index]);
        expect(item.progress).toBe(expectedProgress[index]);
      });
    });
  });

  describe('Error handling', () => {
    it('should return 500 when auth throws error', async () => {
      // Arrange
      const authError = new Error('Auth failed');
      (auth as unknown as jest.Mock).mockRejectedValue(authError);

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Erreur API dashboard bénéficiaire:', authError);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    });

    it('should return 500 when unexpected error occurs', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected error');
      (auth as unknown as jest.Mock).mockImplementation(() => {
        throw unexpectedError;
      });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'Erreur API dashboard bénéficiaire:',
        unexpectedError
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await GET(mockRequest as NextRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(500);
    });
  });

  describe('Response structure validation', () => {
    beforeEach(() => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });
    });

    it('should return response with all required top-level keys', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      const keys = Object.keys(callArgs);
      expect(keys).toContain('stats');
      expect(keys).toContain('moduleStats');
      expect(keys).toContain('monthlyProgress');
    });

    it('should return response with exactly 3 top-level keys', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      const keys = Object.keys(callArgs);
      expect(keys).toHaveLength(3);
    });

    it('should return stats with exactly 4 properties', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      const statsKeys = Object.keys(callArgs.stats);
      expect(statsKeys).toHaveLength(4);
    });

    it('should return moduleStats with exactly 4 properties', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      const moduleStatsKeys = Object.keys(callArgs.moduleStats);
      expect(moduleStatsKeys).toHaveLength(4);
    });

    it('should not return undefined values', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.modulesCompleted).toBeDefined();
      expect(callArgs.stats.learningTime).toBeDefined();
      expect(callArgs.stats.quizzesPassed).toBeDefined();
      expect(callArgs.stats.globalProgress).toBeDefined();
      expect(callArgs.moduleStats.completed).toBeDefined();
      expect(callArgs.moduleStats.inProgress).toBeDefined();
      expect(callArgs.moduleStats.notStarted).toBeDefined();
      expect(callArgs.moduleStats.total).toBeDefined();
      expect(callArgs.monthlyProgress).toBeDefined();
    });
  });

  describe('Integration scenarios', () => {
    it('should call auth exactly once per request', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it('should not call NextResponse.json twice on success', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledTimes(1);
    });

    it('should handle different userId formats', async () => {
      // Arrange
      const userIds = ['user_123', 'clerk_abc', 'user-special-456'];

      for (const userId of userIds) {
        jest.clearAllMocks();
        (auth as unknown as jest.Mock).mockResolvedValue({ userId });

        // Act
        // eslint-disable-next-line no-await-in-loop
        await GET(mockRequest as NextRequest);

        // Assert
        expect(NextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.any(Object),
          })
        );
      }
    });

    it('should return same data structure for different users', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_1' });

      // Act
      await GET(mockRequest as NextRequest);
      const result1 = (NextResponse.json as jest.Mock).mock.calls[0][0];

      jest.clearAllMocks();
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_2' });
      await GET(mockRequest as NextRequest);
      const result2 = (NextResponse.json as jest.Mock).mock.calls[0][0];

      // Assert
      expect(Object.keys(result1)).toEqual(Object.keys(result2));
      expect(Object.keys(result1.stats)).toEqual(Object.keys(result2.stats));
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace-only userId as authenticated', async () => {
      // Arrange
      const whitespaceUserId = '   ';
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: whitespaceUserId });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      // Whitespace is truthy, so it should return data
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
        })
      );
    });

    it('should handle very long userId strings', async () => {
      // Arrange
      const longUserId = `user_${'a'.repeat(1000)}`;
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: longUserId });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
        })
      );
    });

    it('should handle special characters in userId', async () => {
      // Arrange
      const specialUserId = 'user_123-456_special@domain';
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: specialUserId });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
        })
      );
    });

    it('should handle auth with additional properties', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: 'user_123',
        orgId: 'org_456',
        sessionId: 'session_789',
      });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
        })
      );
    });
  });

  describe('Async behavior', () => {
    it('should wait for auth resolution before processing', async () => {
      // Arrange
      let resolveAuth: (value: any) => void;
      const authPromise = new Promise(resolve => {
        resolveAuth = resolve;
      });
      (auth as unknown as jest.Mock).mockReturnValue(authPromise);

      // Act
      const getPromise = GET(mockRequest as NextRequest);

      // Assert - Should not be called yet
      expect(NextResponse.json).not.toHaveBeenCalled();

      // Resolve auth
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      resolveAuth!({ userId: 'user_123' });
      await getPromise;

      // Assert - Should now be called
      expect(NextResponse.json).toHaveBeenCalled();
    });

    it('should handle slow auth response', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve({ userId: 'user_slow' }), 100);
          })
      );

      // Act
      const startTime = Date.now();
      await GET(mockRequest as NextRequest);
      const endTime = Date.now();

      // Assert
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
        })
      );
    });
  });
});

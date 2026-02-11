import type { NextRequest } from 'next/server';
// eslint-disable-next-line no-duplicate-imports
import { NextResponse } from 'next/server';

import { GET } from '@/app/api/beneficiaire/dashboard/stats/route';

// Mock dependencies
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

const mockDashboardResponse = {
  stats: {
    modulesCompleted: { current: 8, total: 26 },
    learningTime: '24h 30m',
    quizzesPassed: { current: 12, total: 15 },
    globalProgress: 75,
    modulesCompletedTrend: '+2 ce mois',
    learningTimeTrend: '+5h cette semaine',
    globalProgressTrend: '+15% ce mois',
    quizzesPassedTrend: '80% de réussite',
  },
  moduleStats: { completed: 8, inProgress: 5, notStarted: 13, total: 26 },
  monthlyProgress: [
    { month: 'Jan', progress: 20 },
    { month: 'Fév', progress: 35 },
    { month: 'Mar', progress: 50 },
    { month: 'Avr', progress: 60 },
    { month: 'Mai', progress: 70 },
    { month: 'Juin', progress: 75 },
  ],
};

describe('GET /api/beneficiaire/dashboard/stats', () => {
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
      text: async () => JSON.stringify(mockDashboardResponse),
    }) as jest.Mock;
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Authentication checks (Query Parameters)', () => {
    it('should return 401 when userId is not in query params', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats',
      } as NextRequest;

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Non autorisé - userId manquant' },
        { status: 401 }
      );
    });

    it('should return 401 when userId query param is empty', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=',
      } as NextRequest;

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Non autorisé - userId manquant' },
        { status: 401 }
      );
    });

    it('should pass userId to backend API', async () => {
      // Arrange
      const userId = 'user_123';
      mockRequest = {
        url: `http://localhost:3000/api/beneficiaire/dashboard/stats?userId=${userId}`,
      } as NextRequest;

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
        expect.any(Object)
      );
    });
  });

  describe('Successful data retrieval', () => {
    beforeEach(() => {
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=user_123',
      } as NextRequest;
    });

    it('should return dashboard stats when userId is provided', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
          moduleStats: expect.any(Object),
          monthlyProgress: expect.any(Array),
        })
      );
    });

    it('should return correct stats structure', async () => {
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
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(typeof callArgs.stats.learningTime).toBe('string');
    });

    it('should return quizzesPassed with current and total', async () => {
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
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(typeof callArgs.stats.globalProgress).toBe('number');
    });

    it('should return moduleStats with correct structure', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.moduleStats).toHaveProperty('completed');
      expect(callArgs.moduleStats).toHaveProperty('inProgress');
      expect(callArgs.moduleStats).toHaveProperty('notStarted');
      expect(callArgs.moduleStats).toHaveProperty('total');
    });

    it('should return monthlyProgress as array', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(callArgs.monthlyProgress)).toBe(true);
    });

    it('should return 6 months of progress data', async () => {
      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.monthlyProgress).toHaveLength(6);
    });
  });

  describe('Error handling', () => {
    it('should return 500 when fetch throws error', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=user_123',
      } as NextRequest;
      const fetchError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(fetchError);

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Erreur API dashboard bénéficiaire:', fetchError);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    });

    it('should return error when backend returns 404', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=user_123',
      } as NextRequest;
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ message: 'Route not found', path: '/api/v1/unknown' }),
      });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Backend non trouvé'),
        }),
        { status: 404 }
      );
    });

    it('should forward backend error message when backend returns 500', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=user_123',
      } as NextRequest;
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ success: false, message: 'Bénéficiaire non trouvé' }),
      });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Bénéficiaire non trouvé' },
        { status: 500 }
      );
    });

    it('should use body.error when backend returns error field', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=user_123',
      } as NextRequest;
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'userId manquant' }),
      });

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'userId manquant' }, { status: 400 });
    });
  });

  describe('URL encoding', () => {
    it('should handle special characters in userId', async () => {
      // Arrange
      const specialUserId = 'user+123@domain.com';
      mockRequest = {
        url: `http://localhost:3000/api/beneficiaire/dashboard/stats?userId=${encodeURIComponent(specialUserId)}`,
      } as NextRequest;

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(specialUserId)),
        expect.any(Object)
      );
    });

    it('should properly encode userId in backend URL', async () => {
      // Arrange
      const userId = 'user_123-456';
      mockRequest = {
        url: `http://localhost:3000/api/beneficiaire/dashboard/stats?userId=${userId}`,
      } as NextRequest;

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${encodeURIComponent(userId)}`),
        expect.any(Object)
      );
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=user_123',
      } as NextRequest;
    });

    it('should not call NextResponse.json twice on success', async () => {
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
        mockRequest = {
          url: `http://localhost:3000/api/beneficiaire/dashboard/stats?userId=${userId}`,
        } as NextRequest;

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
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=user_1',
      } as NextRequest;

      // Act
      await GET(mockRequest as NextRequest);
      const result1 = (NextResponse.json as jest.Mock).mock.calls[0][0];

      jest.clearAllMocks();
      mockRequest = {
        url: 'http://localhost:3000/api/beneficiaire/dashboard/stats?userId=user_2',
      } as NextRequest;
      await GET(mockRequest as NextRequest);
      const result2 = (NextResponse.json as jest.Mock).mock.calls[0][0];

      // Assert
      expect(Object.keys(result1)).toEqual(Object.keys(result2));
      expect(Object.keys(result1.stats)).toEqual(Object.keys(result2.stats));
    });
  });

  describe('Edge cases', () => {
    it('should handle very long userId strings', async () => {
      // Arrange
      const longUserId = `user_${'a'.repeat(1000)}`;
      mockRequest = {
        url: `http://localhost:3000/api/beneficiaire/dashboard/stats?userId=${longUserId}`,
      } as NextRequest;

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
        })
      );
    });

    it('should handle whitespace in userId (URL encoded)', async () => {
      // Arrange
      const userIdWithSpace = 'user 123';
      mockRequest = {
        url: `http://localhost:3000/api/beneficiaire/dashboard/stats?userId=${encodeURIComponent(userIdWithSpace)}`,
      } as NextRequest;

      // Act
      await GET(mockRequest as NextRequest);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

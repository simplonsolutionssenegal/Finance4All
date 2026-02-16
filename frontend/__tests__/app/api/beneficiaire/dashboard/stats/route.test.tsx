import { NextResponse } from 'next/server';

import { GET } from '@/app/api/beneficiaire/dashboard/stats/route';

// Mock Clerk auth - userId and getToken from session
const mockGetToken = jest.fn().mockResolvedValue(null);
const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

jest.mock('@/lib/auth-utils', () => ({
  getBackendToken: jest.fn().mockResolvedValue(null),
}));

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
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'user_123', getToken: mockGetToken });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
      text: async () => JSON.stringify(mockDashboardResponse),
    }) as jest.Mock;
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Authentication checks (Clerk session)', () => {
    it('should return 401 when userId is not in session', async () => {
      mockAuth.mockResolvedValue({ userId: null, getToken: mockGetToken });

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Non autorisé - session invalide ou expirée' },
        { status: 401 }
      );
    });

    it('should pass userId from session to backend API', async () => {
      const userId = 'user_123';
      mockAuth.mockResolvedValue({ userId, getToken: mockGetToken });

      await GET();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
        expect.any(Object)
      );
    });
  });

  describe('Successful data retrieval', () => {
    it('should return dashboard stats when user is authenticated', async () => {
      await GET();

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
      await GET();

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats).toHaveProperty('modulesCompleted');
      expect(callArgs.stats).toHaveProperty('learningTime');
      expect(callArgs.stats).toHaveProperty('quizzesPassed');
      expect(callArgs.stats).toHaveProperty('globalProgress');
    });

    it('should return modulesCompleted with current and total', async () => {
      await GET();

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.modulesCompleted).toHaveProperty('current');
      expect(callArgs.stats.modulesCompleted).toHaveProperty('total');
      expect(typeof callArgs.stats.modulesCompleted.current).toBe('number');
      expect(typeof callArgs.stats.modulesCompleted.total).toBe('number');
    });

    it('should return learningTime as string', async () => {
      await GET();

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(typeof callArgs.stats.learningTime).toBe('string');
    });

    it('should return quizzesPassed with current and total', async () => {
      await GET();

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.stats.quizzesPassed).toHaveProperty('current');
      expect(callArgs.stats.quizzesPassed).toHaveProperty('total');
      expect(typeof callArgs.stats.quizzesPassed.current).toBe('number');
      expect(typeof callArgs.stats.quizzesPassed.total).toBe('number');
    });

    it('should return globalProgress as number', async () => {
      await GET();

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(typeof callArgs.stats.globalProgress).toBe('number');
    });

    it('should return moduleStats with correct structure', async () => {
      await GET();

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.moduleStats).toHaveProperty('completed');
      expect(callArgs.moduleStats).toHaveProperty('inProgress');
      expect(callArgs.moduleStats).toHaveProperty('notStarted');
      expect(callArgs.moduleStats).toHaveProperty('total');
    });

    it('should return monthlyProgress as array', async () => {
      await GET();

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(callArgs.monthlyProgress)).toBe(true);
    });

    it('should return 6 months of progress data', async () => {
      await GET();

      // Assert
      const callArgs = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.monthlyProgress).toHaveLength(6);
    });
  });

  describe('Error handling', () => {
    it('should return 500 when fetch throws error', async () => {
      const fetchError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(fetchError);

      await GET();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Erreur API dashboard bénéficiaire:', fetchError);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    });

    it('should return error when backend returns 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ message: 'Route not found', path: '/api/v1/unknown' }),
      });

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Backend non trouvé'),
        }),
        { status: 404 }
      );
    });

    it('should forward backend error message when backend returns 500', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ success: false, message: 'Bénéficiaire non trouvé' }),
      });

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Bénéficiaire non trouvé' },
        { status: 500 }
      );
    });

    it('should use body.error when backend returns error field', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'userId manquant' }),
      });

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'userId manquant' }, { status: 400 });
    });
  });

  describe('URL encoding', () => {
    it('should handle special characters in userId from session', async () => {
      const specialUserId = 'user+123@domain.com';
      mockAuth.mockResolvedValue({ userId: specialUserId, getToken: mockGetToken });

      await GET();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(specialUserId)),
        expect.any(Object)
      );
    });

    it('should properly encode userId in backend URL', async () => {
      const userId = 'user_123-456';
      mockAuth.mockResolvedValue({ userId, getToken: mockGetToken });

      await GET();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${encodeURIComponent(userId)}`),
        expect.any(Object)
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should not call NextResponse.json twice on success', async () => {
      await GET();
      expect(NextResponse.json).toHaveBeenCalledTimes(1);
    });

    it('should handle different userId formats from session', async () => {
      const userIds = ['user_123', 'clerk_abc', 'user-special-456'];

      for (const userId of userIds) {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ userId, getToken: mockGetToken });
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockDashboardResponse,
          text: async () => JSON.stringify(mockDashboardResponse),
        });

        // eslint-disable-next-line no-await-in-loop
        await GET();

        expect(NextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            stats: expect.any(Object),
          })
        );
      }
    });

    it('should return same data structure for different users', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1', getToken: mockGetToken });
      await GET();
      const result1 = (NextResponse.json as jest.Mock).mock.calls[0][0];

      jest.clearAllMocks();
      mockAuth.mockResolvedValue({ userId: 'user_2', getToken: mockGetToken });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardResponse,
        text: async () => JSON.stringify(mockDashboardResponse),
      });
      await GET();
      const result2 = (NextResponse.json as jest.Mock).mock.calls[0][0];

      expect(Object.keys(result1)).toEqual(Object.keys(result2));
      expect(Object.keys(result1.stats)).toEqual(Object.keys(result2.stats));
    });
  });

  describe('Edge cases', () => {
    it('should handle very long userId strings from session', async () => {
      const longUserId = `user_${'a'.repeat(1000)}`;
      mockAuth.mockResolvedValue({ userId: longUserId, getToken: mockGetToken });

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.any(Object),
        })
      );
    });

    it('should handle whitespace in userId from session', async () => {
      const userIdWithSpace = 'user 123';
      mockAuth.mockResolvedValue({ userId: userIdWithSpace, getToken: mockGetToken });

      await GET();

      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

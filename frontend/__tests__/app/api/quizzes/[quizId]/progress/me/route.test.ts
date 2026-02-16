import { GET } from '@/app/api/quizzes/[quizId]/progress/me/route';

const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));
jest.mock('@/lib/auth-utils', () => ({
  getBackendToken: jest.fn().mockResolvedValue(null),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

describe('GET /api/quizzes/[quizId]/progress/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'user_123', getToken: jest.fn().mockResolvedValue(null) });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ totalAttempts: 2, bestScore: 80 }),
    }) as jest.Mock;
  });

  it('should return 401 when userId is not in session', async () => {
    mockAuth.mockResolvedValue({ userId: null, getToken: jest.fn() });

    const res = await GET({} as any, { params: Promise.resolve({ quizId: 'quiz-1' }) });

    expect(res.status).toBe(401);
  });

  it('should return 400 when quizId is missing', async () => {
    const res = await GET({} as any, { params: Promise.resolve({ quizId: '' }) });

    expect(res.status).toBe(400);
  });

  it('should call backend and return progress', async () => {
    const res = await GET({} as any, { params: Promise.resolve({ quizId: 'quiz-1' }) });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/quizzes/quiz-1/progress/me'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(res.status).toBe(200);
  });

  it('should return error when backend returns not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Quiz non trouvé' }),
    });

    const res = await GET({} as any, { params: Promise.resolve({ quizId: 'quiz-1' }) });

    expect(res.status).toBe(404);
  });
});

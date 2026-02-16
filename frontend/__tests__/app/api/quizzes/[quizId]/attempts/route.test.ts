import { POST } from '@/app/api/quizzes/[quizId]/attempts/route';

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

describe('POST /api/quizzes/[quizId]/attempts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'user_123', getToken: jest.fn().mockResolvedValue(null) });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'attempt-1' }),
    }) as jest.Mock;
  });

  it('should return 401 when userId is not in session', async () => {
    mockAuth.mockResolvedValue({ userId: null, getToken: jest.fn() });

    const req = { json: async () => ({ answers: [] }) } as any;
    const res = await POST(req, { params: Promise.resolve({ quizId: 'quiz-1' }) });

    expect(res.status).toBe(401);
  });

  it('should return 400 when quizId is missing', async () => {
    const req = { json: async () => ({ answers: [] }) } as any;
    const res = await POST(req, { params: Promise.resolve({ quizId: '' }) });

    expect(res.status).toBe(400);
  });

  it('should return 400 when answers is missing or not array', async () => {
    const req = { json: async () => ({}) } as any;
    const res = await POST(req, { params: Promise.resolve({ quizId: 'quiz-1' }) });

    expect(res.status).toBe(400);
  });

  it('should call backend and return success', async () => {
    const req = {
      json: async () => ({ answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }] }),
    } as any;
    const res = await POST(req, { params: Promise.resolve({ quizId: 'quiz-1' }) });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/quizzes/quiz-1/attempts'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }] }),
      })
    );
    expect(res.status).toBe(200);
  });
});

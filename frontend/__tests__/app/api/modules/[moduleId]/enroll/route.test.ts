import { POST } from '@/app/api/modules/[moduleId]/enroll/route';

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

describe('POST /api/modules/[moduleId]/enroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'user_123', getToken: jest.fn().mockResolvedValue(null) });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }) as jest.Mock;
  });

  it('should return 401 when userId is not in session', async () => {
    mockAuth.mockResolvedValue({ userId: null, getToken: jest.fn() });

    const res = await POST({} as any, { params: Promise.resolve({ moduleId: 'mod-1' }) });

    expect(res.status).toBe(401);
    const body = (res as { body?: { message?: string; error?: string } }).body;
    expect(body?.message ?? body?.error).toMatch(/Non autorisé|session/);
  });

  it('should return 400 when moduleId is missing', async () => {
    const res = await POST({} as any, { params: Promise.resolve({ moduleId: '' }) });

    expect(res.status).toBe(400);
  });

  it('should call backend enroll and return success', async () => {
    const res = await POST({} as any, { params: Promise.resolve({ moduleId: 'mod-1' }) });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/modules/mod-1/enroll'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(res.status).toBe(200);
  });

  it('should return error when backend returns not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: 'Déjà inscrit' }),
    });

    const res = await POST({} as any, { params: Promise.resolve({ moduleId: 'mod-1' }) });

    expect(res.status).toBe(409);
  });
});

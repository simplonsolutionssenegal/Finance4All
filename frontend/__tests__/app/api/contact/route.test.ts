import { POST } from '@/app/api/contact/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

describe('POST /api/contact', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: 'http://localhost:5001/api/v1' };
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, attemptsRemaining: 2 }),
    } as Response) as jest.Mock;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('proxies request to backend contact endpoint', async () => {
    const req = {
      json: jest.fn().mockResolvedValue({ firstName: 'A', email: 'a@b.com' }),
      headers: { get: jest.fn().mockReturnValue('127.0.0.1') },
    } as unknown as Request;

    const res = await POST(req);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5001/api/v1/contact/email',
      expect.objectContaining({ method: 'POST' })
    );
    expect(res.status).toBe(200);
  });

  it('returns 400 on invalid payload', async () => {
    const req = {
      json: jest.fn().mockResolvedValue(null),
      headers: { get: jest.fn().mockReturnValue('') },
    } as unknown as Request;

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when API URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.API_URL;
    const req = {
      json: jest.fn().mockResolvedValue({ firstName: 'A' }),
      headers: { get: jest.fn().mockReturnValue('') },
    } as unknown as Request;

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

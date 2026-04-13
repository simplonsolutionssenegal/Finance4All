import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';
import { GET } from '@/app/api/beneficiaries/stats/route';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/auth-utils', () => ({
  getBackendToken: jest.fn(),
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

global.fetch = jest.fn();

function createMockRequest(searchParams: Record<string, string> = {}) {
  const params = new URLSearchParams(searchParams);
  return {
    nextUrl: { searchParams: params },
  } as any;
}

describe('GET /api/beneficiaries/stats', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 when not authenticated', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: null,
      getToken: jest.fn(),
    });

    await GET(createMockRequest());

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Non autorisé' }, { status: 401 });
  });

  it('should fetch stats successfully without orgId', async () => {
    const mockGetToken = jest.fn();
    const statsData = { total: 42, active: 30 };

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'user_123',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('mock-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(statsData),
    });

    await GET(createMockRequest());

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/beneficiaries/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
      cache: 'no-store',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(statsData);
  });

  it('should forward orgId to the backend URL', async () => {
    const mockGetToken = jest.fn();
    const statsData = { total: 10 };

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'user_456',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('token-xyz');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(statsData),
    });

    await GET(createMockRequest({ orgId: 'org_123' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/beneficiaries/stats?orgId=org_123',
      expect.objectContaining({ method: 'GET' })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(statsData);
  });

  it('should handle backend non-ok response with JSON error', async () => {
    const mockGetToken = jest.fn();

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'user_err1',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'Access denied' })),
    });

    await GET(createMockRequest());

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Access denied' }, { status: 403 });
  });

  it('should handle backend non-ok response with non-JSON text', async () => {
    const mockGetToken = jest.fn();

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'user_err2',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: jest.fn().mockResolvedValue('Bad Gateway'),
    });

    await GET(createMockRequest());

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Bad Gateway' }, { status: 502 });
  });

  it('should return 500 on network error', async () => {
    const mockGetToken = jest.fn();

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'user_net1',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('token');
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await GET(createMockRequest());

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Erreur serveur' }, { status: 500 });
  });
});

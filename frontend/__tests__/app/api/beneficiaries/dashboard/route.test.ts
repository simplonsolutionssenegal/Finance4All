import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';
import { GET } from '@/app/api/beneficiaries/dashboard/route';

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

describe('GET /api/beneficiaries/dashboard', () => {
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

    await GET(createMockRequest({ userId: 'user_abc' }));

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Non autorisé' }, { status: 401 });
  });

  it('should return 400 when userId param is missing', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'session_user_1',
      getToken: jest.fn(),
    });

    await GET(createMockRequest());

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Le paramètre userId est requis' },
      { status: 400 }
    );
  });

  it('should fetch dashboard data successfully', async () => {
    const mockGetToken = jest.fn();
    const dashboardData = { completedModules: 5, score: 85 };

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'session_user_2',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('mock-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(dashboardData),
    });

    await GET(createMockRequest({ userId: 'target_user_1' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/beneficiaries/dashboard?userId=target_user_1',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        cache: 'no-store',
      }
    );
    expect(NextResponse.json).toHaveBeenCalledWith(dashboardData);
  });

  it('should handle backend non-ok response with JSON error', async () => {
    const mockGetToken = jest.fn();

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'session_user_3',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'User not found' })),
    });

    await GET(createMockRequest({ userId: 'unknown_user' }));

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'User not found' }, { status: 404 });
  });

  it('should handle backend non-ok response with non-JSON text', async () => {
    const mockGetToken = jest.fn();

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'session_user_4',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: jest.fn().mockResolvedValue('Service Unavailable'),
    });

    await GET(createMockRequest({ userId: 'target_user_2' }));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Service Unavailable' },
      { status: 503 }
    );
  });

  it('should return 500 on network error', async () => {
    const mockGetToken = jest.fn();

    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'session_user_5',
      getToken: mockGetToken,
    });
    (getBackendToken as jest.Mock).mockResolvedValue('token');
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await GET(createMockRequest({ userId: 'target_user_3' }));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  });
});

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';
import { POST } from '@/app/api/beneficiaries/self-register/route';

// Mock dependencies
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

// Mock fetch globally
global.fetch = jest.fn();

describe('POST /api/beneficiaries/self-register', () => {
  let mockRequest: { json: jest.Mock; nextUrl: { searchParams: URLSearchParams } };
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

    mockRequest = {
      json: jest.fn(),
      nextUrl: { searchParams: new URLSearchParams() },
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Authentication checks', () => {
    it('should return 401 when userId is missing', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: null,
        getToken: jest.fn(),
      });
      mockRequest.json.mockResolvedValue({});

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Non autorisé' }, { status: 401 });
    });
  });

  describe('Request body injection', () => {
    it('should inject clerkUserId from auth into request body', async () => {
      // Arrange
      const mockUserId = 'user_abc123';
      const mockGetToken = jest.fn();
      const requestBody = { firstName: 'John', lastName: 'Doe' };

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('mock-token');
      mockRequest.json.mockResolvedValue(requestBody);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const parsedBody = JSON.parse(fetchCall[1].body);

      expect(parsedBody).toEqual({
        ...requestBody,
        clerkUserId: mockUserId,
      });
    });
  });

  describe('Backend forwarding', () => {
    it('should forward form data to backend with correct URL', async () => {
      // Arrange
      const mockUserId = 'user_123';
      const mockGetToken = jest.fn();
      const requestBody = { firstName: 'Jane', email: 'jane@example.com' };

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('token-xyz');
      mockRequest.json.mockResolvedValue(requestBody);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 'ben_1' }),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/beneficiaries/self-register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token-xyz',
          },
          body: JSON.stringify({ ...requestBody, clerkUserId: mockUserId }),
        }
      );
    });

    it('should include Authorization header when token exists', async () => {
      // Arrange
      const mockUserId = 'user_456';
      const mockGetToken = jest.fn();

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('secure-token');
      mockRequest.json.mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['Authorization']).toBe('Bearer secure-token');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
    });

    it('should omit Authorization header when token is null', async () => {
      // Arrange
      const mockUserId = 'user_789';
      const mockGetToken = jest.fn();

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue(null);
      mockRequest.json.mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers).toEqual({ 'Content-Type': 'application/json' });
      expect(fetchCall[1].headers['Authorization']).toBeUndefined();
    });
  });

  describe('Backend error handling', () => {
    it('should handle backend error with JSON response', async () => {
      // Arrange
      const mockUserId = 'user_err1';
      const mockGetToken = jest.fn();
      const errorJson = { error: 'Email already exists' };

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('token');
      mockRequest.json.mockResolvedValue({ email: 'dup@example.com' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        text: jest.fn().mockResolvedValue(JSON.stringify(errorJson)),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Email already exists' },
        { status: 409 }
      );
    });

    it('should handle backend error with message field in JSON', async () => {
      // Arrange
      const mockUserId = 'user_err2';
      const mockGetToken = jest.fn();
      const errorJson = { message: 'Validation failed' };

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('token');
      mockRequest.json.mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue(JSON.stringify(errorJson)),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Validation failed' },
        { status: 400 }
      );
    });

    it('should handle backend error with non-JSON response', async () => {
      // Arrange
      const mockUserId = 'user_err3';
      const mockGetToken = jest.fn();

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('token');
      mockRequest.json.mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: jest.fn().mockResolvedValue('Bad Gateway'),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Bad Gateway' }, { status: 502 });
    });

    it('should handle backend error with empty text response', async () => {
      // Arrange
      const mockUserId = 'user_err4';
      const mockGetToken = jest.fn();

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('token');
      mockRequest.json.mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue(''),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    });
  });

  describe('Network error handling', () => {
    it('should return 500 when fetch rejects with a network error', async () => {
      // Arrange
      const mockUserId = 'user_net1';
      const mockGetToken = jest.fn();

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('token');
      mockRequest.json.mockResolvedValue({ firstName: 'Test' });
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Erreur serveur' }, { status: 500 });
    });
  });

  describe('URL construction', () => {
    it('should construct correct backend URL from env', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_API_URL = 'https://backend.prod.com';
      const mockUserId = 'user_url1';
      const mockGetToken = jest.fn();

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('token');
      mockRequest.json.mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://backend.prod.com/beneficiaries/self-register',
        expect.any(Object)
      );
    });
  });

  describe('Successful response', () => {
    it('should return backend data on success', async () => {
      // Arrange
      const mockUserId = 'user_ok1';
      const mockGetToken = jest.fn();
      const responseData = { id: 'ben_999', firstName: 'Alice' };

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('token');
      mockRequest.json.mockResolvedValue({ firstName: 'Alice' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(responseData),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(responseData);
    });

    it('should call getBackendToken with getToken from auth', async () => {
      // Arrange
      const mockUserId = 'user_tok1';
      const mockGetToken = jest.fn();

      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        getToken: mockGetToken,
      });
      (getBackendToken as jest.Mock).mockResolvedValue('resolved-token');
      mockRequest.json.mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act
      await POST(mockRequest as any);

      // Assert
      expect(getBackendToken).toHaveBeenCalledWith(mockGetToken);
    });
  });
});

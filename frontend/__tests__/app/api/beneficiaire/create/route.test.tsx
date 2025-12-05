import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { POST } from '@/app/api/beneficiaire/create/route';

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

// Mock fetch globally
global.fetch = jest.fn();

describe('POST /api/beneficiaire/create', () => {
  let mockRequest: Partial<Request>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    mockRequest = {
      json: jest.fn(),
    } as any;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment configuration', () => {
    it('should return 500 when API_URL is missing', async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.API_URL;
      (mockRequest.json as jest.Mock).mockResolvedValue({});

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'API_URL manquant' },
        { status: 500 }
      );
    });

    it('should use NEXT_PUBLIC_API_URL when available', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
      process.env.API_URL = 'https://fallback.example.com';

      const mockToken = 'mock-token';
      const mockOrgId = 'org_123';
      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({ firstName: 'John' });
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/beneficiaries/org_123',
        expect.any(Object)
      );
    });

    it('should fallback to API_URL when NEXT_PUBLIC_API_URL is not set', async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.API_URL = 'https://fallback.example.com';

      const mockToken = 'mock-token';
      const mockOrgId = 'org_456';
      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({ firstName: 'Jane' });
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://fallback.example.com/api/v1/beneficiaries/org_456',
        expect.any(Object)
      );
    });
  });

  describe('Authentication checks', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });

    it('should return 401 when token is missing', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(null),
        orgId: 'org_123',
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    });

    it('should return 401 when token is undefined', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(undefined),
        orgId: 'org_123',
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    });

    it('should return 401 when token is empty string', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(''),
        orgId: 'org_123',
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    });

    it('should return 400 when orgId is missing', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue('valid-token'),
        orgId: null,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'Aucune organisation active' },
        { status: 400 }
      );
    });

    it('should return 400 when orgId is undefined', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue('valid-token'),
        orgId: undefined,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'Aucune organisation active' },
        { status: 400 }
      );
    });

    it('should return 400 when orgId is empty string', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue('valid-token'),
        orgId: '',
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'Aucune organisation active' },
        { status: 400 }
      );
    });
  });

  describe('Successful beneficiary creation', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });

    it('should create beneficiary with valid data', async () => {
      // Arrange
      const mockToken = 'valid-token';
      const mockOrgId = 'org_123';
      const requestBody = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+221771234567',
      };
      const apiResponse = {
        success: true,
        data: { id: 'ben_123', ...requestBody },
      };

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue(requestBody);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(apiResponse),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/beneficiaries/org_123',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({
            ...requestBody,
            organizationId: mockOrgId,
          }),
        }
      );
      expect(NextResponse.json).toHaveBeenCalledWith(apiResponse, { status: 201 });
    });

    it('should add organizationId to request body', async () => {
      // Arrange
      const mockToken = 'token-456';
      const mockOrgId = 'org_789';
      const requestBody = { firstName: 'Jane', lastName: 'Smith' };

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue(requestBody);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const bodyString = fetchCall[1].body;
      const parsedBody = JSON.parse(bodyString);

      expect(parsedBody).toEqual({
        ...requestBody,
        organizationId: mockOrgId,
      });
    });

    it('should preserve all request body fields', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_abc';
      const requestBody = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        phone: '+221775555555',
        status: 'ACTIVE',
        customField: 'value',
      };

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue(requestBody);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const bodyString = fetchCall[1].body;
      const parsedBody = JSON.parse(bodyString);

      expect(parsedBody).toMatchObject(requestBody);
      expect(parsedBody.organizationId).toBe(mockOrgId);
    });

    it('should handle response with different status codes', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({ firstName: 'Test' });
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 200,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true }, { status: 200 });
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });

    it('should handle backend API errors', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_123';
      const errorResponse = {
        success: false,
        message: 'Email already exists',
      };

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: 'duplicate@example.com',
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(errorResponse),
        status: 400,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(errorResponse, { status: 400 });
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({ firstName: 'Test' });
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(POST(mockRequest as Request)).rejects.toThrow('Network error');
    });

    it('should handle invalid JSON response from backend', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({ firstName: 'Test' });
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        status: 500,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({}, { status: 500 });
    });

    it('should handle auth errors', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockRejectedValue(new Error('Auth failed'));
      (mockRequest.json as jest.Mock).mockResolvedValue({});

      // Act & Assert
      await expect(POST(mockRequest as Request)).rejects.toThrow('Auth failed');
    });

    it('should handle request body parsing errors', async () => {
      // Arrange
      (mockRequest.json as jest.Mock).mockRejectedValue(new Error('Invalid JSON body'));

      // Act & Assert
      await expect(POST(mockRequest as Request)).rejects.toThrow('Invalid JSON body');
    });
  });

  describe('Request headers', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });

    it('should include Authorization header with Bearer token', async () => {
      // Arrange
      const mockToken = 'secure-token-123';
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should include Content-Type application/json header', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
    });
  });

  describe('URL construction', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });

    it('should construct correct API URL with orgId', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_special_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/beneficiaries/org_special_123',
        expect.any(Object)
      );
    });

    it('should handle API URL without trailing slash', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
      const mockToken = 'token';
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toBe('https://api.example.com/api/v1/beneficiaries/org_123');
    });

    it('should handle API URL with trailing slash', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
      const mockToken = 'token';
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toBe('https://api.example.com//api/v1/beneficiaries/org_123');
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });

    it('should handle empty request body', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const bodyString = fetchCall[1].body;
      const parsedBody = JSON.parse(bodyString);

      expect(parsedBody).toEqual({ organizationId: mockOrgId });
    });

    it('should handle very long token strings', async () => {
      // Arrange
      const longToken = `token_${'a'.repeat(1000)}`;
      const mockOrgId = 'org_123';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(longToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${longToken}`);
    });

    it('should handle special characters in orgId', async () => {
      // Arrange
      const mockToken = 'token';
      const specialOrgId = 'org_123-456_special';

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: specialOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.example.com/api/v1/beneficiaries/${specialOrgId}`,
        expect.any(Object)
      );
    });

    it('should handle request body with null values', async () => {
      // Arrange
      const mockToken = 'token';
      const mockOrgId = 'org_123';
      const requestBody = { firstName: 'Test', phone: null };

      (auth as unknown as jest.Mock).mockResolvedValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
        orgId: mockOrgId,
      });
      (mockRequest.json as jest.Mock).mockResolvedValue(requestBody);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
        status: 201,
      });

      // Act
      await POST(mockRequest as Request);

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const bodyString = fetchCall[1].body;
      const parsedBody = JSON.parse(bodyString);

      expect(parsedBody.phone).toBeNull();
      expect(parsedBody.organizationId).toBe(mockOrgId);
    });
  });
});

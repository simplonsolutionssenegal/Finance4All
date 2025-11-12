import { NextResponse } from 'next/server';

import { GET } from '@/app/api/health/route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: async () => body,
      status: init?.status || 200,
      ...init,
    })),
  },
}));

describe('Health Check API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return healthy status with correct structure', async () => {
      // Mock Date
      const mockDate = '2025-01-15T10:00:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

      // Mock process.uptime
      const mockUptime = 123.456;
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);

      const response = await GET();
      const jsonResponse = await response.json();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          status: 'healthy',
          timestamp: mockDate,
          uptime: mockUptime,
          environment: process.env.NODE_ENV,
        },
        { status: 200 }
      );

      expect(jsonResponse).toEqual({
        status: 'healthy',
        timestamp: mockDate,
        uptime: mockUptime,
        environment: process.env.NODE_ENV,
      });
    });

    it('should return status 200 for healthy response', async () => {
      const response = await GET();

      expect(response.status).toBe(200);
    });

    it('should include timestamp in response', async () => {
      const mockDate = '2025-01-15T10:00:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

      const response = await GET();
      const jsonResponse = await response.json();

      expect(jsonResponse.timestamp).toBe(mockDate);
    });

    it('should include uptime in response', async () => {
      const mockUptime = 456.789;
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);

      const response = await GET();
      const jsonResponse = await response.json();

      expect(jsonResponse.uptime).toBe(mockUptime);
    });

    it('should include environment in response', async () => {
      const response = await GET();
      const jsonResponse = await response.json();

      expect(jsonResponse.environment).toBe(process.env.NODE_ENV);
      expect(jsonResponse).toHaveProperty('environment');
    });

    it('should handle different NODE_ENV values', async () => {
      // Test that the environment value is included regardless of its value
      const response = await GET();
      const jsonResponse = await response.json();

      // Verify environment field exists and is a string
      expect(jsonResponse).toHaveProperty('environment');
      expect(typeof jsonResponse.environment).toBe('string');

      // In test environment, NODE_ENV should be 'test'
      expect(['development', 'production', 'test']).toContain(jsonResponse.environment);
    });

    it('should return unhealthy status when error occurs', async () => {
      const mockError = new Error('Simulated error');
      const mockDate = '2025-01-15T10:00:00.000Z';

      // Mock Date before causing error
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

      // Force an error by making process.uptime throw
      jest.spyOn(process, 'uptime').mockImplementation(() => {
        throw mockError;
      });

      const response = await GET();
      const jsonResponse = await response.json();

      expect(console.error).toHaveBeenCalledWith('Health check failed:', mockError);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          status: 'unhealthy',
          timestamp: mockDate,
        },
        { status: 503 }
      );

      expect(jsonResponse).toEqual({
        status: 'unhealthy',
        timestamp: mockDate,
      });
      expect(response.status).toBe(503);
    });

    it('should return status 503 when unhealthy', async () => {
      // Force an error
      jest.spyOn(process, 'uptime').mockImplementation(() => {
        throw new Error('Test error');
      });

      const response = await GET();

      expect(response.status).toBe(503);
    });

    it('should log error to console when health check fails', async () => {
      const mockError = new Error('Critical failure');

      jest.spyOn(process, 'uptime').mockImplementation(() => {
        throw mockError;
      });

      await GET();

      expect(console.error).toHaveBeenCalledWith('Health check failed:', mockError);
    });

    it('should include timestamp in unhealthy response', async () => {
      const mockDate = '2025-01-15T12:30:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

      jest.spyOn(process, 'uptime').mockImplementation(() => {
        throw new Error('Test error');
      });

      const response = await GET();
      const jsonResponse = await response.json();

      expect(jsonResponse.timestamp).toBe(mockDate);
    });

    it('should not include uptime and environment in unhealthy response', async () => {
      jest.spyOn(process, 'uptime').mockImplementation(() => {
        throw new Error('Test error');
      });

      const response = await GET();
      const jsonResponse = await response.json();

      expect(jsonResponse.uptime).toBeUndefined();
      expect(jsonResponse.environment).toBeUndefined();
    });

    it('should handle error when Date.toISOString fails in healthy path', async () => {
      const mockDate = '2025-01-15T10:00:00.000Z';

      // First call succeeds (for try block), second call fails (for catch block)
      const dateToISOString = jest
        .spyOn(Date.prototype, 'toISOString')
        .mockImplementationOnce(() => {
          throw new Error('Date error');
        })
        .mockReturnValue(mockDate);

      const response = await GET();
      const jsonResponse = await response.json();

      expect(jsonResponse.status).toBe('unhealthy');
      expect(response.status).toBe(503);

      dateToISOString.mockRestore();
    });

    it('should return valid JSON structure for healthy response', async () => {
      const response = await GET();
      const jsonResponse = await response.json();

      expect(jsonResponse).toHaveProperty('status');
      expect(jsonResponse).toHaveProperty('timestamp');
      expect(jsonResponse).toHaveProperty('uptime');
      expect(jsonResponse).toHaveProperty('environment');
      expect(Object.keys(jsonResponse)).toHaveLength(4);
    });

    it('should return valid JSON structure for unhealthy response', async () => {
      jest.spyOn(process, 'uptime').mockImplementation(() => {
        throw new Error('Test error');
      });

      const response = await GET();
      const jsonResponse = await response.json();

      expect(jsonResponse).toHaveProperty('status');
      expect(jsonResponse).toHaveProperty('timestamp');
      expect(Object.keys(jsonResponse)).toHaveLength(2);
    });

    it('should use real uptime value when not mocked', async () => {
      // Don't mock process.uptime, let it return real value
      const response = await GET();
      const jsonResponse = await response.json();

      expect(typeof jsonResponse.uptime).toBe('number');
      expect(jsonResponse.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should use real timestamp when not mocked', async () => {
      const beforeTime = Date.now();
      const response = await GET();
      const jsonResponse = await response.json();
      const afterTime = Date.now();

      expect(jsonResponse.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Convert timestamp back to milliseconds for comparison
      const responseTime = new Date(jsonResponse.timestamp).getTime();
      expect(responseTime).toBeGreaterThanOrEqual(beforeTime);
      expect(responseTime).toBeLessThanOrEqual(afterTime);
    });
  });
});

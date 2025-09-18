import { clerkMiddleware } from '@clerk/nextjs/server';

jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: jest.fn(() => jest.fn()),
}));

const mockedClerkMiddleware = clerkMiddleware as jest.MockedFunction<typeof clerkMiddleware>;

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call clerkMiddleware', () => {
    require('../middleware');
    expect(mockedClerkMiddleware).toHaveBeenCalled();
  });

  it('should export the correct config', () => {
    const middleware = require('../middleware');
    expect(middleware.config).toBeDefined();
    expect(middleware.config.matcher).toEqual([
      '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
      '/(api|trpc)(.*)',
    ]);
  });

  it('should have correct matcher patterns', () => {
    const middleware = require('../middleware');
    const matcher = middleware.config.matcher;

    expect(matcher).toHaveLength(2);
    expect(matcher[0]).toContain('(?!_next');
    expect(matcher[1]).toBe('/(api|trpc)(.*)');
  });
});
import '@testing-library/jest-dom';

// Polyfills for Web APIs needed for Next.js API routes
import { ReadableStream } from 'stream/web';
import { TextEncoder, TextDecoder } from 'util';

// Add polyfills for Web APIs
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream as any;
}

// Mock Request and Response for Next.js API route testing
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(
      public url: string,
      public init?: any
    ) {}

    async json() {
      return this.init?.body ? JSON.parse(this.init.body) : {};
    }

    async text() {
      return this.init?.body || '';
    }

    get method() {
      return this.init?.method || 'GET';
    }

    get headers() {
      return this.init?.headers || {};
    }
  } as any;
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(
      public body?: any,
      public init?: ResponseInit
    ) {}

    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }

    get status() {
      return this.init?.status || 200;
    }

    get ok() {
      return this.status >= 200 && this.status < 300;
    }
  } as any;
}

// Mock de matchMedia (nécessaire pour les composants Radix UI) - seulement dans l'environnement jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock de scrollTo (souvent utilisé dans les composants UI)
  global.scrollTo = jest.fn();

  // Mock de getComputedStyle pour les tests de style
  global.getComputedStyle = jest.fn(() => ({
    getPropertyValue: jest.fn(),
  })) as any;

  // Mock de requestAnimationFrame
  global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
    return setTimeout(() => cb(Date.now()), 0) as unknown as number;
  });
  global.cancelAnimationFrame = jest.fn();
}

// Ces mocks peuvent être dans n'importe quel environnement
if (typeof global !== 'undefined') {
  // Mock de ResizeObserver (utilisé par certains composants Radix UI)
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock de IntersectionObserver (utilisé pour les animations et lazy loading)
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
}

// Mock des méthodes d'éléments HTML - seulement si Element/HTMLElement existent
// The following mocks are commented out because they interfere with @testing-library/user-event
// user-event simulates real user interactions, and mocking these methods can break the tests.
// if (typeof Element !== 'undefined') {
//     // Mock de Element.prototype.scrollIntoView
//     Element.prototype.scrollIntoView = jest.fn();
// }
//
// if (typeof HTMLElement !== 'undefined') {
//     // Mock de HTMLElement.prototype.focus
//     HTMLElement.prototype.focus = jest.fn();
//
//     // Mock de HTMLElement.prototype.blur
//     HTMLElement.prototype.blur = jest.fn();
//
//     // Mock de HTMLElement.prototype.click
//     HTMLElement.prototype.click = jest.fn();
//
//     // Mock de pointerCapture methods
//     HTMLElement.prototype.setPointerCapture = jest.fn();
//     HTMLElement.prototype.releasePointerCapture = jest.fn();
//     HTMLElement.prototype.hasPointerCapture = jest.fn();
// }

// Configuration pour les tests async
jest.setTimeout(10000);

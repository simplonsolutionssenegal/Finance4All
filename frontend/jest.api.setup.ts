// Setup spécialisé pour les tests d'API routes (environnement Node)
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

// Configuration pour les tests async
jest.setTimeout(10000);

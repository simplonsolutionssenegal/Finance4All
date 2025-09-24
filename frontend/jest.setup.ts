import '@testing-library/jest-dom';

// Configuration d'environnement pour les tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';


// Mock de matchMedia (nécessaire pour les composants Radix UI)
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

// Mock de Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock de HTMLElement.prototype.focus
HTMLElement.prototype.focus = jest.fn();

// Mock de HTMLElement.prototype.blur
HTMLElement.prototype.blur = jest.fn();

// Mock de HTMLElement.prototype.click
HTMLElement.prototype.click = jest.fn();

// Mock de pointerCapture methods
HTMLElement.prototype.setPointerCapture = jest.fn();
HTMLElement.prototype.releasePointerCapture = jest.fn();
HTMLElement.prototype.hasPointerCapture = jest.fn();

// Configuration pour les tests async
jest.setTimeout(10000);

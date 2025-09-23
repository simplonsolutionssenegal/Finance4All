import { act, render, renderHook, screen } from "@testing-library/react";

import { ThemeProvider, useTheme } from "@/contexts/theme-provider";

const mockMatchMedia = (matches: boolean) => ({
  matches,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  media: "(prefers-color-scheme: dark)",
  onchange: null,
  dispatchEvent: jest.fn(),
});

const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Mock matchMedia globally before tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(() => mockMatchMedia(false)),
});

describe("ThemeProvider", () => {
  let mockStorage: ReturnType<typeof mockLocalStorage>;
  let originalMatchMedia: typeof window.matchMedia;

  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
  });

  beforeEach(() => {
    mockStorage = mockLocalStorage();
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });

    // Set up matchMedia mock
    window.matchMedia = jest.fn().mockImplementation(() => mockMatchMedia(false));

    // Reset document classes
    document.documentElement.className = "";
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.documentElement.className = "";
  });

  it("renders children correctly", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("uses default theme when no stored theme exists", () => {
    mockStorage.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme}</div>;
    };

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("loads stored theme from localStorage", () => {
    mockStorage.getItem.mockReturnValue("dark");

    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("applies theme class to document element", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("handles system theme with dark preference", () => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => mockMatchMedia(true)),
      writable: true,
    });

    render(
      <ThemeProvider defaultTheme="system">
        <div>Content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("handles system theme with light preference", () => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => mockMatchMedia(false)),
      writable: true,
    });

    render(
      <ThemeProvider defaultTheme="system">
        <div>Content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("provides setTheme function that can be called", () => {
    const TestComponent = () => {
      const { setTheme } = useTheme();
      expect(typeof setTheme).toBe("function");
      return <div>Test</div>;
    };

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );
  });

  it("uses custom storage key", () => {
    mockStorage.getItem.mockReturnValue("dark");

    render(
      <ThemeProvider storageKey="custom-theme">
        <div>Content</div>
      </ThemeProvider>
    );

    expect(mockStorage.getItem).toHaveBeenCalledWith("custom-theme");
  });

  it("calculates actualTheme correctly for system theme", () => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => mockMatchMedia(true)),
      writable: true,
    });

    const TestComponent = () => {
      const { actualTheme } = useTheme();
      return <div data-testid="actual-theme">{actualTheme}</div>;
    };

    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("actual-theme")).toHaveTextContent("dark");
  });

  it("calculates actualTheme correctly for non-system theme", () => {
    const TestComponent = () => {
      const { actualTheme } = useTheme();
      return <div data-testid="actual-theme">{actualTheme}</div>;
    };

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("actual-theme")).toHaveTextContent("light");
  });

  it("applies initial theme class to document element", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("renders ThemeProvider context successfully", () => {
    render(
      <ThemeProvider>
        <div data-testid="content">Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});

describe("useTheme hook", () => {
  it("throws error when used outside ThemeProvider", () => {
    const TestComponent = () => {
      useTheme();
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
  });

  it("returns theme context when used within provider", () => {
    const TestComponent = () => {
      const context = useTheme();
      expect(context).toBeDefined();
      expect(typeof context.theme).toBe("string");
      expect(typeof context.setTheme).toBe("function");
      expect(typeof context.actualTheme).toBe("string");
      return <div data-testid="success">Success</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("success")).toBeInTheDocument();
  });

  it("provides correct theme values", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
      ),
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.actualTheme).toBe("dark");
    expect(typeof result.current.setTheme).toBe("function");
  });

  it("updates theme when setTheme is called", () => {
    const mockStorage = mockLocalStorage();
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      ),
    });

    expect(result.current.theme).toBe("light");

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
  });
});
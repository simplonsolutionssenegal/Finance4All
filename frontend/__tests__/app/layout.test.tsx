import RootLayout from "@/app/layout";

// Mock Clerk pour éviter les problèmes de module ES
jest.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
  useClerk: () => ({
    client: {
      signIn: {
        create: jest.fn(),
      },
    },
    session: null,
  }),
  useUser: () => ({
    user: null,
  }),
}));

jest.mock("@/components/theme-provider", () => {
  return {
    ThemeProvider: ({ children, defaultTheme }: { children: React.ReactNode; defaultTheme: string }) => (
      <div data-testid="theme-provider" data-default-theme={defaultTheme}>
        {children}
      </div>
    ),
  };
});

jest.mock("@/components/ui/sonner", () => {
  return {
    Toaster: ({ position }: { position: string }) => (
      <div data-testid="toaster" data-position={position}>
        Toaster
      </div>
    ),
  };
});

describe("RootLayout", () => {
  const mockChildren = <div data-testid="test-children">Test Content</div>;

  it("should be a function that returns JSX", () => {
    expect(typeof RootLayout).toBe("function");
    const result = RootLayout({ children: mockChildren });
    expect(result).toBeDefined();
    expect(result.type.name).toBe("ClerkProvider");
  });

  it("returns ClerkProvider with html element inside", () => {
    const result = RootLayout({ children: mockChildren });
    const htmlElement = result.props.children;
    expect(htmlElement.type).toBe("html");
    expect(htmlElement.props.lang).toBe("fr");
    expect(htmlElement.props.suppressHydrationWarning).toBe(true);
  });

  it("contains body element with children", () => {
    const result = RootLayout({ children: mockChildren });
    const htmlElement = result.props.children;
    const body = htmlElement.props.children;
    expect(body.type).toBe("body");
    expect(body.props.className).toContain("antialiased");
  });

  it("contains ThemeProvider with correct default theme", () => {
    const result = RootLayout({ children: mockChildren });
    const htmlElement = result.props.children;
    const body = htmlElement.props.children;
    const themeProvider = body.props.children;
    expect(themeProvider.type.name).toBe("ThemeProvider");
    expect(themeProvider.props.defaultTheme).toBe("light");
  });

  it("renders with empty children", () => {
    const result = RootLayout({ children: null });
    expect(result).toBeDefined();
    expect(result.type.name).toBe("ClerkProvider");
  });

  it("renders multiple children correctly", () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    const result = RootLayout({ children: multipleChildren });
    expect(result).toBeDefined();
    expect(result.type.name).toBe("ClerkProvider");
  });
});
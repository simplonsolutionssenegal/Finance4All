import { render, screen } from "@testing-library/react";

import PublicLayout from "@/app/(public)/layout";

jest.mock("@/components/public/layout/header", () => {
  return function MockPublicHeader() {
    return <header data-testid="public-header">Header</header>;
  };
});

jest.mock("@/components/public/layout/footer", () => {
  return function MockPublicFooter() {
    return <footer data-testid="public-footer">Footer</footer>;
  };
});

describe("PublicLayout", () => {
  const mockChildren = <div data-testid="test-children">Test Content</div>;

  it("renders without crashing", () => {
    render(<PublicLayout>{mockChildren}</PublicLayout>);
    expect(screen.getByTestId("test-children")).toBeInTheDocument();
    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });

  it("renders children inside main element", () => {
    render(<PublicLayout>{mockChildren}</PublicLayout>);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId("test-children"));
  });

  it("renders header and footer components", () => {
    render(<PublicLayout>{mockChildren}</PublicLayout>);
    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });

  it("has correct structure: header, main, footer", () => {
    const { container } = render(<PublicLayout>{mockChildren}</PublicLayout>);
    const outerDiv = container.firstChild;
    expect(outerDiv).toBeInTheDocument();
    
    const children = outerDiv?.childNodes;
    expect(children).toHaveLength(3);
  });

  it("main element has min-h-screen class", () => {
    render(<PublicLayout>{mockChildren}</PublicLayout>);
    const main = screen.getByRole("main");
    expect(main).toHaveClass("min-h-screen");
  });

  it("should be a function that returns JSX", () => {
    expect(typeof PublicLayout).toBe("function");
    const result = PublicLayout({ children: mockChildren });
    expect(result).toBeDefined();
    expect(result.type).toBe("div");
  });

  it("renders multiple children correctly", () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    render(<PublicLayout>{multipleChildren}</PublicLayout>);
    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("renders with empty children", () => {
    render(<PublicLayout>{null}</PublicLayout>);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("min-h-screen");
    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });

  it("maintains proper layout order", () => {
    render(<PublicLayout>{mockChildren}</PublicLayout>);
    
    const header = screen.getByTestId("public-header");
    const main = screen.getByRole("main");
    const footer = screen.getByTestId("public-footer");
    
    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });
});
import { render, screen } from "@testing-library/react";

import AuthLayout from "@/app/(auth)/layout";

describe("AuthLayout", () => {
  const mockChildren = <div data-testid="test-children">Test Content</div>;

  it("renders without crashing", () => {
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    expect(screen.getByTestId("test-children")).toBeInTheDocument();
  });

  it("renders children inside main element", () => {
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId("test-children"));
  });

  it("has correct structure with div and main", () => {
    const { container } = render(<AuthLayout>{mockChildren}</AuthLayout>);
    const outerDiv = container.firstChild;
    expect(outerDiv).toBeInTheDocument();
    expect(outerDiv?.firstChild).toHaveClass("min-h-screen");
  });

  it("main element has min-h-screen class", () => {
    render(<AuthLayout>{mockChildren}</AuthLayout>);
    const main = screen.getByRole("main");
    expect(main).toHaveClass("min-h-screen");
  });

  it("should be a function that returns JSX", () => {
    expect(typeof AuthLayout).toBe("function");
    const result = AuthLayout({ children: mockChildren });
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

    render(<AuthLayout>{multipleChildren}</AuthLayout>);
    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("renders with empty children", () => {
    render(<AuthLayout>{null}</AuthLayout>);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("min-h-screen");
  });
});
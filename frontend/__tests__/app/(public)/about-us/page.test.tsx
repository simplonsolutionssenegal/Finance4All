import { render, screen } from "@testing-library/react";

import AboutUs from "@/app/(public)/about-us/page";

describe("AboutUs", () => {
  it("renders without crashing", () => {
    render(<AboutUs />);
    expect(screen.getByText("Page de About Us")).toBeInTheDocument();
  });

  it("displays the correct content", () => {
    render(<AboutUs />);
    const content = screen.getByText("Page de About Us");
    expect(content).toBeInTheDocument();
  });

  it("renders as a div element", () => {
    const { container } = render(<AboutUs />);
    const divElement = container.querySelector("div");
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent("Page de About Us");
  });

  it("should be a function that returns JSX", () => {
    expect(typeof AboutUs).toBe("function");
    const result = AboutUs();
    expect(result).toBeDefined();
    expect(result.type).toBe("div");
  });
});
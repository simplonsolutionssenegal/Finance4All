import { render, screen } from "@testing-library/react";

import Login from "@/app/login/page";

describe("Login", () => {
  it("renders without crashing", () => {
    render(<Login />);
    expect(screen.getByText("Page de connexion")).toBeInTheDocument();
  });

  it("displays the correct content", () => {
    render(<Login />);
    const content = screen.getByText("Page de connexion");
    expect(content).toBeInTheDocument();
  });

  it("renders as a div element", () => {
    const { container } = render(<Login />);
    const divElement = container.querySelector("div");
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent("Page de connexion");
  });

  it("should be a function that returns JSX", () => {
    expect(typeof Login).toBe("function");
    const result = Login();
    expect(result).toBeDefined();
    expect(result.type).toBe("div");
  });
});
import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

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

describe("Home Page", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });

  it("displays the main title", () => {
    render(<Home />);
    expect(screen.getByText("Finance4All :")).toBeInTheDocument();
    expect(screen.getByText("Prenez le pouvoir")).toBeInTheDocument();
    expect(screen.getByText("sur vos finances !")).toBeInTheDocument();
  });

  it("displays the hero section subtitle", () => {
    render(<Home />);
    expect(screen.getByText("Formez-vous, simulez, et choisissez")).toBeInTheDocument();
    expect(screen.getByText("les meilleures solutions financières")).toBeInTheDocument();
    expect(screen.getByText("en toute autonomie.")).toBeInTheDocument();
  });

  it("renders the trust section", () => {
    render(<Home />);
    expect(screen.getByText("Ils font confiance à Finance4or all")).toBeInTheDocument();
  });

  it("displays about us section", () => {
    render(<Home />);
    expect(screen.getByText("À PROPOS DE NOUS")).toBeInTheDocument();
    expect(screen.getByText("Lire Plus")).toBeInTheDocument();
  });

  it("renders education section", () => {
    render(<Home />);
    expect(screen.getByText("Education financière")).toBeInTheDocument();
    expect(screen.getAllByText("Gestion de finance")).toHaveLength(3);
    expect(screen.getAllByText("20 heures")).toHaveLength(3);
    expect(screen.getAllByText("Voir Plus")).toHaveLength(3);
  });

  it("displays compare section", () => {
    render(<Home />);
    expect(screen.getByText("Comparer selon vos besoins")).toBeInTheDocument();
    expect(screen.getAllByText(/Service \d/)).toHaveLength(4);
    expect(screen.getAllByText("En savoir plus →")).toHaveLength(4);
  });

  it("renders testimonials section", () => {
    render(<Home />);
    expect(screen.getByText("Ils témoignent")).toBeInTheDocument();
    expect(screen.getAllByText("John Doe")).toHaveLength(3);
  });

  it("displays newsletter section", () => {
    render(<Home />);
    expect(screen.getByText("Abonnez-vous à notre newsletter pour rester informé")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
    expect(screen.getByText("S'abonner")).toBeInTheDocument();
  });

  it("renders services icons section", () => {
    render(<Home />);
    expect(screen.getAllByText(/Service \d/)).toHaveLength(8); // 4 in services + 4 in compare section
  });

  it("has correct structure with header and footer", () => {
    const { container } = render(<Home />);
    expect(container.querySelector('[data-testid="public-header"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="public-footer"]')).toBeInTheDocument();
  });

  it("contains all main sections", () => {
    const { container } = render(<Home />);
    const sections = container.querySelectorAll("section");
    expect(sections).toHaveLength(7); // Hero, Trust, About, Services, Education, Compare, Testimonials, Newsletter
  });

  it("should be a function that returns JSX", () => {
    expect(typeof Home).toBe("function");
    const result = Home();
    expect(result).toBeDefined();
    expect(result.type).toBe("div");
  });

  it("has proper CSS classes for responsive design", () => {
    const { container } = render(<Home />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass("min-h-screen");
  });

  it("renders email input with correct attributes", () => {
    render(<Home />);
    const emailInput = screen.getByPlaceholderText("Votre email");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("displays placeholder content for graphics", () => {
    render(<Home />);
    expect(screen.getByText("Graphiques financiers")).toBeInTheDocument();
    expect(screen.getByText("Image gratte-ciels + graphiques")).toBeInTheDocument();
  });
});
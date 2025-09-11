import { render, screen, fireEvent } from "@testing-library/react";

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

describe("Home Page - Lines 1-176 Coverage", () => {
  it("covers imports and component declaration (lines 1-4)", () => {
    // Test que les imports sont bien définis
    expect(Home).toBeDefined();
    expect(typeof Home).toBe('function');
  });

  it("renders without crashing and covers main div structure (lines 5-6)", () => {
    render(<Home />);
    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
    
    // Vérifier la structure principale
    const mainDiv = document.querySelector('.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
  });

  it("covers Hero Section (lines 10-36)", () => {
    render(<Home />);
    
    // Tester le contenu de la hero section
    expect(screen.getByText(/Finance4All/)).toBeInTheDocument();
    expect(screen.getByText(/Prenez le pouvoir/)).toBeInTheDocument();
    expect(screen.getByText(/sur vos finances/)).toBeInTheDocument();
    expect(screen.getByText(/Formez-vous, simulez, et choisissez/)).toBeInTheDocument();
    expect(screen.getByText(/les meilleures solutions financières/)).toBeInTheDocument();
    expect(screen.getByText(/en toute autonomie/)).toBeInTheDocument();
    expect(screen.getByText(/Graphiques financiers/)).toBeInTheDocument();
  });

  it("covers Trust Section (lines 38-54)", () => {
    render(<Home />);
    
    // Tester la section de confiance
    expect(screen.getByText(/Ils font confiance à Finance4or all/)).toBeInTheDocument();
    expect(screen.getByText("Logo 1")).toBeInTheDocument();
    expect(screen.getByText("Logo 2")).toBeInTheDocument(); 
    expect(screen.getByText("Logo 3")).toBeInTheDocument();
    expect(screen.getByText("Logo 4")).toBeInTheDocument();
    expect(screen.getByText("Logo 5")).toBeInTheDocument();
  });

  it("covers About Section (lines 56-79)", () => {
    render(<Home />);
    
    // Tester la section À propos
    expect(screen.getByText("À PROPOS DE NOUS")).toBeInTheDocument();
    expect(screen.getByText(/Lorem Ipsum is simply dummy text/)).toBeInTheDocument();
    expect(screen.getByText(/when an unknown printer took a galley/)).toBeInTheDocument();
    expect(screen.getByText("Lire Plus")).toBeInTheDocument();
    expect(screen.getByText(/Image gratte-ciels \+ graphiques/)).toBeInTheDocument();
  });

  it("covers Services Icons Section (lines 81-112)", () => {
    render(<Home />);
    
    // Tester la section des icônes de services - utiliser des sélecteurs plus spécifiques
    expect(screen.getByText("📊")).toBeInTheDocument();
    expect(screen.getByText("📈")).toBeInTheDocument();
    expect(screen.getByText("🛡️")).toBeInTheDocument();
    expect(screen.getByText("👤")).toBeInTheDocument();
    
    // Utiliser getAllByText pour les éléments dupliqués
    const serviceTexts = screen.getAllByText(/Service [1-4]/);
    expect(serviceTexts.length).toBeGreaterThanOrEqual(4);
    
    // Vérifier la structure de la section services (couleur de fond)
    const servicesSection = document.querySelector('.bg-teal-600');
    expect(servicesSection).toBeInTheDocument();
  });

  it("covers Education Section with map function (lines 114-139)", () => {
    render(<Home />);
    
    // Tester la section éducation financière
    expect(screen.getByText("Education financière")).toBeInTheDocument();
    expect(screen.getAllByText("Gestion de finance")).toHaveLength(3);
    expect(screen.getAllByText("20 heures")).toHaveLength(3);
    expect(screen.getAllByText("Voir Plus")).toHaveLength(3);
    expect(screen.getByText("Image cours 1")).toBeInTheDocument();
    expect(screen.getByText("Image cours 2")).toBeInTheDocument();
    expect(screen.getByText("Image cours 3")).toBeInTheDocument();
    expect(screen.getAllByText("⭐⭐⭐⭐⭐")).toHaveLength(6); // 3 dans education + 3 dans testimonials
  });

  it("covers Compare Section with map function (lines 141-163)", () => {
    render(<Home />);
    
    // Tester la section de comparaison
    expect(screen.getByText("Comparer selon vos besoins")).toBeInTheDocument();
    
    // Utiliser getAllByText pour les éléments emoji dupliqués
    const documentEmojis = screen.getAllByText("📄");
    expect(documentEmojis.length).toBe(4);
    
    // Vérifier les services dans la section de comparaison avec getAllByText
    const compareServices = screen.getAllByText(/Service [1-4]/);
    expect(compareServices.length).toBeGreaterThanOrEqual(4);
    
    expect(screen.getAllByText("Description du service et de ses avantages")).toHaveLength(4);
    expect(screen.getAllByText("En savoir plus →")).toHaveLength(4);
  });

  it("covers Testimonials Section with map function (lines 165-176)", () => {
    render(<Home />);
    
    // Tester la section témoignages jusqu'à la ligne 176
    expect(screen.getByText("Ils témoignent")).toBeInTheDocument();
    expect(screen.getAllByText(/Lorem ipsum is simply dummy text/)).toHaveLength(3);
    expect(screen.getAllByText("John Doe")).toHaveLength(3);
    expect(screen.getAllByText("⭐⭐⭐⭐⭐")).toHaveLength(6); // 3 dans education + 3 dans testimonials
  });

  it("displays the hero section subtitle", () => {
    render(<Home />);
    expect(screen.getByText(/Formez-vous, simulez, et choisissez/)).toBeInTheDocument();
    expect(screen.getByText(/les meilleures solutions financières/)).toBeInTheDocument();
    expect(screen.getByText(/en toute autonomie/)).toBeInTheDocument();
  });

  it("renders the trust section", () => {
    render(<Home />);
    expect(screen.getByText("Ils font confiance à Finance4or all")).toBeInTheDocument();
  });

  it("covers Newsletter Section structure", () => {
    render(<Home />);
    
    // Tester la section newsletter
    expect(screen.getByText("Abonnez-vous à notre newsletter pour rester informé")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
    expect(screen.getByText("S'abonner")).toBeInTheDocument();
    expect(screen.getByText("📧 Newsletter")).toBeInTheDocument();
  });

  it("tests email input functionality", () => {
    render(<Home />);
    
    const emailInput = screen.getByPlaceholderText("Votre email");
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it("covers complete component structure and all sections", () => {
    render(<Home />);
    
    // Test complet de la structure
    const sections = document.querySelectorAll("section");
    expect(sections).toHaveLength(8); // Hero, Trust, About, Services, Education, Compare, Testimonials, Newsletter
    
    // Vérifier la structure principale
    const mainDiv = document.querySelector('.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
  });

  it("contains all main sections", () => {
    const { container } = render(<Home />);
    const sections = container.querySelectorAll("section");
    expect(sections).toHaveLength(8); // Hero, Trust, About, Services, Education, Compare, Testimonials, Newsletter
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
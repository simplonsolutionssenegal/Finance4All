import NavLinks from "@/components/nav-links";
import { render, screen } from "@testing-library/react";


// Mock complet du module next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/utilisateurs",
}));

describe("NavLinks", () => {
  it("affiche toutes les links avec leurs noms", () => {
    render(<NavLinks />);

    const linkNames = [
      "Overview",
      "Institutions partenaires",
      "Cours & Formations",
      "Utilisateurs",
      "Home",
      "Invoices",
      "Settings"
    ];

    linkNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("applique la classe active sur le lien correspondant au pathname", () => {
    render(<NavLinks />);
    const activeLink = screen.getByText("Utilisateurs").closest("a");
    expect(activeLink).toHaveClass("bg-sky-100 text-black");
  });
});

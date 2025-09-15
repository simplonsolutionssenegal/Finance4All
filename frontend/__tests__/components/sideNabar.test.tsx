// __tests__/components/SideNav.test.tsx
import SideNav from "@/components/sidenav";
import { render, screen } from "@testing-library/react";

// Mock des composants internes si besoin
jest.mock("@/components/nav-links", () => () => <div data-testid="nav-links" />);

describe("SideNav Component", () => {
  it("affiche le Dashboard et le menu Profil", () => {
    render(<SideNav />);

    // Vérifier le titre Dashboard
    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    // Vérifier que NavLinks est rendu
    expect(screen.getByTestId("nav-links")).toBeInTheDocument();

    // Vérifier le menu Profil
    expect(screen.getByText("Profil")).toBeInTheDocument();
    expect(screen.getByText("Jajaar")).toBeInTheDocument();
    expect(screen.getByText("dgueye.ext@simplon.co")).toBeInTheDocument();

    // Vérifier le bouton Log out
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });
});

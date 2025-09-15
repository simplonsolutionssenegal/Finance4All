
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/header";


jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, ...rest } = props;
    return <img src={typeof src === "string" ? src : ""} alt={alt} {...rest} />;
  },
}));



describe("Header", () => {
  it("rend le logo et le titre Dashboard", () => {
    render(<Header />);

    // Logo (alt="Logo")
    expect(screen.getByAltText("Logo")).toBeInTheDocument();

    // Titre
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("affiche le champ de recherche (desktop) avec le placeholder", () => {
    render(<Header />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("ouvre le menu Notifications et affiche les éléments", async () => {
    render(<Header />);
    const user = userEvent.setup();

 
    const badge = screen.getByText("3");
    const notifButton = badge.closest("button");
    expect(notifButton).toBeTruthy();

    await user.click(notifButton!);

    expect(await screen.findByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Nouvelle commande")).toBeInTheDocument();
    expect(screen.getByText("Mise à jour système")).toBeInTheDocument();
    expect(screen.getByText("Nouveau message")).toBeInTheDocument();
  });

  

});


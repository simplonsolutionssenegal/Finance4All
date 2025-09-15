import React from "react";
import { render, screen } from "@testing-library/react";
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
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("affiche le champ de recherche (desktop) avec le placeholder", () => {
    render(<Header />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("rend les badges et les titres de notifications (sans cliquer)", () => {
    render(<Header />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});

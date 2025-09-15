// __tests__/components/admin/UserStats.test.tsx
import UserStats from "@/components/admin/UserStatst";
import { render, screen, within } from "@testing-library/react";

const mockUsers = [
  { id: 1, email: "user1@test.com", username: "user1", firstName: "User", lastName: "One", role: "admin", status: "active",  avatar: "", isActive: true,  lastLoginAt: "2025-09-10",
    organisationId: 1, organisation: { id: 1, name: "Org 1", avatar: "", address: "Address 1", phone: "12345", createdAt: "2025-01-01", updatedAt: "2025-01-01" },
    createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  { id: 2, email: "user2@test.com", username: "user2", firstName: "User", lastName: "Two", role: "user",  status: "pending", avatar: "", isActive: false, lastLoginAt: "2025-09-11",
    organisationId: 1, organisation: { id: 1, name: "Org 1", avatar: "", address: "Address 1", phone: "12345", createdAt: "2025-01-01", updatedAt: "2025-01-01" },
    createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  { id: 3, email: "user3@test.com", username: "user3", firstName: "User", lastName: "Three", role: "user", status: "inactive", avatar: "", isActive: false, lastLoginAt: "2025-09-12",
    organisationId: 1, organisation: { id: 1, name: "Org 1", avatar: "", address: "Address 1", phone: "12345", createdAt: "2025-01-01", updatedAt: "2025-01-01" },
    createdAt: "2025-01-01", updatedAt: "2025-01-01" },
];

describe("UserStats", () => {
  it("affiche correctement titres, totaux et pourcentages", () => {
    // total=3, active=1 => 33%, pending=1 => 33%
    render(<UserStats users={mockUsers} />);

    const totalCard   = screen.getByTestId("card-total");
    const activeCard  = screen.getByTestId("card-active");
    const pendingCard = screen.getByTestId("card-pending");

    // Titres
    expect(within(totalCard).getByText("Total Utilisateurs")).toBeInTheDocument();
    expect(within(activeCard).getByText("Utilisateurs Actifs")).toBeInTheDocument();
    expect(within(pendingCard).getByText("Utilisateurs Attente")).toBeInTheDocument();

    // Compteurs
    expect(within(totalCard).getByTestId("card-total-count")).toHaveTextContent("3");
    expect(within(activeCard).getByTestId("card-active-count")).toHaveTextContent("1");
    expect(within(pendingCard).getByTestId("card-pending-count")).toHaveTextContent("1");

    // Pourcentages (💡 attention: ta carte "total" affiche "33 Actifs" SANS le symbole %)
    expect(within(totalCard).getByTestId("card-total-percentage")).toHaveTextContent("33 Actifs");
    expect(within(pendingCard).getByTestId("card-pending-percentage")).toHaveTextContent("33%");
  });

  it("affiche 0 partout quand aucun utilisateur n'est passé", () => {
    render(<UserStats users={[]} />);

    const totalCard   = screen.getByTestId("card-total");
    const activeCard  = screen.getByTestId("card-active");
    const pendingCard = screen.getByTestId("card-pending");

    expect(within(totalCard).getByTestId("card-total-count")).toHaveTextContent("0");
    expect(within(activeCard).getByTestId("card-active-count")).toHaveTextContent("0");
    expect(within(pendingCard).getByTestId("card-pending-count")).toHaveTextContent("0");

    // 0 Actifs (toujours sans % dans ta carte "total")
    expect(within(totalCard).getByTestId("card-total-percentage")).toHaveTextContent("0 Actifs");
 
    expect(within(pendingCard).getByTestId("card-pending-percentage")).toHaveTextContent("0%");
  });
});

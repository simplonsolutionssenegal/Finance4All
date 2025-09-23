import { render, screen, within } from "@testing-library/react";

import UserStatsCards from "@/components/users/UserStatsCards";

// Mock Clerk hooks
const mockUseOrganization = jest.fn();

jest.mock("@clerk/nextjs", () => ({
  useOrganization: () => mockUseOrganization(),
}));

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className, variant, size }: any) => (
    <button data-testid="button" className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Users: (props: any) => <div data-testid="users-icon" {...props} />,
  UserCheck: (props: any) => <div data-testid="user-check-icon" {...props} />,
  UserPlus: (props: any) => <div data-testid="user-plus-icon" {...props} />,
  MoreHorizontal: (props: any) => <div data-testid="more-horizontal-icon" {...props} />,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UserStatsCards", () => {
  describe("No Data State", () => {
    it("renders default stats when no memberships data", () => {
      mockUseOrganization.mockReturnValue({
        memberships: undefined,
        invitations: undefined,
      });

      render(<UserStatsCards />);

      // All values should be 0
      expect(screen.getByText("Total utilisateurs")).toBeInTheDocument();
      expect(screen.getByText("Utilisateurs actifs")).toBeInTheDocument();
      expect(screen.getByText("Utilisateurs en attente")).toBeInTheDocument();

      // Values should be 0
      const values = screen.getAllByText("0");
      expect(values).toHaveLength(3);
    });

    it("renders default stats when memberships data is null", () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: null },
        invitations: undefined,
      });

      render(<UserStatsCards />);

      const values = screen.getAllByText("0");
      expect(values).toHaveLength(3);
    });
  });

  describe("With Memberships Data", () => {
    const mockMemberships = {
      data: [
        {
          id: "mem_1",
          role: "admin",
          publicUserData: {
            userId: "user_1",
            firstName: "John",
            lastName: "Doe",
            identifier: "john.doe@example.com",
          },
        },
        {
          id: "mem_2",
          role: "member",
          publicUserData: {
            userId: "user_2",
            firstName: "Jane",
            lastName: "Smith",
            identifier: "jane.smith@example.com",
          },
        },
        {
          id: "mem_3",
          role: "admin",
          publicUserData: null, // Inactive user
        },
      ],
    };

    beforeEach(() => {
      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { count: 2 },
      });
    });

    it("calculates and displays correct total users", () => {
      render(<UserStatsCards />);

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Total utilisateurs")).toBeInTheDocument();
    });

    it("calculates and displays correct active users", () => {
      render(<UserStatsCards />);

      const cards = screen.getAllByTestId("card");
      expect(within(cards[1]).getByText("2")).toBeInTheDocument();
      expect(within(cards[1]).getByText("Utilisateurs actifs")).toBeInTheDocument();
    });

    it("calculates and displays correct pending users", () => {
      render(<UserStatsCards />);

      const cards = screen.getAllByTestId("card");
      expect(within(cards[2]).getByText("2")).toBeInTheDocument();
      expect(within(cards[2]).getByText("Utilisateurs en attente")).toBeInTheDocument();
    });

    it("calculates and displays correct admin count", () => {
      render(<UserStatsCards />);

      expect(screen.getByText("2 administrateurs")).toBeInTheDocument();
    });

    it("displays correct percentage for active users", () => {
      render(<UserStatsCards />);

      expect(screen.getByText("67% du total")).toBeInTheDocument();
    });

    it("displays correct percentage for active users", () => {
      render(<UserStatsCards />);

      expect(screen.getByText("67% du total")).toBeInTheDocument();
    });
  });

  describe("Single Admin Case", () => {
    it("uses singular form for single admin", () => {
      const mockMemberships = {
        data: [
          {
            id: "mem_1",
            role: "admin",
            publicUserData: {
              userId: "user_1",
              firstName: "John",
              lastName: "Doe",
              identifier: "john.doe@example.com",
            },
          },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { count: 1 },
      });

      render(<UserStatsCards />);

      expect(screen.getByText("1 administrateur")).toBeInTheDocument();
    });
  });

  describe("All Active Users", () => {
    it("handles 100% active users correctly", () => {
      const mockMemberships = {
        data: [
          {
            id: "mem_1",
            role: "admin",
            publicUserData: {
              userId: "user_1",
              firstName: "John",
              lastName: "Doe",
              identifier: "john.doe@example.com",
            },
          },
          {
            id: "mem_2",
            role: "member",
            publicUserData: {
              userId: "user_2",
              firstName: "Jane",
              lastName: "Smith",
              identifier: "jane.smith@example.com",
            },
          },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { count: 0 },
      });

      render(<UserStatsCards />);

      expect(screen.getByText("100% du total")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument(); // pending users
    });
  });

  describe("Icons and Styling", () => {
    it("renders correct icons for each stat card", () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { count: 0 },
      });

      render(<UserStatsCards />);

      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
      expect(screen.getByTestId("user-check-icon")).toBeInTheDocument();
      expect(screen.getByTestId("user-plus-icon")).toBeInTheDocument();
      expect(screen.getAllByTestId("more-horizontal-icon")).toHaveLength(3);
    });

    it("renders stat cards with correct structure", () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { count: 0 },
      });

      render(<UserStatsCards />);

      const cards = screen.getAllByTestId("card");
      expect(cards).toHaveLength(3);

      const cardHeaders = screen.getAllByTestId("card-header");
      expect(cardHeaders).toHaveLength(3);

      const cardContents = screen.getAllByTestId("card-content");
      expect(cardContents).toHaveLength(3);
    });

    it("applies correct CSS classes to cards", () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { count: 0 },
      });

      render(<UserStatsCards />);

      const cards = screen.getAllByTestId("card");
      cards.forEach((card) => {
        expect(card).toHaveClass("relative", "bg-white", "shadow-sm", "border", "border-gray-100", "rounded-2xl");
      });
    });
  });

  describe("Grid Layout", () => {
    it("renders cards in a responsive grid", () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { count: 0 },
      });

      const { container } = render(<UserStatsCards />);

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-6", "mb-6");
    });
  });

  describe("Edge Cases", () => {
    it("handles division by zero for percentages", () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { count: 0 },
      });

      render(<UserStatsCards />);

      // When total is 0, percentage calculation should not crash
      expect(screen.getAllByText("0% du total")).toHaveLength(1);
    });

    it("handles empty data array", () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { count: 0 },
      });

      render(<UserStatsCards />);

      expect(screen.getByText("Total utilisateurs")).toBeInTheDocument();
      expect(screen.getByText("Utilisateurs actifs")).toBeInTheDocument();
      expect(screen.getByText("Utilisateurs en attente")).toBeInTheDocument();

      const zeroValues = screen.getAllByText("0");
      expect(zeroValues).toHaveLength(3);
    });

    it("handles all inactive users", () => {
      const mockMemberships = {
        data: [
          {
            id: "mem_1",
            role: "admin",
            publicUserData: null,
          },
          {
            id: "mem_2",
            role: "member",
            publicUserData: null,
          },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { count: 5 },
      });

      render(<UserStatsCards />);

      const cards = screen.getAllByTestId("card");

      // Total users card
      expect(within(cards[0]).getByText("Total utilisateurs")).toBeInTheDocument();
      expect(within(cards[0]).getByText("2")).toBeInTheDocument();

      // Active users card
      expect(within(cards[1]).getByText("Utilisateurs actifs")).toBeInTheDocument();
      expect(within(cards[1]).getByText("0")).toBeInTheDocument();
      expect(within(cards[1]).getByText("0% du total")).toBeInTheDocument();

      // Pending users card
      expect(within(cards[2]).getByText("Utilisateurs en attente")).toBeInTheDocument();
      expect(within(cards[2]).getByText("5")).toBeInTheDocument();
    });
  });

  describe("Role Filtering", () => {
    it("correctly counts admins vs other roles", () => {
      const mockMemberships = {
        data: [
          { id: "mem_1", role: "admin", publicUserData: {} },
          { id: "mem_2", role: "member", publicUserData: {} },
          { id: "mem_3", role: "moderator", publicUserData: {} },
          { id: "mem_4", role: "admin", publicUserData: {} },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { count: 1 },
      });

      render(<UserStatsCards />);

      expect(screen.getByText("2 administrateurs")).toBeInTheDocument();
    });
  });

  describe("Color Indicators", () => {
    it("renders color indicators for each stat type", () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [{ id: "mem_1", role: "admin", publicUserData: {} }] },
        invitations: { count: 1 },
      });

      const { container } = render(<UserStatsCards />);

      // Check for blue indicator (total users)
      expect(container.querySelector(".bg-blue-500")).toBeInTheDocument();

      // Check for green indicator (active users)
      expect(container.querySelector(".bg-green-500")).toBeInTheDocument();

      // Note: orange indicator (pending users) is not rendered because subtitle is empty
      // This is expected behavior based on component implementation
    });
  });
});
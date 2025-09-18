// frontend/components/admin/UserStatst.tsx
"use client";

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role?: string;
  status?: string; // "ACTIF" | "INACTIF" | "EN_ATTENTE"
  avatar?: string;
  isActive: boolean;
  lastSignInAt: string | null;
  organisationId: number;
  createdAt: string;
  updatedAt: string;
}

interface UserStatsProps {
  users: User[];
}

const UserStatst: React.FC<UserStatsProps> = ({ users }) => {
  const stats = {
    total: users.length,
    active: users.filter((user) => user.status === "ACTIF").length,
    pending: users.filter((user) => user.status === "EN_ATTENTE").length,
    inactive: users.filter((user) => user.status === "INACTIF").length,
  };

  const activePercentage =
    users.length > 0 ? Math.round((stats.active / users.length) * 100) : 0;
  const pendingPercentage =
    users.length > 0 ? Math.round((stats.pending / users.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-6">
      {/* Carte Total utilisateurs */}
      <div
        className="bg-white rounded-lg p-6 border border-[#EAEAEA] shadow-[1px_5px_#EAEAEA]"
        data-testid="card-total"
      >
        <h3 className="text-lg font-semibold" style={{ color: "#6CB9C6" }}>
          Total Utilisateurs
        </h3>
        <span
          className="text-3xl font-bold"
          style={{ color: "#000000" }}
          data-testid="card-total-count"
        >
          {stats.total}
        </span>
        <span
          className="ml-2 text-sm font-medium flex items-center"
          style={{ color: "#6CB9C6" }}
          data-testid="card-total-percentage"
        >
          {activePercentage}% Actifs
        </span>
      </div>

      {/* Carte Utilisateurs actifs */}
      <div
        className="bg-white rounded-lg p-6 border border-[#EAEAEA] shadow-[1px_5px_#EAEAEA]"
        data-testid="card-active"
      >
        <h3 className="text-lg font-semibold" style={{ color: "#6CB9C6" }}>
          Utilisateurs Actifs
        </h3>
        <span
          className="text-3xl font-bold"
          style={{ color: "#000000" }}
          data-testid="card-active-count"
        >
          {stats.active}
        </span>
        <span
          className="ml-2 text-sm font-medium flex items-center"
          style={{ color: "#6CB9C6" }}
          data-testid="card-active-percentage"
        >
          {activePercentage}%
        </span>
      </div>

      {/* Carte Utilisateurs en attente */}
      <div
        className="bg-white rounded-lg p-6 border border-[#EAEAEA] shadow-[1px_5px_#EAEAEA]"
        data-testid="card-pending"
      >
        <h3 className="text-lg font-semibold" style={{ color: "#6CB9C6" }}>
          Utilisateurs En Attente
        </h3>
        <span
          className="text-3xl font-bold"
          style={{ color: "#000000" }}
          data-testid="card-pending-count"
        >
          {stats.pending}
        </span>
        <span
          className="ml-2 text-sm font-medium flex items-center"
          style={{ color: "#6CB9C6" }}
          data-testid="card-pending-percentage"
        >
          {pendingPercentage}%
        </span>
      </div>
    </div>
  );
};

export default UserStatst;

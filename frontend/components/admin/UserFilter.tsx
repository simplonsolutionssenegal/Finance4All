"use client";

import { CheckCircle, Filter as FilterIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ---------------- Types ----------------
export interface UserFilters {
  search?: string;
  status: string[];
  roleId: string[];
  organizationId: string[];
  dateRange: "" | "recent" | "month" | "custom";
  customDate?: Date | null;
}

interface UserFilterProps {
  onFiltersChange: (filters: UserFilters) => void;
  currentFilters: UserFilters;
}

// ---------------- Utils ----------------
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function toDateInputValue(d?: Date | null) {
  if (!d) return "";
  const dd = new Date(d);
  const yyyy = dd.getFullYear();
  const mm = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${day}`;
}

function fromDateInputValue(v: string): Date | null {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// Session storage utilities
const FILTERS_STORAGE_KEY = 'finance4all_user_filters';

function saveFiltersToSession(filters: UserFilters) {
  try {
    const filtersToSave = {
      ...filters,
      customDate: filters.customDate ? filters.customDate.toISOString() : null,
    };
    sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde des filtres:', error);
  }
}

function loadFiltersFromSession(): UserFilters | null {
  try {
    const saved = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      customDate: parsed.customDate ? new Date(parsed.customDate) : null,
    };
  } catch (error) {
    console.warn('Erreur lors du chargement des filtres:', error);
    return null;
  }
}

// ---------------- Chip ----------------
function FilterChip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="inline-flex items-center max-h-5 rounded-full border px-1 py-1 text-xs transition focus:outline-none focus:ring-2 text-gray-700 border-gray-200 hover:bg-gray-200 focus:ring-gray-300"
    >
      <CheckCircle 
      aria-pressed={selected}
      onClick={onClick} className={cn(
        "max-h-4 w-4 mr-1",
        selected
          ? "font-bold text-green-600 border-green-300 focus:ring-green-900"
          : "text-gray-300 border-gray-200 hover:bg-gray-200 focus:ring-gray-300",
        className
      )} />
      <span>{children}</span>
    </button>
  );
}

// ---------------- Component ----------------
export default function UserFilter({
  onFiltersChange,
  currentFilters,
}: UserFilterProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<UserFilters>(() => {
    // Essayer de charger les filtres depuis la session au premier chargement
    const savedFilters = loadFiltersFromSession();
    if (savedFilters) {
      // Appliquer immédiatement les filtres sauvegardés
      setTimeout(() => onFiltersChange(savedFilters), 0);
      return savedFilters;
    }
    return currentFilters;
  });
  const [roles, setRoles] = useState<Array<{id: string, name: string}>>([]);
  const [organizations, setOrganizations] = useState<Array<{id: string, name: string}>>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // Fetch roles and organizations from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch roles (assuming we have an endpoint for this)
        const rolesResponse = await fetch('http://localhost:5000/api/v1/roles');

        if (!rolesResponse.ok) {
          throw new Error(`Erreur HTTP: ${rolesResponse.status}`);
        }

        const rolesData = await rolesResponse.json();
        
        setRoles(rolesData);
        
        // Fetch organizations
        const orgsResponse = await fetch('http://localhost:5000/api/v1/organizations');

        if (!orgsResponse.ok) {
          throw new Error(`Erreur HTTP: ${orgsResponse.status}`);
        }
        
        const orgsData = await orgsResponse.json();
        
        if (orgsData) {
          setOrganizations(orgsData);
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Pas de données de fallback - laisser vide
        setRoles([]);
        setOrganizations([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const statusOptions = [
    { id: "ACTIF", label: "ACTIF" },
    { id: "EN_ATTENTE", label: "EN ATTENTE" },
    { id: "INACTIF", label: "INACTIF" },
    { id: "SUSPENDU", label: "SUSPENDU" },
  ];

  const dateRanges = [
    { id: "recent", label: "7 derniers jours" },
    { id: "month", label: "30 derniers jours" },
    { id: "custom", label: "Date personnalisée" },
  ] as const;

  const handleCheckboxChange = (
    category: keyof Pick<UserFilters, "status" | "roleId" | "organizationId">,
    value: string
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const handleDateRangeChange = (value: UserFilters["dateRange"]) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: value,
      customDate: value === "custom" ? prev.customDate ?? new Date() : null,
    }));
  };

  const handleCustomDateChange = (v: string) => {
    setLocalFilters((prev) => ({ ...prev, customDate: fromDateInputValue(v) }));
  };

  const handleConfirm = () => {
    // Sauvegarder les filtres dans la session avant de les appliquer
    saveFiltersToSession(localFilters);
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleCancel = () => {
    setLocalFilters(currentFilters);
    setOpen(false);
  };

  // Fonction handleReset supprimée car le bouton a été retiré du modal

  const hasActiveFilters = useMemo(() => {
    return (
      currentFilters.status.length > 0 ||
      currentFilters.roleId.length > 0 ||
      currentFilters.organizationId.length > 0 ||
      (currentFilters.dateRange && currentFilters.dateRange !== "recent") ||
      !!currentFilters.customDate
    );
  }, [currentFilters]);

  const activeCount = useMemo(() => {
    let n =
      currentFilters.status.length +
      currentFilters.roleId.length +
      currentFilters.organizationId.length;
    if (
      (currentFilters.dateRange && currentFilters.dateRange !== "recent") ||
      currentFilters.customDate
    ) {
      n += 1;
    }
    return n;
  }, [currentFilters]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center h-11 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
          hasActiveFilters
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-800 hover:bg-gray-900"
        }`}
      >
        <FilterIcon className="mr-2 h-4 w-4" />
        Filtrer
        {hasActiveFilters && (
          <span className="ml-2 rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div 
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          onClick={(e) => {
            // Fermer le modal si on clique sur l'overlay (pas sur le contenu)
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs mx-4">

            <div className="p-4 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* Rôles */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-gray-900 border-b border-[#EAEAEA]">Rôles</h3>
                <div className="flex flex-wrap gap-2">
                  {isLoadingData ? (
                    <div className="text-xs text-gray-500">Chargement des rôles...</div>
                  ) : roles.length === 0 ? (
                    <div className="text-xs text-gray-500">Aucun rôle disponible</div>
                  ) : (
                    roles.map((role) => (
                      <FilterChip
                        key={role.id}
                        selected={localFilters.roleId.includes(role.id)}
                        onClick={() => handleCheckboxChange("roleId", role.id)}
                      >
                        {role.name}
                      </FilterChip>
                    ))
                  )}
                </div>
              </section>

              {/* Date de création */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-gray-900 border-b border-[#EAEAEA]">Date de création</h3>
                <div className="flex flex-wrap gap-2">
                  {dateRanges.map((range) => (
                    <FilterChip
                      key={range.id}
                      selected={localFilters.dateRange === range.id}
                      onClick={() => handleDateRangeChange(range.id)}
                    >
                      {range.label}
                    </FilterChip>
                  ))}
                </div>
                {localFilters.dateRange === "custom" && (
                  <div className="mt-3">
                    <input
                      type="date"
                      value={toDateInputValue(localFilters.customDate)}
                      onChange={(e) => handleCustomDateChange(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:border-green-600 focus:ring-green-600"
                    />
                  </div>
                )}
              </section>

              {/* Organisations */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-gray-900 border-b border-[#EAEAEA]">Organisations</h3>
                <div className="flex flex-wrap gap-2">
                  {isLoadingData ? (
                    <div className="text-xs text-gray-500">Chargement des organisations...</div>
                  ) : organizations.length === 0 ? (
                    <div className="text-xs text-gray-500">Aucune organisation disponible</div>
                  ) : (
                    organizations.map((org) => (
                      <FilterChip
                        key={org.id}
                        selected={localFilters.organizationId.includes(org.id)}
                        onClick={() => handleCheckboxChange("organizationId", org.id)}
                      >
                        {org.name}
                      </FilterChip>
                    ))
                  )}
                </div>
              </section>

              {/* Statut */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-gray-900 border-b border-[#EAEAEA]">Statut</h3>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <FilterChip
                      key={status.id}
                      selected={localFilters.status.includes(status.id)}
                      onClick={() => handleCheckboxChange("status", status.id)}
                    >
                      {status.label}
                    </FilterChip>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-2 mb-2 p-2 flex items-center justify-between">
              <button
                onClick={handleCancel}
                className="px-6 py-1 text-xs font-medium text-black-900 bg-gray-400 rounded-md hover:bg-gray-600 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirm}
                  className="px-6 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 cursor-pointer"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

}

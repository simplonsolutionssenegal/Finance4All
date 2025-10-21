// Prisma TypeService enum
export type TypeService =
  | 'PAIEMENT_MARCHAND'
  | 'ACHAT_CREDIT'
  | 'PAIEMENT_FACTURES'
  | 'DEPOT_SIMPLE'
  | 'DEPOT_RETRAIT_SIMPLE'
  | 'RETRAIT_SIMPLE'
  | 'TRANSFERT_ARGENT'
  | 'BANQUE_WALLET'
  | 'WALLET_BANQUE'
  | 'EPARGNE'
  | 'CREDIT'
  | 'ASSURANCE'
  | 'AUTRES';

// Prisma InstitutionStatus enum
export type InstitutionStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

// Institution model from Prisma
export interface Institution {
  id: string;
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
  status: InstitutionStatus;
  createdAt: string;
  updatedAt: string;
}

// Service model from Prisma
export interface Service {
  id: string;
  name: string;
  longName: string;
  type: TypeService;
  frais: Record<string, unknown>;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
  institutionId: string;
  createdAt: string;
  updatedAt: string;
}

// Extended service with institution data for UI display
export interface FinancialService extends Service {
  institution: Institution;
  // Computed/display field for backwards compatibility
  designation: string;
  // Institution fields duplicated for easier access
  status: InstitutionStatus;
  geographicZones: string[];
  description: string;
  // Legacy/computed fields not in Prisma schema (may be derived from frais JSON)
  maxAmount?: number;
  minAmount?: number;
  interestRate?: number;
  reimbursement?: string;
}

export interface FilterOptions {
  serviceType: ('Epargne' | 'Crédit' | 'Autre type')[];
  geographicZone: ('Zone Géo A' | 'Zone Géo B')[];
  institut: ('SIMPLON' | 'PAYTECH SN' | 'ODK')[];
  date: 'Récente' | 'Il y a 3 mois';
}

export interface SearchAndFilterState {
  searchTerm: string;
  filters: FilterOptions;
  sortBy:
    | 'designation'
    | 'type'
    | 'institution'
    | 'name'
    | 'longName'
    | 'maxAmount'
    | 'interestRate';
  sortOrder: 'asc' | 'desc';
  viewMode: 'table' | 'grid';
  currentPage: number;
  itemsPerPage: number;
}

// API response type for institutions with nested services
export interface InstitutionWithServices extends Institution {
  services?: Service[];
}

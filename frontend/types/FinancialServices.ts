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

export type InstitutionStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

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

export interface FinancialService extends Service {
  institution: Institution;
  designation: string;
  status: InstitutionStatus;
  geographicZones: string[];
  description: string;
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

export interface InstitutionWithServices extends Institution {
  services?: Service[];
}

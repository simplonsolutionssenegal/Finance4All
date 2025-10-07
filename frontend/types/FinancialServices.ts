export interface FinancialService {
  id: string;
  designation: string;
  type: 'Epargne' | 'Crédit' | 'Assurance';
  institution: string;
  maxAmount: number;
  interestRate: number;
  reimbursement: string;
  status: 'ACTIF' | 'INACTIF';
  geographicZones: string[];
  createdAt: string;
  description: string;
  minAmount: number;
}

export interface Institution {
  id: string;
  name: string;
  logo: string;
  status: 'ACTIF' | 'INACTIF';
  website: string;
  description: string;
  geographicZones: string[];
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
  sortBy: 'designation' | 'type' | 'institution' | 'maxAmount' | 'interestRate';
  sortOrder: 'asc' | 'desc';
  viewMode: 'table' | 'grid';
  currentPage: number;
  itemsPerPage: number;
}

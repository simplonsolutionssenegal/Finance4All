import { Organization } from '../entities/Organization';

export interface OrganizationSearchParams {
  search?: string;
  type?: string[];
  status?: string[];
  dateRange?: 'recent' | 'month' | 'custom';
  customDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'type' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrganizationsResult {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrganizationRepository {
  getAllOrganizations(): Promise<Organization[]>;
  findById(id: string): Promise<Organization | null>;
  save(organization: Organization): Promise<Organization>;
  searchOrganizations(params: OrganizationSearchParams): Promise<PaginatedOrganizationsResult>;
  getOrganizationTypes(): Promise<string[]>;
}

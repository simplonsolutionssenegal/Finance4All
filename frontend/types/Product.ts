// frontend/types/Product.ts

export interface RemboursementConditions {
  dureeMinimum: number;
  dureeMaximum: number;
  modalites: string[];
  tauxInteret: number;
  typeRemboursement: 'fixe' | 'variable';
  remboursementAnticipe: boolean;
}

export interface ConditionsEligibilite {
  ageMinimum: number;
  revenuMinimum: number;
  situationsProfessionnelles: string[];
  documentsRequis: string[];
  autresConditions: string[];
}

export interface Product {
  id: string;
  designation: string;
  type: 'credit' | 'loan' | 'insurance';
  montantMinimum: number;
  montantMaximum: number;
  remboursement: RemboursementConditions;
  conditionsEligibilite: ConditionsEligibilite;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  status: 'success' | 'error';
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  type?: string;
  montantMin?: number;
  montantMax?: number;
  dureeMin?: number;
  dureeMax?: number;
  revenuMin?: number;
}

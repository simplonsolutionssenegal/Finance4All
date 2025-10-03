// src/domain/entities/Product.ts
export interface Product {
  id: string;
  designation: string;
  type: ProductType;
  montantMinimum: number;
  montantMaximum: number;
  remboursement: RemboursementInfo;
  conditionsEligibilite: ConditionsEligibilite;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductType = 'CREDIT' | 'EPARGNE' | 'INVESTISSEMENT' | 'ASSURANCE';

export interface RemboursementInfo {
  dureeMinimum: number;
  dureeMaximum: number;
  modalites: string[];
  tauxInteret: number;
  typeRemboursement: 'fixe' | 'variable';
  penalitesRetard?: number;
  remboursementAnticipe: boolean;
}

export interface ConditionsEligibilite {
  ageMinimum: number;
  ageMaximum?: number;
  revenuMinimum: number;
  situationsProfessionnelles: string[];
  documentsRequis: string[];
  autresConditions: string[];
}

export interface ProductFilter {
  type?: ProductType;
  montantMinimum?: number;
  montantMaximum?: number;
  designation?: string;
}

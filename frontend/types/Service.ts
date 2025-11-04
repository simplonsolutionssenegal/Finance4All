export interface Frais {
  _typeCalculation?: number;
  _amount?: number;
  _rate?: number;
  _fxSurcharge?: number;

  type?: 'FREE' | 'FIX' | 'POURCENTAGE';
  amount?: number;
  rate?: number;
  fxSurcharge?: number;

  montantFixe?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
}

export interface CreateServiceDto {
  name: string;
  longName: string;
  type: TypeService;
  montantMin?: number;
  montantMax?: number;
  frais: Frais;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
}

export interface Service {
  id: string;
  name: string;
  longName: string;
  type: TypeService;
  montantMin?: number;
  montantMax?: number;
  frais: Frais;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
  institutionId: string;
  createdAt: string;
  updatedAt: string;
}

export enum TypeService {
  PAIEMENT_MARCHAND = 'paiement marchand',
  ACHAT_CREDIT = 'achat de crédit',
  PAIEMENT_FACTURES = 'paiement de factures',
  DEPOT_SIMPLE = 'dépôts simples',
  DEPOT_RETRAIT_SIMPLE = 'dépôts et retraits simples',
  RETRAIT_SIMPLE = 'retraits simples',
  TRANSFERT_ARGENT = "transferts d'argent",
  BANQUE_WALLET = 'banque vers wallet',
  WALLET_BANQUE = 'wallet vers banque',
  EPARGNE = 'épargne',
  CREDIT = 'crédit',
  ASSURANCE = 'assurance',
  AUTRES = 'autres services',
}

import { Option } from '@/components/admin/institutions/filters/BadgeCheckboxGroup';

export interface Frais {
  montantFixe?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
}
export interface FraisFilter {
  _typeCalculation?: number;
  _amount?: number;
  _rate?: number;
}

export interface CreateServiceDto {
  name: string;
  longName: string;
  type: TypeService;
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
  frais: Frais;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
  institutionId: string;
  createdAt: string;
  updatedAt: string;
  isGratuit: boolean;
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

export interface FilterOptions {
  type: TypeService[];
  Coût: CoutType[];
}

export const EMPTY_FILTERS: FilterOptions = { type: [], Coût: [] };

export const TYPE_OPTIONS = [
  { label: 'Paiement marchand', value: TypeService.PAIEMENT_MARCHAND },
  { label: 'Achat de crédit', value: TypeService.ACHAT_CREDIT },
  { label: 'Paiement de factures', value: TypeService.PAIEMENT_FACTURES },
  { label: 'Dépôts simples', value: TypeService.DEPOT_SIMPLE },
  { label: 'Dépôts et retraits simples', value: TypeService.DEPOT_RETRAIT_SIMPLE },
  { label: 'Retraits simples', value: TypeService.RETRAIT_SIMPLE },
  { label: "Transferts d'argent", value: TypeService.TRANSFERT_ARGENT },
  { label: 'Banque vers wallet', value: TypeService.BANQUE_WALLET },
  { label: 'Wallet vers banque', value: TypeService.WALLET_BANQUE },
  { label: 'Épargne', value: TypeService.EPARGNE },
  { label: 'Crédit', value: TypeService.CREDIT },
  { label: 'Assurance', value: TypeService.ASSURANCE },
  { label: 'Autres services', value: TypeService.AUTRES },
];

export type CoutType = true | false;

export const COUT_OPTIONS: ReadonlyArray<Option<CoutType>> = [
  { value: true, label: 'Gratuit' },
  { value: false, label: 'Payant' },
];

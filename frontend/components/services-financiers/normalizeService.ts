import type { FinancialService, Institution } from '../../types/FinancialServices';

export function displayDesignation(service: FinancialService): string {
  return (service.name as string) || (service.longName as string) || service.designation || '';
}

export function displayInstitutionName(service: FinancialService): string {
  if (!service.institution) return '';
  if (typeof service.institution === 'string') return service.institution;
  const inst = service.institution as Institution;
  return inst.name || (inst as any).institutionName || '';
}

export function displayLogoUrl(service: FinancialService): string | undefined {
  if (!service.institution) return undefined;
  if (typeof service.institution === 'string') return undefined;
  return (service.institution as Institution).logoUrl || (service.institution as any).logo;
}

export function displayGeographicZones(service: FinancialService): string[] {
  return service.geographicZones || [];
}

export function displayType(service: FinancialService): string {
  return service.type || '';
}

// Map Prisma enum tokens to human-friendly French labels
export function mapTypeToLabel(type?: FinancialService['type']): string {
  if (!type) return '';
  const map: Record<string, string> = {
    EPARGNE: 'Épargne',
    CREDIT: 'Crédit',
    ASSURANCE: 'Assurance',
    PAIEMENT_MARCHAND: 'Paiement marchand',
    ACHAT_CREDIT: 'Achat de crédit',
    PAIEMENT_FACTURES: 'Paiement de factures',
    DEPOT_SIMPLE: 'Dépôt simple',
    DEPOT_RETRAIT_SIMPLE: 'Dépôt / Retrait',
    RETRAIT_SIMPLE: 'Retrait simple',
    TRANSFERT_ARGENT: "Transfert d'argent",
    BANQUE_WALLET: 'Bank ↔ Wallet',
    WALLET_BANQUE: 'Wallet ↔ Bank',
    AUTRES: 'Autres',
  };
  return map[type as string] || (type as string);
}

export function mapStatusToLabel(status?: Institution['status']): string {
  if (!status) return '';
  const map: Record<string, string> = {
    ACTIVE: 'Actif',
    INACTIVE: 'Inactif',
    PENDING: 'En attente',
    ACTIF: 'Actif',
    INACTIF: 'Inactif',
  };
  return map[status as string] || (status as string);
}

export function displayMaxAmount(service: FinancialService): number {
  return service.maxAmount ?? 0;
}

export function displayMinAmount(service: FinancialService): number {
  return service.minAmount ?? 0;
}

const normalizeServiceHelpers = {
  displayDesignation,
  displayInstitutionName,
  displayLogoUrl,
  displayGeographicZones,
  displayType,
  displayMaxAmount,
  displayMinAmount,
};

export default normalizeServiceHelpers;

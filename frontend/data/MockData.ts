import { FinancialService, Institution } from '../types/FinancialServices';

export const institutions: Institution[] = [
  {
    id: '1',
    name: 'Société Générale',
    logo: 'SG',
    status: 'ACTIF',
    website: 'www.institutname.com',
    description:
      'Lorem ipsum ubn hndd sjjjkllqsfij hjhjhdfn hbsjbjh kjbskfjk bbsfjnkjfs jbsjbnjktn . jnskfjn sdbshjb dsbkbfnks dskbkjcbn wjurbhjk djbdjkdns cbnkwdnkjs oojjfed bjkbjwknjkcsf djbcjkdns wjekjdskjbejwjqclms',
    geographicZones: ['Zone géographique A', 'Zone géographique B'],
  },
];

export const financialServices: FinancialService[] = [
  {
    id: '1',
    designation: 'Épargne Jeune',
    type: 'Epargne',
    institution: 'Société Générale',
    maxAmount: 50000,
    interestRate: 3.5,
    reimbursement: 'Agence',
    status: 'ACTIF',
    geographicZones: ['Zone géographique A'],
    createdAt: '2025-01-15',
    description: "Compte d'épargne spécialement conçu pour les jeunes",
    minAmount: 10000,
  },
  {
    id: '2',
    designation: 'Crédit Habitat',
    type: 'Crédit',
    institution: 'Société Générale',
    maxAmount: 25000000,
    interestRate: 8.5,
    reimbursement: 'Mensuel',
    status: 'ACTIF',
    geographicZones: ['Zone géographique A', 'Zone géographique B'],
    createdAt: '2025-01-10',
    description: "Crédit immobilier pour l'acquisition de logements",
    minAmount: 1000000,
  },
  {
    id: '3',
    designation: 'Épargne Retraite',
    type: 'Epargne',
    institution: 'Société Générale',
    maxAmount: 100000,
    interestRate: 4.2,
    reimbursement: 'Agence',
    status: 'ACTIF',
    geographicZones: ['Zone géographique B'],
    createdAt: '2024-11-15',
    description: "Plan d'épargne pour la préparation de la retraite",
    minAmount: 25000,
  },
  {
    id: '4',
    designation: 'Crédit Auto',
    type: 'Crédit',
    institution: 'Société Générale',
    maxAmount: 5000000,
    interestRate: 7.8,
    reimbursement: 'Mensuel',
    status: 'ACTIF',
    geographicZones: ['Zone géographique A'],
    createdAt: '2025-01-08',
    description: "Financement pour l'achat de véhicules",
    minAmount: 500000,
  },
  {
    id: '5',
    designation: 'Épargne Famille',
    type: 'Epargne',
    institution: 'Société Générale',
    maxAmount: 75000,
    interestRate: 3.8,
    reimbursement: 'Agence',
    status: 'ACTIF',
    geographicZones: ['Zone géographique A', 'Zone géographique B'],
    createdAt: '2024-12-20',
    description: "Compte d'épargne familiale avec avantages",
    minAmount: 15000,
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (rate: number): string => {
  return `${rate}%`;
};

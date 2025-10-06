import type { ProductType } from './simulator-types';

// Constantes pour le simulateur

export const STORAGE_KEY = 'product-simulator-params';

export const INSTITUTION_NAMES = [
  'BNP Paribas',
  'Société Générale',
  'Crédit Agricole',
  'LCL',
  'Banque Populaire',
  "Caisse d'Épargne",
  'Crédit Mutuel',
  'La Banque Postale',
  'HSBC France',
  'ING',
  'Crédit du Nord',
  'Banque Palatine',
  'Boursorama',
  'Hello Bank',
  'Fortuneo',
  'Monabanq',
  'Orange Bank',
  'N26',
  'Revolut',
  'Qonto',
  'Lydia',
  'PayPal',
  'Stripe',
  'Adyen',
  'Square',
  'Payoneer',
  'Wise',
  'Remitly',
  'Western Union',
  'MoneyGram',
];

export const PRODUCT_TYPES: ProductType[] = [
  // CREDIT
  {
    name: 'Prêt Immobilier',
    icon: '🏠',
    type: 'CREDIT',
    rates: { min: 2.5, max: 4 },
    limits: { amount: { min: 50000, max: 800000 }, duration: { min: 5, max: 25 } },
  },
  {
    name: 'Prêt Personnel',
    icon: '💳',
    type: 'CREDIT',
    rates: { min: 3, max: 5.5 },
    limits: { amount: { min: 1000, max: 75000 }, duration: { min: 1, max: 7 } },
  },
  {
    name: 'Prêt Auto',
    icon: '🚗',
    type: 'CREDIT',
    rates: { min: 2.8, max: 4.5 },
    limits: { amount: { min: 5000, max: 100000 }, duration: { min: 1, max: 7 } },
  },
  {
    name: 'Prêt Professionnel',
    icon: '🏢',
    type: 'CREDIT',
    rates: { min: 2, max: 4 },
    limits: { amount: { min: 10000, max: 1000000 }, duration: { min: 2, max: 20 } },
  },
  // INVESTISSEMENT
  {
    name: 'Assurance Vie',
    icon: '💎',
    type: 'INVESTISSEMENT',
    rates: { min: 3.5, max: 6 },
    limits: { amount: { min: 1000, max: 500000 }, duration: { min: 2, max: 15 } },
  },
  {
    name: 'PERP',
    icon: '🎯',
    type: 'INVESTISSEMENT',
    rates: { min: 3, max: 5.5 },
    limits: { amount: { min: 500, max: 300000 }, duration: { min: 5, max: 25 } },
  },
  {
    name: 'PEA',
    icon: '📈',
    type: 'INVESTISSEMENT',
    rates: { min: 4, max: 8 },
    limits: { amount: { min: 1000, max: 150000 }, duration: { min: 5, max: 20 } },
  },
  // EPARGNE
  {
    name: 'Livret A',
    icon: '💰',
    type: 'EPARGNE',
    rates: { min: 2, max: 3 },
    limits: { amount: { min: 100, max: 100000 }, duration: { min: 1, max: 10 } },
  },
  {
    name: 'Compte Épargne',
    icon: '🏦',
    type: 'EPARGNE',
    rates: { min: 1.5, max: 2.8 },
    limits: { amount: { min: 100, max: 200000 }, duration: { min: 1, max: 8 } },
  },
  {
    name: 'LDDS',
    icon: '🌱',
    type: 'EPARGNE',
    rates: { min: 2, max: 3 },
    limits: { amount: { min: 100, max: 12000 }, duration: { min: 1, max: 10 } },
  },
  // ASSURANCE
  {
    name: 'Assurance Décès',
    icon: '🛡️',
    type: 'ASSURANCE',
    rates: { min: 1, max: 3 },
    limits: { amount: { min: 10000, max: 500000 }, duration: { min: 1, max: 30 } },
  },
  {
    name: 'Assurance Maladie',
    icon: '🏥',
    type: 'ASSURANCE',
    rates: { min: 0.5, max: 2 },
    limits: { amount: { min: 1000, max: 100000 }, duration: { min: 1, max: 10 } },
  },
];

export const INSTITUTION_LOGOS = ['🏦', '🏛️', '🏪', '🏢', '💳', '💰', '🎯', '💎', '🚀', '⭐'];

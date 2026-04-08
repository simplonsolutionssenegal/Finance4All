import type { LucideIcon } from 'lucide-react';
import { Award, BookOpen, Clock3, Trophy } from 'lucide-react';

export type CertificateLevel = 'Excellence' | 'Tres Bien';

export type CertificateItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  score: number;
  level: CertificateLevel;
};

export type HeaderStatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export const CERTIFICAT_HEADER_STATS: HeaderStatItem[] = [
  {
    label: 'Certificats obtenus',
    value: '3',
    icon: Award,
  },
  {
    label: 'Modules completes',
    value: '8/26',
    icon: BookOpen,
  },
  {
    label: "Temps d'apprentissage",
    value: '24h 30m',
    icon: Clock3,
  },
  {
    label: 'Taux de reussite',
    value: '85%',
    icon: Trophy,
  },
];

export const CERTIFICATS_MOCK: CertificateItem[] = [
  {
    id: 'expert-mobile-money',
    title: 'Expert Mobile Money',
    subtitle: 'Mobile Money avance',
    date: '12 Octobre 2025',
    score: 98,
    level: 'Excellence',
  },
  {
    id: 'maitre-du-budget',
    title: 'Maitre du Budget',
    subtitle: 'Epargne et Budget',
    date: '8 Octobre 2025',
    score: 95,
    level: 'Excellence',
  },
  {
    id: 'gestion-de-credit',
    title: 'Gestion de Credit',
    subtitle: 'Credit Responsable',
    date: '25 Septembre 2025',
    score: 92,
    level: 'Tres Bien',
  },
];

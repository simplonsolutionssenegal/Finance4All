import type { LucideIcon } from 'lucide-react';
import { Heart, Lightbulb, ShieldCheck, Users } from 'lucide-react';

export type AboutStat = {
  value: string;
  label: string;
};

export type AboutMissionBullet = {
  title: string;
  desc: string;
};

export type AboutValue = {
  title: string;
  desc: string;
  icon: LucideIcon;
};

export type AboutTimelineItem = {
  year: string;
  title: string;
  desc: string;
  side: 'left' | 'right';
};

export const ABOUT_STATS: AboutStat[] = [
  { value: '10 000+', label: 'Utilisateurs actifs' },
  { value: '50+', label: 'Institutions partenaires' },
  { value: '100+', label: 'Modules de formation' },
  { value: '4,8/5', label: 'Note moyenne' },
];

export const ABOUT_MISSION_BULLETS: AboutMissionBullet[] = [
  {
    title: 'Apprentissage adaptatif',
    desc: 'Contenus personnalisés selon votre niveau et vos objectifs.',
  },
  {
    title: 'Outils intelligents',
    desc: 'Comparateur et simulateur pour choisir les solutions adaptées.',
  },
  {
    title: 'Certification reconnue',
    desc: 'Validez vos compétences avec des certifications officielles.',
  },
];

export const ABOUT_VALUES: AboutValue[] = [
  {
    title: 'Accessibilité',
    desc: "Rendre l'éducation financière simple et accessible partout, pour tous.",
    icon: Heart,
  },
  {
    title: 'Innovation',
    desc: 'Utiliser la technologie pour créer des expériences d’apprentissage engageantes.',
    icon: Lightbulb,
  },
  {
    title: 'Transparence',
    desc: 'Fournir les informations les plus claires et objectives sur les produits financiers.',
    icon: ShieldCheck,
  },
  {
    title: 'Communauté',
    desc: 'Construire une communauté solidaire et dynamique autour de la finance responsable.',
    icon: Users,
  },
];

export const ABOUT_TIMELINE: AboutTimelineItem[] = [
  {
    year: '2024',
    title: 'Lancement au Sénégal',
    desc: 'Finance4All voit le jour avec une mission claire : démocratiser l’éducation financière.',
    side: 'left',
  },
  {
    year: '2025',
    title: 'Expansion au Cameroun',
    desc: 'Extension de nos services et partenariats avec des institutions locales.',
    side: 'right',
  },
  {
    year: '2026',
    title: 'Innovation continue',
    desc: "Lancement de nouveaux outils interactifs et modules d'apprentissage avancés.",
    side: 'left',
  },
];

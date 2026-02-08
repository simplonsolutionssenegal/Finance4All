import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  Bell,
  Settings,
  type LucideIcon,
  GraduationCap,
  Home,
  Compass,
  Award,
  Calculator,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
}

export const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/beneficiaire-dashboard',
  },
  {
    id: 'modules',
    label: 'Mes modules',
    icon: GraduationCap,
    href: '/learning',
  },
  {
    id: 'institutions',
    label: 'Institutions partenaires',
    icon: Building2,
    badge: '32',
    href: '/institutions',
  },
  {
    id: 'formations',
    label: 'Cours & Formations',
    icon: BookOpen,
    href: '/modules',
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: Users,
    href: '/users',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    badge: '10',
    href: '/notifications',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
  {
    id: 'certificats',
    label: 'Certificats',
    icon: Award,
    href: '/certificats',
  },
  {
    id: 'comparator',
    label: 'Comparateur',
    icon: Compass,
    href: '/comparator',
  },
  {
    id: 'simulator',
    label: 'Simulateur',
    icon: Calculator,
    href: '/simulator',
  },
];

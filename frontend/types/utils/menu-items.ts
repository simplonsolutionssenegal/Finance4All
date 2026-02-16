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
  allowedRoles?: string[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/dashboard',
    allowedRoles: ['admin', 'org:admin', 'org:member'],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/beneficiaire-dashboard',
    allowedRoles: ['org:recipient', 'beneficiary'],
  },
  {
    id: 'modules',
    label: 'Mes modules',
    icon: GraduationCap,
    href: '/learning',
    allowedRoles: ['org:recipient', 'beneficiary'],
  },
  {
    id: 'institutions',
    label: 'Institutions partenaires',
    icon: Building2,
    badge: '32',
    href: '/institutions',
    allowedRoles: ['admin', 'org:admin', 'org:member'],
  },
  {
    id: 'formations',
    label: 'Cours & Formations',
    icon: BookOpen,
    href: '/modules',
    allowedRoles: ['admin', 'org:admin', 'org:member'],
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: Users,
    href: '/users',
    allowedRoles: ['admin', 'org:admin'],
  },
  {
    id: 'certificats',
    label: 'Certificats',
    icon: Award,
    href: '/certificats',
    allowedRoles: ['org:recipient', 'beneficiary'],
  },
  {
    id: 'comparator',
    label: 'Comparateur',
    icon: Compass,
    href: '/comparateur',
    allowedRoles: ['org:recipient', 'beneficiary'],
  },
  {
    id: 'simulator',
    label: 'Simulateur',
    icon: Calculator,
    href: '/simulateur',
    allowedRoles: ['org:recipient', 'beneficiary'],
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
];

export function getAllowedRolesForPath(pathname: string): string[] | undefined {
  const item = menuItems.find(
    item => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  return item?.allowedRoles;
}

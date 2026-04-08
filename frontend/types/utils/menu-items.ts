import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  UsersRound,
  Bell,
  Settings,
  type LucideIcon,
  GraduationCap,
  Home,
  Compass,
  Award,
  Calculator,
} from 'lucide-react';

import {
  MENU_IDS_BY_GROUP,
  getAccessGroup,
  type AppRole,
  type AccessGroup,
} from '@/lib/role-access';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  allowedGroups?: AccessGroup[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    allowedGroups: ['platform', 'organization'],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    allowedGroups: ['beneficiary'],
  },
  {
    id: 'modules',
    label: 'Mes modules',
    icon: GraduationCap,
    href: '/learning',
    allowedGroups: ['beneficiary'],
  },
  {
    id: 'institutions',
    label: 'Institutions partenaires',
    icon: Building2,
    badge: '32',
    href: '/institutions',
    allowedGroups: ['platform'],
  },
  {
    id: 'formations',
    label: 'Cours & Formations',
    icon: BookOpen,
    href: '/modules',
    allowedGroups: ['platform'],
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: Users,
    href: '/users',
    allowedGroups: ['platform'],
  },
  {
    id: 'recipients',
    label: 'Recipients',
    icon: Users,
    href: '/recipients',
    allowedGroups: ['organization'],
  },
  {
    id: 'members',
    label: 'Membres',
    icon: UsersRound,
    href: '/members',
    allowedGroups: ['organization'],
  },
  {
    id: 'certificats',
    label: 'Certificats',
    icon: Award,
    href: '/certificats',
    allowedGroups: ['beneficiary'],
  },
  {
    id: 'comparator',
    label: 'Comparateur',
    icon: Compass,
    href: '/comparateur',
    allowedGroups: ['beneficiary'],
  },
  {
    id: 'simulator',
    label: 'Simulateur',
    icon: Calculator,
    href: '/simulateur',
    allowedGroups: ['beneficiary'],
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

/**
 * Retourne les items de menu accessibles pour un role applicatif donne.
 */
export function getMenuItemsForRole(role: AppRole): MenuItem[] {
  const group = getAccessGroup(role);
  const allowedIds = MENU_IDS_BY_GROUP[group];

  return menuItems.filter(item => {
    // Items sans allowedGroups sont accessibles a tous (notifications, settings)
    if (!item.allowedGroups) return true;
    return allowedIds.includes(item.id);
  });
}

import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  Bell,
  Settings,
  type LucideIcon,
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
];

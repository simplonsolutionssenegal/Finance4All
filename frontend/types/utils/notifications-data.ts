import type { LucideIcon } from 'lucide-react';
import { Bell, BookOpen, CircleAlert, CircleCheck, Trophy } from 'lucide-react';

export type NotificationCategory =
  | 'certificate'
  | 'module'
  | 'quiz'
  | 'assignment'
  | 'system'
  | 'goal'
  | 'session';

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  isRead: boolean;
  category: NotificationCategory;
};

export type NotificationFilterItem = {
  label: string;
  value: 'all' | 'unread';
};

export type NotificationCategoryStyle = {
  icon: LucideIcon;
  iconClassName: string;
  iconBgClassName: string;
};

export const NOTIFICATIONS_STORAGE_KEY = 'finance4all.notifications';
export const NOTIFICATIONS_UPDATED_EVENT = 'finance4all-notifications-updated';

export const NOTIFICATION_FILTERS: NotificationFilterItem[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Non lues', value: 'unread' },
];

export const NOTIFICATIONS_MOCK: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Nouveau certificat obtenu',
    description: "Vous avez complete le module 'Finance Personnelle' et obtenu votre certificat.",
    timeLabel: "Aujourd'hui - 14:30",
    isRead: false,
    category: 'certificate',
  },
  {
    id: 'notif-2',
    title: 'Nouveau module disponible',
    description:
      "Le module 'Investissements Responsables' est maintenant disponible dans votre catalogue.",
    timeLabel: "Aujourd'hui - 10:15",
    isRead: false,
    category: 'module',
  },
  {
    id: 'notif-3',
    title: 'Quiz en attente',
    description: "Terminez le quiz du module 'Credit et Endettement' avant le 30 mars.",
    timeLabel: 'Hier - 16:45',
    isRead: false,
    category: 'quiz',
  },
  {
    id: 'notif-4',
    title: 'Module assigne',
    description: "'Gestion de Budget' vous a ete assigne par votre organisation.",
    timeLabel: 'Il y a 2 jours - 08:00',
    isRead: true,
    category: 'assignment',
  },
  {
    id: 'notif-5',
    title: 'Mise a jour systeme',
    description: 'Finance4All a ete mis a jour avec de nouvelles fonctionnalites.',
    timeLabel: 'Il y a 3 jours - 08:00',
    isRead: true,
    category: 'system',
  },
  {
    id: 'notif-6',
    title: 'Objectif atteint',
    description: 'Vous avez complete 8 modules. Continuez sur cette lancee.',
    timeLabel: 'Il y a 5 jours - 18:20',
    isRead: true,
    category: 'goal',
  },
  {
    id: 'notif-7',
    title: 'Rappel de session',
    description: 'Une nouvelle session de formation en ligne commence demain a 15h.',
    timeLabel: 'Il y a 1 semaine - 11:30',
    isRead: true,
    category: 'session',
  },
];

export const NOTIFICATION_CATEGORY_STYLES: Record<NotificationCategory, NotificationCategoryStyle> =
  {
    certificate: {
      icon: Trophy,
      iconClassName: 'text-purple-600',
      iconBgClassName: 'bg-purple-100',
    },
    module: {
      icon: BookOpen,
      iconClassName: 'text-primary-600',
      iconBgClassName: 'bg-primary-50',
    },
    quiz: {
      icon: CircleAlert,
      iconClassName: 'text-warning-700',
      iconBgClassName: 'bg-warning-100',
    },
    assignment: {
      icon: CircleCheck,
      iconClassName: 'text-success-700',
      iconBgClassName: 'bg-success-100',
    },
    system: {
      icon: Bell,
      iconClassName: 'text-primary-600',
      iconBgClassName: 'bg-primary-50',
    },
    goal: {
      icon: Trophy,
      iconClassName: 'text-purple-600',
      iconBgClassName: 'bg-purple-100',
    },
    session: {
      icon: Bell,
      iconClassName: 'text-primary-600',
      iconBgClassName: 'bg-primary-50',
    },
  };

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') {
    return NOTIFICATIONS_MOCK;
  }

  const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(NOTIFICATIONS_MOCK));
    return NOTIFICATIONS_MOCK;
  }

  try {
    const parsed = JSON.parse(raw) as NotificationItem[];
    if (!Array.isArray(parsed)) {
      return NOTIFICATIONS_MOCK;
    }
    return parsed;
  } catch {
    return NOTIFICATIONS_MOCK;
  }
}

export function persistNotifications(notifications: NotificationItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}

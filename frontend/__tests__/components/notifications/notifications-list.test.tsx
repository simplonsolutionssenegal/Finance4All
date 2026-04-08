import { fireEvent, render, screen } from '@testing-library/react';

import NotificationsList from '@/components/notifications/notifications-list';
import type { NotificationItem } from '@/types/utils/notifications-data';

const notifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Nouveau certificat obtenu',
    description: 'Desc 1',
    timeLabel: 'Aujourd hui - 14:30',
    isRead: false,
    category: 'certificate',
  },
  {
    id: '2',
    title: 'Module assigne',
    description: 'Desc 2',
    timeLabel: 'Hier - 16:45',
    isRead: true,
    category: 'assignment',
  },
];

describe('NotificationsList', () => {
  it('renders filters and unread badge count', () => {
    render(
      <NotificationsList
        notifications={notifications}
        activeFilter='all'
        onFilterChange={jest.fn()}
        unreadCount={3}
        onMarkAllRead={jest.fn()}
      />
    );

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('3 non lues')).toBeInTheDocument();
    expect(screen.getByText('Toutes')).toBeInTheDocument();
    expect(screen.getByText('Non lues')).toBeInTheDocument();
    expect(screen.getByText('Tout lire')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('triggers callbacks for filter and mark all read', () => {
    const onFilterChange = jest.fn();
    const onMarkAllRead = jest.fn();

    render(
      <NotificationsList
        notifications={notifications}
        activeFilter='all'
        onFilterChange={onFilterChange}
        unreadCount={2}
        onMarkAllRead={onMarkAllRead}
      />
    );

    fireEvent.click(screen.getByText('Non lues'));
    expect(onFilterChange).toHaveBeenCalledWith('unread');

    fireEvent.click(screen.getByText('Tout lire'));
    expect(onMarkAllRead).toHaveBeenCalled();
  });

  it('renders empty state when no notifications', () => {
    render(
      <NotificationsList
        notifications={[]}
        activeFilter='unread'
        onFilterChange={jest.fn()}
        unreadCount={0}
        onMarkAllRead={jest.fn()}
      />
    );

    expect(screen.getByText('Aucune notification a afficher.')).toBeInTheDocument();
  });

  it('disables "Tout lire" button when unread count is zero', () => {
    render(
      <NotificationsList
        notifications={notifications}
        activeFilter='all'
        onFilterChange={jest.fn()}
        unreadCount={0}
        onMarkAllRead={jest.fn()}
      />
    );

    const markAllReadButton = screen.getByRole('button', { name: 'Tout lire' });
    expect(markAllReadButton).toBeDisabled();
  });
});

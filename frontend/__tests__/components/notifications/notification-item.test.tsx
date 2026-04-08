import { render, screen } from '@testing-library/react';

import NotificationItem from '@/components/notifications/notification-item';
import type { NotificationItem as NotificationItemType } from '@/types/utils/notifications-data';

const unreadNotification: NotificationItemType = {
  id: 'n1',
  title: 'Nouveau module disponible',
  description: 'Le module est maintenant disponible.',
  timeLabel: "Aujourd'hui - 10:15",
  isRead: false,
  category: 'module',
};

describe('NotificationItem', () => {
  it('renders notification title, description and time', () => {
    render(<NotificationItem notification={unreadNotification} />);

    expect(screen.getByText('Nouveau module disponible')).toBeInTheDocument();
    expect(screen.getByText('Le module est maintenant disponible.')).toBeInTheDocument();
    expect(screen.getByText("Aujourd'hui - 10:15")).toBeInTheDocument();
  });
});

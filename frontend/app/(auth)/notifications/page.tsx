'use client';

import { useEffect, useMemo, useState } from 'react';

import NotificationsList from '@/components/notifications/notifications-list';
import {
  getStoredNotifications,
  persistNotifications,
  type NotificationFilterItem,
} from '@/types/utils/notifications-data';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(getStoredNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterItem['value']>('all');

  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter(notification => !notification.isRead);
    }

    return notifications;
  }, [activeFilter, notifications]);

  const handleMarkAllRead = () => {
    setNotifications(previous =>
      previous.map(notification => {
        if (notification.isRead) {
          return notification;
        }

        return { ...notification, isRead: true };
      })
    );
  };

  useEffect(() => {
    persistNotifications(notifications);
  }, [notifications]);

  return (
    <div className='w-full max-w-4xl mx-auto lg:mt-0 mt-[5%]'>
      <NotificationsList
        notifications={filteredNotifications}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}

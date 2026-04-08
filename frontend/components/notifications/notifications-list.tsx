import { Card } from '@/components/ui/card';
import {
  NOTIFICATION_FILTERS,
  type NotificationItem,
  type NotificationFilterItem,
} from '@/types/utils/notifications-data';

import NotificationItemRow from './notification-item';

type NotificationsListProps = {
  notifications: NotificationItem[];
  activeFilter: NotificationFilterItem['value'];
  onFilterChange: (filter: NotificationFilterItem['value']) => void;
  unreadCount: number;
  onMarkAllRead: () => void;
};

export default function NotificationsList({
  notifications,
  activeFilter,
  onFilterChange,
  unreadCount,
  onMarkAllRead,
}: NotificationsListProps) {
  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-secondary-300'>Notifications</h1>
          <p className='text-grey-600 mt-1'>{unreadCount} non lues</p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='inline-flex items-center gap-1 bg-gray-100 p-1 rounded-full'>
            {NOTIFICATION_FILTERS.map(filter => (
              <button
                key={filter.value}
                type='button'
                onClick={() => onFilterChange(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                  activeFilter === filter.value
                    ? 'bg-white border border-grey-200 text-secondary-300 shadow-sm'
                    : 'text-grey-600 hover:text-grey-700'
                }`}
              >
                <span className='inline-flex items-center gap-2'>
                  {filter.label}
                  {filter.value === 'unread' && unreadCount > 0 && (
                    <span className='inline-flex size-7 items-center justify-center rounded-full bg-primary-300 text-white text-sm font-bold'>
                      {unreadCount}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
          <button
            type='button'
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className='px-1 py-1.5 text-sm font-semibold text-primary-400 hover:text-primary-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Tout lire
          </button>
        </div>
      </div>

      <Card className='border-grey-200 gap-0 overflow-hidden py-0 rounded-2xl'>
        {notifications.length === 0 ? (
          <div className='px-5 py-10 text-center text-sm text-grey-600'>
            Aucune notification a afficher.
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`${!notification.isRead ? 'bg-grey-50/80' : 'bg-white'} ${
                index !== notifications.length - 1 ? 'border-b border-grey-200' : ''
              }`}
            >
              <NotificationItemRow notification={notification} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

import { CardContent } from '@/components/ui/card';
import {
  NOTIFICATION_CATEGORY_STYLES,
  type NotificationItem as NotificationItemType,
} from '@/types/utils/notifications-data';

type NotificationItemProps = {
  notification: NotificationItemType;
};

export default function NotificationItem({ notification }: NotificationItemProps) {
  const categoryStyle = NOTIFICATION_CATEGORY_STYLES[notification.category];
  const Icon = categoryStyle.icon;

  return (
    <CardContent className='px-4 sm:px-5 py-4.5'>
      <div className='flex items-start gap-3.5'>
        <div
          className={`mt-0.5 size-8 rounded-full flex items-center justify-center ${categoryStyle.iconBgClassName}`}
        >
          <Icon className={`size-4 ${categoryStyle.iconClassName}`} />
        </div>

        <div className='min-w-0 max-w-[85%]'>
          <h3 className='text-sm font-semibold text-secondary-300 flex items-center gap-1.5'>
            {notification.title}
            {!notification.isRead && <span className='size-1.5 rounded-full bg-primary-400' />}
          </h3>
          <p className='text-sm text-grey-700 mt-1 leading-relaxed'>{notification.description}</p>
          <p className='text-xs text-grey-400 mt-1.5'>{notification.timeLabel}</p>
        </div>
      </div>
    </CardContent>
  );
}

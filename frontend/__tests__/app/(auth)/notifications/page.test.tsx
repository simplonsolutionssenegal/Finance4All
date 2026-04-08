import { fireEvent, render, screen } from '@testing-library/react';

import NotificationsPage from '@/app/(auth)/notifications/page';

const listSpy = jest.fn();

jest.mock('@/components/notifications/notifications-list', () => ({
  __esModule: true,
  default: (props: {
    notifications: Array<{ id: string; isRead: boolean }>;
    activeFilter: 'all' | 'unread';
    onFilterChange: (value: 'all' | 'unread') => void;
    unreadCount: number;
    onMarkAllRead: () => void;
  }) => {
    listSpy(props);
    return (
      <div>
        <div data-testid='active-filter'>{props.activeFilter}</div>
        <div data-testid='unread-count'>{props.unreadCount}</div>
        <div data-testid='items-count'>{props.notifications.length}</div>
        <button onClick={() => props.onFilterChange('unread')}>set-unread</button>
        <button onClick={props.onMarkAllRead}>mark-all-read</button>
      </div>
    );
  },
}));

describe('NotificationsPage', () => {
  beforeEach(() => {
    listSpy.mockClear();
    window.localStorage.clear();
  });

  it('renders with all notifications and unread count', () => {
    render(<NotificationsPage />);

    expect(screen.getByTestId('active-filter')).toHaveTextContent('all');
    expect(screen.getByTestId('items-count')).toHaveTextContent('7');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
  });

  it('filters unread notifications and marks all as read', () => {
    render(<NotificationsPage />);

    fireEvent.click(screen.getByText('set-unread'));
    expect(screen.getByTestId('active-filter')).toHaveTextContent('unread');
    expect(screen.getByTestId('items-count')).toHaveTextContent('3');

    fireEvent.click(screen.getByText('mark-all-read'));
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
  });
});

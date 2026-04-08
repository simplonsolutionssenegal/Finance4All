import {
  getStoredNotifications,
  NOTIFICATIONS_MOCK,
  NOTIFICATIONS_STORAGE_KEY,
  persistNotifications,
} from '@/types/utils/notifications-data';

describe('notifications-data helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('seeds localStorage with mock notifications when empty', () => {
    const notifications = getStoredNotifications();

    expect(notifications).toHaveLength(NOTIFICATIONS_MOCK.length);
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    expect(raw).not.toBeNull();
  });

  it('returns stored notifications when present', () => {
    const stored = [{ ...NOTIFICATIONS_MOCK[0], isRead: true }];
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(stored));

    const notifications = getStoredNotifications();
    expect(notifications).toEqual(stored);
  });

  it('persists notifications in localStorage', () => {
    const payload = [{ ...NOTIFICATIONS_MOCK[0], isRead: true }];

    persistNotifications(payload);

    expect(window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)).toBe(JSON.stringify(payload));
  });
});

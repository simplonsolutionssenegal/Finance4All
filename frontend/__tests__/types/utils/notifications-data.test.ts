import {
  getStoredNotifications,
  NOTIFICATION_FILTERS,
  NOTIFICATION_CATEGORY_STYLES,
  NOTIFICATIONS_MOCK,
  NOTIFICATIONS_UPDATED_EVENT,
  NOTIFICATIONS_STORAGE_KEY,
  persistNotifications,
} from '@/types/utils/notifications-data';

describe('notifications-data helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('contains expected filters and mixed read/unread mock notifications', () => {
    expect(NOTIFICATION_FILTERS).toEqual([
      { label: 'Toutes', value: 'all' },
      { label: 'Non lues', value: 'unread' },
    ]);
    expect(NOTIFICATIONS_MOCK).toHaveLength(7);
    expect(NOTIFICATIONS_MOCK.some(item => item.isRead)).toBe(true);
    expect(NOTIFICATIONS_MOCK.some(item => !item.isRead)).toBe(true);
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

  it('falls back to mock notifications when localStorage JSON is invalid', () => {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, '{invalid-json');

    const notifications = getStoredNotifications();
    expect(notifications).toEqual(NOTIFICATIONS_MOCK);
  });

  it('exposes styles for all notification categories', () => {
    expect(Object.keys(NOTIFICATION_CATEGORY_STYLES)).toEqual(
      expect.arrayContaining([
        'certificate',
        'module',
        'quiz',
        'assignment',
        'system',
        'goal',
        'session',
      ])
    );
    expect(NOTIFICATION_CATEGORY_STYLES.certificate.iconClassName).toBe('text-purple-600');
    expect(NOTIFICATION_CATEGORY_STYLES.module.iconBgClassName).toBe('bg-primary-50');
  });

  it('falls back to mock notifications when stored value is not an array', () => {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));

    const notifications = getStoredNotifications();
    expect(notifications).toEqual(NOTIFICATIONS_MOCK);
  });

  it('persists notifications in localStorage', () => {
    const payload = [{ ...NOTIFICATIONS_MOCK[0], isRead: true }];
    const eventSpy = jest.fn();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, eventSpy);

    persistNotifications(payload);

    expect(window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)).toBe(JSON.stringify(payload));
    expect(eventSpy).toHaveBeenCalledTimes(1);
    window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, eventSpy);
  });
});

/** @jest-environment node */

import {
  getStoredNotifications,
  NOTIFICATIONS_MOCK,
  persistNotifications,
} from '@/types/utils/notifications-data';

describe('notifications-data helpers (node env)', () => {
  it('returns mock notifications when window is undefined', () => {
    expect(typeof (globalThis as any).window).toBe('undefined');
    expect(getStoredNotifications()).toEqual(NOTIFICATIONS_MOCK);
  });

  it('does nothing when persisting without window', () => {
    expect(() => persistNotifications([])).not.toThrow();
  });
});

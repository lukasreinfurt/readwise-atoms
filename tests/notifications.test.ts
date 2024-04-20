import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Notifications from 'src/features/notifications';

describe('Notifications', () => {
  let notifications: Notifications;
  let noticeSpy: MockInstance;

  beforeEach(async () => {
    vi.restoreAllMocks();
    notifications = new Notifications();
    noticeSpy = vi.spyOn(notifications, 'Notice');
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should add prefix to message', () => {
    notifications.prefix = 'prefix';

    notifications.notice('message');

    expect(noticeSpy).toHaveBeenCalledOnce();
    expect(noticeSpy).toHaveBeenCalledWith('prefixmessage');
  });
});

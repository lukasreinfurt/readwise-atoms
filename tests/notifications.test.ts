import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Notifications from 'src/features/notifications';
import mockPlugin from './__mocks__/plugin';

console.log = vi.fn();

describe('Notifications', () => {
  let notifications: Notifications;
  let noticeSpy: MockInstance;
  let logSpy: MockInstance;
  let setTextSpy: MockInstance;

  beforeEach(async () => {
    vi.restoreAllMocks();
    notifications = new Notifications(mockPlugin);
    notifications.prefix = 'prefix';
    notifications.statusBarItem = {
      setText: vi.fn(),
    } as unknown as HTMLElement;
    noticeSpy = vi.spyOn(notifications, 'Notice');
    logSpy = vi.spyOn(console, 'log');
    setTextSpy = vi.spyOn(notifications.statusBarItem, 'setText');
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should add prefix to notice', () => {
    notifications.notice('message');

    expect(noticeSpy).toHaveBeenCalledOnce();
    expect(noticeSpy).toHaveBeenCalledWith('prefixmessage');
  });

  it('should log notices by default', () => {
    notifications.notice('message');

    expect(noticeSpy).toHaveBeenCalledOnce();
    expect(noticeSpy).toHaveBeenCalledWith('prefixmessage');
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledWith('prefixmessage');
  });

  it('should log status bar text by default', () => {
    notifications.setStatusBarText('message');

    expect(setTextSpy).toHaveBeenCalledOnce();
    expect(setTextSpy).toHaveBeenCalledWith('message');
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledWith('prefixmessage');
  });

  it('should not log status bar text when disabled', () => {
    notifications.setStatusBarText('message', false);

    expect(setTextSpy).toHaveBeenCalledOnce();
    expect(setTextSpy).toHaveBeenCalledWith('message');
    expect(logSpy).not.toHaveBeenCalled();
  });
});

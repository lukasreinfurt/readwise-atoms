import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Notifications from 'src/features/notifications';

describe('Readwise Atoms', () => {
  let notifications: Notifications;

  beforeEach(async () => {
    vi.restoreAllMocks();
    notifications = new Notifications();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Bugs', () => {
    it.todo('should add tests for bugs here');
  });
});

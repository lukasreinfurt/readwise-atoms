import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import ReadwiseAtoms from 'src/main';
import Commands from 'src/features/commands';
import InvalidTokenError from 'src/features/readwise/InvalidTokenError.ts';
import ClientError from 'src/features/readwise/ClientError';
import ServerError from 'src/features/readwise/ServerError';
import NetworkError from 'src/features/readwise/NetworkError';
import UnidentifiedError from 'src/features/readwise/UnidentifiedError';

describe('Readwise Atoms', () => {
  const plugin = {
    readwise: {
      getHighlights: vi.fn(),
    },
    synchronize: {
      syncHighlights: vi.fn(),
    },
    notifications: {
      notice: vi.fn(),
    },
  } as unknown as ReadwiseAtoms;
  let getHighlightsSpy: MockInstance;
  let syncHighlightsSpy: MockInstance;
  let noticeSpy: MockInstance;
  let commands: Commands;

  beforeEach(async () => {
    vi.restoreAllMocks();
    getHighlightsSpy = vi.spyOn(plugin.readwise, 'getHighlights');
    syncHighlightsSpy = vi.spyOn(plugin.synchronize, 'syncHighlights');
    noticeSpy = vi.spyOn(plugin.notifications, 'notice');
    commands = new Commands();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('sync', () => {
    it('should get highlights and sync them', async () => {
      getHighlightsSpy.mockResolvedValue([1, 2, 3]);

      await commands.sync(plugin);

      expect(getHighlightsSpy).toHaveBeenCalledOnce();
      expect(syncHighlightsSpy).toHaveBeenCalledOnce();
      expect(syncHighlightsSpy).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should handle invalid token errors', async () => {
      getHighlightsSpy.mockRejectedValue(new InvalidTokenError('token invalid'));

      await commands.sync(plugin);

      expect(noticeSpy).toHaveBeenCalledOnce();
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: token invalid');
    });

    it('should handle network errors', async () => {
      getHighlightsSpy.mockRejectedValue(new NetworkError('network error'));

      await commands.sync(plugin);

      expect(noticeSpy).toHaveBeenCalledOnce();
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: network error');
    });

    it('should handle client errors', async () => {
      getHighlightsSpy.mockRejectedValue(new ClientError('client error'));

      await commands.sync(plugin);

      expect(noticeSpy).toHaveBeenCalledOnce();
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: client error');
    });

    it('should handle server errors', async () => {
      getHighlightsSpy.mockRejectedValue(new ServerError('server error'));

      await commands.sync(plugin);

      expect(noticeSpy).toHaveBeenCalledOnce();
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: server error');
    });

    it('should handle unidentified errors', async () => {
      getHighlightsSpy.mockRejectedValue(new UnidentifiedError('unidentified error'));

      await commands.sync(plugin);

      expect(noticeSpy).toHaveBeenCalledOnce();
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: unidentified error');
    });
  });

  describe('Bugs', () => {
    it.todo('should add tests for bugs here');
  });
});

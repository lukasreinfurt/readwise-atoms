import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Commands from 'src/features/commands';
import InvalidTokenError from 'src/features/readwise/InvalidTokenError.ts';
import ClientError from 'src/features/readwise/ClientError';
import ServerError from 'src/features/readwise/ServerError';
import NetworkError from 'src/features/readwise/NetworkError';
import UnidentifiedError from 'src/features/readwise/UnidentifiedError';
import mockPlugin from './__mocks__/plugin';

describe('Commands', () => {
  let getHighlightsSpy: MockInstance;
  let syncHighlightsSpy: MockInstance;
  let noticeSpy: MockInstance;
  let saveSettingsSpy: MockInstance;
  let commands: Commands;

  beforeEach(async () => {
    vi.restoreAllMocks();
    getHighlightsSpy = vi.spyOn(mockPlugin.readwise, 'getHighlights');
    syncHighlightsSpy = vi.spyOn(mockPlugin.synchronize, 'syncHighlights');
    noticeSpy = vi.spyOn(mockPlugin.notifications, 'notice');
    saveSettingsSpy = vi.spyOn(mockPlugin, 'saveSettings');
    commands = new Commands();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('sync', () => {
    it('should get highlights and sync them', async () => {
      getHighlightsSpy.mockResolvedValue([1, 2, 3]);

      await commands.sync(mockPlugin);

      expect(getHighlightsSpy).toHaveBeenCalledOnce();
      expect(syncHighlightsSpy).toHaveBeenCalledOnce();
      expect(syncHighlightsSpy).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should handle invalid token errors', async () => {
      getHighlightsSpy.mockRejectedValue(new InvalidTokenError('token invalid'));

      await commands.sync(mockPlugin);

      expect(noticeSpy).toHaveBeenCalledTimes(2);
      expect(noticeSpy).toHaveBeenCalledWith('synchronizing highlights');
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: token invalid');
    });

    it('should handle network errors', async () => {
      getHighlightsSpy.mockRejectedValue(new NetworkError('network error'));

      await commands.sync(mockPlugin);

      expect(noticeSpy).toHaveBeenCalledTimes(2);
      expect(noticeSpy).toHaveBeenCalledWith('synchronizing highlights');
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: network error');
    });

    it('should handle client errors', async () => {
      getHighlightsSpy.mockRejectedValue(new ClientError('client error'));

      await commands.sync(mockPlugin);

      expect(noticeSpy).toHaveBeenCalledTimes(2);
      expect(noticeSpy).toHaveBeenCalledWith('synchronizing highlights');
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: client error');
    });

    it('should handle server errors', async () => {
      getHighlightsSpy.mockRejectedValue(new ServerError('server error'));

      await commands.sync(mockPlugin);

      expect(noticeSpy).toHaveBeenCalledTimes(2);
      expect(noticeSpy).toHaveBeenCalledWith('synchronizing highlights');
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: server error');
    });

    it('should handle unidentified errors', async () => {
      getHighlightsSpy.mockRejectedValue(new UnidentifiedError('unidentified error'));

      await commands.sync(mockPlugin);

      expect(noticeSpy).toHaveBeenCalledTimes(2);
      expect(noticeSpy).toHaveBeenCalledWith('synchronizing highlights');
      expect(noticeSpy).toHaveBeenCalledWith('synchronization error: unidentified error');
    });
  });

  describe('resync', () => {
    it('should reset readwiseUpdateAfter and sync', async () => {
      getHighlightsSpy.mockResolvedValue([1, 2, 3]);

      await commands.resync(mockPlugin);

      expect(saveSettingsSpy).toHaveBeenCalledOnce();
      expect(getHighlightsSpy).toHaveBeenCalledOnce();
      expect(syncHighlightsSpy).toHaveBeenCalledOnce();
      expect(syncHighlightsSpy).toHaveBeenCalledWith([1, 2, 3]);
    });
  });
});

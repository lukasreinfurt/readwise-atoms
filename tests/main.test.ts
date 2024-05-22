import { MockInstance, beforeEach, describe, expect, it, vi } from 'vitest';
import { App, PluginManifest } from 'obsidian';
import ReadwiseAtoms from '../src/main';
import mockPlugin from './__mocks__/plugin';

vi.mock('obsidian');
vi.mock('../src/features/notifications');
vi.mock('../src/features/templates');
vi.mock('../src/features/readwise');
vi.mock('../src/features/synchronize');
vi.mock('../src/features/commands');
vi.stubGlobal('document', { body: { hasClass: vi.fn() } });

describe('Readwise Atoms', () => {
  let plugin: ReadwiseAtoms;
  let loadSettingsSpy: MockInstance;
  let syncSpy: MockInstance;

  beforeEach(async () => {
    vi.restoreAllMocks();
    plugin = new ReadwiseAtoms({} as App, {} as PluginManifest);
    plugin.loadSettings = mockPlugin.loadSettings;
    plugin.addSettingTab = mockPlugin.addSettingTab;
    plugin.addCommand = mockPlugin.addCommand;
    plugin.settings = mockPlugin.settings;
    loadSettingsSpy = vi.spyOn(plugin, 'loadSettings');
    syncSpy = vi.spyOn(plugin.commands, 'sync');
  });

  describe('onload', () => {
    it('should sync when syncOnStart is activated', async () => {
      plugin.settings.syncOnStart = true;

      await plugin.onload();

      expect(syncSpy).toHaveBeenCalledOnce();
    });

    it('should not sync when syncOnStart is deactivated', async () => {
      plugin.settings.syncOnStart = false;

      await plugin.onload();

      expect(syncSpy).not.toHaveBeenCalled();
    });
  });
});

import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, Settings, SettingTab } from './features/settings';
import { Templates } from './features/templates';
import Readwise from './features/readwise';
import Synchronize from './features/synchronize';
import Commands from './features/commands';
import Notifications from './features/notifications';

export default class ReadwiseAtoms extends Plugin {
  settings: Settings;
  templates = new Templates();
  readwise: Readwise;
  synchronize: Synchronize;
  notifications: Notifications;
  commands = new Commands();
  isMobile: boolean;

  async onload() {
    this.isMobile = document.body.hasClass('is-mobile');

    await this.loadSettings();

    this.notifications = new Notifications(this);
    this.readwise = new Readwise(this);
    this.synchronize = new Synchronize(this);

    this.addSettingTab(new SettingTab(this.app, this));

    this.addCommand({
      id: 'sync',
      name: 'Sync',
      callback: async () => this.commands.sync(this),
    });

    this.addCommand({
      id: 'resync',
      name: 'Resync',
      callback: async () => this.commands.resync(this),
    });

    if (this.settings.syncOnStart) {
      await this.commands.sync(this);
    }
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.notifications.update(this);
    this.readwise.update(this);
    this.synchronize.update(this);
    this.notifications.log('settings saved');
  }
}

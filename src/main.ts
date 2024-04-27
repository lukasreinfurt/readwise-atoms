import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, Settings, SettingTab } from './features/settings';
import { Templates } from './features/templates';
import Readwise from './features/readwise';
import Synchronize from './features/synchronize';
import Commands from './features/commands';
import Notifications from './features/notifications';

export default class ReadwiseAtoms extends Plugin {
  settings: Settings;
  templates: Templates;
  readwise: Readwise;
  synchronize: Synchronize;
  notifications: Notifications;
  commands: Commands;

  async onload() {
    await this.loadSettings();
    this.initialize();

    this.addSettingTab(new SettingTab(this.app, this));

    this.addCommand({
      id: 'sync',
      name: 'Sync',
      callback: async () => this.commands.sync(this),
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.initialize();
  }

  private initialize() {
    this.templates = new Templates();
    this.readwise = new Readwise(this);
    this.synchronize = new Synchronize(this);
    this.notifications = new Notifications();
    this.commands = new Commands();
  }
}

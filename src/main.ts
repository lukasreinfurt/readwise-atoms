import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, Settings, SettingTab } from './features/settings';
import { Templates } from './features/templates';
import Readwise from './features/readwise';
import Synchronize from './features/synchronize';

export default class ReadwiseAtoms extends Plugin {
  settings: Settings;
  templates: Templates;
  readwise: Readwise;
  synchronize: Synchronize;

  async onload() {
    await this.loadSettings();
    this.templates = new Templates();
    this.readwise = new Readwise(this.settings.readwiseToken);
    this.synchronize = new Synchronize(this.app, this.settings, this.templates);

    this.addSettingTab(new SettingTab(this.app, this));

    this.addCommand({
      id: 'sync',
      name: 'Sync',
      callback: async () => {
        console.log('Readwise Atoms: running sync...');
        if (!(await this.readwise.isTokenValid())) {
          console.log('token invalid');
        }
        const highlights = await this.readwise.getHighlights();
        await this.synchronize.syncHighlights(highlights);
      },
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

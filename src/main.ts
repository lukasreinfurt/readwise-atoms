import { DataAdapter, Plugin } from 'obsidian';
import Settings from './settings/settings';
import DEFAULT_SETTINGS from './settings/defaultSettings';
import SettingTab from './settings/settingTab';
import Templates from './templates/templates';
import Readwise from './readwise/readwise';

export default class ReadwiseAtoms extends Plugin {
  settings: Settings;
  templates = new Templates();
  readwise: Readwise;
  fs: DataAdapter;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'sync',
      name: 'Sync',
      callback: async () => {
        this.readwise = new Readwise(this.settings.readwiseToken);

        console.log('Readwise Atoms: running sync...');
        // check if token is valid
        // TODO: implement more robust error handling
        if (!(await this.readwise.isTokenValid())) {
          console.log('token invalid');
        }

        // get highlights that have to be synced
        // TODO: handle new highlights only
        // TODO: handle API rate limit
        const highlights = await this.readwise.getHighlights();
        //const highlights = [];

        // sync highlights with obsidian files
        await this.syncHighlights(highlights);
      },
    });

    this.addSettingTab(new SettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async syncHighlights(books: any) {
    this.fs = this.app.vault.adapter;

    const highlightPathTemplate = this.settings.highlightPathTemplate;
    const highlightFileTemplate = this.settings.highlightFileTemplate;
    const indexPathTemplate = this.settings.indexPathTemplate;
    const indexFileTemplate = this.settings.indexFileTemplate;

    for await (const book of books) {
      const resolvedindexPath = this.templates.resolve({ indexPathTemplate }, book);
      const resolvedBookIndexPath = resolvedindexPath.substring(0, resolvedindexPath.lastIndexOf('/'));

      for await (const highlight of book.highlights) {
        const data = { book: book, highlight: highlight };
        const resolvedhighlightPath = this.templates.resolve({ highlightPathTemplate }, data);
        const resolvedHighlightPath = resolvedhighlightPath.substring(0, resolvedhighlightPath.lastIndexOf('/'));
        if (!(await this.fs.exists(resolvedhighlightPath))) {
          const resolvedHighlightFile = this.templates.resolve({ highlightFileTemplate }, data);
          await this.fs.mkdir(resolvedHighlightPath);
          await this.fs.write(resolvedhighlightPath, resolvedHighlightFile);
        }
      }

      if (resolvedBookIndexPath !== '') {
        if (!(await this.fs.exists(resolvedindexPath))) {
          const resolvedindexFile = this.templates.resolve({ indexFileTemplate }, book);
          await this.fs.mkdir(resolvedBookIndexPath);
          await this.fs.write(resolvedindexPath, resolvedindexFile);
        }
      }
    }
  }
}

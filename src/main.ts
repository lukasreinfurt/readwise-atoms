import { DataAdapter, Plugin } from 'obsidian';
import Settings from './settings/settings';
import DEFAULT_SETTINGS from './settings/defaultSettings';
import SettingTab from './settings/settingTab';
import Templates from './templates/templates';

export default class ReadwiseAtoms extends Plugin {
  settings: Settings;
  templates = new Templates();
  fs: DataAdapter;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'sync',
      name: 'Sync',
      callback: async () => {
        console.log('Readwise Atoms: running sync...');
        // check if token is valid
        // TODO: implement more robust error handling
        if (!(await this.isTokenValid(this.settings.readwiseToken))) {
          console.log('token invalid');
        }

        // get highlights that have to be synced
        // TODO: handle new highlights only
        // TODO: handle API rate limit
        const highlights = await this.getHighlights(this.settings.readwiseToken);
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

  async isTokenValid(token: string) {
    const response = await fetch('https://readwise.io/api/v2/auth/', {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.status === 204;
  }

  async getHighlights(token: string, updatedAfter = null) {
    let fullData = [];
    let nextPageCursor = null;

    while (true) {
      const queryParams = new URLSearchParams();

      if (nextPageCursor) {
        queryParams.append('pageCursor', nextPageCursor);
      }

      if (updatedAfter) {
        queryParams.append('updatedAfter', updatedAfter);
      }

      console.log('Making export api request with params ' + queryParams.toString());
      const response = await fetch('https://readwise.io/api/v2/export/?' + queryParams.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const responseJson = await response.json();
      fullData.push(...responseJson['results']);
      nextPageCursor = responseJson['nextPageCursor'];

      if (!nextPageCursor) {
        break;
      }
    }
    return fullData;
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

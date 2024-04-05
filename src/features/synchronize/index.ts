import { App, DataAdapter } from 'obsidian';
import { Settings } from '../settings';
import { Templates } from '../templates';

export default class Synchronize {
  fs: DataAdapter;
  settings: Settings;
  templates: Templates;

  constructor(app: App, settings: Settings, templates: Templates) {
    this.fs = app.vault.adapter;
    this.settings = settings;
    this.templates = templates;
  }

  async syncHighlights(books: any) {
    const highlightPathTemplate = this.settings.highlightPathTemplate;
    const highlightFileTemplate = this.settings.highlightFileTemplate;
    const indexPathTemplate = this.settings.indexPathTemplate;
    const indexFileTemplate = this.settings.indexFileTemplate;

    for await (const book of books) {
      const indexFilePath = this.templates.resolve({ indexPathTemplate }, book);
      const indexFolderPath = indexFilePath.substring(0, indexFilePath.lastIndexOf('/'));

      for await (const highlight of book.highlights) {
        const data = { book: book, highlight: highlight };
        const highlightFilePath = this.templates.resolve({ highlightPathTemplate }, data);
        const highlightFolderPath = highlightFilePath.substring(0, highlightFilePath.lastIndexOf('/'));
        if (!(await this.fs.exists(highlightFilePath))) {
          const highlightFileContent = this.templates.resolve({ highlightFileTemplate }, data);
          await this.fs.mkdir(highlightFolderPath);
          await this.fs.write(highlightFilePath, highlightFileContent);
        }
      }

      if (indexFolderPath !== '') {
        if (!(await this.fs.exists(indexFilePath))) {
          const indexFileConten = this.templates.resolve({ indexFileTemplate }, book);
          await this.fs.mkdir(indexFolderPath);
          await this.fs.write(indexFilePath, indexFileConten);
        }
      }
    }
  }
}

import { App, DataAdapter } from 'obsidian';
import { Settings } from '../settings';
import { Templates } from '../templates';
import ReadwiseAtoms from 'src/main';

export default class Synchronize {
  plugin: ReadwiseAtoms;
  fs: DataAdapter;

  constructor(plugin: ReadwiseAtoms) {
    this.plugin = plugin;
    this.fs = this.plugin.app.vault.adapter;
  }

  async syncHighlights(books: any) {
    const highlightPathTemplate = this.plugin.settings.highlightPathTemplate;
    const highlightFileTemplate = this.plugin.settings.highlightFileTemplate;
    const indexPathTemplate = this.plugin.settings.indexPathTemplate;
    const indexFileTemplate = this.plugin.settings.indexFileTemplate;

    for await (const book of books) {
      const indexFilePath = this.plugin.templates.resolve({ indexPathTemplate }, book);
      const indexFolderPath = indexFilePath.substring(0, indexFilePath.lastIndexOf('/'));

      for await (const highlight of book.highlights) {
        const data = { book: book, highlight: highlight };
        const highlightFilePath = this.plugin.templates.resolve({ highlightPathTemplate }, data);
        const highlightFolderPath = highlightFilePath.substring(0, highlightFilePath.lastIndexOf('/'));
        if (!(await this.fs.exists(highlightFilePath))) {
          await this.fs.mkdir(highlightFolderPath);
        }
        const highlightFileContent = this.plugin.templates.resolve({ highlightFileTemplate }, data);
        await this.fs.write(highlightFilePath, highlightFileContent);
      }

      if (indexFolderPath !== '') {
        if (!(await this.fs.exists(indexFilePath))) {
          await this.fs.mkdir(indexFolderPath);
        }
        const indexFileContent = this.plugin.templates.resolve({ indexFileTemplate }, book);
        await this.fs.write(indexFilePath, indexFileContent);
      }
    }
  }
}

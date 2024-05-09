import { DataAdapter } from 'obsidian';
import ReadwiseAtoms from 'src/main';

export default class Synchronize {
  plugin: ReadwiseAtoms;
  fs: DataAdapter;

  constructor(plugin: ReadwiseAtoms) {
    this.update(plugin);
  }

  update(plugin: ReadwiseAtoms) {
    this.plugin = plugin;
    this.fs = this.plugin.app.vault.adapter;
  }

  async syncHighlights(books: any) {
    const highlightPathTemplate = this.plugin.settings.highlightPathTemplate;
    const highlightFileTemplate = this.plugin.settings.highlightFileTemplate;
    const indexPathTemplate = this.plugin.settings.indexPathTemplate;
    const indexFileTemplate = this.plugin.settings.indexFileTemplate;

    const totalHighlights = books.reduce((a: number, b: any) => a + b.highlights.length, 0);
    let currentHighlight = 0;

    this.plugin.notifications.log(`found ${totalHighlights} highlights to synchronize`);

    for await (const book of books) {
      const indexFilePath = this.plugin.templates.resolve({ indexPathTemplate }, book);
      const indexFolderPath = indexFilePath.substring(0, indexFilePath.lastIndexOf('/'));

      for await (const highlight of book.highlights) {
        currentHighlight++;
        this.plugin.notifications.setStatusBarText(
          `synchronizing ${totalHighlights} highlights: ${((currentHighlight / totalHighlights) * 100).toFixed(0)}%`,
          false
        );
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

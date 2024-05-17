import { normalizePath, Vault } from 'obsidian';
import ReadwiseAtoms from 'src/main';

export default class Synchronize {
  plugin: ReadwiseAtoms;
  vault: Vault;

  constructor(plugin: ReadwiseAtoms) {
    this.update(plugin);
  }

  update(plugin: ReadwiseAtoms) {
    this.plugin = plugin;
    this.vault = this.plugin.app.vault;
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
      for await (const highlight of book.highlights) {
        currentHighlight++;
        this.plugin.notifications.setStatusBarText(
          `synchronizing ${totalHighlights} highlights: ${((currentHighlight / totalHighlights) * 100).toFixed(0)}%`,
          false
        );
        const data = { book: book, highlight: highlight };
        const highlightFilePath = this.cleanUpFileName(this.plugin.templates.resolve({ highlightPathTemplate }, data));
        const highlightFolderPath = highlightFilePath.substring(0, highlightFilePath.lastIndexOf('/'));

        if (!this.vault.getFolderByPath(highlightFolderPath)) {
          await this.vault.createFolder(highlightFolderPath);
        }

        const highlightFileContent = this.plugin.templates.resolve({ highlightFileTemplate }, data);
        const highlightFile = this.vault.getFileByPath(highlightFilePath);
        if (!highlightFile) {
          await this.vault.create(highlightFilePath, highlightFileContent);
        } else {
          await this.vault.modify(highlightFile, highlightFileContent);
        }
      }

      const indexFilePath = this.cleanUpFileName(this.plugin.templates.resolve({ indexPathTemplate }, book));
      const indexFolderPath = indexFilePath.substring(0, indexFilePath.lastIndexOf('/'));

      if (indexFolderPath !== '') {
        if (!this.vault.getFolderByPath(indexFolderPath)) {
          await this.vault.createFolder(indexFolderPath);
        }

        const indexFileContent = this.plugin.templates.resolve({ indexFileTemplate }, book);
        const indexFile = this.vault.getFileByPath(indexFilePath);
        if (!indexFile) {
          await this.vault.create(indexFilePath, indexFileContent);
        } else {
          await this.vault.modify(indexFile, indexFileContent);
        }
      }
    }
  }

  private cleanUpFileName(fileName: string): string {
    fileName = fileName.replace(/:/g, ' -');
    return normalizePath(fileName);
  }
}

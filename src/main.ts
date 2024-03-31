import { App, DataAdapter, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as Handlebars from 'handlebars';
import highlightFileTemplate from './templates/highlight.file.template.md?raw';
import highlightPathTemplate from './templates/highlight.path.template.md?raw';
import indexFileTemplate from './templates/index.file.template.md?raw';
import indexPathTemplate from './templates/index.path.template.md?raw';

export interface ReadwiseAtomsSettings {
  readwiseToken: string;
  bookIndexFilenameTemplate: string;
  bookIndexFileTemplate: string;
  highlightFilenameTemplate: string;
  highlightFileTemplate: string;
}

const DEFAULT_SETTINGS: ReadwiseAtomsSettings = {
  readwiseToken: '',
  bookIndexFilenameTemplate: indexPathTemplate.trim(),
  bookIndexFileTemplate: indexFileTemplate,
  highlightFilenameTemplate: highlightPathTemplate.trim(),
  highlightFileTemplate: highlightFileTemplate,
};

export default class ReadwiseAtoms extends Plugin {
  settings: ReadwiseAtomsSettings;
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

    this.addSettingTab(new SampleSettingTab(this.app, this));
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
    const highlightFilenameTemplate = Handlebars.compile(this.settings.highlightFilenameTemplate);
    const highlightFileTemplate = Handlebars.compile(this.settings.highlightFileTemplate);
    const bookIndexFilenameTemplate = Handlebars.compile(this.settings.bookIndexFilenameTemplate);
    const bookIndexFileTemplate = Handlebars.compile(this.settings.bookIndexFileTemplate);

    for await (const book of books) {
      const resolvedBookIndexFilename = bookIndexFilenameTemplate(book);
      const resolvedBookIndexPath = resolvedBookIndexFilename.substring(0, resolvedBookIndexFilename.lastIndexOf('/'));

      for await (const highlight of book.highlights) {
        const data = { book: book, highlight: highlight };
        const resolvedHighlightFilename = highlightFilenameTemplate(data);
        const resolvedHighlightPath = resolvedHighlightFilename.substring(
          0,
          resolvedHighlightFilename.lastIndexOf('/')
        );
        if (!(await this.fs.exists(resolvedHighlightFilename))) {
          const resolvedHighlightFile = highlightFileTemplate(data);
          await this.fs.mkdir(resolvedHighlightPath);
          await this.fs.write(resolvedHighlightFilename, resolvedHighlightFile);
        }
      }

      if (resolvedBookIndexPath !== '') {
        if (!(await this.fs.exists(resolvedBookIndexFilename))) {
          const resolvedBookIndexFile = bookIndexFileTemplate(book);
          await this.fs.mkdir(resolvedBookIndexPath);
          await this.fs.write(resolvedBookIndexFilename, resolvedBookIndexFile);
        }
      }
    }
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: ReadwiseAtoms;

  constructor(app: App, plugin: ReadwiseAtoms) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Readwise Token')
      .setDesc('Your Readwise token can be found at https://readwise.io/access_tokens')
      .addText((text) =>
        text
          .setPlaceholder('Enter your Readwise token')
          .setValue(this.plugin.settings.readwiseToken)
          .onChange(async (value) => {
            this.plugin.settings.readwiseToken = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Book Index Filename Template')
      .setDesc(this.bookIndexFilenameTemplateDescription())
      .addText((text) =>
        text
          .setPlaceholder('Example: ' + indexPathTemplate.trim())
          .setValue(this.plugin.settings.bookIndexFilenameTemplate)
          .onChange(async (value) => {
            this.plugin.settings.bookIndexFilenameTemplate = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Book Index File Template')
      .setDesc(this.bookIndexFileTemplateDescription())
      .addTextArea((text) => {
        text
          .setPlaceholder('Example:\n\n' + indexFileTemplate)
          .setValue(this.plugin.settings.bookIndexFileTemplate)
          .onChange(async (value) => {
            this.plugin.settings.bookIndexFileTemplate = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 10;
        text.inputEl.cols = 22;
      });

    new Setting(containerEl)
      .setName('Highlight Filename Template')
      .setDesc(this.highlightFilenameTemplateDescription())
      .addText((text) =>
        text
          .setPlaceholder('Example: ' + highlightPathTemplate.trim())
          .setValue(this.plugin.settings.highlightFilenameTemplate)
          .onChange(async (value) => {
            this.plugin.settings.highlightFilenameTemplate = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Highlight File Template')
      .setDesc(this.highlightFileTemplateDescription())
      .addTextArea((text) => {
        text
          .setPlaceholder('Example:\n\n' + highlightFileTemplate)
          .setValue(this.plugin.settings.highlightFileTemplate)
          .onChange(async (value) => {
            this.plugin.settings.highlightFileTemplate = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 10;
        text.inputEl.cols = 22;
      });
  }

  private bookIndexFilenameTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.appendText(
      'A book index file can be created for each book that is imported from Readwise. ' +
        'This template controls where these files will be created and how they will be called.'
    );

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    this.addHandlebarsLink(fragment);

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    fragment.appendText(
      'This template has access to the Readwise metadata of the currently processed highlight and its corresponding book, such as' +
        'title, author, source, book_tags, category, readwise_url, etc. '
    );
    this.addReadwiseApiLink(fragment);

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    fragment.appendText("Leave empty if you don't want to create book index files.");
    return fragment;
  }

  private bookIndexFileTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.appendText(
      'This template controls the content of the book index files. ' +
        'It can be used to link to all highlights from the book or list any other book metadata that you might want to see here.'
    );

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    this.addHandlebarsLink(fragment);

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    fragment.appendText(
      'This template has access to the Readwise metadata of the currently processed book, such as: ' +
        'title, author, highlights, etc. '
    );
    this.addReadwiseApiLink(fragment);
    return fragment;
  }

  private highlightFilenameTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.appendText(
      'A highlight file is created for each highlight that is imported from Readwise. ' +
        'This template controls where these files will be created and how they will be called.'
    );

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    this.addHandlebarsLink(fragment);

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    fragment.appendText(
      'This template has access to the Readwise metadata of the currently processed highlight and its corresponding book, such as: ' +
        'book.title, book.author, highlight.id, highlight.text, etc. '
    );
    this.addReadwiseApiLink(fragment);

    return fragment;
  }

  private highlightFileTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.appendText(
      'This template controls the content of the highlight files. ' +
        'It can be used to show the highlight text, list any other highlight metadata, and link back to the book index note.'
    );

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    this.addHandlebarsLink(fragment);

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    fragment.appendText(
      'This template has access to the Readwise metadata of the currently processed highlight and its corresponding book, such as: ' +
        'book.title, book.author, highlight.id, highlight.text, etc. '
    );
    this.addReadwiseApiLink(fragment);
    return fragment;
  }

  private addHandlebarsLink(fragment: DocumentFragment) {
    const a = document.createElement('a');
    a.href = 'https://handlebarsjs.com/guide/#simple-expressions';
    a.text = 'handlebars';
    a.target = '_blank';

    fragment.appendText('The templating language used is ');
    fragment.appendChild(a);
    fragment.appendText('.');
  }

  private addReadwiseApiLink(fragment: DocumentFragment) {
    const a = document.createElement('a');
    a.href = 'https://readwise.io/api_deets';
    a.text = 'Readwisse api documentation';
    a.target = '_blank';

    fragment.appendText('You can find more about all options in the ');
    fragment.appendChild(a);
    fragment.appendText(' in the highlight export response example.');
  }
}

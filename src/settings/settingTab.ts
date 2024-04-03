import { App, PluginSettingTab, Setting } from 'obsidian';
import ReadwiseAtoms from 'src/main';
import highlightFileTemplate from '../templates/highlight.file.template.md?raw';
import highlightPathTemplate from '../templates/highlight.path.template.md?raw';
import indexFileTemplate from '../templates/index.file.template.md?raw';
import indexPathTemplate from '../templates/index.path.template.md?raw';

export default class SettingTab extends PluginSettingTab {
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
      .setName('Book Index Path Template')
      .setDesc(this.indexPathTemplateDescription())
      .addText((text) =>
        text
          .setPlaceholder('Example: ' + indexPathTemplate.trim())
          .setValue(this.plugin.settings.indexPathTemplate)
          .onChange(async (value) => {
            this.plugin.settings.indexPathTemplate = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Book Index File Template')
      .setDesc(this.indexFileTemplateDescription())
      .addTextArea((text) => {
        text
          .setPlaceholder('Example:\n\n' + indexFileTemplate)
          .setValue(this.plugin.settings.indexFileTemplate)
          .onChange(async (value) => {
            this.plugin.settings.indexFileTemplate = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 10;
        text.inputEl.cols = 22;
      });

    new Setting(containerEl)
      .setName('Highlight Path Template')
      .setDesc(this.highlightPathTemplateDescription())
      .addText((text) =>
        text
          .setPlaceholder('Example: ' + highlightPathTemplate.trim())
          .setValue(this.plugin.settings.highlightPathTemplate)
          .onChange(async (value) => {
            this.plugin.settings.highlightPathTemplate = value;
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

  private indexPathTemplateDescription(): DocumentFragment {
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

  private indexFileTemplateDescription(): DocumentFragment {
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

  private highlightPathTemplateDescription(): DocumentFragment {
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

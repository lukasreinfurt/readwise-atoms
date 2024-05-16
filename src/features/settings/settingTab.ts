import { App, PluginSettingTab, Setting } from 'obsidian';
import ReadwiseAtoms from 'src/main';
import highlightFileTemplate from '../templates/highlight.file.template.handlebars?raw';
import highlightPathTemplate from '../templates/highlight.path.template.handlebars?raw';
import indexFileTemplate from '../templates/index.file.template.handlebars?raw';
import indexPathTemplate from '../templates/index.path.template.handlebars?raw';

export default class SettingTab extends PluginSettingTab {
  plugin: ReadwiseAtoms;

  constructor(app: App, plugin: ReadwiseAtoms) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl).setName('General').setHeading();

    new Setting(containerEl)
      .setName('Readwise Token')
      .setDesc(this.readwiseTokenDescription())
      .addText((text) =>
        text
          .setPlaceholder('Enter your Readwise token')
          .setValue(this.plugin.settings.readwiseToken)
          .onChange(async (value) => {
            this.plugin.settings.readwiseToken = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl).setName('Templates').setHeading();

    new Setting(containerEl).setDesc(this.generalTemplateDescription());

    new Setting(containerEl)
      .setName('Index Path Template')
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
      .setName('Index File Template')
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

  private readwiseTokenDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();

    const readwiseToken = document.createElement('a');
    readwiseToken.href = 'https://readwise.io/access_tokens';
    readwiseToken.text = 'https://readwise.io/access_tokens';
    readwiseToken.target = '_blank';

    fragment.appendText('A token is required to access the Readwise API. ');
    fragment.appendText('It can be found at ');
    fragment.appendChild(readwiseToken);
    fragment.appendText('.');

    return fragment;
  }

  private generalTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();

    const handlebars = document.createElement('a');
    handlebars.href = 'https://handlebarsjs.com/guide/#simple-expressions';
    handlebars.text = 'handlebars';
    handlebars.target = '_blank';

    const here = document.createElement('a');
    here.href = 'https://handlebarsjs.com/guide/#html-escaping';
    here.text = 'here';
    here.target = '_blank';

    const readwiseApiDocumentation = document.createElement('a');
    readwiseApiDocumentation.href = 'https://readwise.io/api_deets';
    readwiseApiDocumentation.text = 'Readwisse api documentation';
    readwiseApiDocumentation.target = '_blank';

    fragment.appendText('All templates use the ');
    fragment.appendChild(handlebars);
    fragment.appendText(' templating language. ');
    fragment.appendText(
      'Note that handlebars HTML escapes values inserted with double-stash expressions like {{ this }}. Use tripe-stash expressions like {{{ this }}} wherever you want to insert text as is. You can find more information '
    );
    fragment.appendChild(here);
    fragment.appendText('.');

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    fragment.appendText(
      'Templates have access to the Readwise metadata of the currently processed highlight and/or its corresponding book, such as: ' +
        'book.title, book.author, book.highlights, highlight.id, highlight.text, etc. '
    );
    fragment.appendText('You can find more about all options in the ');
    fragment.appendChild(readwiseApiDocumentation);
    fragment.appendText(' in the highlight export response example.');

    return fragment;
  }

  private indexPathTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.appendText(
      'An index file can be created for each book that is imported from Readwise. ' +
        'This template controls where these files will be created and how they will be named.'
    );

    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createElement('br'));

    fragment.appendText("Leave empty if you don't want to create book index files.");
    return fragment;
  }

  private indexFileTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.appendText(
      'This template controls the content of the index files. ' +
        'It can be used to link to all highlights from the book or list any other book metadata that you might want to see here.'
    );
    return fragment;
  }

  private highlightPathTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.appendText(
      'A highlight file is created for each highlight that is imported from Readwise. ' +
        'This template controls where these files will be created and how they will be named.'
    );
    return fragment;
  }

  private highlightFileTemplateDescription(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.appendText(
      'This template controls the content of the highlight files. ' +
        'It can be used to show the highlight text, list any other highlight metadata, and link back to the book index note.'
    );
    return fragment;
  }
}

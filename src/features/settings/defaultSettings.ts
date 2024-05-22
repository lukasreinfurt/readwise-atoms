import Settings from './settings';
import highlightFileTemplate from '../templates/highlight.file.template.handlebars?raw';
import highlightPathTemplate from '../templates/highlight.path.template.handlebars?raw';
import indexFileTemplate from '../templates/index.file.template.handlebars?raw';
import indexPathTemplate from '../templates/index.path.template.handlebars?raw';

const DEFAULT_SETTINGS: Settings = {
  readwiseToken: '',
  readwiseUpdateAfter: '',
  syncOnStart: false,
  indexPathTemplate: indexPathTemplate.trim(),
  indexFileTemplate: indexFileTemplate,
  highlightPathTemplate: highlightPathTemplate.trim(),
  highlightFileTemplate: highlightFileTemplate,
};

export default DEFAULT_SETTINGS;

import Settings from './settings';
import highlightFileTemplate from '../templates/highlight.file.template.md?raw';
import highlightPathTemplate from '../templates/highlight.path.template.md?raw';
import indexFileTemplate from '../templates/index.file.template.md?raw';
import indexPathTemplate from '../templates/index.path.template.md?raw';

const DEFAULT_SETTINGS: Settings = {
  readwiseToken: '',
  readwiseUpdateAfter: '',
  indexPathTemplate: indexPathTemplate.trim(),
  indexFileTemplate: indexFileTemplate,
  highlightPathTemplate: highlightPathTemplate.trim(),
  highlightFileTemplate: highlightFileTemplate,
};

export default DEFAULT_SETTINGS;

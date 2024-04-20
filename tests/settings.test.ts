import { MockInstance, afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App, PluginManifest } from 'obsidian';
import ReadwiseAtoms from '../src/main';
import * as dataJson from './__mocks__/data.json';
import indexFileTemplateDefault from '../src/features/templates/index.file.template.md?raw';
import highlightFileTemplateDefault from '../src/features/templates/highlight.file.template.md?raw';

describe('Settings', () => {
  let plugin: ReadwiseAtoms;
  let loadDataSpy: MockInstance;

  beforeAll(() => {
    plugin = new ReadwiseAtoms({} as App, {} as PluginManifest);
    plugin.loadData = vi.fn();
  });

  beforeEach(async (expect) => {
    vi.restoreAllMocks();
    loadDataSpy = vi.spyOn(plugin, 'loadData');
    await plugin.loadSettings();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should have correct default values', () => {
    const indexPathTemplateDefault = 'Readwise Atoms/{{author}} - {{title}}/index.md';
    const highlightPathTemplateDefault = 'Readwise Atoms/{{book.author}} - {{book.title}}/quotes/{{highlight.id}}.md';

    expect(loadDataSpy).toHaveBeenCalledOnce();
    expect(plugin.settings.readwiseToken).toEqual('');
    expect(plugin.settings.indexPathTemplate).toEqual(indexPathTemplateDefault);
    expect(plugin.settings.indexFileTemplate).toEqual(indexFileTemplateDefault);
    expect(plugin.settings.highlightPathTemplate).toEqual(highlightPathTemplateDefault);
    expect(plugin.settings.highlightFileTemplate).toEqual(highlightFileTemplateDefault);
  });

  it.todo('should warn about missing values');

  it.todo('should warn about erroneous values');

  it('should use saved values if available', async () => {
    loadDataSpy.mockResolvedValueOnce(dataJson);

    await plugin.loadSettings();

    expect(loadDataSpy).toHaveBeenCalledTimes(2);
    expect(plugin.settings.readwiseToken).toEqual('savedReadwiseToken');
    expect(plugin.settings.indexPathTemplate).toEqual('savedIndexPathTemplate');
    expect(plugin.settings.indexFileTemplate).toEqual('savedIndexFileTemplate');
    expect(plugin.settings.highlightPathTemplate).toEqual('savedHighlightPathTemplate');
    expect(plugin.settings.highlightFileTemplate).toEqual('savedHighlightFileTemplate');
  });
});

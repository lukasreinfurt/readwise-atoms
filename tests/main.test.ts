import { MockInstance, afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App, PluginManifest } from 'obsidian';
import ReadwiseAtoms from '../src/main';
import * as exportJson from './__mocks__/export.json';
import * as dataJson from './__mocks__/data.json';
import indexFileTemplateDefault from '../src/templates/index.file.template.md?raw';
import highlightFileTemplateDefault from '../src/templates/highlight.file.template.md?raw';
import Templates from 'src/templates/templates';
import Readwise from 'src/readwise/readwise';

vi.mock('obsidian');
global.fetch = vi.fn();

describe('Readwise Atoms', () => {
  const snapshotBaseDir = '__snapshots__';
  let snapshotBaseName: string;

  let plugin: ReadwiseAtoms;
  let loadDataSpy: MockInstance;
  let existsSpy: MockInstance;
  let mkdirSpy: MockInstance;
  let writeSpy: MockInstance;
  let fetchSpy: MockInstance;

  beforeAll(() => {
    plugin = new ReadwiseAtoms({} as App, {} as PluginManifest);
    plugin.app = {
      vault: {
        adapter: {
          exists: vi.fn(),
          mkdir: vi.fn(),
          write: vi.fn(),
        },
      },
    } as unknown as App;
    plugin.loadData = vi.fn();
  });

  beforeEach(async (expect) => {
    vi.restoreAllMocks();
    loadDataSpy = vi.spyOn(plugin, 'loadData');
    existsSpy = vi.spyOn(plugin.app.vault.adapter, 'exists');
    mkdirSpy = vi.spyOn(plugin.app.vault.adapter, 'mkdir');
    writeSpy = vi.spyOn(plugin.app.vault.adapter, 'write');
    fetchSpy = vi.spyOn(global, 'fetch');
    snapshotBaseName = `${snapshotBaseDir}/${expect.task.name} - `;
    await plugin.loadSettings();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Settings', () => {
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

  describe('Readwise API', () => {
    it.todo('should warn about connection issues');

    it.todo('should warn about invalid token');

    it('should load initial export', async () => {
      fetchSpy.mockResolvedValueOnce({
        json: () => exportJson,
      });
      const readwise = new Readwise(plugin.settings.readwiseToken);

      await readwise.getHighlights();

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it.todo('should handle API rate limits');

    it.todo('should load incremental exports');
  });

  describe('Templates', () => {
    it.todo('should resolve templates');

    it.todo('should warn about invalid templates');
  });

  describe('Synchronization', () => {
    it('should create folders if they do not exists', async () => {
      existsSpy.mockResolvedValueOnce(false).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      plugin.templates = new Templates();

      await plugin.syncHighlights(exportJson.results);

      expect(existsSpy).toHaveBeenCalledTimes(3);
      expect(existsSpy).toHaveBeenNthCalledWith(1, 'Readwise Atoms/Book Author - Book Title/quotes/456.md');
      expect(existsSpy).toHaveBeenNthCalledWith(2, 'Readwise Atoms/Book Author - Book Title/quotes/890.md');
      expect(existsSpy).toHaveBeenNthCalledWith(3, 'Readwise Atoms/Book Author - Book Title/index.md');
      expect(mkdirSpy).toHaveBeenCalledTimes(2);
      expect(mkdirSpy).toHaveBeenNthCalledWith(1, 'Readwise Atoms/Book Author - Book Title/quotes');
      expect(mkdirSpy).toHaveBeenNthCalledWith(2, 'Readwise Atoms/Book Author - Book Title');
    });

    it('should write new files', async () => {
      existsSpy.mockResolvedValue(false);

      await plugin.syncHighlights(exportJson.results);

      expect(writeSpy).toHaveBeenCalledTimes(3);
      expect(writeSpy.mock.calls[0][1]).toMatchFileSnapshot(`${snapshotBaseName}highlight 1.md`);
      expect(writeSpy.mock.calls[1][1]).toMatchFileSnapshot(`${snapshotBaseName}highlight 2.md`);
      expect(writeSpy.mock.calls[2][1]).toMatchFileSnapshot(`${snapshotBaseName}index.md`);
    });

    it.todo('should update existing files');

    it('should not create index file if template is empty', async () => {
      existsSpy.mockResolvedValue(false);
      plugin.settings.indexPathTemplate = '';
      plugin.templates = new Templates();

      await plugin.syncHighlights(exportJson.results);

      expect(writeSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Bugs', () => {
    it.todo('should add tests for bugs here');
  });
});

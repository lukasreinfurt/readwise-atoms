import { MockInstance, afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from 'obsidian';
import * as exportJson from './__mocks__/export.json';
import { Templates } from 'src/features/templates';
import Synchronize from 'src/features/synchronize';
import { Settings } from 'src/features/settings';

describe('Readwise Atoms', () => {
  const snapshotBaseDir = '__snapshots__';
  let snapshotBaseName: string;

  let app: App;
  let settings: Settings;
  let templates: Templates;
  let resolveSpy: MockInstance;
  let existsSpy: MockInstance;
  let mkdirSpy: MockInstance;
  let writeSpy: MockInstance;
  let fetchSpy: MockInstance;
  let synchronize: Synchronize;

  beforeAll(() => {
    app = {
      vault: {
        adapter: {
          exists: vi.fn(),
          mkdir: vi.fn(),
          write: vi.fn(),
        },
      },
    } as unknown as App;
    settings = {
      readwiseToken: '',
      highlightPathTemplate: '',
      highlightFileTemplate: '',
      indexPathTemplate: '',
      indexFileTemplate: '',
    };
    templates = {
      templates: [],
      resolve: vi.fn(),
    };
  });

  beforeEach(async (expect) => {
    vi.restoreAllMocks();
    resolveSpy = vi.spyOn(templates, 'resolve');
    existsSpy = vi.spyOn(app.vault.adapter, 'exists');
    mkdirSpy = vi.spyOn(app.vault.adapter, 'mkdir');
    writeSpy = vi.spyOn(app.vault.adapter, 'write');
    fetchSpy = vi.spyOn(global, 'fetch');
    snapshotBaseName = `${snapshotBaseDir}/${expect.task.name} - `;

    resolveSpy
      .mockReturnValueOnce('file/path/index.md')
      .mockReturnValueOnce('file/path/quotes/highlight1.md')
      .mockReturnValueOnce('highlight 1 file content')
      .mockReturnValueOnce('file/path/quotes/highlight2.md')
      .mockReturnValueOnce('highlight 2 file content')
      .mockReturnValueOnce('index file content');

    synchronize = new Synchronize(app, settings, templates);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Synchronization', () => {
    it('should create folders if they do not exists', async () => {
      existsSpy.mockResolvedValueOnce(false).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      await synchronize.syncHighlights(exportJson.results);

      expect(resolveSpy).toHaveBeenCalledTimes(5);
      expect(existsSpy).toHaveBeenCalledTimes(3);
      expect(existsSpy).toHaveBeenNthCalledWith(1, 'file/path/quotes/highlight1.md');
      expect(existsSpy).toHaveBeenNthCalledWith(2, 'file/path/quotes/highlight2.md');
      expect(existsSpy).toHaveBeenNthCalledWith(3, 'file/path/index.md');
      expect(mkdirSpy).toHaveBeenCalledTimes(2);
      expect(mkdirSpy).toHaveBeenNthCalledWith(1, 'file/path/quotes');
      expect(mkdirSpy).toHaveBeenNthCalledWith(2, 'file/path');
    });

    it('should write new files', async () => {
      await synchronize.syncHighlights(exportJson.results);

      expect(writeSpy).toHaveBeenCalledTimes(3);
      expect(writeSpy.mock.calls[0][1]).toMatchFileSnapshot(`${snapshotBaseName}highlight 1.md`);
      expect(writeSpy.mock.calls[1][1]).toMatchFileSnapshot(`${snapshotBaseName}highlight 2.md`);
      expect(writeSpy.mock.calls[2][1]).toMatchFileSnapshot(`${snapshotBaseName}index.md`);
    });

    it.todo('should update existing files');

    it('should not create index file if path template is empty', async () => {
      resolveSpy.mockReset();
      resolveSpy
        .mockReturnValueOnce('')
        .mockReturnValueOnce('file/path/quotes/highlight1.md')
        .mockReturnValueOnce('highlight 1 file content')
        .mockReturnValueOnce('file/path/quotes/highlight2.md')
        .mockReturnValueOnce('highlight 2 file content')
        .mockReturnValueOnce('');
      existsSpy.mockResolvedValue(false);

      await synchronize.syncHighlights(exportJson.results);

      expect(writeSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Bugs', () => {
    it.todo('should add tests for bugs here');
  });
});

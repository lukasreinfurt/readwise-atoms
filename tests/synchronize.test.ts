import { MockInstance, afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from 'obsidian';
import * as exportJson from './__mocks__/export.json';
import { Templates } from 'src/features/templates';
import Synchronize from 'src/features/synchronize';
import { Settings } from 'src/features/settings';

describe('Synchronize', () => {
  const snapshotBaseDir = '__snapshots__';
  let snapshotBaseName: string;

  let app: App;
  let settings: Settings;
  let templates: Templates;
  let resolveSpy: MockInstance;
  let existsSpy: MockInstance;
  let mkdirSpy: MockInstance;
  let writeSpy: MockInstance;
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
      compile: vi.fn(),
    };
  });

  beforeEach(async (expect) => {
    vi.restoreAllMocks();
    resolveSpy = vi.spyOn(templates, 'resolve');
    existsSpy = vi.spyOn(app.vault.adapter, 'exists');
    mkdirSpy = vi.spyOn(app.vault.adapter, 'mkdir');
    writeSpy = vi.spyOn(app.vault.adapter, 'write');
    snapshotBaseName = `${snapshotBaseDir}/${expect.task.name} - `;

    resolveSpy
      .mockReturnValueOnce('file/path/book1/index.md')
      .mockReturnValueOnce('file/path/book1/quotes/highlight1.md')
      .mockReturnValueOnce('highlight 1 file content')
      .mockReturnValueOnce('file/path/book1/quotes/highlight2.md')
      .mockReturnValueOnce('highlight 2 file content')
      .mockReturnValueOnce('book 1 index file content')
      .mockReturnValueOnce('file/path/book2/index.md')
      .mockReturnValueOnce('file/path/book2/quotes/highlight3.md')
      .mockReturnValueOnce('highlight 3 file content')
      .mockReturnValueOnce('book 2 index file content');

    synchronize = new Synchronize(app, settings, templates);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should create folders if they do not exists', async () => {
    existsSpy
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    await synchronize.syncHighlights(exportJson.results);

    expect(resolveSpy).toHaveBeenCalledTimes(10);
    expect(existsSpy).toHaveBeenCalledTimes(5);
    expect(existsSpy).toHaveBeenNthCalledWith(1, 'file/path/book1/quotes/highlight1.md');
    expect(existsSpy).toHaveBeenNthCalledWith(2, 'file/path/book1/quotes/highlight2.md');
    expect(existsSpy).toHaveBeenNthCalledWith(3, 'file/path/book1/index.md');
    expect(existsSpy).toHaveBeenNthCalledWith(4, 'file/path/book2/quotes/highlight3.md');
    expect(existsSpy).toHaveBeenNthCalledWith(5, 'file/path/book2/index.md');
    expect(mkdirSpy).toHaveBeenCalledTimes(4);
    expect(mkdirSpy).toHaveBeenNthCalledWith(1, 'file/path/book1/quotes');
    expect(mkdirSpy).toHaveBeenNthCalledWith(2, 'file/path/book1');
    expect(mkdirSpy).toHaveBeenNthCalledWith(3, 'file/path/book2/quotes');
    expect(mkdirSpy).toHaveBeenNthCalledWith(4, 'file/path/book2');
  });

  it('should write new files', async () => {
    await synchronize.syncHighlights(exportJson.results);

    expect(writeSpy).toHaveBeenCalledTimes(5);
    expect(writeSpy.mock.calls[0][1]).toMatchFileSnapshot(`${snapshotBaseName}book1 - highlight 1.md`);
    expect(writeSpy.mock.calls[1][1]).toMatchFileSnapshot(`${snapshotBaseName}book1 - highlight 2.md`);
    expect(writeSpy.mock.calls[2][1]).toMatchFileSnapshot(`${snapshotBaseName}book1 - index.md`);
    expect(writeSpy.mock.calls[3][1]).toMatchFileSnapshot(`${snapshotBaseName}book2 - highlight 3.md`);
    expect(writeSpy.mock.calls[4][1]).toMatchFileSnapshot(`${snapshotBaseName}book2 - index.md`);
  });

  it('should update existing files', async () => {
    await synchronize.syncHighlights(exportJson.results);

    expect(writeSpy).toHaveBeenCalledTimes(5);
    expect(writeSpy.mock.calls[0][0]).toEqual('file/path/book1/quotes/highlight1.md');
    expect(writeSpy.mock.calls[0][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - highlight 1.md`);
    expect(writeSpy.mock.calls[1][0]).toEqual('file/path/book1/quotes/highlight2.md');
    expect(writeSpy.mock.calls[1][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - highlight 2.md`);
    expect(writeSpy.mock.calls[2][0]).toEqual('file/path/book1/index.md');
    expect(writeSpy.mock.calls[2][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - index.md`);
    expect(writeSpy.mock.calls[3][0]).toEqual('file/path/book2/quotes/highlight3.md');
    expect(writeSpy.mock.calls[3][1]).toMatchFileSnapshot(`${snapshotBaseName}book 2 - highlight 3.md`);
    expect(writeSpy.mock.calls[4][0]).toEqual('file/path/book2/index.md');
    expect(writeSpy.mock.calls[4][1]).toMatchFileSnapshot(`${snapshotBaseName}book 2 - index.md`);

    resolveSpy.mockReset();
    resolveSpy
      .mockReturnValueOnce('file/path/book1/index.md')
      .mockReturnValueOnce('file/path/book1/quotes/highlight1.md')
      .mockReturnValueOnce('updated highlight 1 file content')
      .mockReturnValueOnce('file/path/book1/quotes/highlight2.md')
      .mockReturnValueOnce('highlight 2 file content')
      .mockReturnValueOnce('updated book 1 index file content')
      .mockReturnValueOnce('file/path/book2/index.md')
      .mockReturnValueOnce('file/path/book2/quotes/highlight3.md')
      .mockReturnValueOnce('highlight 3 file content')
      .mockReturnValueOnce('book 2 index file content');
    existsSpy.mockResolvedValue(false);

    await synchronize.syncHighlights(exportJson.results);

    expect(writeSpy).toHaveBeenCalledTimes(10);
    expect(writeSpy.mock.calls[5][0]).toEqual('file/path/book1/quotes/highlight1.md');
    expect(writeSpy.mock.calls[5][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - updated highlight 1.md`);
    expect(writeSpy.mock.calls[6][0]).toEqual('file/path/book1/quotes/highlight2.md');
    expect(writeSpy.mock.calls[6][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - highlight 2.md`);
    expect(writeSpy.mock.calls[7][0]).toEqual('file/path/book1/index.md');
    expect(writeSpy.mock.calls[7][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - updated index.md`);
    expect(writeSpy.mock.calls[8][0]).toEqual('file/path/book2/quotes/highlight3.md');
    expect(writeSpy.mock.calls[8][1]).toMatchFileSnapshot(`${snapshotBaseName}book 2 - highlight 3.md`);
    expect(writeSpy.mock.calls[9][0]).toEqual('file/path/book2/index.md');
    expect(writeSpy.mock.calls[9][1]).toMatchFileSnapshot(`${snapshotBaseName}book 2 - index.md`);
  });

  it('should not create index file if path template is empty', async () => {
    resolveSpy.mockReset();
    resolveSpy
      .mockReturnValueOnce('')
      .mockReturnValueOnce('file/path/book1/quotes/highlight1.md')
      .mockReturnValueOnce('highlight 1 file content')
      .mockReturnValueOnce('file/path/book1/quotes/highlight2.md')
      .mockReturnValueOnce('highlight 2 file content')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('file/path/book2/quotes/highlight3.md')
      .mockReturnValueOnce('highlight 3 file content')
      .mockReturnValueOnce('');
    existsSpy.mockResolvedValue(false);

    await synchronize.syncHighlights(exportJson.results);

    expect(writeSpy).toHaveBeenCalledTimes(3);
  });
});

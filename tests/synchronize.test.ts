import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import * as exportJson from './__mocks__/export.json';
import Synchronize from 'src/features/synchronize';
import mockPlugin from './__mocks__/plugin';
import { TFile } from 'obsidian';

describe('Synchronize', () => {
  const snapshotBaseDir = '__snapshots__';
  let snapshotBaseName: string;

  let resolveSpy: MockInstance;
  let getFolderByPathSpy: MockInstance;
  let getFileByPathSpy: MockInstance;
  let createFolderSpy: MockInstance;
  let createSpy: MockInstance;
  let modifySpy: MockInstance;
  let synchronize: Synchronize;

  beforeEach(async (expect) => {
    vi.restoreAllMocks();
    resolveSpy = vi.spyOn(mockPlugin.templates, 'resolve');
    getFolderByPathSpy = vi.spyOn(mockPlugin.app.vault, 'getFolderByPath');
    getFileByPathSpy = vi.spyOn(mockPlugin.app.vault, 'getFileByPath');
    createFolderSpy = vi.spyOn(mockPlugin.app.vault, 'createFolder');
    createSpy = vi.spyOn(mockPlugin.app.vault, 'create');
    modifySpy = vi.spyOn(mockPlugin.app.vault, 'modify');
    snapshotBaseName = `${snapshotBaseDir}/${expect.task.name} - `;

    resolveSpy
      .mockReturnValueOnce('file/path/book1/quotes/highlight1.md')
      .mockReturnValueOnce('highlight 1 file content')
      .mockReturnValueOnce('file/path/book1/quotes/highlight2.md')
      .mockReturnValueOnce('highlight 2 file content')
      .mockReturnValueOnce('file/path/book1/index.md')
      .mockReturnValueOnce('book 1 index file content')
      .mockReturnValueOnce('file/path/book2/quotes/highlight3.md')
      .mockReturnValueOnce('highlight 3 file content')
      .mockReturnValueOnce('file/path/book2/index.md')
      .mockReturnValueOnce('book 2 index file content');

    synchronize = new Synchronize(mockPlugin);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should create folders if they do not exists', async () => {
    getFolderByPathSpy.mockReturnValueOnce(null).mockReturnValue({} as TFile);

    getFileByPathSpy
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValue({} as TFile);

    await synchronize.syncHighlights(exportJson.results);

    expect(resolveSpy).toHaveBeenCalledTimes(10);
    expect(getFolderByPathSpy).toHaveBeenCalledTimes(5);
    expect(getFolderByPathSpy).toHaveBeenNthCalledWith(1, 'file/path/book1/quotes');
    expect(getFolderByPathSpy).toHaveBeenNthCalledWith(2, 'file/path/book1/quotes');
    expect(getFolderByPathSpy).toHaveBeenNthCalledWith(3, 'file/path/book1');
    expect(getFolderByPathSpy).toHaveBeenNthCalledWith(4, 'file/path/book2/quotes');
    expect(getFolderByPathSpy).toHaveBeenNthCalledWith(5, 'file/path/book2');
    expect(getFileByPathSpy).toHaveBeenCalledTimes(5);
    expect(getFileByPathSpy).toHaveBeenNthCalledWith(1, 'file/path/book1/quotes/highlight1.md');
    expect(getFileByPathSpy).toHaveBeenNthCalledWith(2, 'file/path/book1/quotes/highlight2.md');
    expect(getFileByPathSpy).toHaveBeenNthCalledWith(3, 'file/path/book1/index.md');
    expect(getFileByPathSpy).toHaveBeenNthCalledWith(4, 'file/path/book2/quotes/highlight3.md');
    expect(getFileByPathSpy).toHaveBeenNthCalledWith(5, 'file/path/book2/index.md');
    expect(createFolderSpy).toHaveBeenCalledTimes(1);
    expect(createFolderSpy).toHaveBeenNthCalledWith(1, 'file/path/book1/quotes');
    expect(createSpy).toHaveBeenCalledTimes(3);
    expect(createSpy).toHaveBeenNthCalledWith(1, 'file/path/book1/quotes/highlight1.md', 'highlight 1 file content');
    expect(createSpy).toHaveBeenNthCalledWith(2, 'file/path/book1/quotes/highlight2.md', 'highlight 2 file content');
    expect(createSpy).toHaveBeenNthCalledWith(3, 'file/path/book1/index.md', 'book 1 index file content');
  });

  it('should write new files', async () => {
    getFileByPathSpy.mockReturnValue(null);

    await synchronize.syncHighlights(exportJson.results);

    expect(createSpy).toHaveBeenCalledTimes(5);
    expect(createSpy.mock.calls[0][1]).toMatchFileSnapshot(`${snapshotBaseName}book1 - highlight 1.md`);
    expect(createSpy.mock.calls[1][1]).toMatchFileSnapshot(`${snapshotBaseName}book1 - highlight 2.md`);
    expect(createSpy.mock.calls[2][1]).toMatchFileSnapshot(`${snapshotBaseName}book1 - index.md`);
    expect(createSpy.mock.calls[3][1]).toMatchFileSnapshot(`${snapshotBaseName}book2 - highlight 3.md`);
    expect(createSpy.mock.calls[4][1]).toMatchFileSnapshot(`${snapshotBaseName}book2 - index.md`);
  });

  it('should update existing files', async () => {
    getFileByPathSpy.mockReturnValue({} as TFile);

    await synchronize.syncHighlights(exportJson.results);

    expect(modifySpy).toHaveBeenCalledTimes(5);
    expect(modifySpy.mock.calls[0][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[0][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - highlight 1.md`);
    expect(modifySpy.mock.calls[1][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[1][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - highlight 2.md`);
    expect(modifySpy.mock.calls[2][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[2][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - index.md`);
    expect(modifySpy.mock.calls[3][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[3][1]).toMatchFileSnapshot(`${snapshotBaseName}book 2 - highlight 3.md`);
    expect(modifySpy.mock.calls[4][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[4][1]).toMatchFileSnapshot(`${snapshotBaseName}book 2 - index.md`);

    resolveSpy.mockReset();
    resolveSpy
      .mockReturnValueOnce('file/path/book1/quotes/highlight1.md')
      .mockReturnValueOnce('updated highlight 1 file content')
      .mockReturnValueOnce('file/path/book1/quotes/highlight2.md')
      .mockReturnValueOnce('highlight 2 file content')
      .mockReturnValueOnce('file/path/book1/index.md')
      .mockReturnValueOnce('updated book 1 index file content')
      .mockReturnValueOnce('file/path/book2/quotes/highlight3.md')
      .mockReturnValueOnce('highlight 3 file content')
      .mockReturnValueOnce('file/path/book2/index.md')
      .mockReturnValueOnce('book 2 index file content');

    await synchronize.syncHighlights(exportJson.results);

    expect(modifySpy).toHaveBeenCalledTimes(10);
    expect(modifySpy.mock.calls[5][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[5][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - updated highlight 1.md`);
    expect(modifySpy.mock.calls[6][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[6][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - highlight 2.md`);
    expect(modifySpy.mock.calls[7][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[7][1]).toMatchFileSnapshot(`${snapshotBaseName}book 1 - updated index.md`);
    expect(modifySpy.mock.calls[8][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[8][1]).toMatchFileSnapshot(`${snapshotBaseName}book 2 - highlight 3.md`);
    expect(modifySpy.mock.calls[9][0]).toMatchObject({} as TFile);
    expect(modifySpy.mock.calls[9][1]).toMatchFileSnapshot(`${snapshotBaseName}book 2 - index.md`);
  });

  it('should not create index file if path template is empty', async () => {
    resolveSpy.mockReset();
    resolveSpy
      .mockReturnValueOnce('file/path/book1/quotes/highlight1.md')
      .mockReturnValueOnce('highlight 1 file content')
      .mockReturnValueOnce('file/path/book1/quotes/highlight2.md')
      .mockReturnValueOnce('highlight 2 file content')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('file/path/book2/quotes/highlight3.md')
      .mockReturnValueOnce('highlight 3 file content')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('');
    getFileByPathSpy.mockReturnValue(null);

    await synchronize.syncHighlights(exportJson.results);

    expect(createSpy).toHaveBeenCalledTimes(3);
  });
});

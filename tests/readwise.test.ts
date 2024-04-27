import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import response from './__mocks__/response.mock';
import responsePage1 from './__mocks__/response-page-1.mock';
import responsePage2 from './__mocks__/response-page-2.mock';
import * as exportJson from './__mocks__/export.json';
import Readwise from 'src/features/readwise';

global.fetch = vi.fn();

describe('Readwise', () => {
  let readwise: Readwise;
  let fetchSpy: MockInstance;

  beforeEach(async (expect) => {
    vi.restoreAllMocks();
    readwise = new Readwise('readwiseToken');
    fetchSpy = vi.spyOn(global, 'fetch');
    fetchSpy.mockResolvedValueOnce({ ok: true, status: 204 }); // token valid response
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should throw error on network error', async () => {
    fetchSpy.mockRejectedValue(new Error('NetworkError'));

    await expect(readwise.getHighlights()).rejects.toThrowError('NetworkError');
    expect(fetchSpy).toBeCalledTimes(2);
  });

  it('should throw error on client error', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'status text',
    });

    await expect(readwise.getHighlights()).rejects.toThrowError('404: status text');
    expect(fetchSpy).toBeCalledTimes(2);
  });

  it('should throw error on server error', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'status text',
    });

    await expect(readwise.getHighlights()).rejects.toThrowError('500: status text');
    expect(fetchSpy).toBeCalledTimes(2);
  });

  it('should throw error on invalid token', async () => {
    fetchSpy.mockReset();
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'status text',
    });

    await expect(readwise.getHighlights()).rejects.toThrowError('token seems to be invalid');
    expect(fetchSpy).toBeCalledTimes(1);
  });

  it('should load initial export', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => response,
    });

    const highlights = await readwise.getHighlights();

    expect(highlights).toEqual(exportJson.results);
    expect(fetchSpy).toBeCalledTimes(2);
  });

  it('should handle API rate limits', async () => {
    fetchSpy.mockReset();
    fetchSpy
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: vi.fn().mockReturnValue(1),
        },
      })
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: () => response,
      });

    const highlights = await readwise.getHighlights();

    expect(highlights).toEqual(exportJson.results);
    expect(fetchSpy).toBeCalledTimes(3);
  });

  it('should handle multi page responses', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => responsePage1,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => responsePage2,
      });

    const highlights = await readwise.getHighlights();

    expect(highlights).toEqual(exportJson.results);
    expect(fetchSpy).toBeCalledTimes(3);
  });

  it.todo('should load incremental exports');
});

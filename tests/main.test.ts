import { afterAll, beforeEach, describe, it, vi } from 'vitest';
import { App, PluginManifest } from 'obsidian';
import ReadwiseAtoms from '../src/main';

vi.mock('obsidian');

describe('Readwise Atoms', () => {
  let plugin: ReadwiseAtoms;

  beforeEach(async () => {
    vi.restoreAllMocks();
    plugin = new ReadwiseAtoms({} as App, {} as PluginManifest);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it.todo('add tests');
});

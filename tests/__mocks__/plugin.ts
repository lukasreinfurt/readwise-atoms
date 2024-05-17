import { vi } from 'vitest';
import ReadwiseAtoms from 'src/main';

export default {
  app: {
    vault: {
      getFolderByPath: vi.fn(),
      getFileByPath: vi.fn(),
      create: vi.fn(),
      createFolder: vi.fn(),
      modify: vi.fn(),
    },
  },
  settings: {
    readwiseToken: 'readwiseToken',
  },
  readwise: {
    getHighlights: vi.fn(),
  },
  synchronize: {
    syncHighlights: vi.fn(),
  },
  notifications: {
    log: vi.fn(),
    notice: vi.fn(),
    setStatusBarText: vi.fn(),
  },

  templates: {
    templates: [],
    resolve: vi.fn(),
    compile: vi.fn(),
  },
  saveSettings: vi.fn(),
} as unknown as ReadwiseAtoms;

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
  commands: {
    sync: vi.fn(),
    resync: vi.fn(),
  },
  notifications: {
    log: vi.fn(),
    notice: vi.fn(),
    setStatusBarText: vi.fn(),
  },
  readwise: {
    getHighlights: vi.fn(),
  },
  settings: {
    readwiseToken: 'readwiseToken',
    syncOnStart: false,
  },
  synchronize: {
    syncHighlights: vi.fn(),
  },
  templates: {
    templates: [],
    resolve: vi.fn(),
    compile: vi.fn(),
  },
  loadData: vi.fn(),
  loadSettings: vi.fn(),
  saveSettings: vi.fn(),
  addCommand: vi.fn(),
  addSettingTab: vi.fn(),
  addStatusBarItem: vi.fn(),
} as unknown as ReadwiseAtoms;

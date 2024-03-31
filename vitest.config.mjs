import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['**/*.md'],
  test: {
    alias: {
      obsidian: path.resolve(__dirname, 'tests/__mocks__/obsidian.ts'),
    },
  },
});

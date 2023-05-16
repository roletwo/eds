import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 1000 * 60 * 3,
    hookTimeout: 1000 * 60 * 3,
  },
});

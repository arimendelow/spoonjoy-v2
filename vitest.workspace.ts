import { defineWorkspace } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'path';

export default defineWorkspace([
  // Main project tests (unit/integration)
  'vitest.config.ts',
  // Storybook component tests
  {
    extends: '.storybook/vite.config.ts',
    plugins: [
      storybookTest({
        configDir: path.join(__dirname, '.storybook'),
      }),
    ],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        instances: [{ browser: 'chromium' }],
      },
      setupFiles: ['.storybook/vitest.setup.ts'],
    },
  },
]);

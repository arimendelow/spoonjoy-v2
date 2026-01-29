import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../stories/Introduction.mdx",
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-onboarding",
    "@storybook/addon-themes",
    "@chromatic-com/storybook",
  ],
  framework: "@storybook/react-vite",
  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: path.resolve(__dirname, 'vite.config.ts'),
      },
    },
  },
};
export default config;
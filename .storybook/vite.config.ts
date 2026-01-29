import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Separate Vite config for Storybook that doesn't use React Router plugin
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../app/components"),
      "~": path.resolve(__dirname, "../app"),
    },
  },
});

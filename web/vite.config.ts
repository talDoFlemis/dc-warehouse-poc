import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteEnvs } from 'vite-envs';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss(), viteEnvs()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

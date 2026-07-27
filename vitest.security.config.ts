/**
 * Live-network security config. This suite authenticates against the DEPLOYED
 * Supabase instance with the anon key, so it is excluded from the hermetic
 * default run by vitest.config.ts. That exclude also applied to the dedicated
 * workflow, which inherited the default config — so the suite matched zero
 * files and exited 1 on every run since BD238. This config is what lets it
 * execute at all.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/security/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Live-network e2e suites are excluded from the default run. They POST to
    // the deployed production Edge Functions, so they are non-hermetic and fail
    // closed in any runner without egress. Run deliberately: `npm run test:e2e`.
    // src/test/security/** is live-network too: it authenticates against the
    // deployed Supabase instance with the anon key. It is fail-closed (BD238),
    // so it MUST NOT run in the hermetic default suite where no credentials
    // exist. It is executed by .github/workflows/security-tests.yml.
    exclude: [
      'node_modules/**',
      'dist/**',
      'src/test/mcp/**',
      'src/test/security/**',
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});

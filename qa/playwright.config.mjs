import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  workers: 2,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:8877', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop-light', use: { viewport: { width: 1280, height: 900 }, colorScheme: 'light' } },
    { name: 'mobile-dark-reduced', use: { viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce' } },
  ],
  webServer: {
    command: 'python3 -m http.server 8877 --bind 127.0.0.1 --directory dist',
    cwd: root,
    url: 'http://127.0.0.1:8877',
    reuseExistingServer: false,
  },
});

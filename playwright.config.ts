import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import { requiredEnvironment } from './scripts/required-environment.ts';

const LOCAL_ENVIRONMENT_FILE = '.env';
const PHONE = devices['Pixel 7'];

if (existsSync(LOCAL_ENVIRONMENT_FILE)) {
  process.loadEnvFile(LOCAL_ENVIRONMENT_FILE);
}

const baseURL = requiredEnvironment('E2E_BASE_URL');
const servesLocalSite = (process.env.E2E_SITE_DIR ?? '') !== '';
const runsInCi = process.env.CI === 'true';

export default defineConfig({
  forbidOnly: runsInCi,
  retries: 0,
  reporter: runsInCi ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'e2e',
      testDir: 'tests/e2e',
      use: { ...PHONE },
    },
    {
      name: 'smoke',
      testDir: 'tests/smoke',
      use: { ...PHONE },
    },
    {
      name: 'audit',
      testDir: 'tests/audit',
    },
  ],
  webServer: servesLocalSite
    ? {
        command: 'node scripts/serve-site.ts',
        url: baseURL,
        reuseExistingServer: !runsInCi,
      }
    : undefined,
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Only look at spec files — skip the reporters directory */
  testMatch: '**/*.spec.ts',
  /* Sequential inside each file but parallel across files */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 30_000,

  /* Reporters: HTML for interactive viewing + our custom Excel report */
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['./tests/reporters/excel-reporter.ts'],
  ],

  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off',
    /* Slightly slower actions so pages have time to react */
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  /* Run only on Chromium for speed — extend to Firefox/Safari as needed */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

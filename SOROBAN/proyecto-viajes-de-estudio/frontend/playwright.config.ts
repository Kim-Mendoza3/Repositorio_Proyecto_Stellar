import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium-local',
      use: {
        channel: 'chrome', // Usa Chrome instalado localmente
      },
    },
  ],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  testDir: 'tests/e2e',
});

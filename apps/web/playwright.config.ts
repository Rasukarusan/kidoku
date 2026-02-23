import { defineConfig, devices } from '@playwright/test'

const isSandbox = !!process.env.SANDBOX

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : isSandbox ? 1 : undefined,
  reporter: 'html',
  timeout: isSandbox ? 60000 : 30000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    ...(isSandbox
      ? {
          launchOptions: {
            executablePath:
              process.env.CHROMIUM_PATH ||
              '/root/.cache/ms-playwright/chromium-1155/chrome-linux/chrome',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-gpu',
              '--disable-dev-shm-usage',
              '--no-zygote',
            ],
          },
        }
      : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: 'pnpm start',
        port: 3000,
        reuseExistingServer: false,
      }
    : undefined,
})

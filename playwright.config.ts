import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: './tests/browser', timeout: 30000, workers: 1, use: { baseURL: 'http://127.0.0.1:5173', channel: 'msedge', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' }, reporter: [['list']] })

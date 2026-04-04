#!/usr/bin/env node
/**
 * Screenshot helper — install Playwright locally, then capture key routes.
 *
 *   npm i -D @playwright/test
 *   npx playwright install chromium
 *
 * Example Playwright script (save as scripts/capture.spec.ts):
 *
 * import { test } from '@playwright/test';
 * test('capture', async ({ page }) => {
 *   await page.goto('http://localhost:3000');
 *   await page.screenshot({ path: 'shot-landing.png', fullPage: true });
 *   await page.goto('http://localhost:3000/app');
 *   await page.screenshot({ path: 'shot-app.png', fullPage: true });
 * });
 */
console.log(`Sora Calm screenshot script placeholder.
Run the dev server (npm run dev), install Playwright as above, then add routes you want to capture.
Suggested shots: / (landing), /app (home), /app/library, /app/play/<sessionId>, /admin/sessions.`);

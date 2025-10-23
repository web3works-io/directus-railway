import { test, expect } from '@playwright/test';

const RAILWAY_URL = 'https://directus-production-8279.up.railway.app';

test.describe('Directus Authentication Debug', () => {

  test('Debug login page structure', async ({ page }) => {
    await page.goto(`${RAILWAY_URL}/admin/login`);

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-login-page.png', fullPage: true });

    // Check page content
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());

    // Look for any error messages or form elements
    const allInputs = await page.locator('input').all();
    console.log(`Found ${allInputs.length} input elements`);

    for (const input of allInputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`Input - type: ${type}, name: ${name}, placeholder: ${placeholder}`);
    }

    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} button elements`);

    for (const button of allButtons) {
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      console.log(`Button - type: ${type}, text: ${text}`);
    }
  });

  test('Test multiple authentication methods', async ({ request }) => {
    // Test different authentication endpoints
    const endpoints = [
      '/auth/login',
      '/auth/refresh',
      '/auth/logout'
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${RAILWAY_URL}${endpoint}`);
      console.log(`${endpoint}: ${response.status()}`);
    }

    // Test with different content types
    const testPayloads = [
      { email: 'admin@example.com', password: 'd1r3ctu5' },
      { email: 'test@example.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'admin123' },
    ];

    for (const payload of testPayloads) {
      const response = await request.post(`${RAILWAY_URL}/auth/login`, {
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`Login attempt ${payload.email}: ${response.status()} - ${await response.text()}`);
    }
  });

  test('Check server configuration', async ({ request }) => {
    // Check various server endpoints
    const endpoints = [
      '/server/info',
      '/server/ping',
      '/server/specs/oas',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${RAILWAY_URL}${endpoint}`);
      console.log(`${endpoint}: ${response.status()}`);

      if (response.status() === 200) {
        const data = await response.json();
        console.log(`${endpoint} response keys:`, Object.keys(data));
      }
    }
  });
});
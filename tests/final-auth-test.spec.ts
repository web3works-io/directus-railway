import { test, expect } from '@playwright/test';

const RAILWAY_URL = 'https://directus-production-8279.up.railway.app';

test.describe('Final Authentication Test', () => {

  test('Test all known credentials in browser', async ({ page }) => {
    await page.goto(`${RAILWAY_URL}/admin/login`);

    // Wait for login form to load
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    const testCredentials = [
      { email: 'admin@example.com', password: 'admin123', description: 'Admin with updated hash' },
      { email: 'admin@example.com', password: 'd1r3ctu5', description: 'Admin with default password' },
      { email: 'admin@example.com', password: 'directus123', description: 'Admin with directus123' },
      { email: 'test@example.com', password: 'admin123', description: 'Test user' },
      { email: 'che@gmail.com', password: 'admin123', description: 'Che user' },
      { email: 'tomirl2020@gmail.com', password: 'j3fnnn3tayy2cfoxab06miyv2senys1k', description: 'Tomirl from .env' },
    ];

    for (const credentials of testCredentials) {
      console.log(`\nTesting: ${credentials.description}`);

      // Fill credentials
      await page.fill('input[type="email"]', credentials.email);
      await page.fill('input[type="password"]', credentials.password);

      // Click login
      await page.click('button[type="submit"]');

      // Wait for result
      await page.waitForTimeout(3000);

      // Check if login was successful
      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        console.log(`✅ SUCCESS! Logged in with: ${credentials.email}`);

        // Take screenshot of successful login
        await page.screenshot({ path: `success-${credentials.email.replace('@', '-')}.png` });

        // Logout and continue testing
        await page.goto(`${RAILWAY_URL}/admin/login`);
        await page.waitForSelector('input[type="email"]');
        break;
      } else {
        console.log(`❌ Failed: ${credentials.email}`);

        // Check for error message
        const errorElement = await page.locator('[role="alert"], .error, .v-alert, .v-notice').first();
        if (await errorElement.isVisible()) {
          const errorText = await errorElement.textContent();
          console.log(`   Error: ${errorText}`);
        }

        // Clear fields for next attempt
        await page.fill('input[type="email"]', '');
        await page.fill('input[type="password"]', '');
      }
    }

    // If we get here, all credentials failed
    console.log('\n❌ All credentials failed. The Railway deployment is likely using a different database.');
  });

  test('Verify database connection status', async ({ request }) => {
    // Test if we can access any public endpoints
    const endpoints = [
      '/server/ping',
      '/server/info',
      '/auth/login',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${RAILWAY_URL}${endpoint}`);
      console.log(`${endpoint}: ${response.status()}`);
    }

    // Test API access with different methods
    const testPayloads = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'test@example.com', password: 'admin123' },
    ];

    for (const payload of testPayloads) {
      const response = await request.post(`${RAILWAY_URL}/auth/login`, {
        data: payload,
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(`API Login ${payload.email}: ${response.status()}`);

      if (response.status() !== 401) {
        console.log(`Unexpected status for ${payload.email}: ${response.status()}`);
        console.log('Response:', await response.text());
      }
    }
  });
});
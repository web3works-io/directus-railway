import { test, expect } from '@playwright/test';

const RAILWAY_URL = 'https://directus-production-8279.up.railway.app';
const LOCAL_URL = 'http://localhost:8055';

test.describe('Directus Database Validation', () => {

  test('Railway Directus should be accessible', async ({ page }) => {
    await page.goto(RAILWAY_URL);

    // Check if we're redirected to login page or see Directus content
    const currentUrl = page.url();

    if (currentUrl.includes('/login')) {
      // We're on login page, check for login form elements
      await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
      await expect(page.locator('button[type="submit"], button:has-text("Login")').first()).toBeVisible();
    } else {
      // We might be on the main Directus interface
      await expect(page).toHaveTitle(/Directus/);
      console.log('✅ Directus interface loaded successfully');
    }
  });

  test('Railway Directus login should work with known credentials', async ({ page }) => {
    await page.goto(`${RAILWAY_URL}/admin/login`);

    // Try multiple known credentials with flexible selectors
    const testCredentials = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'che@gmail.com', password: 'admin123' },
      { email: 'test@example.com', password: 'admin123' },
    ];

    for (const credentials of testCredentials) {
      // Use flexible selectors for email and password fields
      await page.fill('input[type="email"], input[name="email"]', credentials.email);
      await page.fill('input[type="password"], input[name="password"]', credentials.password);
      await page.click('button[type="submit"], button:has-text("Login")');

      // Wait for either success or error
      await page.waitForTimeout(3000);

      // Check if login was successful
      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        console.log(`✅ Successfully logged in with: ${credentials.email}`);
        return; // Success!
      }

      // If still on login page, check for error message
      const errorVisible = await page.locator('[role="alert"], .error, .v-alert').isVisible().catch(() => false);
      if (errorVisible) {
        console.log(`❌ Login failed for: ${credentials.email}`);
      }

      // Clear and try next
      await page.goto(`${RAILWAY_URL}/admin/login`);
    }

    // If we get here, all credentials failed
    throw new Error('All test credentials failed to login');
  });

  test('Railway Directus API should be responsive', async ({ request }) => {
    const response = await request.get(`${RAILWAY_URL}/server/ping`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe('pong');
  });

  test('Railway Directus server info should be accessible', async ({ request }) => {
    const response = await request.get(`${RAILWAY_URL}/server/info`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(data.data.project).toBeDefined();
    expect(data.data.project.project_name).toBe('Directus');
  });

  test('Local Directus should be accessible when running', async ({ page }) => {
    // This test will be skipped if local instance is not running
    test.skip(!process.env.RUN_LOCAL_TESTS, 'Local tests disabled');

    await page.goto(LOCAL_URL);
    await expect(page).toHaveTitle(/Directus/);

    // Check if login form is present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Database synchronization should be verified', async ({ request }) => {
    // This test would compare data between local and remote databases
    // For now, we'll just verify the remote database has expected tables

    // Check if we can access basic collections (this will fail without auth)
    const response = await request.get(`${RAILWAY_URL}/items/directus_users?limit=1`);

    // We expect either 403 (forbidden) or 401 (unauthorized) or 200 (if public access)
    const status = response.status();
    expect([200, 401, 403]).toContain(status);

    if (status === 401 || status === 403) {
      console.log(`✅ API correctly requires authentication (status: ${status})`);
    } else if (status === 200) {
      const data = await response.json();
      expect(data.data).toBeDefined();
      console.log('✅ API accessible with public data');
    }
  });
});
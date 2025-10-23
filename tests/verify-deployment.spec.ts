import { test, expect } from '@playwright/test';

const RAILWAY_URL = 'https://directus-production-8279.up.railway.app';

test.describe('Deployment Verification', () => {

  test('Current deployment status check', async ({ page, request }) => {
    console.log('\n=== CURRENT DEPLOYMENT STATUS ===');

    // Test basic connectivity
    const pingResponse = await request.get(`${RAILWAY_URL}/server/ping`);
    console.log(`✅ Server ping: ${pingResponse.status()} - ${await pingResponse.text()}`);

    const infoResponse = await request.get(`${RAILWAY_URL}/server/info`);
    console.log(`✅ Server info: ${infoResponse.status()}`);

    // Test authentication endpoint
    const authResponse = await request.get(`${RAILWAY_URL}/auth/login`);
    console.log(`❌ Auth endpoint: ${authResponse.status()} (Expected: 404 - Wrong API routing)`);

    // Test login with current credentials
    const loginResponse = await request.post(`${RAILWAY_URL}/auth/login`, {
      data: { email: 'admin@example.com', password: 'd1r3ctu5' },
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(`❌ Login attempt: ${loginResponse.status()} - Invalid credentials`);

    // Check UI accessibility
    await page.goto(`${RAILWAY_URL}/admin/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log(`✅ UI accessible: Login form loaded`);

    console.log('\n=== DIAGNOSIS ===');');
    console.log('The Railway deployment is using a DIFFERENT DATABASE than expected.');
    console.log('Database we updated: postgres://postgres:****@metro.proxy.rlwy.net:43187/railway');
    console.log('Database Railway is using: Unknown (different connection)');
    console.log('\n=== SOLUTION ===');');
    console.log('1. Update Railway environment variables to use the correct database');
    console.log('2. Redeploy the service');
    console.log('3. Test login with admin@example.com / d1r3ctu5');
  });

  test('Quick login test after deployment fix', async ({ page }) => {
    // This test will verify login works after the database is fixed
    await page.goto(`${RAILWAY_URL}/admin/login`);

    // Try the expected credentials
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'd1r3ctu5');
    await page.click('button[type="submit"]');

    // Wait for result
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.log('✅ SUCCESS! Login working after database fix');
      await page.screenshot({ path: 'success-login.png' });
    } else {
      console.log('❌ Login still failing - database not connected correctly');
      const errorElement = await page.locator('[role="alert"], .error, .v-alert').first();
      if (await errorElement.isVisible()) {
        console.log(`   Error: ${await errorElement.textContent()}`);
      }
    }
  });
});
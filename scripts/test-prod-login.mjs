import puppeteer from 'puppeteer';

const BASE_URL = 'https://4tango.com';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  console.log('Testing production login page...');

  // Test 1: Login page loads
  const loginResponse = await page.goto(BASE_URL + '/login');
  console.log('Login page status:', loginResponse.status());

  await page.waitForSelector('input[type="email"]');
  await page.waitForSelector('input[type="password"]');
  console.log('✓ Login form elements present');

  // Test 2: Check that login form submits (with invalid creds - should show error, not crash)
  await page.type('input[type="email"]', 'invalid@test.com');
  await page.type('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 3000));

  const url = page.url();
  console.log('After invalid login attempt URL:', url);

  // Should stay on login page with error (not crash)
  if (url.includes('login')) {
    console.log('✓ Invalid login handled correctly (stayed on login page)');
  } else {
    console.log('✗ Unexpected redirect after invalid login');
  }

  // Test 3: Health endpoint
  const healthResponse = await page.goto(BASE_URL + '/api/health');
  console.log('Health endpoint status:', healthResponse.status());

  const healthText = await page.evaluate(() => document.body.innerText);
  const healthData = JSON.parse(healthText);
  console.log('Health data:', healthData);

  if (healthData.status === 'ok' && healthData.database === 'connected') {
    console.log('✓ Production health check passed');
  } else {
    console.log('✗ Production health check failed');
  }

  // Test 4: Protected endpoint returns 401
  const protectedResponse = await page.goto(BASE_URL + '/api/events');
  console.log('Protected API status (should be 401):', protectedResponse.status());

  if (protectedResponse.status() === 401) {
    console.log('✓ Protected API correctly returns 401');
  } else {
    console.log('✗ Protected API did not return 401');
  }

  console.log('\n=== Production checks complete ===');

  await browser.close();
}

main().catch(console.error);

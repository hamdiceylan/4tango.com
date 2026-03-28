import puppeteer from 'puppeteer';

const BASE_URL = 'https://dev.4tango.com';
const ORGANIZER = { email: 'test@4tango.com', password: 'TestPass123' };

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  console.log('Logging in...');
  await page.goto(BASE_URL + '/login');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', ORGANIZER.email);
  await page.type('input[type="password"]', ORGANIZER.password);
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 5000));

  console.log('After login URL:', page.url());

  // Check cookies
  const cookies = await page.cookies();
  console.log('\n=== COOKIES ===');
  for (const c of cookies) {
    console.log('Name:', c.name);
    console.log('  Domain:', c.domain);
    console.log('  Path:', c.path);
    console.log('  HttpOnly:', c.httpOnly);
    console.log('  Secure:', c.secure);
    console.log('  SameSite:', c.sameSite);
    console.log('');
  }

  // Try a direct fetch with credentials
  console.log('=== Testing fetch with credentials ===');
  const result = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/events', { credentials: 'include' });
      return { status: res.status, ok: res.ok };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('Fetch /api/events result:', result);

  // Also try profile endpoint
  const profileResult = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/auth/profile', { credentials: 'include' });
      const data = await res.json();
      return { status: res.status, data };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('Fetch /api/auth/profile result:', profileResult);

  await browser.close();
}

main().catch(console.error);

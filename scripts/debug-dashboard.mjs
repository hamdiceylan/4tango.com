import puppeteer from 'puppeteer';

const BASE_URL = 'https://dev.4tango.com';
const ORGANIZER = { email: 'test@4tango.com', password: 'TestPass123' };

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
  
  // Capture response errors
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('HTTP ERROR:', response.status(), response.url());
    }
  });

  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', ORGANIZER.email);
  await page.type('input[type="password"]', ORGANIZER.password);
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 5000));
  console.log('After login URL:', page.url());
  
  console.log('\nGoing to dashboard...');
  await page.goto(`${BASE_URL}/dashboard`);
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Dashboard URL:', page.url());
  
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log('\n=== PAGE CONTENT ===\n', bodyText);
  
  await browser.close();
}

main().catch(console.error);

import puppeteer from 'puppeteer';

const BASE_URL = 'https://dev.4tango.com';
const ORGANIZER = { email: 'test@4tango.com', password: 'TestPass123' };

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Capture Set-Cookie headers from responses
  page.on('response', async response => {
    const headers = response.headers();
    const setCookie = headers['set-cookie'];
    if (setCookie) {
      console.log('Set-Cookie from', response.url());
      console.log(setCookie);
      console.log('');
    }
  });

  console.log('Going to login page...');
  await page.goto(BASE_URL + '/login');
  await page.waitForSelector('input[type="email"]');

  console.log('Filling credentials and clicking submit...');
  await page.type('input[type="email"]', ORGANIZER.email);
  await page.type('input[type="password"]', ORGANIZER.password);

  // Click submit and wait for response
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 5000));

  console.log('\nFinal URL:', page.url());

  // Check cookies
  const cookies = await page.cookies();
  console.log('\n=== BROWSER COOKIES ===');
  for (const c of cookies) {
    console.log('Name:', c.name, '| Domain:', c.domain, '| Path:', c.path, '| Secure:', c.secure);
  }

  await browser.close();
}

main().catch(console.error);

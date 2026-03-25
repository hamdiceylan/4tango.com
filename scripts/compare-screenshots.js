const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshots() {
  const screenshotsDir = path.join(__dirname, '../screenshots');

  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // Screenshot 1: Original website
    console.log('Taking screenshot of original website...');
    await page.goto('https://inviernotangomarathon.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await delay(2000); // Wait for animations
    await page.screenshot({
      path: path.join(screenshotsDir, '1-original-hero.png'),
      fullPage: false
    });

    // Scroll down and take more screenshots of original
    await page.evaluate(() => window.scrollTo(0, 800));
    await delay(500);
    await page.screenshot({
      path: path.join(screenshotsDir, '2-original-program.png'),
      fullPage: false
    });

    await page.evaluate(() => window.scrollTo(0, 1600));
    await delay(500);
    await page.screenshot({
      path: path.join(screenshotsDir, '3-original-accommodation.png'),
      fullPage: false
    });

    await page.evaluate(() => window.scrollTo(0, 2400));
    await delay(500);
    await page.screenshot({
      path: path.join(screenshotsDir, '4-original-djs.png'),
      fullPage: false
    });

    await page.evaluate(() => window.scrollTo(0, 3200));
    await delay(500);
    await page.screenshot({
      path: path.join(screenshotsDir, '5-original-prices.png'),
      fullPage: false
    });

    // Screenshot 2: Our local version
    console.log('Taking screenshot of local version...');
    await page.goto('http://localhost:3001/sol-de-invierno-2025', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await delay(2000); // Wait for animations
    await page.screenshot({
      path: path.join(screenshotsDir, '1-local-hero.png'),
      fullPage: false
    });

    // Scroll down and take more screenshots of local
    await page.evaluate(() => window.scrollTo(0, 800));
    await delay(500);
    await page.screenshot({
      path: path.join(screenshotsDir, '2-local-program.png'),
      fullPage: false
    });

    await page.evaluate(() => window.scrollTo(0, 1600));
    await delay(500);
    await page.screenshot({
      path: path.join(screenshotsDir, '3-local-accommodation.png'),
      fullPage: false
    });

    await page.evaluate(() => window.scrollTo(0, 2400));
    await delay(500);
    await page.screenshot({
      path: path.join(screenshotsDir, '4-local-djs.png'),
      fullPage: false
    });

    await page.evaluate(() => window.scrollTo(0, 3200));
    await delay(500);
    await page.screenshot({
      path: path.join(screenshotsDir, '5-local-prices.png'),
      fullPage: false
    });

    // Full page screenshots
    console.log('Taking full page screenshots...');
    await page.goto('https://inviernotangomarathon.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await delay(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, 'full-original.png'),
      fullPage: true
    });

    await page.goto('http://localhost:3001/sol-de-invierno-2025', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await delay(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, 'full-local.png'),
      fullPage: true
    });

    console.log('Screenshots saved to:', screenshotsDir);
    console.log('\nFiles created:');
    const files = fs.readdirSync(screenshotsDir);
    files.forEach(file => console.log('  -', file));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshots();

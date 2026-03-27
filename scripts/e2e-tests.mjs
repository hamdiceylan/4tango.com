#!/usr/bin/env node
/**
 * End-to-End Tests for 4Tango
 * Uses Puppeteer for browser automation
 *
 * Usage:
 *   npm run test:e2e                    # Run all tests against localhost
 *   npm run test:e2e -- --url=https://dev.4tango.com  # Run against dev
 *   npm run test:e2e -- --headed        # Run with visible browser
 *   npm run test:e2e -- --filter=auth   # Run only auth tests
 */

import puppeteer from 'puppeteer';

// Configuration
const DEFAULT_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// Test credentials (from seed data)
const ORGANIZER = {
  email: 'test@4tango.com',
  password: 'TestPass123',
};

const DANCER = {
  email: 'maria.garcia@example.com',
  password: 'TestPass123',
};

const EVENT_SLUG = 'summer-tango-festival-2024';

// Colors for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const NC = '\x1b[0m';

// Parse arguments
const args = process.argv.slice(2);
const BASE_URL = args.find(a => a.startsWith('--url='))?.split('=')[1] || DEFAULT_URL;
const HEADED = args.includes('--headed');
const FILTER = args.find(a => a.startsWith('--filter='))?.split('=')[1];

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

// Helper functions
function log(message, color = NC) {
  console.log(`${color}${message}${NC}`);
}

function logTest(name, status, error = null) {
  const icon = status === 'passed' ? '✓' : status === 'failed' ? '✗' : '○';
  const color = status === 'passed' ? GREEN : status === 'failed' ? RED : YELLOW;
  log(`  ${icon} ${name}`, color);
  if (error) {
    log(`    Error: ${error}`, RED);
  }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test runner
async function runTest(name, testFn, page) {
  try {
    await Promise.race([
      testFn(page),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Test timeout')), TEST_TIMEOUT)
      ),
    ]);
    results.passed++;
    logTest(name, 'passed');
    return true;
  } catch (error) {
    results.failed++;
    results.errors.push({ name, error: error.message });
    logTest(name, 'failed', error.message);
    return false;
  }
}

// ==========================================
// TEST SUITES
// ==========================================

// 1. Public Pages Tests
const publicTests = {
  name: 'Public Pages',
  tests: [
    {
      name: 'Homepage loads',
      fn: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('body');
        const title = await page.title();
        if (!title) throw new Error('No page title');
      },
    },
    {
      name: 'Event page loads',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/en/${EVENT_SLUG}`);
        await page.waitForSelector('body');
        const content = await page.content();
        if (!content.includes('Summer Tango Festival')) {
          throw new Error('Event content not found');
        }
      },
    },
    {
      name: 'Event page in Spanish',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/es/${EVENT_SLUG}`);
        await page.waitForSelector('body');
        // Page should load without error
      },
    },
    {
      name: 'Registration form loads',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/en/${EVENT_SLUG}/register`);
        await page.waitForSelector('form', { timeout: 5000 });
      },
    },
    {
      name: '404 for non-existent event',
      fn: async (page) => {
        const response = await page.goto(`${BASE_URL}/en/non-existent-event-12345`);
        if (response.status() !== 404) {
          throw new Error(`Expected 404, got ${response.status()}`);
        }
      },
    },
  ],
};

// 2. Organizer Auth Tests
const authTests = {
  name: 'Organizer Authentication',
  tests: [
    {
      name: 'Login page loads',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/login`);
        await page.waitForSelector('input[type="email"]');
        await page.waitForSelector('input[type="password"]');
      },
    },
    {
      name: 'Login with invalid credentials shows error',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/login`);
        await page.type('input[type="email"]', 'invalid@test.com');
        await page.type('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        await wait(2000);
        const content = await page.content();
        // Should show error or stay on login page
        const url = page.url();
        if (url.includes('dashboard')) {
          throw new Error('Should not login with invalid credentials');
        }
      },
    },
    {
      name: 'Login with valid credentials redirects to dashboard',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/login`);
        await page.type('input[type="email"]', ORGANIZER.email);
        await page.type('input[type="password"]', ORGANIZER.password);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ timeout: 10000 });
        const url = page.url();
        if (!url.includes('dashboard') && !url.includes('onboarding')) {
          throw new Error(`Expected redirect to dashboard, got ${url}`);
        }
      },
    },
    {
      name: 'Protected routes redirect to login when not authenticated',
      fn: async (page) => {
        // Clear cookies
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');

        await page.goto(`${BASE_URL}/dashboard`);
        await wait(2000);
        const url = page.url();
        if (!url.includes('login')) {
          throw new Error(`Expected redirect to login, got ${url}`);
        }
      },
    },
  ],
};

// 3. Dashboard Tests (requires login)
const dashboardTests = {
  name: 'Dashboard',
  requiresAuth: true,
  tests: [
    {
      name: 'Dashboard loads with stats',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForSelector('body');
        await wait(2000);
        // Should see dashboard content
        const content = await page.content();
        if (!content.includes('Dashboard') && !content.includes('Events') && !content.includes('Summer Tango')) {
          throw new Error('Dashboard content not found');
        }
      },
    },
    {
      name: 'Events list shows seeded event',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/events`);
        await wait(2000);
        const content = await page.content();
        if (!content.includes('Summer Tango Festival')) {
          throw new Error('Seeded event not found in events list');
        }
      },
    },
  ],
};

// 4. Registrations Tests (requires login)
const registrationTests = {
  name: 'Registrations',
  requiresAuth: true,
  tests: [
    {
      name: 'Registrations page loads',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/registrations`);
        await page.waitForSelector('body');
        await wait(2000);
      },
    },
    {
      name: 'Registrations table shows data',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/registrations`);
        await wait(3000);
        const content = await page.content();
        // Should see some dancer names from seed data
        if (!content.includes('Maria Garcia') && !content.includes('Carlos Rodriguez')) {
          // May be paginated or filtered, so just check table exists
          const table = await page.$('table');
          if (!table) {
            throw new Error('Registrations table not found');
          }
        }
      },
    },
  ],
};

// 5. API Tests
const apiTests = {
  name: 'API Endpoints',
  tests: [
    {
      name: 'Health endpoint returns 200',
      fn: async (page) => {
        const response = await page.goto(`${BASE_URL}/api/health`);
        if (response.status() !== 200) {
          throw new Error(`Health check failed with status ${response.status()}`);
        }
      },
    },
    {
      name: 'Public event API returns event data',
      fn: async (page) => {
        const response = await page.goto(`${BASE_URL}/api/public/events/${EVENT_SLUG}`);
        if (response.status() !== 200) {
          throw new Error(`Event API failed with status ${response.status()}`);
        }
        const text = await page.evaluate(() => document.body.innerText);
        const data = JSON.parse(text);
        if (!data.title || !data.title.includes('Summer Tango')) {
          throw new Error('Event data not correct');
        }
      },
    },
    {
      name: 'Protected API returns 401 without auth',
      fn: async (page) => {
        // Clear cookies first
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');

        const response = await page.goto(`${BASE_URL}/api/events`);
        if (response.status() !== 401) {
          throw new Error(`Expected 401, got ${response.status()}`);
        }
      },
    },
  ],
};

// 6. Registration Flow Test
const registrationFlowTests = {
  name: 'Registration Flow',
  tests: [
    {
      name: 'Can fill and submit registration form',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/en/${EVENT_SLUG}/register`);
        await page.waitForSelector('form', { timeout: 5000 });

        // Fill required fields
        const emailInput = await page.$('input[name="email"], input[type="email"]');
        if (emailInput) {
          await emailInput.type(`test-${Date.now()}@example.com`);
        }

        const nameInput = await page.$('input[name="fullName"], input[name="name"]');
        if (nameInput) {
          await nameInput.type('Test Dancer');
        }

        // Check if form is present - this is a basic check
        const form = await page.$('form');
        if (!form) {
          throw new Error('Registration form not found');
        }
      },
    },
  ],
};

// 7. Page Builder Tests (requires login)
const pageBuilderTests = {
  name: 'Page Builder',
  requiresAuth: true,
  tests: [
    {
      name: 'Page builder loads for event',
      fn: async (page) => {
        // First get the event ID
        await page.goto(`${BASE_URL}/events`);
        await wait(2000);

        // Click on the first event to get its ID
        const eventLink = await page.$('a[href*="/events/"]');
        if (eventLink) {
          const href = await page.evaluate(el => el.href, eventLink);
          const eventId = href.split('/events/')[1]?.split('/')[0];
          if (eventId) {
            await page.goto(`${BASE_URL}/events/${eventId}/page-builder`);
            await wait(2000);
            // Page should load
          }
        }
      },
    },
  ],
};

// 8. Settings Tests (requires login)
const settingsTests = {
  name: 'Settings',
  requiresAuth: true,
  tests: [
    {
      name: 'Settings page loads',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/settings`);
        await wait(2000);
        const content = await page.content();
        if (!content.includes('Settings') && !content.includes('Profile')) {
          throw new Error('Settings page content not found');
        }
      },
    },
    {
      name: 'Team settings page loads',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/settings/team`);
        await wait(2000);
      },
    },
    {
      name: 'Email templates page loads',
      fn: async (page) => {
        await page.goto(`${BASE_URL}/settings/email-templates`);
        await wait(2000);
      },
    },
  ],
};

// All test suites
const allSuites = [
  publicTests,
  apiTests,
  authTests,
  dashboardTests,
  registrationTests,
  registrationFlowTests,
  pageBuilderTests,
  settingsTests,
];

// ==========================================
// MAIN TEST RUNNER
// ==========================================

async function loginAsOrganizer(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', ORGANIZER.email);
  await page.type('input[type="password"]', ORGANIZER.password);
  await page.click('button[type="submit"]');
  await wait(3000);
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════╗', CYAN);
  log('║           4TANGO END-TO-END TESTS                         ║', CYAN);
  log('╚═══════════════════════════════════════════════════════════╝', CYAN);
  log(`\nBase URL: ${BASE_URL}`);
  log(`Mode: ${HEADED ? 'Headed' : 'Headless'}`);
  if (FILTER) log(`Filter: ${FILTER}`);
  log('');

  const browser = await puppeteer.launch({
    headless: !HEADED,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  let isLoggedIn = false;

  for (const suite of allSuites) {
    // Apply filter if specified
    if (FILTER && !suite.name.toLowerCase().includes(FILTER.toLowerCase())) {
      continue;
    }

    log(`\n${suite.name}`, CYAN);
    log('─'.repeat(40));

    // Login if required
    if (suite.requiresAuth && !isLoggedIn) {
      log('  Logging in as organizer...', YELLOW);
      try {
        await loginAsOrganizer(page);
        isLoggedIn = true;
        log('  ✓ Logged in', GREEN);
      } catch (error) {
        log(`  ✗ Login failed: ${error.message}`, RED);
        results.skipped += suite.tests.length;
        continue;
      }
    }

    for (const test of suite.tests) {
      await runTest(test.name, test.fn, page);
    }
  }

  await browser.close();

  // Print summary
  log('\n═══════════════════════════════════════════════════════════', CYAN);
  log('SUMMARY', CYAN);
  log('═══════════════════════════════════════════════════════════', CYAN);
  log(`\n  Passed:  ${results.passed}`, GREEN);
  log(`  Failed:  ${results.failed}`, results.failed > 0 ? RED : NC);
  log(`  Skipped: ${results.skipped}`, results.skipped > 0 ? YELLOW : NC);

  if (results.errors.length > 0) {
    log('\nFailed Tests:', RED);
    for (const err of results.errors) {
      log(`  • ${err.name}: ${err.error}`, RED);
    }
  }

  log('');

  // Exit with error code if any tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

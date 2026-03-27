#!/usr/bin/env node

/**
 * 4Tango Health Check Script
 * Run with: node scripts/check-health.mjs
 * Or: npm run check:health
 */

const SITES = [
  { name: 'Dev Homepage', url: 'https://dev.4tango.com' },
  { name: 'Dev API', url: 'https://dev.4tango.com/api/health' },
  { name: 'Prod Homepage', url: 'https://4tango.com' },
  { name: 'Prod API', url: 'https://4tango.com/api/health' },
];

async function checkUrl(name, url) {
  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    const duration = Date.now() - start;

    return {
      name,
      url,
      status: response.status,
      ok: response.ok,
      duration,
    };
  } catch (error) {
    return {
      name,
      url,
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║           4TANGO HEALTH CHECK                             ║');
  console.log(`║           ${new Date().toISOString()}              ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const results = await Promise.all(
    SITES.map(site => checkUrl(site.name, site.url))
  );

  let allOk = true;

  for (const result of results) {
    const icon = result.ok ? '✓' : '✗';
    const color = result.ok ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    if (result.ok) {
      console.log(`${color}${icon}${reset} ${result.name}: ${result.status} (${result.duration}ms)`);
    } else {
      console.log(`${color}${icon}${reset} ${result.name}: ${result.error || result.status}`);
      allOk = false;
    }
  }

  console.log('');

  if (allOk) {
    console.log('\x1b[32m✓ All systems operational\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\x1b[31m✗ Some systems are not responding\x1b[0m\n');
    process.exit(1);
  }
}

main().catch(console.error);

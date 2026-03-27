#!/usr/bin/env node
/**
 * Database Wipe Script
 * Removes all data from dev and/or prod databases
 * Usage:
 *   npm run db:wipe dev      # Wipe dev only
 *   npm run db:wipe prod     # Wipe prod only
 *   npm run db:wipe all      # Wipe both
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import readline from 'readline';

function getDbUrl(appId) {
  try {
    const result = execSync(
      `aws amplify get-app --app-id ${appId} --region eu-west-1 --query 'app.environmentVariables.DATABASE_URL' --output text`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return result.trim();
  } catch {
    return null;
  }
}

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

async function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function wipeDatabase(label, url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: []
  });

  try {
    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename
    `;

    console.log(`\n${YELLOW}Wiping ${label}...${NC}`);

    // Disable foreign key checks and truncate all tables
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    for (const t of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t.tablename}" CASCADE`);
      console.log(`  ${GREEN}✓${NC} Truncated ${t.tablename}`);
    }

    // Re-enable foreign key checks
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

    console.log(`${GREEN}✓ ${label} wiped successfully${NC}`);
  } catch (e) {
    console.log(`${RED}✗ Error wiping ${label}: ${e.message}${NC}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Main
const target = process.argv[2];

if (!target || !['dev', 'prod', 'all'].includes(target)) {
  console.log('Usage: node scripts/db-wipe.mjs [dev|prod|all]');
  process.exit(1);
}

// Get URLs from env or fetch from AWS
const devUrl = process.env.DEV_URL || getDbUrl('d35qopwzo3l31w');
const prodUrl = process.env.PROD_URL || getDbUrl('d3jwiy3qjkzx5q');

if ((target === 'dev' || target === 'all') && !devUrl) {
  console.log('Error: Could not get DEV database URL.');
  process.exit(1);
}
if ((target === 'prod' || target === 'all') && !prodUrl) {
  console.log('Error: Could not get PROD database URL.');
  process.exit(1);
}

console.log(`\n${RED}╔═══════════════════════════════════════════════════════════╗${NC}`);
console.log(`${RED}║            ⚠️  DATABASE WIPE WARNING ⚠️                     ║${NC}`);
console.log(`${RED}╚═══════════════════════════════════════════════════════════╝${NC}`);
console.log(`\nThis will ${RED}PERMANENTLY DELETE ALL DATA${NC} from:`);
if (target === 'dev' || target === 'all') console.log(`  - DEV database`);
if (target === 'prod' || target === 'all') console.log(`  - PROD database`);

const answer = await ask(`\nType "WIPE ${target.toUpperCase()}" to confirm: `);

if (answer !== `WIPE ${target.toUpperCase()}`) {
  console.log('\nAborted.');
  process.exit(0);
}

if (target === 'dev' || target === 'all') {
  await wipeDatabase('DEV DATABASE', devUrl);
}

if (target === 'prod' || target === 'all') {
  await wipeDatabase('PROD DATABASE', prodUrl);
}

console.log(`\n${GREEN}Done. Databases have been wiped.${NC}\n`);

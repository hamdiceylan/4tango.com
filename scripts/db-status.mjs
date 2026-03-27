#!/usr/bin/env node
/**
 * Database Status Script
 * Shows record counts for dev and prod databases
 * Usage: npm run db:status
 */
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

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

async function countRecords(label, url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: []
  });

  try {
    // Get list of tables first
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;

    console.log(`\n=== ${label} ===`);

    let total = 0;
    for (const t of tables) {
      if (t.tablename.startsWith('_')) continue; // Skip Prisma internal tables
      const countResult = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int as count FROM "${t.tablename}"`
      );
      const count = countResult[0].count;
      if (count > 0) {
        console.log(`${t.tablename.padEnd(20)} ${count}`);
        total += count;
      }
    }
    console.log(`---`);
    console.log(`Total records:       ${total}`);
  } catch (e) {
    console.log(`\n=== ${label} ===`);
    console.log(`Error: ${e.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Get URLs from env or fetch from AWS
const devUrl = process.env.DEV_URL || getDbUrl('d35qopwzo3l31w');
const prodUrl = process.env.PROD_URL || getDbUrl('d3jwiy3qjkzx5q');

if (!devUrl || !prodUrl) {
  console.log('Error: Could not get database URLs. Make sure AWS CLI is configured.');
  process.exit(1);
}

await countRecords('DEV DATABASE', devUrl);
await countRecords('PROD DATABASE', prodUrl);

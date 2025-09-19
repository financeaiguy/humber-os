#!/usr/bin/env node

/**
 * Database Migration Runner for Humber Operations
 * 
 * Usage:
 *   node scripts/migrate.js [environment] [--seed]
 * 
 * Examples:
 *   node scripts/migrate.js development
 *   node scripts/migrate.js staging --seed
 *   node scripts/migrate.js production
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ENVIRONMENTS = {
  development: 'humber-operations-db',
  staging: 'humber-operations-db-staging', 
  production: 'humber-operations-db'
};

const MIGRATION_ORDER = [
  '0001_initial_schema.sql',
  '0002_seed_data.sql'
];

function runCommand(command, description) {
  // SECURITY: console statement removedlog(`🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    // SECURITY: console statement removedlog(`✅ ${description} completed`);
    return output;
  } catch (error) {
    // SECURITY: console statement removederror(`❌ ${description} failed:`, error.message);
    if (error.stdout) // SECURITY: console statement removedlog('STDOUT:', error.stdout);
    if (error.stderr) // SECURITY: console statement removedlog('STDERR:', error.stderr);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  const shouldSeed = args.includes('--seed');
  
  if (!ENVIRONMENTS[environment]) {
    // SECURITY: console statement removederror(`❌ Invalid environment: ${environment}`);
    // SECURITY: console statement removederror(`Valid environments: ${Object.keys(ENVIRONMENTS).join(', ')}`);
    process.exit(1);
  }
  
  const databaseName = ENVIRONMENTS[environment];
  const isLocal = environment === 'development';
  const remoteFlag = isLocal ? '--local' : '--remote';
  
  // SECURITY: console statement removedlog(`🚀 Running migrations for ${environment} environment`);
  // SECURITY: console statement removedlog(`📊 Database: ${databaseName}`);
  // SECURITY: console statement removedlog(`🌍 Mode: ${isLocal ? 'local' : 'remote'}`);
  
  // Run schema migrations
  // SECURITY: console statement removedlog(`\n📋 Running schema migrations...`);
  
  // Always run initial schema
  const schemaFile = join(process.cwd(), 'migrations', '0001_initial_schema.sql');
  runCommand(
    `wrangler d1 execute ${databaseName} ${remoteFlag} --file=${schemaFile}`,
    'Creating database schema'
  );
  
  // Run seed data if requested or in development
  if (shouldSeed || environment === 'development') {
    // SECURITY: console statement removedlog(`\n🌱 Running seed data...`);
    const seedFile = join(process.cwd(), 'migrations', '0002_seed_data.sql');
    runCommand(
      `wrangler d1 execute ${databaseName} ${remoteFlag} --file=${seedFile}`,
      'Inserting seed data'
    );
  }
  
  // Verify migration success
  // SECURITY: console statement removedlog(`\n🔍 Verifying migration...`);
  runCommand(
    `wrangler d1 execute ${databaseName} ${remoteFlag} --command="SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%';"`,
    'Counting created tables'
  );
  
  // SECURITY: console statement removedlog(`\n🎉 Migration completed successfully for ${environment}!`);
  
  if (environment === 'development') {
    // SECURITY: console statement removedlog(`\n📖 Next steps:`);
    // SECURITY: console statement removedlog(`   • Start the development server: pnpm dev`);
    // SECURITY: console statement removedlog(`   • View API docs: http://localhost:8787/docs`);
    // SECURITY: console statement removedlog(`   • Test health endpoint: http://localhost:8787/health`);
  }
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  // SECURITY: console statement removederror('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  // SECURITY: console statement removederror('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();

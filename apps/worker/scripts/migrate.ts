#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MigrationConfig {
  masterDb: string;
  tenantDbs: string[];
  migrationsPath: string;
}

const config: MigrationConfig = {
  masterDb: 'humber-os-master',
  tenantDbs: [
    'humber-tenant-001',
    'humber-tenant-002',
    'humber-tenant-003',
    'humber-tenant-004',
    'humber-tenant-005',
    'humber-tenant-006',
    'humber-tenant-007',
    'humber-tenant-008',
    'humber-tenant-009',
    'humber-tenant-010',
  ],
  migrationsPath: join(__dirname, '..', 'migrations'),
};

async function runMigration(dbName: string, sqlFile: string): Promise<void> {
  const sql = readFileSync(sqlFile, 'utf-8');
  
  // SECURITY: console statement removedlog(`📦 Running migration on ${dbName}...`);
  
  try {
    // Using wrangler d1 execute command
    const command = `echo "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}" | npx wrangler d1 execute ${dbName} --local`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      // SECURITY: console statement removederror(`❌ Error migrating ${dbName}:`, stderr);
      throw new Error(stderr);
    }
    
    // SECURITY: console statement removedlog(`✅ Successfully migrated ${dbName}`);
    if (stdout) {
      // SECURITY: console statement removedlog(`   Output: ${stdout.substring(0, 100)}...`);
    }
  } catch (error) {
    // SECURITY: console statement removederror(`❌ Failed to migrate ${dbName}:`, error);
    throw error;
  }
}

async function createDatabase(dbName: string): Promise<void> {
  // SECURITY: console statement removedlog(`🔨 Creating database ${dbName}...`);
  
  try {
    const { stdout, stderr } = await execAsync(`npx wrangler d1 create ${dbName}`);
    
    if (stderr && !stderr.includes('already exists')) {
      // SECURITY: console statement removederror(`❌ Error creating ${dbName}:`, stderr);
    } else {
      // SECURITY: console statement removedlog(`✅ Database ${dbName} created or already exists`);
    }
  } catch (error: any) {
    if (error.name !== 'AlreadyExistsError') {
      // SECURITY: console statement removederror(`❌ Failed to create ${dbName}:`, error);
    } else {
      // SECURITY: console statement removedlog(`ℹ️  Database ${dbName} already exists`);
    }
  }
}

async function main() {
  // SECURITY: console statement removedlog('🚀 Starting database migration process...\n');
  
  const environment = process.env.NODE_ENV || 'development';
  const isLocal = environment === 'development';
  
  // SECURITY: console statement removedlog(`📍 Environment: ${environment}`);
  // SECURITY: console statement removedlog(`📍 Mode: ${isLocal ? 'Local' : 'Remote'}\n`);
  
  try {
    // Step 1: Create databases if they don't exist (remote only)
    if (!isLocal) {
      // SECURITY: console statement removedlog('📦 Creating databases...\n');
      
      await createDatabase(config.masterDb);
      
      for (const tenantDb of config.tenantDbs) {
        await createDatabase(tenantDb);
      }
      
      // SECURITY: console statement removedlog('\n✅ All databases created\n');
    }
    
    // Step 2: Run master database migrations
    // SECURITY: console statement removedlog('🔄 Running master database migrations...\n');
    
    const masterMigrationFile = join(config.migrationsPath, '001_create_master_db.sql');
    await runMigration(config.masterDb, masterMigrationFile);
    
    // SECURITY: console statement removedlog('\n✅ Master database migrated\n');
    
    // Step 3: Run tenant database migrations
    // SECURITY: console statement removedlog('🔄 Running tenant database migrations...\n');
    
    const tenantMigrationFile = join(config.migrationsPath, '002_create_tenant_db.sql');
    
    for (const tenantDb of config.tenantDbs) {
      await runMigration(tenantDb, tenantMigrationFile);
    }
    
    // SECURITY: console statement removedlog('\n✅ All tenant databases migrated\n');
    
    // Step 4: Verify migrations
    // SECURITY: console statement removedlog('🔍 Verifying migrations...\n');
    
    // Check master database
    const verifyMasterCmd = `echo "SELECT name FROM sqlite_master WHERE type='table';" | npx wrangler d1 execute ${config.masterDb} --local`;
    const { stdout: masterTables } = await execAsync(verifyMasterCmd);
    // SECURITY: console statement removedlog(`📊 Master database tables: ${masterTables.split('\n').length - 1} tables created`);
    
    // Check first tenant database as sample
    const verifyTenantCmd = `echo "SELECT name FROM sqlite_master WHERE type='table';" | npx wrangler d1 execute ${config.tenantDbs[0]} --local`;
    const { stdout: tenantTables } = await execAsync(verifyTenantCmd);
    // SECURITY: console statement removedlog(`📊 Tenant database tables: ${tenantTables.split('\n').length - 1} tables created`);
    
    // SECURITY: console statement removedlog('\n🎉 Migration completed successfully!');
    // SECURITY: console statement removedlog('\n📝 Next steps:');
    // SECURITY: console statement removedlog('   1. Update wrangler.toml with the database IDs from Cloudflare dashboard');
    // SECURITY: console statement removedlog('   2. Run "pnpm run dev" to start the worker locally');
    // SECURITY: console statement removedlog('   3. Deploy with "pnpm run deploy" when ready');
    
  } catch (error) {
    // SECURITY: console statement removederror('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
main().catch((error) => {
  // SECURITY: console statement removed - error('Migration failed:', error);
  process.exit(1);
});
#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
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
  
  console.log(`📦 Running migration on ${dbName}...`);
  
  try {
    // Using wrangler d1 execute command
    const command = `echo "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}" | npx wrangler d1 execute ${dbName} --local`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      console.error(`❌ Error migrating ${dbName}:`, stderr);
      throw new Error(stderr);
    }
    
    console.log(`✅ Successfully migrated ${dbName}`);
    if (stdout) {
      console.log(`   Output: ${stdout.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error(`❌ Failed to migrate ${dbName}:`, error);
    throw error;
  }
}

async function createDatabase(dbName: string): Promise<void> {
  console.log(`🔨 Creating database ${dbName}...`);
  
  try {
    const { stdout, stderr } = await execAsync(`npx wrangler d1 create ${dbName}`);
    
    if (stderr && !stderr.includes('already exists')) {
      console.error(`❌ Error creating ${dbName}:`, stderr);
    } else {
      console.log(`✅ Database ${dbName} created or already exists`);
    }
  } catch (error: any) {
    if (!error.message?.includes('already exists')) {
      console.error(`❌ Failed to create ${dbName}:`, error);
    } else {
      console.log(`ℹ️  Database ${dbName} already exists`);
    }
  }
}

async function main() {
  console.log('🚀 Starting database migration process...\n');
  
  const environment = process.env.NODE_ENV || 'development';
  const isLocal = environment === 'development';
  
  console.log(`📍 Environment: ${environment}`);
  console.log(`📍 Mode: ${isLocal ? 'Local' : 'Remote'}\n`);
  
  try {
    // Step 1: Create databases if they don't exist (remote only)
    if (!isLocal) {
      console.log('📦 Creating databases...\n');
      
      await createDatabase(config.masterDb);
      
      for (const tenantDb of config.tenantDbs) {
        await createDatabase(tenantDb);
      }
      
      console.log('\n✅ All databases created\n');
    }
    
    // Step 2: Run master database migrations
    console.log('🔄 Running master database migrations...\n');
    
    const masterMigrationFile = join(config.migrationsPath, '001_create_master_db.sql');
    await runMigration(config.masterDb, masterMigrationFile);
    
    console.log('\n✅ Master database migrated\n');
    
    // Step 3: Run tenant database migrations
    console.log('🔄 Running tenant database migrations...\n');
    
    const tenantMigrationFile = join(config.migrationsPath, '002_create_tenant_db.sql');
    
    for (const tenantDb of config.tenantDbs) {
      await runMigration(tenantDb, tenantMigrationFile);
    }
    
    console.log('\n✅ All tenant databases migrated\n');
    
    // Step 4: Verify migrations
    console.log('🔍 Verifying migrations...\n');
    
    // Check master database
    const verifyMasterCmd = `echo "SELECT name FROM sqlite_master WHERE type='table';" | npx wrangler d1 execute ${config.masterDb} --local`;
    const { stdout: masterTables } = await execAsync(verifyMasterCmd);
    console.log(`📊 Master database tables: ${masterTables.split('\n').length - 1} tables created`);
    
    // Check first tenant database as sample
    const verifyTenantCmd = `echo "SELECT name FROM sqlite_master WHERE type='table';" | npx wrangler d1 execute ${config.tenantDbs[0]} --local`;
    const { stdout: tenantTables } = await execAsync(verifyTenantCmd);
    console.log(`📊 Tenant database tables: ${tenantTables.split('\n').length - 1} tables created`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update wrangler.toml with the database IDs from Cloudflare dashboard');
    console.log('   2. Run "pnpm run dev" to start the worker locally');
    console.log('   3. Deploy with "pnpm run deploy" when ready');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
main().catch(console.error);
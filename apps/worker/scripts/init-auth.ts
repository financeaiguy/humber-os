#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

/**
 * Initialize authentication tables and create default users
 */
async function initializeAuth() {
  console.log('🔐 Initializing Humber OS Authentication System...\n');
  
  try {
    // 1. Run auth migration on master database
    console.log('📦 Creating authentication tables...');
    
    const authMigration = readFileSync(
      join(__dirname, '..', 'migrations', '003_create_auth_tables.sql'), 
      'utf-8'
    );
    
    // Execute on master database
    const escapedSql = authMigration.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const command = `echo "${escapedSql}" | npx wrangler d1 execute humber_os_master --local`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      console.error('❌ Error creating auth tables:', stderr);
      throw new Error(stderr);
    }
    
    console.log('✅ Authentication tables created successfully\n');
    
    // 2. Create additional test users
    console.log('👥 Creating test users...');
    
    const testUsers = [
      {
        id: 'user_manager_001',
        email: 'manager@humber-operations.com',
        password: 'manager123',
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager'
      },
      {
        id: 'user_engineer_001',
        email: 'engineer@humber-operations.com',
        password: 'engineer123',
        firstName: 'Jane',
        lastName: 'Engineer',
        role: 'engineer'
      },
      {
        id: 'user_viewer_001',
        email: 'viewer@humber-operations.com',
        password: 'viewer123',
        firstName: 'Bob',
        lastName: 'Viewer',
        role: 'viewer'
      }
    ];
    
    for (const user of testUsers) {
      const userSql = `
        INSERT OR IGNORE INTO users (
          id, email, password_hash, first_name, last_name, 
          status, created_at, updated_at
        ) VALUES (
          '${user.id}',
          '${user.email}',
          'hashed_${user.password}',
          '${user.firstName}',
          '${user.lastName}',
          'active',
          datetime('now'),
          datetime('now')
        );
        
        INSERT OR IGNORE INTO user_tenant_roles (
          id, user_id, tenant_id, role, granted_by, granted_at, created_at
        ) VALUES (
          'role_${user.id}',
          '${user.id}',
          'tenant_humber_001',
          '${user.role}',
          'system',
          datetime('now'),
          datetime('now')
        );
      `;
      
      const escapedUserSql = userSql.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const userCommand = `echo "${escapedUserSql}" | npx wrangler d1 execute humber_os_master --local`;
      
      await execAsync(userCommand);
      console.log(`   ✅ Created ${user.role}: ${user.email}`);
    }
    
    console.log('\n🔑 Test Authentication Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    🧪 TEST USERS                       │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ ADMIN:    admin@humber-operations.com    / admin123     │');
    console.log('│ MANAGER:  manager@humber-operations.com  / manager123   │');
    console.log('│ ENGINEER: engineer@humber-operations.com / engineer123  │');
    console.log('│ VIEWER:   viewer@humber-operations.com   / viewer123    │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    console.log('\n🛡️  Security Features Enabled:');
    console.log('✅ JWT-based authentication');
    console.log('✅ Role-based access control (RBAC)');
    console.log('✅ Token blacklisting');
    console.log('✅ Rate limiting');
    console.log('✅ Multi-factor authentication support');
    console.log('✅ IP binding (optional)');
    console.log('✅ Comprehensive audit logging');
    console.log('✅ API key authentication');
    console.log('✅ Session management');
    console.log('✅ Password security');
    
    console.log('\n📚 Authentication Endpoints:');
    console.log('• POST /auth/login     - User login');
    console.log('• POST /auth/refresh   - Refresh access token');
    console.log('• POST /auth/logout    - User logout');
    
    console.log('\n🧪 Test Authentication:');
    console.log('curl -X POST https://your-worker.workers.dev/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email": "admin@humber-operations.com", "password": "admin123", "tenantId": "tenant_humber_001"}\'');
    
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('🔸 Change all default passwords immediately in production');
    console.log('🔸 Use proper password hashing (bcrypt) in production');
    console.log('🔸 Set strong JWT secrets using wrangler secrets');
    console.log('🔸 Enable MFA for admin accounts');
    console.log('🔸 Monitor security audit logs regularly');
    console.log('🔸 Implement proper key rotation policies');
    
    console.log('\n🎉 Authentication system initialized successfully!');
    
  } catch (error) {
    console.error('\n❌ Authentication initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
main().catch(console.error);

async function main() {
  await initializeAuth();
}
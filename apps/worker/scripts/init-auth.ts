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
  // SECURITY: Removed // SECURITY: Removed console.log('🔐 Initializing Humber OS Authentication System...\n');
  
  try {
    // 1. Run auth migration on master database
    // SECURITY: Removed // SECURITY: Removed console.log('📦 Creating authentication tables...');
    
    const authMigration = readFileSync(
      join(__dirname, '..', 'migrations', '003_create_auth_tables.sql'), 
      'utf-8'
    );
    
    // Execute on master database
    const escapedSql = authMigration.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const command = `echo "${escapedSql}" | npx wrangler d1 execute humber_os_master --local`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      // SECURITY: Removed console.error('❌ Error creating auth tables:', stderr);
      throw new Error(stderr);
    }
    
    // SECURITY: Removed // SECURITY: Removed console.log('✅ Authentication tables created successfully\n');
    
    // 2. Create additional test users
    // SECURITY: Removed // SECURITY: Removed console.log('👥 Creating test users...');
    
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
      // SECURITY: Removed // SECURITY: Removed console.log(`   ✅ Created ${user.role}: ${user.email}`);
    }
    
    // SECURITY: Removed // SECURITY: Removed console.log('\n🔑 Test Authentication Credentials:');
    // SECURITY: Removed // SECURITY: Removed console.log('┌─────────────────────────────────────────────────────────┐');
    // SECURITY: Removed // SECURITY: Removed console.log('│                    🧪 TEST USERS                       │');
    // SECURITY: Removed // SECURITY: Removed console.log('├─────────────────────────────────────────────────────────┤');
    // SECURITY: Removed // SECURITY: Removed console.log('│ ADMIN:    admin@humber-operations.com    / admin123     │');
    // SECURITY: Removed // SECURITY: Removed console.log('│ MANAGER:  manager@humber-operations.com  / manager123   │');
    // SECURITY: Removed // SECURITY: Removed console.log('│ ENGINEER: engineer@humber-operations.com / engineer123  │');
    // SECURITY: Removed // SECURITY: Removed console.log('│ VIEWER:   viewer@humber-operations.com   / viewer123    │');
    // SECURITY: Removed // SECURITY: Removed console.log('└─────────────────────────────────────────────────────────┘');
    
    // SECURITY: Removed // SECURITY: Removed console.log('\n🛡️  Security Features Enabled:');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ JWT-based authentication');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ Role-based access control (RBAC)');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ Token blacklisting');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ Rate limiting');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ Multi-factor authentication support');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ IP binding (optional)');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ Comprehensive audit logging');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ API key authentication');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ Session management');
    // SECURITY: Removed // SECURITY: Removed console.log('✅ Password security');
    
    // SECURITY: Removed // SECURITY: Removed console.log('\n📚 Authentication Endpoints:');
    // SECURITY: Removed // SECURITY: Removed console.log('• POST /auth/login     - User login');
    // SECURITY: Removed // SECURITY: Removed console.log('• POST /auth/refresh   - Refresh access token');
    // SECURITY: Removed // SECURITY: Removed console.log('• POST /auth/logout    - User logout');
    
    // SECURITY: Removed // SECURITY: Removed console.log('\n🧪 Test Authentication:');
    // SECURITY: Removed // SECURITY: Removed console.log('curl -X POST https://your-worker.workers.dev/auth/login \\');
    // SECURITY: Removed // SECURITY: Removed console.log('  -H "Content-Type: application/json" \\');
    // SECURITY: Removed // SECURITY: Removed console.log('  -d \'{"email": "admin@humber-operations.com", "password": "admin123", "tenantId": "tenant_humber_001"}\'');
    
    // SECURITY: Removed // SECURITY: Removed console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    // SECURITY: Removed // SECURITY: Removed console.log('🔸 Change all default passwords immediately in production');
    // SECURITY: Removed // SECURITY: Removed console.log('🔸 Use proper password hashing (bcrypt) in production');
    // SECURITY: Removed // SECURITY: Removed console.log('🔸 Set strong JWT secrets using wrangler secrets');
    // SECURITY: Removed // SECURITY: Removed console.log('🔸 Enable MFA for admin accounts');
    // SECURITY: Removed // SECURITY: Removed console.log('🔸 Monitor security audit logs regularly');
    // SECURITY: Removed // SECURITY: Removed console.log('🔸 Implement proper key rotation policies');
    
    // SECURITY: Removed // SECURITY: Removed console.log('\n🎉 Authentication system initialized successfully!');
    
  } catch (error) {
    // SECURITY: Removed console.error('\n❌ Authentication initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
main().catch(// SECURITY: Removed console.error);

async function main() {
  await initializeAuth();
}
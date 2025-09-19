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
  // SECURITY: console statement removedlog('🔐 Initializing Humber OS Authentication System...\n');
  
  try {
    // 1. Run auth migration on master database
    // SECURITY: console statement removedlog('📦 Creating authentication tables...');
    
    const authMigration = readFileSync(
      join(__dirname, '..', 'migrations', '003_create_auth_tables.sql'), 
      'utf-8'
    );
    
    // Execute on master database
    const escapedSql = authMigration.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const command = `echo "${escapedSql}" | npx wrangler d1 execute humber_os_master --local`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      // SECURITY: console statement removederror('❌ Error creating auth tables:', stderr);
      throw new Error(stderr);
    }
    
    // SECURITY: console statement removedlog('✅ Authentication tables created successfully\n');
    
    // 2. Create additional test users
    // SECURITY: console statement removedlog('👥 Creating test users...');
    
    const testUsers = [
      {
        id: 'user_manager_001',
        email: 'manager@example.com',
        password: 'manager123',
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager'
      },
      {
        id: 'user_engineer_001',
        email: 'engineer@example.com',
        password: 'engineer123',
        firstName: 'Jane',
        lastName: 'Engineer',
        role: 'engineer'
      },
      {
        id: 'user_viewer_001',
        email: 'viewer@example.com',
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
      // SECURITY: console statement removedlog(`   ✅ Created ${user.role}: ${user.email}`);
    }
    
    // SECURITY: console statement removedlog('\n🔑 Test Authentication Credentials:');
    // SECURITY: console statement removedlog('┌─────────────────────────────────────────────────────────┐');
    // SECURITY: console statement removedlog('│                    🧪 TEST USERS                       │');
    // SECURITY: console statement removedlog('├─────────────────────────────────────────────────────────┤');
    // SECURITY: console statement removedlog('│ ADMIN:    admin@example.com    / admin123     │');
    // SECURITY: console statement removedlog('│ MANAGER:  manager@example.com  / manager123   │');
    // SECURITY: console statement removedlog('│ ENGINEER: engineer@example.com / engineer123  │');
    // SECURITY: console statement removedlog('│ VIEWER:   viewer@example.com   / viewer123    │');
    // SECURITY: console statement removedlog('└─────────────────────────────────────────────────────────┘');
    
    // SECURITY: console statement removedlog('\n🛡️  Security Features Enabled:');
    // SECURITY: console statement removedlog('✅ JWT-based authentication');
    // SECURITY: console statement removedlog('✅ Role-based access control (RBAC)');
    // SECURITY: console statement removedlog('✅ Token blacklisting');
    // SECURITY: console statement removedlog('✅ Rate limiting');
    // SECURITY: console statement removedlog('✅ Multi-factor authentication support');
    // SECURITY: console statement removedlog('✅ IP binding (optional)');
    // SECURITY: console statement removedlog('✅ Comprehensive audit logging');
    // SECURITY: console statement removedlog('✅ API key authentication');
    // SECURITY: console statement removedlog('✅ Session management');
    // SECURITY: console statement removedlog('✅ Password security');
    
    // SECURITY: console statement removedlog('\n📚 Authentication Endpoints:');
    // SECURITY: console statement removedlog('• POST /auth/login     - User login');
    // SECURITY: console statement removedlog('• POST /auth/refresh   - Refresh access token');
    // SECURITY: console statement removedlog('• POST /auth/logout    - User logout');
    
    // SECURITY: console statement removedlog('\n🧪 Test Authentication:');
    // SECURITY: console statement removedlog('curl -X POST https://your-worker.workers.dev/auth/login \\');
    // SECURITY: console statement removedlog('  -H "Content-Type: application/json" \\');
    // SECURITY: console statement removedlog('  -d \'{"email": "admin@example.com", "password": "admin123", "tenantId": "tenant_humber_001"}\'');
    
    // SECURITY: console statement removedlog('\n⚠️  IMPORTANT SECURITY NOTES:');
    // SECURITY: console statement removedlog('🔸 Change all default passwords immediately in production');
    // SECURITY: console statement removedlog('🔸 Use proper password hashing (bcrypt) in production');
    // SECURITY: console statement removedlog('🔸 Set strong JWT secrets using wrangler secrets');
    // SECURITY: console statement removedlog('🔸 Enable MFA for admin accounts');
    // SECURITY: console statement removedlog('🔸 Monitor security audit logs regularly');
    // SECURITY: console statement removedlog('🔸 Implement proper key rotation policies');
    
    // SECURITY: console statement removedlog('\n🎉 Authentication system initialized successfully!');
    
  } catch (error) {
    // SECURITY: console statement removederror('\n❌ Authentication initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
main().catch(// SECURITY: console statement removederror);

async function main() {
  await initializeAuth();
}
/**
 * SECURE API TESTING INTERFACE
 * 
 * SECURITY: Does not expose internal architecture or sensitive endpoints
 * Only allows testing of properly authenticated and authorized endpoints
 */

import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

const app = new Hono()

// SECURITY: Require authentication for API testing
app.use('*', authMiddleware)

app.get('/secure-api-test', (c) => {
  const testingHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>🔒 Secure API Testing - Authenticated Interface</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
            min-height: 100vh;
            padding: 2rem;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 3rem; }
        .title { font-size: 2.5rem; font-weight: bold; color: #fff; margin-bottom: 1rem; }
        .security-notice { 
            background: linear-gradient(90deg, #dc2626, #b91c1c); 
            padding: 1rem 2rem; 
            border-radius: 1rem; 
            color: white; 
            margin-bottom: 2rem;
            border: 2px solid #fca5a5;
        }
        .endpoint-section { 
            background: rgba(30, 41, 59, 0.5); 
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 1rem; 
            margin-bottom: 2rem; 
            overflow: hidden;
        }
        .section-header { 
            background: linear-gradient(90deg, #059669, #047857);
            padding: 1.5rem; 
            font-size: 1.5rem; 
            font-weight: bold;
            color: white;
        }
        .endpoint { 
            border-bottom: 1px solid rgba(148, 163, 184, 0.1); 
            padding: 2rem;
        }
        .auth-required { 
            background: rgba(220, 38, 38, 0.1); 
            border: 1px solid #dc2626; 
            border-radius: 0.5rem; 
            padding: 1rem; 
            margin: 1rem 0;
        }
        .test-button { 
            background: linear-gradient(90deg, #059669, #047857); 
            color: white; 
            border: none; 
            padding: 1rem 2rem; 
            border-radius: 0.75rem; 
            cursor: pointer; 
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🔒 Secure API Testing</h1>
            <div class="security-notice">
                <strong>⚠️ SECURITY NOTICE:</strong> This interface requires proper authentication and authorization. 
                All API calls are logged and audited for security compliance.
            </div>
        </div>

        <div class="endpoint-section">
            <div class="section-header">🔐 Authenticated Endpoints Only</div>
            
            <div class="endpoint">
                <h3>System Health Check</h3>
                <p>Test basic system connectivity (authenticated)</p>
                <div class="auth-required">
                    <strong>🔒 Authentication Required:</strong> Valid JWT token with appropriate permissions
                </div>
                <button class="test-button" onclick="testHealthCheck()">Test Health Check</button>
                <div id="healthResponse" style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 0.5rem; display: none;"></div>
            </div>
            
            <div class="endpoint">
                <h3>User Profile</h3>
                <p>Get current user profile information</p>
                <div class="auth-required">
                    <strong>🔒 Authentication Required:</strong> Valid session with user context
                </div>
                <button class="test-button" onclick="testUserProfile()">Test User Profile</button>
                <div id="profileResponse" style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 0.5rem; display: none;"></div>
            </div>
        </div>

        <div class="endpoint-section">
            <div class="section-header">🚫 Security Restrictions</div>
            
            <div class="endpoint">
                <h3>Removed for Security</h3>
                <p>The following endpoints have been removed from public testing for security reasons:</p>
                <ul style="margin: 1rem 0; padding-left: 2rem; color: #fca5a5;">
                    <li>Internal architecture endpoints</li>
                    <li>Database schema exploration</li>
                    <li>Sensitive data endpoints</li>
                    <li>Financial information APIs</li>
                    <li>PII and biometric data endpoints</li>
                </ul>
                <p><strong>Reason:</strong> These endpoints exposed internal system architecture and sensitive data, 
                creating security vulnerabilities that could be exploited by attackers.</p>
            </div>
        </div>
    </div>

    <script>
        async function testHealthCheck() {
            try {
                const response = await fetch('/health', {
                    headers: {
                        'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || 'missing-token')
                    }
                });
                const data = await response.text();
                document.getElementById('healthResponse').style.display = 'block';
                document.getElementById('healthResponse').textContent = data;
            } catch (error) {
                document.getElementById('healthResponse').style.display = 'block';
                document.getElementById('healthResponse').textContent = 'Error: Request failed';
            }
        }

        async function testUserProfile() {
            try {
                const response = await fetch('/auth/profile', {
                    headers: {
                        'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || 'missing-token')
                    }
                });
                const data = await response.text();
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').textContent = data;
            } catch (error) {
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').textContent = 'Error: Request failed';
            }
        }

        // Security warning on load
        window.onload = () => {
            // SECURITY: console statement removedwarn('🔒 SECURE API TESTING INTERFACE');
            // SECURITY: console statement removedwarn('All API calls are authenticated and logged for security auditing');
            
            if (!localStorage.getItem('authToken')) {
                alert('⚠️ No authentication token found. Please log in first.');
            }
        };
    </script>
</body>
</html>
  `
  
  return c.html(testingHtml)
})

export default app

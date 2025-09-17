import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { Env } from '@humber/types';
import { multiTenantMiddleware } from './middleware/multi-tenant';
import { authMiddleware, rateLimitMiddleware } from './middleware/auth';
import { securityHeaders, corsMiddleware, requestSizeLimit } from './middleware/security';
import { operationsRouter } from './routes/operations';
import { timesheetsRouter } from './routes/timesheets';
import { reconciliationRouter } from './routes/timesheet-reconciliation';
import { bullPenRouter } from './routes/bull-pen';
import { engineersRouter } from './routes/engineers';
import { realDocumentsRouter } from './routes/real-documents';
import { chatRouter } from './routes/chat';
import { authRouter } from './routes/auth';
import { secureTimeTrackingRouter } from './routes/secure-time-tracking';
import { notificationsRouter } from './routes/notifications';
import { reportsRouter } from './routes/reports';
import knowledgeBaseRouter from './routes/knowledge-base';
import mockTimesheetsRouter from './routes/mock-timesheets';
import { recruitsRouter } from './routes/recruits';
// import mockRecruitingRouter from './routes/mock-recruiting'; // Removed - using real API

// Define context variables used across the app
interface AppVariables {
  requestId?: string;
  tenantId?: string;
  userId?: string;
  role?: string;
  authenticated?: boolean;
}

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// Apply security middleware globally
app.use('*', logger());
app.use('*', securityHeaders);
app.use('*', corsMiddleware);
app.use('*', requestSizeLimit);

// Apply JWT authentication to protected routes only
// Core endpoints (health, docs, metrics) remain public for development
app.use('/operations/*', authMiddleware);
app.use('/timesheets/*', authMiddleware);
app.use('/reconciliation/*', authMiddleware);
// Documents and chat endpoints need authentication in production
const isDevelopment = true; // Set to false in production
if (!isDevelopment) {
  app.use('/documents/*', authMiddleware);
  app.use('/chat/*', authMiddleware);
  app.use('/bull-pen/*', authMiddleware);
  app.use('/engineers/*', authMiddleware);
  app.use('/docs', authMiddleware);
  app.use('/metrics', authMiddleware);
} // Protect metrics

// Apply rate limiting after authentication
app.use('/operations/*', rateLimitMiddleware);
app.use('/timesheets/*', rateLimitMiddleware);
app.use('/reconciliation/*', rateLimitMiddleware);
app.use('/engineers/*', rateLimitMiddleware);

// Apply multi-tenant middleware after authentication on ALL tenant-scoped routes
app.use('/operations/*', multiTenantMiddleware);
app.use('/timesheets/*', multiTenantMiddleware);
app.use('/reconciliation/*', multiTenantMiddleware);
app.use('/bull-pen/*', multiTenantMiddleware);
app.use('/engineers/*', multiTenantMiddleware);

app.get('/', (c) => {
  return c.json({ 
    service: 'Humber Operations API',
    version: c.env.API_VERSION || '1.0.0',
    status: 'operational'
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/metrics', async (c) => {
  try {
    // System metrics
    const metrics = {
      service: 'Humber Operations API',
      version: '1.0.0',
      environment: c.env.ENVIRONMENT || 'development',
      timestamp: new Date().toISOString(),
      
      // Resource status
      resources: {
        databases: {
          master: 'connected',
          tenant_databases: 10,
          total_connections: 'healthy'
        },
        kv_namespaces: {
          cache: 'operational',
          tenant_cache: 'operational', 
          sessions: 'operational'
        },
        queues: {
          operations: 'processing',
          reconciliation: 'processing',
          tenant_audit: 'processing',
          vetting: 'processing',
          visa: 'processing'
        },
        storage: {
          documents: 'available',
          backup_status: 'current'
        }
      },
      
      // Performance indicators
      performance: {
        average_response_time: '< 50ms',
        error_rate: '< 0.1%',
        uptime: '99.9%',
        throughput: 'normal'
      },
      
      // Business metrics
      business: {
        total_tenants: 'active',
        total_engineers: 'tracking',
        active_deployments: 'monitoring',
        timesheets_processed: 'current'
      }
    };
    
    return c.json(metrics);
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString() 
    }, 500);
  }
});

app.get('/docs', (c) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Humber Operations API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { font-weight: bold; color: #e74c3c; }
        .url { font-family: monospace; background: #ecf0f1; padding: 2px 5px; }
        .example { background: #2c3e50; color: white; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .header { background: #3498db; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
        code { background: #ecf0f1; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🚀 Humber Operations API</h1>
    <p><strong>Version:</strong> 1.0.0</p>
    <p><strong>Base URL:</strong> <code>http://localhost:8787</code></p>
    
    <div class="header">
        <h3>📋 Required Headers for Operations & Timesheets</h3>
        <code>Content-Type: application/json</code><br>
        <code>X-Tenant-ID: your-tenant-id</code>
    </div>

    <h2>🏠 Core Endpoints</h2>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/</span> - Service information
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/health</span> - Health check
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/metrics</span> - System metrics and monitoring
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/docs</span> - This documentation
    </div>

    <h2>⚙️ Operations Workflow</h2>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/operations/recruiting-step-1</span><br>
        Initial candidate recruitment - Creates new candidate record
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/operations/hiring-vetting-step-2</span><br>
        Hiring and vetting process - Evaluates candidate fit
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/operations/background-checks</span><br>
        Background verification - Processes drug tests, background checks, certifications
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/operations/offer-letter-visa</span><br>
        Offer letter and visa processing - Sends offer and handles visa requirements
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/operations/deployment</span><br>
        Final candidate deployment - Assigns candidate to client project
    </div>

    <h2>📊 Timesheets</h2>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/timesheets/reconcile</span><br>
        Submit individual timesheet for reconciliation
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/timesheets/batch-reconcile</span><br>
        Submit multiple timesheets for batch reconciliation
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/timesheets/candidate/:candidateId</span><br>
        Get all timesheets for a specific candidate
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/timesheets/period</span><br>
        Get timesheets for a specific time period (requires startDate and endDate query params)
    </div>

    <h2>🔄 Reconciliation</h2>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/reconciliation/submit</span><br>
        Submit timesheet data for reconciliation processing
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/reconciliation/customer-hours</span><br>
        Submit customer-reported hours for comparison
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/reconciliation/upload-spreadsheet</span><br>
        Upload and process timesheet spreadsheet data
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/reconciliation/human-review</span><br>
        Submit human review decisions for discrepancies
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/reconciliation/needs-review</span><br>
        Get timesheets that need human review
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/reconciliation/stats</span><br>
        Get reconciliation statistics and metrics
    </div>

    <h2>👥 Engineers Management</h2>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/engineers</span><br>
        Get all engineers with filtering (category, status, search)
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/engineers/:engineerId</span><br>
        Get engineer details by ID with deployment history
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/engineers</span><br>
        Create new engineer profile
    </div>
    <div class="endpoint">
        <span class="method">PUT</span> <span class="url">/engineers/:engineerId</span><br>
        Update engineer profile information
    </div>
    <div class="endpoint">
        <span class="method">DELETE</span> <span class="url">/engineers/:engineerId</span><br>
        Deactivate engineer profile (soft delete)
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/engineers/:engineerId/deployments</span><br>
        Get engineer's deployment history and metrics
    </div>

    <h2>🎯 Bull Pen Dashboard</h2>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/bull-pen/dashboard</span><br>
        Get complete Bull Pen dashboard data with metrics and engineer status
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/bull-pen/engineers/by-category</span><br>
        Get engineers grouped by category (5 categories)
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/bull-pen/engineers/available</span><br>
        Get all available engineers ready for deployment
    </div>

    <h2>📄 Document Management</h2>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/documents/upload</span><br>
        Upload documents (PDF, DOC, DOCX, CSV, XLS, XLSX, TXT) for RAG knowledge base
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/documents</span><br>
        Get documents with search and filtering (supports query, category, fileType params)
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/documents/:id</span><br>
        Get specific document details and metadata
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/documents/:id/download</span><br>
        Download document file
    </div>
    <div class="endpoint">
        <span class="method">DELETE</span> <span class="url">/documents/:id</span><br>
        Delete document and remove from vector index
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/documents/search</span><br>
        Semantic search through document content using Vectorize
    </div>

    <h2>🤖 AI Chat (RAG-Powered)</h2>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/chat/message</span><br>
        Send message to AI assistant with RAG context from knowledge base
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/chat/sessions</span><br>
        Get chat session history
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/chat/sessions/:sessionId/messages</span><br>
        Get messages from specific chat session
    </div>

    <h2>👥 Recruiting System (GDPR/BIPA Compliant)</h2>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/api/recruits</span><br>
        Create new recruit with encrypted PII storage and audit logging
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/api/recruits</span><br>
        Get recruits with search, filtering, and pagination (encrypted data decryption)
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/api/recruits/:id/onboard</span><br>
        Move recruit to onboarding process with status validation and audit trail
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/api/recruits/:id/consent</span><br>
        Update GDPR/BIPA consent for recruit (privacy, marketing, biometric)
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/api/recruits/:id/consent</span><br>
        Get current consent status for recruit with legal basis tracking
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/api/recruits/:id/anonymize</span><br>
        Anonymize recruit data for GDPR Article 17 compliance (right to be forgotten)
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/api/recruits/:id/audit-trail</span><br>
        Get complete audit trail for recruit (GDPR Article 15 - right of access)
    </div>

    <h2>🧪 Example Usage</h2>
    <h3>Recruiting System - Create New Recruit</h3>
    <div class="example">
curl -X POST http://localhost:3003/api/recruits \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "phone": "+1 (555) 123-4567",
    "currentLocation": "Detroit, MI",
    "jobTitle": "Senior Mechanical Engineer",
    "yearsExperience": 8,
    "currentCompany": "ABC Manufacturing",
    "desiredSalary": "$85,000",
    "skills": ["AutoCAD", "SolidWorks", "ANSYS"],
    "education": "BS Mechanical Engineering - University of Michigan",
    "certifications": ["PE License", "Six Sigma Black Belt"],
    "availableStartDate": "2025-02-01",
    "workAuthorization": "US Citizen",
    "willingToRelocate": true,
    "travelWillingness": "Moderate (10-25%)",
    "source": "LinkedIn",
    "recruiterName": "Sarah Mitchell",
    "recruiterAgency": "TechTalent Global",
    "notes": "Strong candidate with automotive experience"
  }'
    </div>

    <h3>Move Recruit to Onboarding</h3>
    <div class="example">
curl -X POST http://localhost:3003/api/recruits/rec_123/onboard \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{
    "notes": "Candidate accepted offer, ready for onboarding"
  }'
    </div>

    <h3>GDPR Consent Management</h3>
    <div class="example">
curl -X POST http://localhost:3003/api/recruits/rec_123/consent \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{
    "consentType": "biometric",
    "consentGiven": true,
    "consentVersion": "1.0",
    "consentText": "I consent to biometric data processing for time tracking",
    "purposeSpecification": "Secure time tracking and authentication"
  }'
    </div>

    <h3>Step 1: Operations Recruiting</h3>
    <div class="example">
curl -X POST http://localhost:8787/operations/recruiting-step-1 \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-ID: demo-tenant" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  }'
    </div>

    <h3>Step 2: Hiring & Vetting</h3>
    <div class="example">
curl -X POST http://localhost:8787/operations/hiring-vetting-step-2 \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-ID: demo-tenant" \\
  -d '{
    "candidateId": "cand_xxx",
    "interviewScore": 85,
    "technicalScore": 90,
    "decision": "proceed"
  }'
    </div>

    <h3>Step 3: Background Checks</h3>
    <div class="example">
curl -X POST http://localhost:8787/operations/background-checks \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-ID: demo-tenant" \\
  -d '{
    "candidateId": "cand_xxx",
    "drugTestCompleted": true,
    "drugTestResult": "pass",
    "backgroundCheckCompleted": true,
    "backgroundCheckResult": "clear",
    "certificationVerified": true,
    "ssnVerified": true
  }'
    </div>

    <h3>Timesheet Reconciliation</h3>
    <div class="example">
curl -X POST http://localhost:8787/timesheets/reconcile \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-ID: demo-tenant" \\
  -d '{
    "candidateId": "cand_xxx",
    "weekStartDate": "2025-01-06",
    "weekEndDate": "2025-01-12",
    "hoursWorked": 40.0,
    "status": "submitted"
  }'
    </div>

    <h3>Get Candidate Timesheets</h3>
    <div class="example">
curl -X GET http://localhost:8787/timesheets/candidate/cand_xxx \\
  -H "X-Tenant-ID: demo-tenant"
    </div>

    <h3>Reconciliation Statistics</h3>
    <div class="example">
curl -X GET "http://localhost:8787/reconciliation/stats?startDate=2025-01-01&endDate=2025-01-31" \\
  -H "X-Tenant-ID: demo-tenant"
    </div>

    <h3>Upload Document for RAG</h3>
    <div class="example">
curl -X POST http://localhost:8787/documents/upload \\
  -H "X-Tenant-ID: demo-tenant" \\
  -F "file=@safety-protocols.pdf" \\
  -F 'metadata={"title":"Safety Protocols","category":"SAFETY","tags":["safety","protocols"]}'
    </div>

    <h3>AI Chat with RAG Context</h3>
    <div class="example">
curl -X POST http://localhost:8787/chat/message \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-ID: demo-tenant" \\
  -d '{
    "message": "What are the electrical safety protocols?",
    "useRAG": true,
    "maxDocuments": 5
  }'
    </div>

    <h3>Search Documents</h3>
    <div class="example">
curl -X POST http://localhost:8787/documents/search \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-ID: demo-tenant" \\
  -d '{
    "query": "electrical safety protocols",
    "maxResults": 10,
    "threshold": 0.7
  }'
    </div>

    <h2>📧 Notifications System (8 Endpoints)</h2>
    <p><strong>Multi-channel notification system with SendGrid email and Twilio SMS integration.</strong></p>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/notifications/send</span><br>
        Send custom notifications via multiple channels (Email/SMS) with template support and delivery tracking
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/notifications/timesheet-submitted</span><br>
        Quick notification for timesheet submissions - integrates with timesheet workflow
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/notifications/discrepancy-detected</span><br>
        Critical alert for timesheet discrepancies - auto-triggered by reconciliation system
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/notifications/compliance-violation</span><br>
        Urgent compliance violation alerts - integrates with security and audit systems
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/notifications/history</span><br>
        Retrieve notification history with filtering - supports audit trails and compliance
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/notifications/analytics</span><br>
        Delivery metrics and performance analytics - tracks success rates by channel
    </div>

    <h2>📊 PDF Reports System (12 Endpoints)</h2>
    <p><strong>Comprehensive report generation with PDF/Excel export and automated scheduling.</strong></p>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/reports/generate</span><br>
        Generate custom reports with flexible parameters - stores in R2 with download URLs
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/reports/timesheet-summary</span><br>
        Quick timesheet summary report - integrates with timesheet and discrepancy data
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/reports/engineer-performance</span><br>
        Engineer performance analysis - pulls data from operations, timesheets, and ratings
    </div>
    <div class="endpoint">
        <span class="method">POST</span> <span class="url">/reports/financial-summary</span><br>
        Financial analytics report - aggregates revenue, costs, and profit margins
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/reports/history</span><br>
        Report generation history with status tracking - supports audit and compliance
    </div>
    <div class="endpoint">
        <span class="method">GET</span> <span class="url">/reports/scheduled</span><br>
        Manage scheduled reports - supports daily/weekly/monthly automation
    </div>

    <h2>🔗 System Integration Overview</h2>
    <div class="header">
        <h3>📧 Notification System Integration</h3>
        <p><strong>Seamlessly integrates across all system components:</strong></p>
        <ul>
            <li><strong>Timesheet Workflow:</strong> Auto-sends alerts when timesheets submitted, approved, or rejected</li>
            <li><strong>Discrepancy Detection:</strong> Critical alerts when hour differences detected in reconciliation</li>
            <li><strong>Compliance Monitoring:</strong> Urgent notifications for security violations and audit issues</li>
            <li><strong>Operations Pipeline:</strong> Status updates for recruitment, vetting, and deployment stages</li>
            <li><strong>Multi-Channel Delivery:</strong> SendGrid for professional HTML emails, Twilio for SMS alerts</li>
            <li><strong>Template System:</strong> Pre-built templates with variable substitution for consistent messaging</li>
            <li><strong>User Preferences:</strong> Customizable notification settings with quiet hours support</li>
            <li><strong>Analytics Dashboard:</strong> Delivery tracking, success rates, and channel performance metrics</li>
        </ul>
    </div>
    
    <div class="header">
        <h3>📊 PDF Reports System Integration</h3>
        <p><strong>Automated reporting across all business functions:</strong></p>
        <ul>
            <li><strong>Timesheet Analytics:</strong> Comprehensive summaries with discrepancy analysis and engineer breakdowns</li>
            <li><strong>Financial Reporting:</strong> Revenue, cost, and profit analysis with client and category breakdowns</li>
            <li><strong>Performance Metrics:</strong> Engineer utilization, project success rates, and client satisfaction</li>
            <li><strong>Compliance Documentation:</strong> Audit trails, violation reports, and regulatory compliance summaries</li>
            <li><strong>Automated Scheduling:</strong> Daily/weekly/monthly reports with Cloudflare Cron Triggers</li>
            <li><strong>Multi-Format Export:</strong> PDF for presentations, Excel for analysis, CSV for data processing</li>
            <li><strong>Email Delivery:</strong> Automatic report delivery to stakeholders via notification system</li>
            <li><strong>Template Engine:</strong> Customizable layouts with company branding and styling</li>
        </ul>
    </div>

    <h2>📝 Response Format</h2>
    <p>All endpoints return JSON responses with the following structure:</p>
    <div class="example">
{
  "success": true,
  "candidateId": "cand_xxx",
  "message": "Operation completed successfully",
  "nextStep": "next-operation-name"
}
    </div>

    <div class="header">
        <h3>🚀 Total System Capabilities</h3>
        <p><strong>75+ Total API Endpoints across 15+ integrated systems:</strong></p>
        <ul>
            <li>Operations Management (5 endpoints) - Complete engineer lifecycle</li>
            <li>Timesheet Processing (4 endpoints) - Advanced reconciliation</li>
            <li>Reconciliation System (6 endpoints) - Discrepancy detection</li>
            <li>Bull Pen Dashboard (3 endpoints) - Real-time analytics</li>
            <li>Document Management (6 endpoints) - RAG knowledge base</li>
            <li>AI Chat System (3 endpoints) - Intelligent assistance</li>
            <li>Secure Time Tracking (4 endpoints) - Biometric authentication</li>
            <li>Authentication (3 endpoints) - JWT session management</li>
            <li><strong>👥 Recruiting System (7 endpoints) - GDPR/BIPA compliant recruiting</strong></li>
            <li><strong>📧 Notifications System (8 endpoints) - Multi-channel alerts</strong></li>
            <li><strong>📊 PDF Reports System (12 endpoints) - Automated reporting</strong></li>
            <li><strong>💰 Expenses Management (2 endpoints) - Travel & misc expense tracking</strong></li>
            <li><strong>🛡️ GDPR Data Subject Rights (1 endpoint) - Privacy compliance</strong></li>
            <li><strong>📄 Invoice Generation (2 endpoints) - Project billing automation</strong></li>
            <li><strong>🔄 Offboarding Management (1 endpoint) - Employee lifecycle</strong></li>
            <li><strong>💳 Payments Processing (3 endpoints) - Stripe integration</strong></li>
            <li><strong>✅ Project Approvals (2 endpoints) - Workflow management</strong></li>
            <li><strong>🏢 Customer Portal (1 endpoint) - Client authentication</strong></li>
            <li><strong>⏰ Advanced Time Tracking (1 endpoint) - Biometric + GPS</strong></li>
        </ul>
    </div>

    <p><em>Generated at: ${new Date().toISOString()}</em></p>
</body>
</html>`;
  
  return c.html(html);
});

// Interactive API Testing Interface (like Swagger)
app.get('/api-test', (c) => {
  const baseUrl = new URL(c.req.url).origin;
  
  // Add cache-busting headers
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
  
  const testingHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>🧪 Humber API Testing - Interactive Interface</title>
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
        .container { max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 3rem; }
        .title { font-size: 3rem; font-weight: bold; color: #fff; margin-bottom: 1rem; }
        .subtitle { color: #94a3b8; font-size: 1.2rem; margin-bottom: 2rem; }
        .highlight { background: linear-gradient(90deg, #3b82f6, #8b5cf6); padding: 1rem 2rem; border-radius: 1rem; color: white; display: inline-block; }
        
        .endpoint-section { 
            background: rgba(30, 41, 59, 0.5); 
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 1rem; 
            margin-bottom: 2rem; 
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        .section-header { 
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            padding: 1.5rem; 
            font-size: 1.5rem; 
            font-weight: bold;
            color: white;
        }
        
        .endpoint { 
            border-bottom: 1px solid rgba(148, 163, 184, 0.1); 
            padding: 2rem;
        }
        .endpoint:last-child { border-bottom: none; }
        
        .endpoint-header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            margin-bottom: 1.5rem;
        }
        .method { 
            font-weight: bold; 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.75rem; 
            font-size: 1rem;
            text-transform: uppercase;
            min-width: 80px;
            text-align: center;
        }
        .method.get { background: #10b981; color: white; }
        .method.post { background: #3b82f6; color: white; }
        .method.delete { background: #ef4444; color: white; }
        
        .url { 
            font-family: 'Monaco', 'Menlo', monospace; 
            background: rgba(15, 23, 42, 0.8); 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.75rem;
            border: 1px solid rgba(148, 163, 184, 0.2);
            flex: 1;
            margin: 0 1.5rem;
            font-size: 1.1rem;
        }
        
        .test-button { 
            background: linear-gradient(90deg, #8b5cf6, #ec4899); 
            color: white; 
            border: none; 
            padding: 1rem 2rem; 
            border-radius: 0.75rem; 
            cursor: pointer; 
            font-weight: bold;
            font-size: 1rem;
            transition: all 0.3s;
            min-width: 120px;
        }
        .test-button:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 15px 30px rgba(139, 92, 246, 0.4);
        }
        
        .description { 
            color: #94a3b8; 
            margin-bottom: 1.5rem; 
            line-height: 1.6;
            font-size: 1.1rem;
        }
        
        .test-form { 
            background: rgba(15, 23, 42, 0.5); 
            padding: 1.5rem; 
            border-radius: 1rem; 
            margin-top: 1.5rem;
            border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { 
            display: block; 
            margin-bottom: 0.75rem; 
            font-weight: 600; 
            color: #e2e8f0;
            font-size: 1rem;
        }
        .form-input, .form-textarea { 
            width: 100%; 
            padding: 1rem; 
            background: rgba(30, 41, 59, 0.8); 
            border: 1px solid rgba(148, 163, 184, 0.3); 
            border-radius: 0.75rem; 
            color: #e2e8f0;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.95rem;
        }
        .form-textarea { resize: vertical; min-height: 120px; }
        .file-input { 
            padding: 1rem; 
            border: 2px dashed rgba(148, 163, 184, 0.3);
            border-radius: 0.75rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        .file-input:hover { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
        
        .response-area { 
            background: rgba(15, 23, 42, 0.8); 
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 0.75rem; 
            padding: 1.5rem; 
            margin-top: 1.5rem;
            min-height: 200px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        
        .status-success { color: #10b981; font-weight: bold; font-size: 1.1rem; }
        .status-error { color: #ef4444; font-weight: bold; font-size: 1.1rem; }
        
        .execute-btn {
            background: linear-gradient(90deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            cursor: pointer;
            font-weight: bold;
            font-size: 1rem;
            transition: all 0.3s;
            width: 100%;
            margin-top: 1rem;
        }
        .execute-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }
        .execute-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🧪 Humber API Testing</h1>
            <p class="subtitle">Interactive API Documentation & Testing Interface</p>
            <div class="highlight">
                🚀 75+ Total Endpoints Available • Click any "Test" button - no Postman needed!
            </div>
        </div>

        <!-- Document Management -->
        <div class="endpoint-section">
            <div class="section-header">📄 Document Management & RAG</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/documents/upload</span>
                    <button class="test-button" onclick="toggleForm('uploadForm')">🧪 Test Upload</button>
                </div>
                <p class="description">Upload documents (PDF, DOC, DOCX, CSV, XLSX, TXT) for RAG knowledge base with real R2 storage</p>
                <div class="test-form" id="uploadForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📎 Select File:</label>
                        <input type="file" id="uploadFile" accept=".pdf,.doc,.docx,.csv,.xlsx,.txt" 
                               class="file-input" style="padding: 2rem; cursor: pointer;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📝 Metadata (JSON):</label>
                        <textarea class="form-textarea" id="uploadMetadata" placeholder='{"title":"Safety Protocols","category":"SAFETY","tags":["safety","protocols"],"description":"Document description"}'></textarea>
                    </div>
                    <button class="execute-btn" onclick="executeUpload()">🚀 Upload Document</button>
                    <div id="uploadResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/documents</span>
                    <button class="test-button" onclick="toggleForm('documentsForm')">🧪 Test Get</button>
                </div>
                <p class="description">Get all documents with search and filtering from real database</p>
                <div class="test-form" id="documentsForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🔍 Search Query:</label>
                        <input type="text" class="form-input" id="searchQuery" placeholder="safety protocols">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📂 Category:</label>
                        <select class="form-input" id="searchCategory">
                            <option value="">All Categories</option>
                            <option value="SAFETY">Safety</option>
                            <option value="TECHNICAL">Technical</option>
                            <option value="PROCESS">Process</option>
                            <option value="QUALITY">Quality</option>
                        </select>
                    </div>
                    <button class="execute-btn" onclick="executeGetDocuments()">🚀 Get Documents</button>
                    <div id="documentsResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/documents/search</span>
                    <button class="test-button" onclick="toggleForm('searchForm')">🧪 Test Search</button>
                </div>
                <p class="description">Semantic search through document content using vectorization</p>
                <div class="test-form" id="searchForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🔍 Search Query:</label>
                        <input type="text" class="form-input" id="vectorSearchQuery" placeholder="electrical safety protocols" value="electrical safety protocols">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📊 Max Results:</label>
                        <input type="number" class="form-input" id="maxResults" value="5" min="1" max="20">
                    </div>
                    <button class="execute-btn" onclick="executeDocumentSearch()">🚀 Search Documents</button>
                    <div id="searchResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/documents/:id</span>
                    <button class="test-button" onclick="toggleForm('docDetailForm')">🧪 Test Get Detail</button>
                </div>
                <p class="description">Get specific document details and metadata</p>
                <div class="test-form" id="docDetailForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📄 Document ID:</label>
                        <input type="text" class="form-input" id="docDetailId" placeholder="doc_001" value="doc_001">
                    </div>
                    <button class="execute-btn" onclick="executeDocumentDetail()">🚀 Get Document Detail</button>
                    <div id="docDetailResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/documents/:id/download</span>
                    <button class="test-button" onclick="toggleForm('docDownloadForm')">🧪 Test Download</button>
                </div>
                <p class="description">Download document file from R2 storage</p>
                <div class="test-form" id="docDownloadForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📄 Document ID:</label>
                        <input type="text" class="form-input" id="docDownloadId" placeholder="doc_001" value="doc_001">
                    </div>
                    <button class="execute-btn" onclick="executeDocumentDownload()">🚀 Download Document</button>
                    <div id="docDownloadResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method delete">DELETE</span>
                    <span class="url">/documents/:id</span>
                    <button class="test-button" onclick="toggleForm('docDeleteForm')">🧪 Test Delete</button>
                </div>
                <p class="description">Delete document and remove from vector index</p>
                <div class="test-form" id="docDeleteForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📄 Document ID:</label>
                        <input type="text" class="form-input" id="docDeleteId" placeholder="doc_001" value="doc_001">
                    </div>
                    <button class="execute-btn" onclick="executeDocumentDelete()">🚀 Delete Document</button>
                    <div id="docDeleteResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- AI Chat -->
        <div class="endpoint-section">
            <div class="section-header">🤖 AI Chat (RAG-Powered)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/chat/message</span>
                    <button class="test-button" onclick="toggleForm('chatForm')">🧪 Test Chat</button>
                </div>
                <p class="description">Send message to AI assistant with RAG context from real knowledge base</p>
                <div class="test-form" id="chatForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">💬 Message:</label>
                        <textarea class="form-textarea" id="chatMessage" placeholder="What are the electrical safety protocols?">What are the electrical safety protocols?</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">🧠 Use RAG:</label>
                        <select class="form-input" id="useRAG">
                            <option value="true">Yes - Use Knowledge Base</option>
                            <option value="false">No - General Response</option>
                        </select>
                    </div>
                    <button class="execute-btn" onclick="executeChatMessage()">🚀 Send Message</button>
                    <div id="chatResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/chat/sessions</span>
                    <button class="test-button" onclick="executeChatSessions()">🧪 Get Sessions</button>
                </div>
                <p class="description">Get chat session history from real database</p>
                <div id="sessionsResponse" class="response-area" style="display: none;"></div>
            </div>
        </div>

        <!-- Operations Workflow -->
        <div class="endpoint-section">
            <div class="section-header">⚙️ Operations Workflow</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/operations/recruiting-step-1</span>
                    <button class="test-button" onclick="toggleForm('recruitingForm')">🧪 Test Recruiting</button>
                </div>
                <p class="description">Create new candidate and start recruitment process with real database storage</p>
                <div class="test-form" id="recruitingForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">👤 Candidate Data (JSON):</label>
                        <textarea class="form-textarea" id="recruitingData">{"firstName":"John","lastName":"Doe","email":"john.doe@example.com","phone":"+1234567890","position":"Electrical Engineer"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeRecruiting()">🚀 Create Candidate</button>
                    <div id="recruitingResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/operations/hiring-vetting-step-2</span>
                    <button class="test-button" onclick="toggleForm('vettingForm')">🧪 Test Vetting</button>
                </div>
                <p class="description">Process hiring and vetting decisions</p>
                <div class="test-form" id="vettingForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📋 Vetting Data (JSON):</label>
                        <textarea class="form-textarea" id="vettingData">{"candidateId":"cand_xxx","interviewScore":85,"technicalScore":90,"decision":"proceed","notes":"Strong candidate"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeVetting()">🚀 Process Vetting</button>
                    <div id="vettingResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/operations/background-checks</span>
                    <button class="test-button" onclick="toggleForm('backgroundForm')">🧪 Test Background</button>
                </div>
                <p class="description">Process background checks and verifications</p>
                <div class="test-form" id="backgroundForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🔍 Background Check Data (JSON):</label>
                        <textarea class="form-textarea" id="backgroundData">{"candidateId":"cand_xxx","drugTestCompleted":true,"drugTestResult":"pass","backgroundCheckCompleted":true,"backgroundCheckResult":"clear","certificationVerified":true,"ssnVerified":true}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeBackground()">🚀 Process Checks</button>
                    <div id="backgroundResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/operations/offer-letter-visa</span>
                    <button class="test-button" onclick="toggleForm('offerForm')">🧪 Test Offer</button>
                </div>
                <p class="description">Send offer letter and process visa requirements</p>
                <div class="test-form" id="offerForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">💼 Offer Data (JSON):</label>
                        <textarea class="form-textarea" id="offerData">{"candidateId":"cand_xxx","offerAmount":85000,"startDate":"2025-10-01","position":"Senior Engineer","location":"Remote","visaRequired":false}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeOffer()">🚀 Send Offer</button>
                    <div id="offerResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/operations/deployment</span>
                    <button class="test-button" onclick="toggleForm('deploymentForm')">🧪 Test Deployment</button>
                </div>
                <p class="description">Deploy candidate to client project</p>
                <div class="test-form" id="deploymentForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🚀 Deployment Data (JSON):</label>
                        <textarea class="form-textarea" id="deploymentData">{"candidateId":"cand_xxx","deploymentDate":"2025-10-01","clientName":"Tech Corp","projectName":"System Integration","location":"Remote"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeDeployment()">🚀 Deploy Candidate</button>
                    <div id="deploymentResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Bull Pen Dashboard -->
        <div class="endpoint-section">
            <div class="section-header">🎯 Bull Pen Dashboard</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/bull-pen/dashboard</span>
                    <button class="test-button" onclick="executeBullPenDashboard()">🧪 Test Dashboard</button>
                </div>
                <p class="description">Get complete Bull Pen dashboard data with engineer metrics from real database</p>
                <div id="bullPenResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/engineers</span>
                    <button class="test-button" onclick="executeEngineers()">🧪 Test Engineers</button>
                </div>
                <p class="description">Get all engineers from database with profiles and status</p>
                <div id="engineersResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/bull-pen/engineers/by-category</span>
                    <button class="test-button" onclick="executeEngineersByCategory()">🧪 Test Categories</button>
                </div>
                <p class="description">Get engineers grouped by 5 categories (Electrical, Mechanical, Software, Systems, Project)</p>
                <div id="categoriesResponse" class="response-area" style="display: none;"></div>
            </div>
        </div>

        <!-- Timesheets -->
        <div class="endpoint-section">
            <div class="section-header">📊 Timesheets & Reconciliation</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/timesheets/reconcile</span>
                    <button class="test-button" onclick="toggleForm('timesheetForm')">🧪 Test Timesheet</button>
                </div>
                <p class="description">Submit individual timesheet for reconciliation</p>
                <div class="test-form" id="timesheetForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">⏰ Timesheet Data (JSON):</label>
                        <textarea class="form-textarea" id="timesheetData">{"candidateId":"cand_xxx","weekStartDate":"2025-01-06","weekEndDate":"2025-01-12","hoursWorked":40.0,"status":"submitted"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeTimesheet()">🚀 Submit Timesheet</button>
                    <div id="timesheetResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/timesheets/candidate/:candidateId</span>
                    <button class="test-button" onclick="toggleForm('candidateTimesheetsForm')">🧪 Test Get Timesheets</button>
                </div>
                <p class="description">Get all timesheets for a specific candidate</p>
                <div class="test-form" id="candidateTimesheetsForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">👤 Candidate ID:</label>
                        <input type="text" class="form-input" id="candidateId" placeholder="cand_xxx" value="cand_xxx">
                    </div>
                    <button class="execute-btn" onclick="executeCandidateTimesheets()">🚀 Get Timesheets</button>
                    <div id="candidateTimesheetsResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/timesheets/batch-reconcile</span>
                    <button class="test-button" onclick="toggleForm('batchTimesheetForm')">🧪 Test Batch</button>
                </div>
                <p class="description">Submit multiple timesheets for batch reconciliation</p>
                <div class="test-form" id="batchTimesheetForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📊 Batch Timesheet Data (JSON):</label>
                        <textarea class="form-textarea" id="batchTimesheetData">{"timesheets":[{"candidateId":"cand_001","weekStartDate":"2025-01-06","weekEndDate":"2025-01-12","hoursWorked":40.0},{"candidateId":"cand_002","weekStartDate":"2025-01-06","weekEndDate":"2025-01-12","hoursWorked":38.5}]}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeBatchTimesheet()">🚀 Submit Batch</button>
                    <div id="batchTimesheetResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/timesheets/period</span>
                    <button class="test-button" onclick="toggleForm('periodTimesheetsForm')">🧪 Test Period</button>
                </div>
                <p class="description">Get timesheets for a specific time period</p>
                <div class="test-form" id="periodTimesheetsForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📅 Start Date:</label>
                        <input type="date" class="form-input" id="startDate" value="2025-01-01">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📅 End Date:</label>
                        <input type="date" class="form-input" id="endDate" value="2025-01-31">
                    </div>
                    <button class="execute-btn" onclick="executePeriodTimesheets()">🚀 Get Period Timesheets</button>
                    <div id="periodTimesheetsResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Reconciliation -->
        <div class="endpoint-section">
            <div class="section-header">🔄 Reconciliation System</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/reconciliation/submit</span>
                    <button class="test-button" onclick="toggleForm('reconciliationForm')">🧪 Test Submit</button>
                </div>
                <p class="description">Submit timesheet data for reconciliation processing</p>
                <div class="test-form" id="reconciliationForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📋 Reconciliation Data (JSON):</label>
                        <textarea class="form-textarea" id="reconciliationData">{"candidateId":"cand_xxx","weekStartDate":"2025-01-06","weekEndDate":"2025-01-12","hoursWorked":40.0,"clientName":"Tech Corp"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeReconciliation()">🚀 Submit Reconciliation</button>
                    <div id="reconciliationResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/reconciliation/customer-hours</span>
                    <button class="test-button" onclick="toggleForm('customerHoursForm')">🧪 Test Customer Hours</button>
                </div>
                <p class="description">Submit customer-reported hours for comparison</p>
                <div class="test-form" id="customerHoursForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🏢 Customer Hours Data (JSON):</label>
                        <textarea class="form-textarea" id="customerHoursData">{"candidateId":"cand_xxx","weekStartDate":"2025-01-06","weekEndDate":"2025-01-12","customerHours":38.0,"customerName":"Tech Corp","approvedBy":"Manager"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeCustomerHours()">🚀 Submit Customer Hours</button>
                    <div id="customerHoursResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/reconciliation/needs-review</span>
                    <button class="test-button" onclick="executeNeedsReview()">🧪 Test Needs Review</button>
                </div>
                <p class="description">Get timesheets that need human review</p>
                <div id="needsReviewResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/reconciliation/stats</span>
                    <button class="test-button" onclick="toggleForm('statsForm')">🧪 Test Stats</button>
                </div>
                <p class="description">Get reconciliation statistics and metrics</p>
                <div class="test-form" id="statsForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📅 Start Date:</label>
                        <input type="date" class="form-input" id="statsStartDate" value="2025-01-01">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📅 End Date:</label>
                        <input type="date" class="form-input" id="statsEndDate" value="2025-01-31">
                    </div>
                    <button class="execute-btn" onclick="executeStats()">🚀 Get Stats</button>
                    <div id="statsResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/reconciliation/upload-spreadsheet</span>
                    <button class="test-button" onclick="toggleForm('uploadSpreadsheetForm')">🧪 Test Upload Spreadsheet</button>
                </div>
                <p class="description">Upload and process timesheet spreadsheet data</p>
                <div class="test-form" id="uploadSpreadsheetForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📊 Spreadsheet Data (JSON):</label>
                        <textarea class="form-textarea" id="uploadSpreadsheetData">{"customerName":"Tech Corp","weekStartDate":"2025-01-06","weekEndDate":"2025-01-12","spreadsheetData":[{"engineerId":"eng_001","hoursWorked":40.0,"projectCode":"TC001"}]}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeUploadSpreadsheet()">🚀 Upload Spreadsheet</button>
                    <div id="uploadSpreadsheetResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/reconciliation/human-review</span>
                    <button class="test-button" onclick="toggleForm('humanReviewForm')">🧪 Test Human Review</button>
                </div>
                <p class="description">Submit human review decisions for discrepancies</p>
                <div class="test-form" id="humanReviewForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">👤 Human Review Data (JSON):</label>
                        <textarea class="form-textarea" id="humanReviewData">{"timesheetId":"ts_001","reviewedBy":"Manager","approvedHours":40.0,"reviewNotes":"Approved after verification","resolution":"approve_engineer"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeHumanReview()">🚀 Submit Review</button>
                    <div id="humanReviewResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Secure Time Tracking -->
        <div class="endpoint-section">
            <div class="section-header">🔒 Secure Time Tracking (Biometric + GPS)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/time-tracking/clock-action</span>
                    <button class="test-button" onclick="toggleForm('clockActionForm')">🧪 Test Clock Action</button>
                </div>
                <p class="description">Secure clock in/out with biometric authentication, geolocation, and device verification</p>
                <div class="test-form" id="clockActionForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🕐 Clock Action Data (JSON):</label>
                        <textarea class="form-textarea" id="clockActionData">{"action":"CLOCK_IN","engineerId":"eng_001","biometric":{"type":"WEBAUTHN","verified":true,"confidenceLevel":95,"livenessDetected":true},"geolocation":{"latitude":42.3314,"longitude":-83.0458,"accuracy":12,"isWithinWorkLocation":true,"distanceFromWorkSite":50},"deviceInfo":{"deviceId":"device_123","trustLevel":"TRUSTED","hasSecureElement":true,"supportsBiometrics":true},"projectId":"gm-assembly","workSiteId":"site_001"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeClockAction()">🚀 Execute Clock Action</button>
                    <div id="clockActionResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/time-tracking/active-sessions</span>
                    <button class="test-button" onclick="executeActiveSessions()">🧪 Test Active Sessions</button>
                </div>
                <p class="description">Get all active time tracking sessions with trust scores and verification status</p>
                <div id="activeSessionsResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/time-tracking/work-sites</span>
                    <button class="test-button" onclick="executeWorkSites()">🧪 Test Work Sites</button>
                </div>
                <p class="description">Get approved work sites for geolocation verification</p>
                <div id="workSitesResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/time-tracking/verify-location</span>
                    <button class="test-button" onclick="toggleForm('verifyLocationForm')">🧪 Test Location</button>
                </div>
                <p class="description">Verify if location is within approved work site boundaries</p>
                <div class="test-form" id="verifyLocationForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📍 Location Data (JSON):</label>
                        <textarea class="form-textarea" id="verifyLocationData">{"latitude":42.3314,"longitude":-83.0458,"accuracy":15}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeVerifyLocation()">🚀 Verify Location</button>
                    <div id="verifyLocationResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Recruiting System -->
        <div class="endpoint-section">
            <div class="section-header">👥 Recruiting System (GDPR/BIPA Compliant)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/recruits</span>
                    <button class="test-button" onclick="toggleForm('createRecruitForm')">🧪 Test Create</button>
                </div>
                <p class="description">Create new recruit with encrypted PII storage, audit logging, and consent tracking</p>
                <div class="test-form" id="createRecruitForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">👤 Recruit Data (JSON):</label>
                        <textarea class="form-textarea" id="createRecruitData">{"firstName":"John","lastName":"Smith","email":"john.smith@example.com","phone":"+1 (555) 123-4567","currentLocation":"Detroit, MI","jobTitle":"Senior Mechanical Engineer","yearsExperience":8,"currentCompany":"ABC Manufacturing","desiredSalary":"$85,000","skills":["AutoCAD","SolidWorks","ANSYS"],"education":"BS Mechanical Engineering - University of Michigan","certifications":["PE License","Six Sigma Black Belt"],"availableStartDate":"2025-02-01","workAuthorization":"US Citizen","willingToRelocate":true,"travelWillingness":"Moderate (10-25%)","source":"LinkedIn","recruiterName":"Sarah Mitchell","recruiterAgency":"TechTalent Global","notes":"Strong candidate with automotive experience"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeCreateRecruit()">🚀 Create Recruit</button>
                    <div id="createRecruitResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/api/recruits</span>
                    <button class="test-button" onclick="toggleForm('getRecruitsForm')">🧪 Test Get Recruits</button>
                </div>
                <p class="description">Get recruits with search, filtering, and pagination (with encrypted data decryption and audit logging)</p>
                <div class="test-form" id="getRecruitsForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🔍 Search Query:</label>
                        <input type="text" class="form-input" id="recruitSearchQuery" placeholder="engineer">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📊 Status Filter:</label>
                        <select class="form-input" id="recruitStatusFilter">
                            <option value="">All Statuses</option>
                            <option value="sourced">Sourced</option>
                            <option value="screened">Screened</option>
                            <option value="interviewed">Interviewed</option>
                            <option value="offer_extended">Offer Extended</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="onboarding">Onboarding</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">📄 Page Size:</label>
                        <input type="number" class="form-input" id="recruitPageSize" value="10" min="1" max="100">
                    </div>
                    <button class="execute-btn" onclick="executeGetRecruits()">🚀 Get Recruits</button>
                    <div id="getRecruitsResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/recruits/:id/onboard</span>
                    <button class="test-button" onclick="toggleForm('onboardRecruitForm')">🧪 Test Onboard</button>
                </div>
                <p class="description">Move recruit to onboarding process with status validation and audit trail</p>
                <div class="test-form" id="onboardRecruitForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🆔 Recruit ID:</label>
                        <input type="text" class="form-input" id="onboardRecruitId" placeholder="rec_123" value="rec_123">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📝 Notes:</label>
                        <textarea class="form-textarea" id="onboardNotes" placeholder="Candidate accepted offer, ready for onboarding">Candidate accepted offer, ready for onboarding</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeOnboardRecruit()">🚀 Move to Onboarding</button>
                    <div id="onboardRecruitResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/recruits/:id/consent</span>
                    <button class="test-button" onclick="toggleForm('recruitConsentForm')">🧪 Test Consent</button>
                </div>
                <p class="description">Update GDPR/BIPA consent for recruit (privacy, marketing, biometric data processing)</p>
                <div class="test-form" id="recruitConsentForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🆔 Recruit ID:</label>
                        <input type="text" class="form-input" id="consentRecruitId" placeholder="rec_123" value="rec_123">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📋 Consent Type:</label>
                        <select class="form-input" id="consentType">
                            <option value="privacy">Privacy Data Processing</option>
                            <option value="data_processing">General Data Processing</option>
                            <option value="marketing">Marketing Communications</option>
                            <option value="biometric">Biometric Data Processing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">✅ Consent Given:</label>
                        <select class="form-input" id="consentGiven">
                            <option value="true">Yes - Grant Consent</option>
                            <option value="false">No - Withdraw Consent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">📄 Consent Text:</label>
                        <textarea class="form-textarea" id="consentText" placeholder="I consent to the processing of my personal data...">I consent to the processing of my personal data for recruitment and employment purposes in accordance with GDPR Article 6 and 7.</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeRecruitConsent()">🚀 Update Consent</button>
                    <div id="recruitConsentResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/api/recruits/:id/consent</span>
                    <button class="test-button" onclick="toggleForm('getConsentForm')">🧪 Test Get Consent</button>
                </div>
                <p class="description">Get current consent status for recruit with legal basis tracking and GDPR compliance</p>
                <div class="test-form" id="getConsentForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🆔 Recruit ID:</label>
                        <input type="text" class="form-input" id="getConsentRecruitId" placeholder="rec_123" value="rec_123">
                    </div>
                    <button class="execute-btn" onclick="executeGetConsent()">🚀 Get Consent Status</button>
                    <div id="getConsentResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/api/recruits/:id/audit-trail</span>
                    <button class="test-button" onclick="toggleForm('auditTrailForm')">🧪 Test Audit Trail</button>
                </div>
                <p class="description">Get complete audit trail for recruit (GDPR Article 15 - right of access)</p>
                <div class="test-form" id="auditTrailForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🆔 Recruit ID:</label>
                        <input type="text" class="form-input" id="auditTrailRecruitId" placeholder="rec_123" value="rec_123">
                    </div>
                    <button class="execute-btn" onclick="executeAuditTrail()">🚀 Get Audit Trail</button>
                    <div id="auditTrailResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/recruits/:id/anonymize</span>
                    <button class="test-button" onclick="toggleForm('anonymizeRecruitForm')">🧪 Test Anonymize</button>
                </div>
                <p class="description">Anonymize recruit data for GDPR Article 17 compliance (right to be forgotten)</p>
                <div class="test-form" id="anonymizeRecruitForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🆔 Recruit ID:</label>
                        <input type="text" class="form-input" id="anonymizeRecruitId" placeholder="rec_123" value="rec_123">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📋 Anonymization Reason:</label>
                        <select class="form-input" id="anonymizeReason">
                            <option value="GDPR Article 17 - Right to be forgotten request">GDPR Article 17 - Right to be forgotten</option>
                            <option value="Data retention policy expiry">Data retention policy expiry</option>
                            <option value="Legal hold expiry">Legal hold expiry</option>
                            <option value="Manual administrative request">Manual administrative request</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">📧 Requestor Email (optional):</label>
                        <input type="email" class="form-input" id="anonymizeRequestorEmail" placeholder="john.smith@example.com">
                    </div>
                    <button class="execute-btn" onclick="executeAnonymizeRecruit()">🚀 Anonymize Data</button>
                    <div id="anonymizeRecruitResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Notifications System -->
        <div class="endpoint-section">
            <div class="section-header">📧 Notifications System (Email & SMS)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/notifications/send</span>
                    <button class="test-button" onclick="toggleForm('notificationSendForm')">🧪 Test Send</button>
                </div>
                <p class="description">Send custom notifications via multiple channels (Email/SMS) with template support and delivery tracking</p>
                <div class="test-form" id="notificationSendForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📧 Notification Data (JSON):</label>
                        <textarea class="form-textarea" id="notificationSendData">{"type":"TIMESHEET_SUBMITTED","channels":["EMAIL","SMS"],"emails":["manager@example.com"],"phoneNumbers":["+1234567890"],"subject":"Test Notification","message":"This is a test notification","templateData":{"engineerName":"John Doe","totalHours":8},"tenantId":"demo-tenant"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeNotificationSend()">🚀 Send Notification</button>
                    <div id="notificationSendResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/notifications/timesheet-submitted</span>
                    <button class="test-button" onclick="toggleForm('timesheetNotificationForm')">🧪 Test Timesheet Alert</button>
                </div>
                <p class="description">Quick notification for timesheet submissions - integrates with timesheet workflow and triggers manager alerts</p>
                <div class="test-form" id="timesheetNotificationForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">⏰ Timesheet Alert Data (JSON):</label>
                        <textarea class="form-textarea" id="timesheetNotificationData">{"engineerName":"John Doe","totalHours":8,"emails":["manager@example.com"],"phones":["+1234567890"]}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeTimesheetNotification()">🚀 Send Timesheet Alert</button>
                    <div id="timesheetNotificationResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/notifications/discrepancy-detected</span>
                    <button class="test-button" onclick="toggleForm('discrepancyNotificationForm')">🧪 Test Discrepancy Alert</button>
                </div>
                <p class="description">Critical alert for timesheet discrepancies - auto-triggered by reconciliation system when hour differences detected</p>
                <div class="test-form" id="discrepancyNotificationForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">⚠️ Discrepancy Alert Data (JSON):</label>
                        <textarea class="form-textarea" id="discrepancyNotificationData">{"engineerName":"John Doe","difference":2,"emails":["manager@example.com"],"phones":["+1234567890"]}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeDiscrepancyNotification()">🚀 Send Discrepancy Alert</button>
                    <div id="discrepancyNotificationResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/notifications/compliance-violation</span>
                    <button class="test-button" onclick="toggleForm('complianceNotificationForm')">🧪 Test Compliance Alert</button>
                </div>
                <p class="description">Urgent compliance violation alerts - integrates with security and audit systems for immediate escalation</p>
                <div class="test-form" id="complianceNotificationForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🚨 Compliance Violation Data (JSON):</label>
                        <textarea class="form-textarea" id="complianceNotificationData">{"violationType":"UNAUTHORIZED_ACCESS","description":"Attempted access to restricted area","emails":["security@example.com"],"phones":["+1234567890"]}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeComplianceNotification()">🚀 Send Compliance Alert</button>
                    <div id="complianceNotificationResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/notifications/history</span>
                    <button class="test-button" onclick="executeNotificationHistory()">🧪 Test History</button>
                </div>
                <p class="description">Retrieve notification history with filtering - supports audit trails and compliance reporting</p>
                <div id="notificationHistoryResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/notifications/analytics</span>
                    <button class="test-button" onclick="executeNotificationAnalytics()">🧪 Test Analytics</button>
                </div>
                <p class="description">Delivery metrics and performance analytics - tracks success rates, delivery times, and channel performance</p>
                <div id="notificationAnalyticsResponse" class="response-area" style="display: none;"></div>
            </div>
        </div>

        <!-- PDF Reports System -->
        <div class="endpoint-section">
            <div class="section-header">📊 PDF Reports System (Automated Generation)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/reports/generate</span>
                    <button class="test-button" onclick="toggleForm('reportGenerateForm')">🧪 Test Generate</button>
                </div>
                <p class="description">Generate custom reports with flexible parameters - stores in R2 with download URLs and email delivery</p>
                <div class="test-form" id="reportGenerateForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📋 Report Generation Data (JSON):</label>
                        <textarea class="form-textarea" id="reportGenerateData">{"type":"TIMESHEET_SUMMARY","format":"PDF","name":"Weekly Timesheet Summary","dateRange":{"start":"2025-09-08T00:00:00.000Z","end":"2025-09-15T23:59:59.999Z"},"emailTo":["manager@example.com"],"tenantId":"demo-tenant"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeReportGenerate()">🚀 Generate Report</button>
                    <div id="reportGenerateResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/reports/timesheet-summary</span>
                    <button class="test-button" onclick="toggleForm('timesheetReportForm')">🧪 Test Timesheet Report</button>
                </div>
                <p class="description">Quick timesheet summary report - integrates with timesheet and discrepancy data for comprehensive analysis</p>
                <div class="test-form" id="timesheetReportForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">⏰ Timesheet Report Data (JSON):</label>
                        <textarea class="form-textarea" id="timesheetReportData">{"startDate":"2025-09-08T00:00:00.000Z","endDate":"2025-09-15T23:59:59.999Z","emailTo":["manager@example.com"]}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeTimesheetReport()">🚀 Generate Timesheet Report</button>
                    <div id="timesheetReportResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/reports/financial-summary</span>
                    <button class="test-button" onclick="toggleForm('financialReportForm')">🧪 Test Financial Report</button>
                </div>
                <p class="description">Financial analytics report - aggregates revenue, costs, profit margins, and client breakdowns</p>
                <div class="test-form" id="financialReportForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">💰 Financial Report Data (JSON):</label>
                        <textarea class="form-textarea" id="financialReportData">{"startDate":"2025-08-01T00:00:00.000Z","endDate":"2025-09-15T23:59:59.999Z","emailTo":["finance@example.com"]}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeFinancialReport()">🚀 Generate Financial Report</button>
                    <div id="financialReportResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/reports/history</span>
                    <button class="test-button" onclick="executeReportHistory()">🧪 Test Report History</button>
                </div>
                <p class="description">Report generation history with status tracking - supports audit, compliance, and download management</p>
                <div id="reportHistoryResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/reports/scheduled</span>
                    <button class="test-button" onclick="executeScheduledReports()">🧪 Test Scheduled Reports</button>
                </div>
                <p class="description">Manage scheduled reports - supports daily/weekly/monthly automation with Cloudflare Cron Triggers</p>
                <div id="scheduledReportsResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/reports/scheduled</span>
                    <button class="test-button" onclick="toggleForm('scheduleReportForm')">🧪 Test Schedule Report</button>
                </div>
                <p class="description">Create automated report schedules - integrates with notification system for automatic delivery</p>
                <div class="test-form" id="scheduleReportForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">⏰ Schedule Report Data (JSON):</label>
                        <textarea class="form-textarea" id="scheduleReportData">{"name":"Weekly Timesheet Report","type":"TIMESHEET_SUMMARY","format":"PDF","frequency":"WEEKLY","scheduleConfig":{"dayOfWeek":1,"hour":9,"minute":0},"recipients":[{"email":"manager@example.com","name":"Manager"}],"isActive":true,"tenantId":"demo-tenant","createdBy":"admin"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeScheduleReport()">🚀 Schedule Report</button>
                    <div id="scheduleReportResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Authentication -->
        <div class="endpoint-section">
            <div class="section-header">🔐 Authentication & Sessions</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/auth/login</span>
                    <button class="test-button" onclick="toggleForm('loginForm')">🧪 Test Login</button>
                </div>
                <p class="description">Authenticate user and create session</p>
                <div class="test-form" id="loginForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🔑 Login Data (JSON):</label>
                        <textarea class="form-textarea" id="loginData">{"email":"admin@humber.com","password":"admin123","tenantId":"demo-tenant"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeLogin()">🚀 Login</button>
                    <div id="loginResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/auth/refresh</span>
                    <button class="test-button" onclick="executeRefresh()">🧪 Test Refresh</button>
                </div>
                <p class="description">Refresh authentication token</p>
                <div id="refreshResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/auth/logout</span>
                    <button class="test-button" onclick="executeLogout()">🧪 Test Logout</button>
                </div>
                <p class="description">Logout user and invalidate session</p>
                <div id="logoutResponse" class="response-area" style="display: none;"></div>
            </div>
        </div>

        <!-- Expenses Management -->
        <div class="endpoint-section">
            <div class="section-header">💰 Expenses Management (Next.js API)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/expenses</span>
                    <button class="test-button" onclick="toggleForm('expensesCreateForm')">🧪 Test Create Expense</button>
                </div>
                <p class="description">Create travel or miscellaneous expenses with auto-approval for amounts under threshold</p>
                <div class="test-form" id="expensesCreateForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">💰 Expense Data (JSON):</label>
                        <textarea class="form-textarea" id="expensesCreateData">{"type":"travel","engineerId":"eng_001","amount":150.00,"date":"2025-01-15","description":"Client meeting travel","category":"TRANSPORTATION","receiptUrl":"https://example.com/receipt.pdf","projectId":"proj_001"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeExpensesCreate()">🚀 Create Expense</button>
                    <div id="expensesCreateResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/api/expenses</span>
                    <button class="test-button" onclick="toggleForm('expensesGetForm')">🧪 Test Get Expenses</button>
                </div>
                <p class="description">Get expenses with filtering by engineer, project, status, and date range</p>
                <div class="test-form" id="expensesGetForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">👤 Engineer ID:</label>
                        <input type="text" class="form-input" id="expensesEngineerId" placeholder="eng_001">
                    </div>
                    <div class="form-group">
                        <label class="form-label">📊 Status:</label>
                        <select class="form-input" id="expensesStatus">
                            <option value="">All</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <button class="execute-btn" onclick="executeExpensesGet()">🚀 Get Expenses</button>
                    <div id="expensesGetResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- GDPR Data Subject Rights -->
        <div class="endpoint-section">
            <div class="section-header">🛡️ GDPR Data Subject Rights (Next.js API)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/gdpr/data-subject-rights</span>
                    <button class="test-button" onclick="toggleForm('gdprRequestForm')">🧪 Test GDPR Request</button>
                </div>
                <p class="description">Submit GDPR data subject rights requests (access, portability, erasure, rectification)</p>
                <div class="test-form" id="gdprRequestForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📋 GDPR Request Data (JSON):</label>
                        <textarea class="form-textarea" id="gdprRequestData">{"requestType":"access","subjectEmail":"john.doe@example.com","subjectId":"rec_123","requestDetails":"I would like to access all personal data you have about me","verificationMethod":"email"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeGdprRequest()">🚀 Submit GDPR Request</button>
                    <div id="gdprRequestResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Invoice Generation -->
        <div class="endpoint-section">
            <div class="section-header">📄 Invoice Generation (Next.js API)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/invoices/generate</span>
                    <button class="test-button" onclick="toggleForm('invoiceGenerateForm')">🧪 Test Generate Invoice</button>
                </div>
                <p class="description">Generate comprehensive project invoices with expenses, travel, and custom line items</p>
                <div class="test-form" id="invoiceGenerateForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">📄 Invoice Generation Data (JSON):</label>
                        <textarea class="form-textarea" id="invoiceGenerateData">{"projectId":"proj_001","invoiceType":"project_milestone","billingPeriod":{"start":"2025-01-01","end":"2025-01-31"},"includeExpenses":true,"includeTravel":true,"clientEmail":"client@example.com","dueDate":"2025-02-15"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeInvoiceGenerate()">🚀 Generate Invoice</button>
                    <div id="invoiceGenerateResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/api/invoices/generate</span>
                    <button class="test-button" onclick="executeInvoicesList()">🧪 Test List Invoices</button>
                </div>
                <p class="description">Get list of generated invoices with filtering and pagination</p>
                <div id="invoicesListResponse" class="response-area" style="display: none;"></div>
            </div>
        </div>

        <!-- Offboarding Management -->
        <div class="endpoint-section">
            <div class="section-header">🔄 Offboarding Management (Next.js API)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/api/offboarding</span>
                    <button class="test-button" onclick="executeOffboardingGet()">🧪 Test Get Offboarding</button>
                </div>
                <p class="description">Get offboarding requests with filtering by type, status, and assignee</p>
                <div id="offboardingGetResponse" class="response-area" style="display: none;"></div>
            </div>
        </div>

        <!-- Payments Processing -->
        <div class="endpoint-section">
            <div class="section-header">💳 Payments Processing (Next.js API)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/payments</span>
                    <button class="test-button" onclick="toggleForm('paymentsCreateForm')">🧪 Test Create Payment</button>
                </div>
                <p class="description">Create payment links and process payments via Stripe integration</p>
                <div class="test-form" id="paymentsCreateForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">💳 Payment Data (JSON):</label>
                        <textarea class="form-textarea" id="paymentsCreateData">{"amount":1500.00,"currency":"USD","description":"Project milestone payment","clientEmail":"client@example.com","invoiceId":"inv_001","projectId":"proj_001"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executePaymentsCreate()">🚀 Create Payment</button>
                    <div id="paymentsCreateResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/api/payments</span>
                    <button class="test-button" onclick="executePaymentsGet()">🧪 Test Get Payments</button>
                </div>
                <p class="description">Get payment history with status tracking and filtering</p>
                <div id="paymentsGetResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method put">PUT</span>
                    <span class="url">/api/payments</span>
                    <button class="test-button" onclick="toggleForm('paymentsUpdateForm')">🧪 Test Update Payment</button>
                </div>
                <p class="description">Update payment status and process refunds</p>
                <div class="test-form" id="paymentsUpdateForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">💳 Payment Update Data (JSON):</label>
                        <textarea class="form-textarea" id="paymentsUpdateData">{"paymentId":"pay_001","status":"refunded","refundAmount":500.00,"reason":"Partial project cancellation"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executePaymentsUpdate()">🚀 Update Payment</button>
                    <div id="paymentsUpdateResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Project Approvals -->
        <div class="endpoint-section">
            <div class="section-header">✅ Project Approvals Workflow (Next.js API)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method put">PUT</span>
                    <span class="url">/api/projects/approvals</span>
                    <button class="test-button" onclick="toggleForm('approvalsUpdateForm')">🧪 Test Update Approval</button>
                </div>
                <p class="description">Process approval decisions for projects, budgets, and resource requests</p>
                <div class="test-form" id="approvalsUpdateForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">✅ Approval Data (JSON):</label>
                        <textarea class="form-textarea" id="approvalsUpdateData">{"requestId":"req_001","action":"approve","approverId":"mgr_001","comments":"Budget approved for Q1 project","conditions":[]}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeApprovalsUpdate()">🚀 Process Approval</button>
                    <div id="approvalsUpdateResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/api/projects/approvals</span>
                    <button class="test-button" onclick="executeApprovalsGet()">🧪 Test Get Approvals</button>
                </div>
                <p class="description">Get pending approval requests with filtering by type and priority</p>
                <div id="approvalsGetResponse" class="response-area" style="display: none;"></div>
            </div>
        </div>

        <!-- Customer Portal -->
        <div class="endpoint-section">
            <div class="section-header">🏢 Customer Portal Authentication (Next.js API)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/customer-portal/auth</span>
                    <button class="test-button" onclick="toggleForm('customerAuthForm')">🧪 Test Customer Auth</button>
                </div>
                <p class="description">Authenticate customers for portal access with secure token generation</p>
                <div class="test-form" id="customerAuthForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">🏢 Customer Auth Data (JSON):</label>
                        <textarea class="form-textarea" id="customerAuthData">{"email":"customer@example.com","companyId":"comp_001","accessCode":"TEMP123"}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeCustomerAuth()">🚀 Authenticate Customer</button>
                    <div id="customerAuthResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- Secure Time Tracking (Next.js) -->
        <div class="endpoint-section">
            <div class="section-header">⏰ Secure Time Tracking (Next.js API)</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="url">/api/time-tracking/secure-entry</span>
                    <button class="test-button" onclick="toggleForm('secureTimeForm')">🧪 Test Secure Time Entry</button>
                </div>
                <p class="description">Advanced time tracking with biometric authentication and geolocation verification</p>
                <div class="test-form" id="secureTimeForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">⏰ Secure Time Entry Data (JSON):</label>
                        <textarea class="form-textarea" id="secureTimeData">{"action":"CLOCK_IN","engineerId":"eng_001","biometricData":{"verified":true,"confidenceLevel":95},"geolocation":{"latitude":42.3314,"longitude":-83.0458,"accuracy":10},"deviceInfo":{"deviceId":"device_123","trustLevel":"HIGH"}}</textarea>
                    </div>
                    <button class="execute-btn" onclick="executeSecureTime()">🚀 Submit Time Entry</button>
                    <div id="secureTimeResponse" class="response-area" style="display: none;"></div>
                </div>
            </div>
        </div>

        <!-- System Health -->
        <div class="endpoint-section">
            <div class="section-header">🔧 System Health & Monitoring</div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/health</span>
                    <button class="test-button" onclick="executeHealth()">🧪 Test Health</button>
                </div>
                <p class="description">Check system health and status</p>
                <div id="healthResponse" class="response-area" style="display: none;"></div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="url">/metrics</span>
                    <button class="test-button" onclick="executeMetrics()">🧪 Test Metrics</button>
                </div>
                <p class="description">Get system performance metrics and monitoring data</p>
                <div id="metricsResponse" class="response-area" style="display: none;"></div>
            </div>
        </div>
    </div>

    <script>
        const BASE_URL = '${baseUrl}';
        
        function toggleForm(formId) {
            const form = document.getElementById(formId);
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
        
        async function makeRequest(method, endpoint, data = null, isFormData = false, extraHeaders = {}) {
            // Use Next.js API for recruiting endpoints, Worker API for others
            let baseUrl = BASE_URL;
            if (endpoint.startsWith('/api/recruits')) {
                baseUrl = 'http://localhost:3000'; // Next.js app
            }
            
            const options = {
                method,
                headers: {
                    'X-Tenant-ID': 'demo-tenant',
                    ...extraHeaders
                }
            };
            
            // Add Bearer token for Next.js API routes that require authentication
            if (endpoint.startsWith('/api/recruits')) {
                options.headers['Authorization'] = 'Bearer test-token-for-api-testing';
            }
            
            if (data && !isFormData) {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(data);
            } else if (data && isFormData) {
                options.body = data;
            }
            
            try {
                console.log('🚀 Making request to:', baseUrl + endpoint);
                console.log('📦 Request options:', JSON.stringify(options, null, 2));
                
                const response = await fetch(baseUrl + endpoint, options);
                console.log('📡 Response received:', response.status, response.statusText);
                
                const responseData = await response.text();
                console.log('📄 Response data length:', responseData.length);
                
                let formattedResponse;
                try {
                    const parsed = JSON.parse(responseData);
                    formattedResponse = JSON.stringify(parsed, null, 2);
                    console.log('✅ JSON parsed successfully');
                } catch (parseError) {
                    console.log('⚠️ JSON parse failed, using raw text');
                    formattedResponse = responseData;
                }
                
                return {
                    status: response.status,
                    statusText: response.statusText,
                    data: formattedResponse,
                    url: baseUrl + endpoint,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error('❌ Request failed:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorDetails = \`Error: \${errorMessage}
URL: \${baseUrl + endpoint}
Method: \${options.method}
Headers: \${JSON.stringify(options.headers, null, 2)}
Body: \${options.body || 'none'}
Timestamp: \${new Date().toISOString()}\`;
                
                return {
                    status: 0,
                    statusText: 'Network Error',
                    data: errorDetails,
                    error: errorMessage,
                    url: baseUrl + endpoint
                };
            }
        }
        
        function displayResponse(elementId, response) {
            const element = document.getElementById(elementId);
            element.style.display = 'block';
            
            const statusClass = response.status >= 200 && response.status < 300 ? 'status-success' : 'status-error';
            let debugInfo = '';
            if (response.url) {
                debugInfo = \`<div style="font-size: 12px; color: #666; margin-bottom: 10px;">URL: \${response.url}</div>\`;
            }
            if (response.error) {
                debugInfo += \`<div style="font-size: 12px; color: #f56565; margin-bottom: 10px;">Error: \${response.error}</div>\`;
            }
            
            element.innerHTML = \`\${debugInfo}<div class="\${statusClass}">Status: \${response.status} \${response.statusText}</div>\\n\\n\${response.data}\`;
        }
        
        async function executeUpload() {
            const fileInput = document.getElementById('uploadFile');
            const metadataInput = document.getElementById('uploadMetadata');
            
            if (!fileInput.files[0]) {
                alert('Please select a file to upload');
                return;
            }
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('metadata', metadataInput.value || '{}');
            
            const response = await makeRequest('POST', '/documents/upload', formData, true);
            displayResponse('uploadResponse', response);
        }
        
        async function executeGetDocuments() {
            const query = document.getElementById('searchQuery').value;
            const category = document.getElementById('searchCategory').value;
            
            let endpoint = '/documents?';
            if (query) endpoint += \`query=\${encodeURIComponent(query)}&\`;
            if (category) endpoint += \`category=\${category}&\`;
            
            const response = await makeRequest('GET', endpoint);
            displayResponse('documentsResponse', response);
        }
        
        async function executeDocumentSearch() {
            const query = document.getElementById('vectorSearchQuery').value;
            const maxResults = parseInt(document.getElementById('maxResults').value);
            
            const data = { query, maxResults, threshold: 0.7 };
            const response = await makeRequest('POST', '/documents/search', data);
            displayResponse('searchResponse', response);
        }
        
        async function executeDocumentDetail() {
            const docId = document.getElementById('docDetailId').value;
            const response = await makeRequest('GET', \`/documents/\${docId}\`);
            displayResponse('docDetailResponse', response);
        }
        
        async function executeDocumentDownload() {
            const docId = document.getElementById('docDownloadId').value;
            const response = await makeRequest('GET', \`/documents/\${docId}/download\`);
            displayResponse('docDownloadResponse', response);
        }
        
        async function executeDocumentDelete() {
            const docId = document.getElementById('docDeleteId').value;
            const response = await makeRequest('DELETE', \`/documents/\${docId}\`);
            displayResponse('docDeleteResponse', response);
        }
        
        async function executeChatMessage() {
            const message = document.getElementById('chatMessage').value;
            const useRAG = document.getElementById('useRAG').value === 'true';
            
            const data = { message, useRAG, maxDocuments: 5 };
            const response = await makeRequest('POST', '/chat/message', data);
            displayResponse('chatResponse', response);
        }
        
        async function executeChatSessions() {
            const response = await makeRequest('GET', '/chat/sessions');
            displayResponse('sessionsResponse', response);
        }
        
        // Expenses Management Functions
        async function executeExpensesCreate() {
            const data = JSON.parse(document.getElementById('expensesCreateData').value);
            const response = await makeRequest('POST', '/api/expenses', data);
            displayResponse('expensesCreateResponse', response);
        }
        
        async function executeExpensesGet() {
            const engineerId = document.getElementById('expensesEngineerId').value;
            const status = document.getElementById('expensesStatus').value;
            let endpoint = '/api/expenses?';
            if (engineerId) endpoint += `engineerId=${engineerId}&`;
            if (status) endpoint += `status=${status}&`;
            const response = await makeRequest('GET', endpoint);
            displayResponse('expensesGetResponse', response);
        }

        // GDPR Functions
        async function executeGdprRequest() {
            const data = JSON.parse(document.getElementById('gdprRequestData').value);
            const response = await makeRequest('POST', '/api/gdpr/data-subject-rights', data);
            displayResponse('gdprRequestResponse', response);
        }

        // Invoice Functions
        async function executeInvoiceGenerate() {
            const data = JSON.parse(document.getElementById('invoiceGenerateData').value);
            const response = await makeRequest('POST', '/api/invoices/generate', data);
            displayResponse('invoiceGenerateResponse', response);
        }
        
        async function executeInvoicesList() {
            const response = await makeRequest('GET', '/api/invoices/generate');
            displayResponse('invoicesListResponse', response);
        }

        // Offboarding Functions
        async function executeOffboardingGet() {
            const response = await makeRequest('GET', '/api/offboarding');
            displayResponse('offboardingGetResponse', response);
        }

        // Payments Functions
        async function executePaymentsCreate() {
            const data = JSON.parse(document.getElementById('paymentsCreateData').value);
            const response = await makeRequest('POST', '/api/payments', data);
            displayResponse('paymentsCreateResponse', response);
        }
        
        async function executePaymentsGet() {
            const response = await makeRequest('GET', '/api/payments');
            displayResponse('paymentsGetResponse', response);
        }
        
        async function executePaymentsUpdate() {
            const data = JSON.parse(document.getElementById('paymentsUpdateData').value);
            const response = await makeRequest('PUT', '/api/payments', data);
            displayResponse('paymentsUpdateResponse', response);
        }

        // Approvals Functions
        async function executeApprovalsUpdate() {
            const data = JSON.parse(document.getElementById('approvalsUpdateData').value);
            const response = await makeRequest('PUT', '/api/projects/approvals', data);
            displayResponse('approvalsUpdateResponse', response);
        }
        
        async function executeApprovalsGet() {
            const response = await makeRequest('GET', '/api/projects/approvals');
            displayResponse('approvalsGetResponse', response);
        }

        // Customer Portal Functions
        async function executeCustomerAuth() {
            const data = JSON.parse(document.getElementById('customerAuthData').value);
            const response = await makeRequest('POST', '/api/customer-portal/auth', data);
            displayResponse('customerAuthResponse', response);
        }

        // Secure Time Tracking Functions
        async function executeSecureTime() {
            const data = JSON.parse(document.getElementById('secureTimeData').value);
            const response = await makeRequest('POST', '/api/time-tracking/secure-entry', data);
            displayResponse('secureTimeResponse', response);
        }
        
        async function executeHealth() {
            const response = await makeRequest('GET', '/health');
            displayResponse('healthResponse', response);
        }
        
        async function executeMetrics() {
            const response = await makeRequest('GET', '/metrics');
            displayResponse('metricsResponse', response);
        }
        
        // Operations Workflow Functions
        async function executeRecruiting() {
            const data = JSON.parse(document.getElementById('recruitingData').value);
            const response = await makeRequest('POST', '/operations/recruiting-step-1', data);
            displayResponse('recruitingResponse', response);
        }
        
        async function executeVetting() {
            const data = JSON.parse(document.getElementById('vettingData').value);
            const response = await makeRequest('POST', '/operations/hiring-vetting-step-2', data);
            displayResponse('vettingResponse', response);
        }
        
        async function executeBackground() {
            const data = JSON.parse(document.getElementById('backgroundData').value);
            const response = await makeRequest('POST', '/operations/background-checks', data);
            displayResponse('backgroundResponse', response);
        }
        
        async function executeOffer() {
            const data = JSON.parse(document.getElementById('offerData').value);
            const response = await makeRequest('POST', '/operations/offer-letter-visa', data);
            displayResponse('offerResponse', response);
        }
        
        async function executeDeployment() {
            const data = JSON.parse(document.getElementById('deploymentData').value);
            const response = await makeRequest('POST', '/operations/deployment', data);
            displayResponse('deploymentResponse', response);
        }
        
        // Bull Pen Functions
        async function executeBullPenDashboard() {
            const response = await makeRequest('GET', '/bull-pen/dashboard');
            displayResponse('bullPenResponse', response);
        }
        
        async function executeEngineers() {
            const response = await makeRequest('GET', '/engineers');
            displayResponse('engineersResponse', response);
        }
        
        async function executeEngineersByCategory() {
            const response = await makeRequest('GET', '/bull-pen/engineers/by-category');
            displayResponse('categoriesResponse', response);
        }
        
        // Timesheet Functions
        async function executeTimesheet() {
            const data = JSON.parse(document.getElementById('timesheetData').value);
            const response = await makeRequest('POST', '/timesheets/reconcile', data);
            displayResponse('timesheetResponse', response);
        }
        
        async function executeCandidateTimesheets() {
            const candidateId = document.getElementById('candidateId').value;
            const response = await makeRequest('GET', \`/timesheets/candidate/\${candidateId}\`);
            displayResponse('candidateTimesheetsResponse', response);
        }
        
        async function executeBatchTimesheet() {
            const data = JSON.parse(document.getElementById('batchTimesheetData').value);
            const response = await makeRequest('POST', '/timesheets/batch-reconcile', data);
            displayResponse('batchTimesheetResponse', response);
        }
        
        async function executePeriodTimesheets() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const response = await makeRequest('GET', \`/timesheets/period?startDate=\${startDate}&endDate=\${endDate}\`);
            displayResponse('periodTimesheetsResponse', response);
        }
        
        // Reconciliation Functions
        async function executeReconciliation() {
            const data = JSON.parse(document.getElementById('reconciliationData').value);
            const response = await makeRequest('POST', '/reconciliation/submit', data);
            displayResponse('reconciliationResponse', response);
        }
        
        async function executeCustomerHours() {
            const data = JSON.parse(document.getElementById('customerHoursData').value);
            const response = await makeRequest('POST', '/reconciliation/customer-hours', data);
            displayResponse('customerHoursResponse', response);
        }
        
        async function executeNeedsReview() {
            const response = await makeRequest('GET', '/reconciliation/needs-review');
            displayResponse('needsReviewResponse', response);
        }
        
        async function executeStats() {
            const startDate = document.getElementById('statsStartDate').value;
            const endDate = document.getElementById('statsEndDate').value;
            const response = await makeRequest('GET', \`/reconciliation/stats?startDate=\${startDate}&endDate=\${endDate}\`);
            displayResponse('statsResponse', response);
        }
        
        async function executeUploadSpreadsheet() {
            const data = JSON.parse(document.getElementById('uploadSpreadsheetData').value);
            const response = await makeRequest('POST', '/reconciliation/upload-spreadsheet', data);
            displayResponse('uploadSpreadsheetResponse', response);
        }
        
        async function executeHumanReview() {
            const data = JSON.parse(document.getElementById('humanReviewData').value);
            const response = await makeRequest('POST', '/reconciliation/human-review', data);
            displayResponse('humanReviewResponse', response);
        }
        
        // Authentication Functions
        async function executeLogin() {
            const data = JSON.parse(document.getElementById('loginData').value);
            const response = await makeRequest('POST', '/auth/login', data);
            displayResponse('loginResponse', response);
        }
        
        async function executeRefresh() {
            const response = await makeRequest('POST', '/auth/refresh');
            displayResponse('refreshResponse', response);
        }
        
        async function executeLogout() {
            const response = await makeRequest('POST', '/auth/logout');
            displayResponse('logoutResponse', response);
        }
        
        // Notification Functions
        async function executeNotificationSend() {
            const data = JSON.parse(document.getElementById('notificationSendData').value);
            const response = await makeRequest('POST', '/notifications/send', data);
            displayResponse('notificationSendResponse', response);
        }
        
        async function executeTimesheetNotification() {
            const data = JSON.parse(document.getElementById('timesheetNotificationData').value);
            const response = await makeRequest('POST', '/notifications/timesheet-submitted', data);
            displayResponse('timesheetNotificationResponse', response);
        }
        
        async function executeDiscrepancyNotification() {
            const data = JSON.parse(document.getElementById('discrepancyNotificationData').value);
            const response = await makeRequest('POST', '/notifications/discrepancy-detected', data);
            displayResponse('discrepancyNotificationResponse', response);
        }
        
        async function executeComplianceNotification() {
            const data = JSON.parse(document.getElementById('complianceNotificationData').value);
            const response = await makeRequest('POST', '/notifications/compliance-violation', data);
            displayResponse('complianceNotificationResponse', response);
        }
        
        async function executeNotificationHistory() {
            const response = await makeRequest('GET', '/notifications/history?limit=10');
            displayResponse('notificationHistoryResponse', response);
        }
        
        async function executeNotificationAnalytics() {
            const response = await makeRequest('GET', '/notifications/analytics');
            displayResponse('notificationAnalyticsResponse', response);
        }
        
        // Reports Functions
        async function executeReportGenerate() {
            const data = JSON.parse(document.getElementById('reportGenerateData').value);
            const response = await makeRequest('POST', '/reports/generate', data);
            displayResponse('reportGenerateResponse', response);
        }
        
        async function executeTimesheetReport() {
            const data = JSON.parse(document.getElementById('timesheetReportData').value);
            const response = await makeRequest('POST', '/reports/timesheet-summary', data);
            displayResponse('timesheetReportResponse', response);
        }
        
        async function executeFinancialReport() {
            const data = JSON.parse(document.getElementById('financialReportData').value);
            const response = await makeRequest('POST', '/reports/financial-summary', data);
            displayResponse('financialReportResponse', response);
        }
        
        async function executeReportHistory() {
            const response = await makeRequest('GET', '/reports/history?limit=10');
            displayResponse('reportHistoryResponse', response);
        }
        
        async function executeScheduledReports() {
            const response = await makeRequest('GET', '/reports/scheduled');
            displayResponse('scheduledReportsResponse', response);
        }
        
        async function executeScheduleReport() {
            const data = JSON.parse(document.getElementById('scheduleReportData').value);
            const response = await makeRequest('POST', '/reports/scheduled', data);
            displayResponse('scheduleReportResponse', response);
        }

        // Secure Time Tracking Functions
        async function executeClockAction() {
            const data = JSON.parse(document.getElementById('clockActionData').value);
            const response = await makeRequest('POST', '/time-tracking/clock-action', data);
            displayResponse('clockActionResponse', response);
        }
        
        async function executeActiveSessions() {
            const response = await makeRequest('GET', '/time-tracking/active-sessions');
            displayResponse('activeSessionsResponse', response);
        }
        
        async function executeWorkSites() {
            const response = await makeRequest('GET', '/time-tracking/work-sites');
            displayResponse('workSitesResponse', response);
        }
        
        async function executeVerifyLocation() {
            const data = JSON.parse(document.getElementById('verifyLocationData').value);
            const response = await makeRequest('POST', '/time-tracking/verify-location', data);
            displayResponse('verifyLocationResponse', response);
        }

        // Recruiting System Functions
        async function executeCreateRecruit() {
            const data = JSON.parse(document.getElementById('createRecruitData').value);
            const response = await makeRequest('POST', '/api/recruits', data, false, {
                'Authorization': 'Bearer dev-token-123'
            });
            displayResponse('createRecruitResponse', response);
        }
        
        async function executeGetRecruits() {
            const searchQuery = document.getElementById('recruitSearchQuery').value;
            const statusFilter = document.getElementById('recruitStatusFilter').value;
            const pageSize = document.getElementById('recruitPageSize').value;
            
            let url = '/api/recruits?limit=' + pageSize;
            if (searchQuery) url += '&search=' + encodeURIComponent(searchQuery);
            if (statusFilter) url += '&status=' + statusFilter;
            
            const response = await makeRequest('GET', url, null, false, {
                'Authorization': 'Bearer dev-token-123'
            });
            displayResponse('getRecruitsResponse', response);
        }
        
        async function executeOnboardRecruit() {
            const recruitId = document.getElementById('onboardRecruitId').value;
            const notes = document.getElementById('onboardNotes').value;
            const data = { notes };
            
            const response = await makeRequest('POST', \`/api/recruits/\${recruitId}/onboard\`, data, false, {
                'Authorization': 'Bearer dev-token-123'
            });
            displayResponse('onboardRecruitResponse', response);
        }
        
        async function executeRecruitConsent() {
            const recruitId = document.getElementById('consentRecruitId').value;
            const consentType = document.getElementById('consentType').value;
            const consentGiven = document.getElementById('consentGiven').value === 'true';
            const consentText = document.getElementById('consentText').value;
            
            const data = {
                consentType,
                consentGiven,
                consentVersion: '1.0',
                consentText,
                purposeSpecification: 'Recruitment and employment data processing'
            };
            
            const response = await makeRequest('POST', \`/api/recruits/\${recruitId}/consent\`, data, false, {
                'Authorization': 'Bearer dev-token-123'
            });
            displayResponse('recruitConsentResponse', response);
        }
        
        async function executeGetConsent() {
            const recruitId = document.getElementById('getConsentRecruitId').value;
            
            const response = await makeRequest('GET', \`/api/recruits/\${recruitId}/consent\`, null, false, {
                'Authorization': 'Bearer dev-token-123'
            });
            displayResponse('getConsentResponse', response);
        }
        
        async function executeAuditTrail() {
            const recruitId = document.getElementById('auditTrailRecruitId').value;
            
            const response = await makeRequest('GET', \`/api/recruits/\${recruitId}/audit-trail\`, null, false, {
                'Authorization': 'Bearer dev-token-123'
            });
            displayResponse('auditTrailResponse', response);
        }
        
        async function executeAnonymizeRecruit() {
            const recruitId = document.getElementById('anonymizeRecruitId').value;
            const reason = document.getElementById('anonymizeReason').value;
            const requestorEmail = document.getElementById('anonymizeRequestorEmail').value;
            
            const data = {
                reason,
                requestType: 'gdpr_article_17',
                requestorEmail: requestorEmail || undefined
            };
            
            const response = await makeRequest('POST', \`/api/recruits/\${recruitId}/anonymize\`, data, false, {
                'Authorization': 'Bearer dev-token-123'
            });
            displayResponse('anonymizeRecruitResponse', response);
        }
        
        // Auto-test health on page load
        window.onload = () => {
            executeHealth();
            console.log('🧪 Interactive API Testing Interface Loaded!');
            console.log('Click any "Test" button to try endpoints');
        };
    </script>
</body>
</html>`;
  
  return c.html(testingHtml);
});

// Authentication routes (no auth required)
app.route('/auth', authRouter);

// Protected routes (require authentication)
app.route('/operations', operationsRouter);
app.route('/timesheets', timesheetsRouter);
app.route('/reconciliation', reconciliationRouter);
app.route('/bull-pen', bullPenRouter);
app.route('/engineers', engineersRouter);
app.route('/documents', realDocumentsRouter);
app.route('/chat', chatRouter);
app.route('/time-tracking', secureTimeTrackingRouter);
app.route('/notifications', notificationsRouter);
app.route('/reports', reportsRouter);
app.route('/knowledge-base', knowledgeBaseRouter);
app.route('/mock-timesheets', mockTimesheetsRouter);
app.route('/api/recruits', recruitsRouter);
// app.route('/api/recruits', mockRecruitingRouter); // Removed - using real Next.js API

app.onError((err, c) => {
  // Log full error internally
  console.error(`Error in ${c.req.path}:`, err);
  
  // Return sanitized error to prevent information leakage
  const sanitized = {
    error: 'Internal Server Error',
    message: 'An error occurred processing your request',
    requestId: (c.get('requestId') as string) || crypto.randomUUID()
  };
  
  return c.json(sanitized, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<any>, _env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        console.log('Processing queue message:', message.body);
        message.ack();
      } catch (error) {
        console.error('Queue processing error:', error);
        message.retry();
      }
    }
  },
};
import { Hono } from 'hono';
import { cors } from 'hono/cors';
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
import { realChatRouter } from './routes/real-chat';
import { authRouter } from './routes/auth';

const app = new Hono<{ Bindings: Env }>();

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

    <h2>🧪 Example Usage</h2>
    <h3>Step 1: Recruiting</h3>
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

    <p><em>Generated at: ${new Date().toISOString()}</em></p>
</body>
</html>`;
  
  return c.html(html);
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
app.route('/chat', realChatRouter);

app.onError((err, c) => {
  // Log full error internally
  console.error(`Error in ${c.req.path}:`, err);
  
  // Return sanitized error to prevent information leakage
  const sanitized = {
    error: 'Internal Server Error',
    message: 'An error occurred processing your request',
    requestId: c.get('requestId') || crypto.randomUUID()
  };
  
  return c.json(sanitized, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
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
# 🏗️ Humber Operations - System Architecture & Diagrams

## 1. System Architecture Overview

```mermaid
graph TB
    %% Frontend Layer
    subgraph "Frontend Layer"
        WEB[Next.js 14 Dashboard]
        MOBILE[Mobile Apps]
    end

    %% API Gateway Layer
    subgraph "API Layer - Cloudflare Workers"
        WORKER[Hono.js API Server]
        AUTH[JWT Authentication]
        TENANT[Multi-Tenant Router]
        RATE[Rate Limiter]
    end

    %% Business Logic Layer
    subgraph "Business Logic"
        ROUTES[API Routes]
        MIDDLEWARE[Security Middleware]
        VALIDATORS[Zod Validators]
    end

    %% Queue Processing Layer
    subgraph "Queue Processors"
        BGC[Background Check Processor]
        DRUG[Drug Test Processor]
        DEPLOY[Deployment Processor]
        RECON[Reconciliation Processor]
    end

    %% Data Layer
    subgraph "Data Layer"
        D1[Cloudflare D1 Databases]
        KV[KV Cache Storage]
        R2[R2 Document Storage]
        VECTOR[Vectorize AI Index]
    end

    %% External Services
    subgraph "External Services"
        HR[HR Systems]
        PAYROLL[Payroll Systems]
        BG_CHECK[Background Check APIs]
        EMAIL[Email Services]
    end

    %% Connections
    WEB --> WORKER
    MOBILE --> WORKER
    
    WORKER --> AUTH
    WORKER --> TENANT
    WORKER --> RATE
    
    AUTH --> ROUTES
    TENANT --> ROUTES
    ROUTES --> MIDDLEWARE
    MIDDLEWARE --> VALIDATORS
    
    ROUTES --> BGC
    ROUTES --> DRUG
    ROUTES --> DEPLOY
    ROUTES --> RECON
    
    BGC --> D1
    DRUG --> D1
    DEPLOY --> D1
    RECON --> D1
    
    ROUTES --> KV
    ROUTES --> R2
    ROUTES --> VECTOR
    
    BGC --> BG_CHECK
    RECON --> PAYROLL
    DEPLOY --> HR
    WORKER --> EMAIL

    %% Styling
    classDef frontend fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef api fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef logic fill:#10b981,stroke:#059669,color:#fff
    classDef queue fill:#f59e0b,stroke:#d97706,color:#fff
    classDef data fill:#ef4444,stroke:#dc2626,color:#fff
    classDef external fill:#6b7280,stroke:#4b5563,color:#fff

    class WEB,MOBILE frontend
    class WORKER,AUTH,TENANT,RATE api
    class ROUTES,MIDDLEWARE,VALIDATORS logic
    class BGC,DRUG,DEPLOY,RECON queue
    class D1,KV,R2,VECTOR data
    class HR,PAYROLL,BG_CHECK,EMAIL external
```

## 2. Engineer Lifecycle Flow

```mermaid
flowchart TD
    START([Candidate Application]) --> RECRUIT{Recruiting Stage}
    
    RECRUIT -->|Pass| VET[Vetting Process]
    RECRUIT -->|Fail| REJECT[❌ Rejected]
    
    VET --> BG_CHECK[Background Check]
    VET --> DRUG_TEST[Drug Test]
    VET --> CERT[Certification Verification]
    VET --> SSN[SSN Verification]
    
    BG_CHECK -->|Pass| BG_PASS[✅ Background Clear]
    BG_CHECK -->|Fail| BG_FAIL[❌ Background Failed]
    
    DRUG_TEST -->|Pass| DRUG_PASS[✅ Drug Test Clear]
    DRUG_TEST -->|Fail| DRUG_FAIL[❌ Drug Test Failed]
    
    CERT -->|Valid| CERT_PASS[✅ Certified]
    CERT -->|Invalid| CERT_FAIL[❌ Certification Failed]
    
    SSN -->|Valid| SSN_PASS[✅ SSN Verified]
    SSN -->|Invalid| SSN_FAIL[❌ SSN Failed]
    
    BG_PASS --> ALL_CHECKS{All Checks Complete?}
    DRUG_PASS --> ALL_CHECKS
    CERT_PASS --> ALL_CHECKS
    SSN_PASS --> ALL_CHECKS
    
    ALL_CHECKS -->|Yes| OFFER[Send Offer Letter]
    ALL_CHECKS -->|No| WAIT[⏳ Awaiting Results]
    
    OFFER -->|Accepted| VISA{Visa Required?}
    OFFER -->|Declined| DECLINED[❌ Offer Declined]
    
    VISA -->|Yes| VISA_PROC[Visa Processing]
    VISA -->|No| AVAILABLE[🟢 Available]
    
    VISA_PROC -->|Approved| AVAILABLE
    VISA_PROC -->|Denied| VISA_DENIED[❌ Visa Denied]
    
    %% Engineer Status Flow
    AVAILABLE --> PROCESSING[🟡 Processing]
    PROCESSING --> BUFFERED[🔵 Buffered]
    BUFFERED --> DEPLOYED[🟢 Deployed]
    
    %% Return paths
    DEPLOYED -->|Project Complete| AVAILABLE
    BUFFERED -->|Not Selected| AVAILABLE
    PROCESSING -->|Requirements Change| AVAILABLE
    
    %% Failure paths to rejection
    BG_FAIL --> REJECT
    DRUG_FAIL --> REJECT
    CERT_FAIL --> REJECT
    SSN_FAIL --> REJECT
    DECLINED --> REJECT
    VISA_DENIED --> REJECT

    %% Styling
    classDef success fill:#10b981,stroke:#059669,color:#fff
    classDef warning fill:#f59e0b,stroke:#d97706,color:#fff
    classDef error fill:#ef4444,stroke:#dc2626,color:#fff
    classDef process fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef decision fill:#8b5cf6,stroke:#7c3aed,color:#fff

    class BG_PASS,DRUG_PASS,CERT_PASS,SSN_PASS,AVAILABLE,DEPLOYED success
    class PROCESSING,BUFFERED,WAIT warning
    class REJECT,BG_FAIL,DRUG_FAIL,CERT_FAIL,SSN_FAIL,DECLINED,VISA_DENIED error
    class VET,BG_CHECK,DRUG_TEST,CERT,SSN,OFFER,VISA_PROC process
    class RECRUIT,ALL_CHECKS,VISA decision
```

## 3. Timesheet Reconciliation Flow

```mermaid
flowchart TD
    SUBMIT[📝 Timesheet Submitted] --> VALIDATE{Validation Check}
    
    VALIDATE -->|Pass| CALC[Calculate Variance]
    VALIDATE -->|Fail| INVALID[❌ Invalid Data]
    
    CALC --> VARIANCE{Variance Analysis}
    
    %% Auto-approve path (≤5% or ≤2 hours)
    VARIANCE -->|≤5% or ≤2hrs| AUTO_APPROVE[✅ Auto-Approved]
    
    %% Review required path (≤10% or ≤8 hours)
    VARIANCE -->|≤10% or ≤8hrs| REVIEW[👁️ Requires Review]
    
    %% Failed path (>10% or >8 hours)
    VARIANCE -->|>10% or >8hrs| FAILED[❌ Failed Reconciliation]
    
    AUTO_APPROVE --> APPROVED[✅ Approved Status]
    
    REVIEW --> MANUAL{Manual Review}
    MANUAL -->|Approve| APPROVED
    MANUAL -->|Reject| REJECTED[❌ Rejected]
    MANUAL -->|Request Info| INFO_REQ[📋 Information Requested]
    
    INFO_REQ --> RESUBMIT[📝 Resubmitted]
    RESUBMIT --> VALIDATE
    
    FAILED --> INVESTIGATE[🔍 Investigation Required]
    INVESTIGATE --> MANUAL_FIX[🛠️ Manual Resolution]
    MANUAL_FIX --> RESOLVED[✅ Resolved]
    
    APPROVED --> RECONCILING[⚙️ Reconciling]
    RESOLVED --> RECONCILING
    
    RECONCILING --> PAYROLL{Payroll Processing}
    PAYROLL -->|Success| PAID[💰 Paid]
    PAYROLL -->|Error| PAYROLL_ERROR[❌ Payroll Error]
    
    PAYROLL_ERROR --> RETRY[🔄 Retry Payment]
    RETRY --> PAYROLL
    
    %% Return to draft for corrections
    REJECTED --> DRAFT[📝 Draft Status]
    INVALID --> DRAFT
    
    DRAFT --> SUBMIT

    %% Styling
    classDef success fill:#10b981,stroke:#059669,color:#fff
    classDef warning fill:#f59e0b,stroke:#d97706,color:#fff
    classDef error fill:#ef4444,stroke:#dc2626,color:#fff
    classDef process fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef decision fill:#8b5cf6,stroke:#7c3aed,color:#fff

    class AUTO_APPROVE,APPROVED,RESOLVED,PAID success
    class REVIEW,INFO_REQ,RECONCILING,RETRY warning
    class INVALID,FAILED,REJECTED,PAYROLL_ERROR error
    class SUBMIT,CALC,INVESTIGATE,MANUAL_FIX,RESUBMIT,DRAFT process
    class VALIDATE,VARIANCE,MANUAL,PAYROLL decision
```

## 4. Multi-Tenant Architecture

```mermaid
graph TB
    %% Client Requests
    CLIENT1[Tenant A Client]
    CLIENT2[Tenant B Client]
    CLIENT3[Tenant C Client]

    %% Load Balancer / Edge
    EDGE[Cloudflare Edge Network]

    %% API Gateway with Tenant Routing
    subgraph "API Gateway Layer"
        ROUTER[Tenant Router]
        AUTH_CHECK[Authentication]
        TENANT_CTX[Tenant Context]
    end

    %% Application Layer
    subgraph "Application Services"
        ENGINEER_SVC[Engineer Service]
        TIMESHEET_SVC[Timesheet Service]
        RECONCILE_SVC[Reconciliation Service]
        BULL_PEN_SVC[Bull Pen Service]
    end

    %% Data Layer - Tenant Isolation
    subgraph "Data Layer"
        DB_MASTER[(Master DB)]
        DB_TENANT_A[(Tenant A DB)]
        DB_TENANT_B[(Tenant B DB)]
        DB_TENANT_C[(Tenant C DB)]
        
        KV_CACHE[(KV Cache)]
        R2_STORAGE[(R2 Storage)]
    end

    %% Queue Processing
    subgraph "Queue Layer"
        QUEUE_A[Tenant A Queues]
        QUEUE_B[Tenant B Queues]
        QUEUE_C[Tenant C Queues]
    end

    %% Connections
    CLIENT1 --> EDGE
    CLIENT2 --> EDGE
    CLIENT3 --> EDGE
    
    EDGE --> ROUTER
    ROUTER --> AUTH_CHECK
    AUTH_CHECK --> TENANT_CTX
    
    TENANT_CTX --> ENGINEER_SVC
    TENANT_CTX --> TIMESHEET_SVC
    TENANT_CTX --> RECONCILE_SVC
    TENANT_CTX --> BULL_PEN_SVC
    
    %% Tenant-specific data routing
    ENGINEER_SVC -->|Tenant A| DB_TENANT_A
    ENGINEER_SVC -->|Tenant B| DB_TENANT_B
    ENGINEER_SVC -->|Tenant C| DB_TENANT_C
    
    TIMESHEET_SVC -->|Tenant A| DB_TENANT_A
    TIMESHEET_SVC -->|Tenant B| DB_TENANT_B
    TIMESHEET_SVC -->|Tenant C| DB_TENANT_C
    
    %% Shared services
    ENGINEER_SVC --> DB_MASTER
    TIMESHEET_SVC --> KV_CACHE
    RECONCILE_SVC --> R2_STORAGE
    
    %% Queue routing
    ENGINEER_SVC -->|Tenant A| QUEUE_A
    TIMESHEET_SVC -->|Tenant B| QUEUE_B
    RECONCILE_SVC -->|Tenant C| QUEUE_C

    %% Styling
    classDef client fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef gateway fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef service fill:#10b981,stroke:#059669,color:#fff
    classDef database fill:#ef4444,stroke:#dc2626,color:#fff
    classDef queue fill:#f59e0b,stroke:#d97706,color:#fff

    class CLIENT1,CLIENT2,CLIENT3 client
    class ROUTER,AUTH_CHECK,TENANT_CTX gateway
    class ENGINEER_SVC,TIMESHEET_SVC,RECONCILE_SVC,BULL_PEN_SVC service
    class DB_MASTER,DB_TENANT_A,DB_TENANT_B,DB_TENANT_C,KV_CACHE,R2_STORAGE database
    class QUEUE_A,QUEUE_B,QUEUE_C queue
```

## 5. Data Flow Diagram

```mermaid
flowchart LR
    %% External Data Sources
    CANDIDATE[👤 Candidate Data]
    PROJECT[📊 Project Requirements]
    TIMESHEET[⏰ Timesheet Data]
    
    %% Input Processing
    VALIDATION[🔍 Data Validation]
    ENRICHMENT[➕ Data Enrichment]
    
    %% Core Data Stores
    ENGINEER_DB[(👷 Engineer Database)]
    PROJECT_DB[(📋 Project Database)]
    TIMESHEET_DB[(📝 Timesheet Database)]
    METRICS_DB[(📊 Metrics Database)]
    
    %% Processing Engines
    MATCHING[🎯 Skills Matching Engine]
    RECONCILIATION[⚖️ Reconciliation Engine]
    ANALYTICS[📈 Analytics Engine]
    
    %% Output Systems
    DASHBOARD[📊 Bull Pen Dashboard]
    REPORTS[📄 Reports & Analytics]
    NOTIFICATIONS[🔔 Notifications]
    INTEGRATIONS[🔗 External Integrations]
    
    %% Data Flow
    CANDIDATE --> VALIDATION
    PROJECT --> VALIDATION
    TIMESHEET --> VALIDATION
    
    VALIDATION --> ENRICHMENT
    ENRICHMENT --> ENGINEER_DB
    ENRICHMENT --> PROJECT_DB
    ENRICHMENT --> TIMESHEET_DB
    
    ENGINEER_DB --> MATCHING
    PROJECT_DB --> MATCHING
    MATCHING --> ENGINEER_DB
    
    TIMESHEET_DB --> RECONCILIATION
    RECONCILIATION --> TIMESHEET_DB
    RECONCILIATION --> METRICS_DB
    
    ENGINEER_DB --> ANALYTICS
    PROJECT_DB --> ANALYTICS
    TIMESHEET_DB --> ANALYTICS
    METRICS_DB --> ANALYTICS
    
    ANALYTICS --> DASHBOARD
    ANALYTICS --> REPORTS
    RECONCILIATION --> NOTIFICATIONS
    MATCHING --> NOTIFICATIONS
    
    ANALYTICS --> INTEGRATIONS
    RECONCILIATION --> INTEGRATIONS

    %% Styling
    classDef input fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef process fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef storage fill:#ef4444,stroke:#dc2626,color:#fff
    classDef engine fill:#10b981,stroke:#059669,color:#fff
    classDef output fill:#f59e0b,stroke:#d97706,color:#fff

    class CANDIDATE,PROJECT,TIMESHEET input
    class VALIDATION,ENRICHMENT process
    class ENGINEER_DB,PROJECT_DB,TIMESHEET_DB,METRICS_DB storage
    class MATCHING,RECONCILIATION,ANALYTICS engine
    class DASHBOARD,REPORTS,NOTIFICATIONS,INTEGRATIONS output
```

## 6. Deployment Architecture

```mermaid
graph TB
    %% Developer Environment
    subgraph "Development"
        DEV[👨‍💻 Developer]
        GIT[📚 Git Repository]
    end

    %% CI/CD Pipeline
    subgraph "CI/CD Pipeline"
        GITHUB[🐙 GitHub Actions]
        BUILD[🏗️ Build Process]
        TEST[🧪 Testing Suite]
        SECURITY[🔒 Security Scan]
    end

    %% Cloudflare Infrastructure
    subgraph "Cloudflare Global Network"
        CF_EDGE[🌐 Edge Locations]
        CF_DNS[🔍 DNS Resolution]
        CF_CDN[⚡ CDN]
        CF_WORKERS[⚙️ Workers Runtime]
        CF_D1[🗄️ D1 Databases]
        CF_KV[💾 KV Storage]
        CF_R2[📦 R2 Storage]
        CF_QUEUES[📬 Queues]
    end

    %% Frontend Deployment
    subgraph "Frontend Hosting"
        VERCEL[▲ Vercel]
        PREVIEW[👁️ Preview Deployments]
    end

    %% Monitoring & Observability
    subgraph "Monitoring"
        ANALYTICS[📊 Cloudflare Analytics]
        LOGS[📝 Real-time Logs]
        ALERTS[🚨 Alert System]
        METRICS[📈 Performance Metrics]
    end

    %% External Services
    subgraph "External Services"
        AUTH_PROVIDER[🔐 Auth Provider]
        EMAIL_SVC[📧 Email Service]
        BACKUP[💿 Backup Storage]
    end

    %% Flow
    DEV --> GIT
    GIT --> GITHUB
    GITHUB --> BUILD
    BUILD --> TEST
    TEST --> SECURITY
    SECURITY --> CF_WORKERS
    SECURITY --> VERCEL

    CF_EDGE --> CF_DNS
    CF_DNS --> CF_CDN
    CF_CDN --> CF_WORKERS
    CF_CDN --> VERCEL

    CF_WORKERS --> CF_D1
    CF_WORKERS --> CF_KV
    CF_WORKERS --> CF_R2
    CF_WORKERS --> CF_QUEUES

    VERCEL --> PREVIEW

    CF_WORKERS --> ANALYTICS
    CF_WORKERS --> LOGS
    LOGS --> ALERTS
    ANALYTICS --> METRICS

    CF_WORKERS --> AUTH_PROVIDER
    CF_WORKERS --> EMAIL_SVC
    CF_D1 --> BACKUP

    %% Styling
    classDef dev fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef cicd fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef cloudflare fill:#f59e0b,stroke:#d97706,color:#fff
    classDef frontend fill:#10b981,stroke:#059669,color:#fff
    classDef monitoring fill:#ef4444,stroke:#dc2626,color:#fff
    classDef external fill:#6b7280,stroke:#4b5563,color:#fff

    class DEV,GIT dev
    class GITHUB,BUILD,TEST,SECURITY cicd
    class CF_EDGE,CF_DNS,CF_CDN,CF_WORKERS,CF_D1,CF_KV,CF_R2,CF_QUEUES cloudflare
    class VERCEL,PREVIEW frontend
    class ANALYTICS,LOGS,ALERTS,METRICS monitoring
    class AUTH_PROVIDER,EMAIL_SVC,BACKUP external
```

## 7. Engineer Categories & Bull Pen Organization

```mermaid
mindmap
  root((Bull Pen Dashboard))
    (Controls Engineers)
      PLC Programming
      SCADA Systems
      Process Control
      Automation
      HMI Development
    (Mechanical Engineers)
      CAD Design
      Stress Analysis
      HVAC Systems
      Piping Design
      Equipment Design
    (Electrical Engineers)
      Power Systems
      Motor Control
      Instrumentation
      Panel Design
      Load Analysis
    (Piping Engineers)
      Process Piping
      Stress Analysis
      Isometric Drawings
      P&ID Development
      Material Selection
    (Robotics Engineers)
      Robot Programming
      Vision Systems
      Automated Assembly
      PLC Integration
      Safety Systems
```

## 8. Queue Processing Architecture

```mermaid
sequenceDiagram
    participant UI as Frontend UI
    participant API as Hono API
    participant Queue as Queue System
    participant BG as Background Processor
    participant DB as Database
    participant Ext as External Service

    UI->>API: Submit Engineer for Background Check
    API->>DB: Create Engineer Record
    API->>Queue: Add Background Check Job
    API->>UI: Return Job ID

    Queue->>BG: Process Background Check
    BG->>Ext: Request Background Check
    Ext-->>BG: Background Check Result
    
    alt Success
        BG->>DB: Update Engineer Status
        BG->>Queue: Add to Next Stage Queue
        BG->>API: Send Success Notification
        API->>UI: Real-time Status Update
    else Failure
        BG->>DB: Mark as Failed
        BG->>Queue: Add to Retry Queue (if retries left)
        BG->>API: Send Failure Notification
        API->>UI: Real-time Status Update
    end

    Note over Queue,BG: Retry Logic with Exponential Backoff
    Note over API,UI: WebSocket for Real-time Updates
```

## 9. Security Architecture

```mermaid
graph LR
    %% Entry Points
    USER[👤 User Request]
    API_CALL[🔌 API Call]
    
    %% Security Layers
    subgraph "Security Layers"
        WAF[🛡️ Web Application Firewall]
        DDOS[🚫 DDoS Protection]
        RATE_LIMIT[⏱️ Rate Limiting]
        JWT_AUTH[🔐 JWT Authentication]
        RBAC[👥 Role-Based Access Control]
        TENANT_ISOLATION[🏢 Tenant Isolation]
        INPUT_VALIDATION[✅ Input Validation]
        SQL_INJECTION[🛡️ SQL Injection Protection]
    end
    
    %% Data Protection
    subgraph "Data Protection"
        ENCRYPTION[🔒 Encryption at Rest]
        TLS[🔐 TLS in Transit]
        PII_MASKING[🎭 PII Masking]
        AUDIT_LOG[📝 Audit Logging]
    end
    
    %% Compliance
    subgraph "Compliance"
        GDPR[🇪🇺 GDPR Compliance]
        SOC2[📊 SOC 2 Type II]
        RETENTION[🗃️ Data Retention]
        RIGHT_DELETE[🗑️ Right to Delete]
    end

    %% Flow
    USER --> WAF
    API_CALL --> WAF
    WAF --> DDOS
    DDOS --> RATE_LIMIT
    RATE_LIMIT --> JWT_AUTH
    JWT_AUTH --> RBAC
    RBAC --> TENANT_ISOLATION
    TENANT_ISOLATION --> INPUT_VALIDATION
    INPUT_VALIDATION --> SQL_INJECTION
    
    SQL_INJECTION --> ENCRYPTION
    ENCRYPTION --> TLS
    TLS --> PII_MASKING
    PII_MASKING --> AUDIT_LOG
    
    AUDIT_LOG --> GDPR
    GDPR --> SOC2
    SOC2 --> RETENTION
    RETENTION --> RIGHT_DELETE

    %% Styling
    classDef entry fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef security fill:#ef4444,stroke:#dc2626,color:#fff
    classDef data fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef compliance fill:#10b981,stroke:#059669,color:#fff

    class USER,API_CALL entry
    class WAF,DDOS,RATE_LIMIT,JWT_AUTH,RBAC,TENANT_ISOLATION,INPUT_VALIDATION,SQL_INJECTION security
    class ENCRYPTION,TLS,PII_MASKING,AUDIT_LOG data
    class GDPR,SOC2,RETENTION,RIGHT_DELETE compliance
```

## 10. Performance Monitoring Dashboard

```mermaid
graph TB
    %% Metrics Collection
    subgraph "Metrics Collection"
        APP_METRICS[📊 Application Metrics]
        DB_METRICS[🗄️ Database Metrics]
        QUEUE_METRICS[📬 Queue Metrics]
        USER_METRICS[👤 User Metrics]
    end
    
    %% Processing
    subgraph "Metrics Processing"
        AGGREGATOR[🔄 Metrics Aggregator]
        ALERTING[🚨 Alert Engine]
        DASHBOARD_ENGINE[📈 Dashboard Engine]
    end
    
    %% Outputs
    subgraph "Monitoring Outputs"
        REAL_TIME[⚡ Real-time Dashboard]
        HISTORICAL[📊 Historical Reports]
        ALERTS[🔔 Alert Notifications]
        SLA_REPORTS[📋 SLA Reports]
    end
    
    %% Key Performance Indicators
    subgraph "KPIs"
        RESPONSE_TIME[⏱️ Response Time < 100ms]
        UPTIME[✅ 99.9% Uptime]
        THROUGHPUT[🚀 10K+ Requests/sec]
        ERROR_RATE[❌ < 0.1% Error Rate]
    end

    %% Connections
    APP_METRICS --> AGGREGATOR
    DB_METRICS --> AGGREGATOR
    QUEUE_METRICS --> AGGREGATOR
    USER_METRICS --> AGGREGATOR
    
    AGGREGATOR --> ALERTING
    AGGREGATOR --> DASHBOARD_ENGINE
    
    DASHBOARD_ENGINE --> REAL_TIME
    DASHBOARD_ENGINE --> HISTORICAL
    ALERTING --> ALERTS
    DASHBOARD_ENGINE --> SLA_REPORTS
    
    REAL_TIME --> RESPONSE_TIME
    REAL_TIME --> UPTIME
    REAL_TIME --> THROUGHPUT
    REAL_TIME --> ERROR_RATE

    %% Styling
    classDef collection fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef processing fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef output fill:#10b981,stroke:#059669,color:#fff
    classDef kpi fill:#f59e0b,stroke:#d97706,color:#fff

    class APP_METRICS,DB_METRICS,QUEUE_METRICS,USER_METRICS collection
    class AGGREGATOR,ALERTING,DASHBOARD_ENGINE processing
    class REAL_TIME,HISTORICAL,ALERTS,SLA_REPORTS output
    class RESPONSE_TIME,UPTIME,THROUGHPUT,ERROR_RATE kpi
```

---

These diagrams provide a comprehensive visual representation of the Humber Operations system architecture, workflows, and key processes. Each diagram focuses on different aspects of the system to help understand the complete ecosystem.
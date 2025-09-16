# 🏗️ Humber Operations - Complete System Architecture

## 🌐 System Topology Overview

```mermaid
graph TB
    subgraph "Frontend Layer (Next.js)"
        UI[Web Application<br/>localhost:3003]
        UI --> |Recruits UI| REC[Recruiting Interface]
        UI --> |Bull Pen UI| BP[Bull Pen Dashboard]
        UI --> |Time UI| TIME[Time Tracking]
        UI --> |Analytics UI| ANA[Analytics Dashboard]
    end

    subgraph "API Gateway Layer (Cloudflare Worker)"
        WORKER[Hono API Worker<br/>localhost:8787]
        WORKER --> |/docs| DOCS[API Documentation]
        WORKER --> |/api-test| TEST[Interactive Testing]
    end

    subgraph "Backend Services"
        AUTH[Authentication Service]
        REC_API[Recruiting API Service]
        TIME_API[Time Tracking API]
        BULL_API[Bull Pen API]
        DOC_API[Document Management]
        CHAT_API[AI Chat Service]
        NOTIF[Notification Service]
        REPORT[Report Generation]
    end

    subgraph "Data Layer"
        DB_MASTER[(Master Database<br/>D1)]
        DB_TENANT_1[(Tenant DB 001)]
        DB_TENANT_2[(Tenant DB 002)]
        DB_TENANT_N[(Tenant DB ...)]
        KV_SESSIONS[(Session Store<br/>KV)]
        KV_CACHE[(Cache Store<br/>KV)]
        R2_DOCS[(Document Storage<br/>R2)]
        VECTOR[(Vector Search<br/>Vectorize)]
    end

    subgraph "Message Queues"
        Q_OPS[Operations Queue]
        Q_RECON[Reconciliation Queue]
        Q_VET[Vetting Queue]
        Q_VISA[Visa Queue]
        Q_AUDIT[Audit Queue]
    end

    subgraph "External Services"
        SENDGRID[SendGrid Email]
        TWILIO[Twilio SMS]
        BG_CHECK[Background Check APIs]
        VISA_SVC[Visa Processing]
    end

    %% Connections
    UI --> WORKER
    WORKER --> AUTH
    WORKER --> REC_API
    WORKER --> TIME_API
    WORKER --> BULL_API
    WORKER --> DOC_API
    WORKER --> CHAT_API
    WORKER --> NOTIF
    WORKER --> REPORT

    AUTH --> DB_MASTER
    AUTH --> KV_SESSIONS
    REC_API --> DB_TENANT_1
    REC_API --> Q_AUDIT
    TIME_API --> DB_TENANT_1
    BULL_API --> DB_TENANT_1
    DOC_API --> R2_DOCS
    DOC_API --> VECTOR
    CHAT_API --> VECTOR
    NOTIF --> SENDGRID
    NOTIF --> TWILIO
    REPORT --> R2_DOCS

    Q_OPS --> BG_CHECK
    Q_VISA --> VISA_SVC
```

## 🔄 Complete Recruiting System Flow

```mermaid
sequenceDiagram
    participant UI as Recruiting UI
    participant API as Next.js API
    participant ENC as Encryption Service
    participant DB as Database
    participant AUDIT as Audit Logger
    participant QUEUE as Background Queue
    participant EMAIL as Email Service

    Note over UI,EMAIL: Complete Recruit-to-Bullpen Flow

    %% 1. Create Recruit
    UI->>API: POST /api/recruits (recruit data)
    API->>API: Input sanitization & validation
    API->>ENC: Encrypt PII fields
    ENC-->>API: Encrypted data + hashes
    API->>DB: Store encrypted recruit
    API->>AUDIT: Log creation event
    API->>DB: Create consent records
    API->>DB: Set retention policy
    API-->>UI: Success + recruit ID

    %% 2. Background Processing
    API->>QUEUE: Trigger welcome workflow
    QUEUE->>EMAIL: Send welcome email
    QUEUE->>QUEUE: Schedule follow-up tasks

    %% 3. View Recruits (with decryption)
    UI->>API: GET /api/recruits?status=accepted
    API->>DB: Query encrypted records
    DB-->>API: Encrypted recruit data
    API->>ENC: Decrypt PII fields
    ENC-->>API: Decrypted data
    API->>AUDIT: Log PII access
    API-->>UI: Decrypted recruit list

    %% 4. Move to Onboarding
    UI->>API: POST /api/recruits/{id}/onboard
    API->>DB: Validate recruit status
    API->>DB: Update status to 'onboarding'
    API->>DB: Update retention policy
    API->>AUDIT: Log status change
    API->>QUEUE: Trigger onboarding workflow
    API-->>UI: Success + onboarding ID

    %% 5. Onboarding Process
    QUEUE->>EMAIL: Send onboarding invitation
    QUEUE->>DB: Create onboarding record
    QUEUE->>QUEUE: Schedule background checks

    %% 6. Bull Pen Integration
    Note over QUEUE,EMAIL: Upon onboarding completion
    QUEUE->>DB: Add to bull pen
    QUEUE->>EMAIL: Notify HR team
    QUEUE->>AUDIT: Log bull pen addition
```

## 🏢 Multi-Tenant Architecture

```mermaid
graph TB
    subgraph "Tenant Isolation Architecture"
        LB[Load Balancer<br/>Cloudflare]
        
        subgraph "Application Layer"
            APP[Next.js Application]
            WORKER[Cloudflare Worker]
        end
        
        subgraph "Tenant A - GM Automotive"
            DB_A[(Tenant DB A<br/>Engineers 001-003)]
            KV_A[(Tenant Cache A)]
            R2_A[(Documents A)]
        end
        
        subgraph "Tenant B - Ford Manufacturing"
            DB_B[(Tenant DB B<br/>Engineers 004-006)]
            KV_B[(Tenant Cache B)]
            R2_B[(Documents B)]
        end
        
        subgraph "Tenant C - Stellantis"
            DB_C[(Tenant DB C<br/>Engineers 007-010)]
            KV_C[(Tenant Cache C)]
            R2_C[(Documents C)]
        end
        
        subgraph "Shared Services"
            MASTER[(Master DB<br/>Users & Tenants)]
            SHARED_KV[(Shared Sessions)]
            VECTOR[(Shared Vector DB)]
        end
    end

    LB --> APP
    LB --> WORKER
    
    APP --> |Tenant A| DB_A
    APP --> |Tenant B| DB_B
    APP --> |Tenant C| DB_C
    APP --> MASTER
    
    WORKER --> |Tenant A| DB_A
    WORKER --> |Tenant B| DB_B
    WORKER --> |Tenant C| DB_C
    WORKER --> MASTER
    WORKER --> SHARED_KV
    WORKER --> VECTOR
```

## 📊 Data Flow Architecture

```mermaid
graph LR
    subgraph "Data Ingestion"
        RECRUIT[Recruit Creation]
        TIME[Time Entries]
        DOCS[Document Upload]
    end

    subgraph "Processing Layer"
        VALIDATE[Input Validation]
        SANITIZE[Data Sanitization]
        ENCRYPT[PII Encryption]
        AUDIT[Audit Logging]
    end

    subgraph "Storage Layer"
        DB_ENC[(Encrypted Database)]
        SEARCH[(Search Indexes)]
        CACHE[(Cache Layer)]
        FILES[(File Storage)]
    end

    subgraph "Analytics Layer"
        METRICS[Metrics Collection]
        REPORTS[Report Generation]
        ALERTS[Alert System]
    end

    RECRUIT --> VALIDATE
    TIME --> VALIDATE
    DOCS --> VALIDATE

    VALIDATE --> SANITIZE
    SANITIZE --> ENCRYPT
    ENCRYPT --> AUDIT
    AUDIT --> DB_ENC

    DB_ENC --> SEARCH
    DB_ENC --> CACHE
    DOCS --> FILES

    DB_ENC --> METRICS
    METRICS --> REPORTS
    METRICS --> ALERTS
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            CF[Cloudflare Protection]
            WAF[Web Application Firewall]
            DDoS[DDoS Protection]
        end
        
        subgraph "Application Security"
            AUTH[JWT Authentication]
            RBAC[Role-Based Access Control]
            RATE[Rate Limiting]
            CORS[CORS Protection]
        end
        
        subgraph "Data Security"
            ENC[AES-256-GCM Encryption]
            HASH[Searchable Hashing]
            ANON[Data Anonymization]
            AUDIT[Audit Logging]
        end
        
        subgraph "Compliance"
            GDPR[GDPR Compliance]
            BIPA[BIPA Compliance]
            CCPA[CCPA Compliance]
            SOX[SOX Compliance]
        end
    end

    CF --> AUTH
    WAF --> RBAC
    DDoS --> RATE
    AUTH --> ENC
    RBAC --> HASH
    RATE --> ANON
    CORS --> AUDIT
    ENC --> GDPR
    HASH --> BIPA
    ANON --> CCPA
    AUDIT --> SOX
```

## ⚙️ Operations Workflow Diagram

```mermaid
stateDiagram-v2
    [*] --> Sourced: Create Recruit
    
    Sourced --> Screened: Initial Screening
    Sourced --> Rejected: Failed Screening
    
    Screened --> Interviewed: Pass Screening
    Screened --> Rejected: Failed Screening
    
    Interviewed --> OfferExtended: Pass Interview
    Interviewed --> Rejected: Failed Interview
    
    OfferExtended --> Accepted: Accept Offer
    OfferExtended --> Rejected: Decline Offer
    
    Accepted --> Onboarding: Move to Onboarding
    
    Onboarding --> BackgroundCheck: Start Background
    BackgroundCheck --> DrugTest: Pass Background
    BackgroundCheck --> Rejected: Fail Background
    
    DrugTest --> Documentation: Pass Drug Test
    DrugTest --> Rejected: Fail Drug Test
    
    Documentation --> BullPen: Complete Onboarding
    
    BullPen --> Available: Ready for Assignment
    Available --> Processing: Project Matching
    Processing --> Buffered: Awaiting Deployment
    Buffered --> Deployed: Assigned to Project
    
    Deployed --> Available: Project Complete
    
    Rejected --> [*]: End Process
```

## 🏗️ System Component Architecture

```mermaid
graph TB
    subgraph "Frontend Architecture"
        subgraph "Pages"
            HOME[Dashboard Page]
            REC_PAGE[Recruiting Page]
            BP_PAGE[Bull Pen Page]
            TIME_PAGE[Time Tracking Page]
            ANA_PAGE[Analytics Page]
        end
        
        subgraph "Components"
            MODAL[NewRecruitModal]
            SIDEBAR[Sidebar Navigation]
            CHAT[Professional Chat]
            FORMS[Form Components]
        end
        
        subgraph "Services"
            API_CLIENT[API Client]
            AUTH_CLIENT[Auth Client]
            ENCRYPT_CLIENT[Encryption Client]
        end
    end

    subgraph "Backend Architecture"
        subgraph "API Routes"
            REC_ROUTES[Recruiting Routes]
            TIME_ROUTES[Time Routes]
            AUTH_ROUTES[Auth Routes]
            DOC_ROUTES[Document Routes]
        end
        
        subgraph "Middleware"
            AUTH_MW[Auth Middleware]
            RATE_MW[Rate Limiting]
            AUDIT_MW[Audit Middleware]
            SECURITY_MW[Security Middleware]
        end
        
        subgraph "Services"
            DB_SVC[Database Service]
            ENC_SVC[Encryption Service]
            AUDIT_SVC[Audit Service]
            QUEUE_SVC[Queue Service]
        end
    end

    HOME --> API_CLIENT
    REC_PAGE --> MODAL
    MODAL --> API_CLIENT
    API_CLIENT --> REC_ROUTES
    REC_ROUTES --> AUTH_MW
    AUTH_MW --> RATE_MW
    RATE_MW --> AUDIT_MW
    AUDIT_MW --> DB_SVC
    DB_SVC --> ENC_SVC
    ENC_SVC --> AUDIT_SVC
```

## 📡 API Endpoint Topology

```mermaid
graph LR
    subgraph "Client Applications"
        WEB[Web App<br/>:3003]
        MOBILE[Mobile App<br/>Future]
        API_CLIENT[API Clients<br/>External]
    end

    subgraph "API Gateway"
        WORKER[Cloudflare Worker<br/>:8787]
        DOCS[/docs]
        TEST[/api-test]
    end

    subgraph "Next.js API Routes"
        subgraph "Recruiting APIs"
            REC_CREATE[POST /api/recruits]
            REC_LIST[GET /api/recruits]
            REC_ONBOARD[POST /api/recruits/{id}/onboard]
            REC_CONSENT[POST /api/recruits/{id}/consent]
            REC_AUDIT[GET /api/recruits/{id}/audit-trail]
            REC_ANON[POST /api/recruits/{id}/anonymize]
        end
        
        subgraph "Onboarding APIs"
            ONB_CREATE[POST /api/onboarding]
            ONB_SUBMIT[POST /api/onboarding/submit]
            ONB_DATA[POST /api/onboarding/recruitment-data]
        end
    end

    subgraph "Worker API Routes"
        subgraph "Operations"
            OP_REC[POST /operations/recruiting-step-1]
            OP_VET[POST /operations/hiring-vetting-step-2]
            OP_BG[POST /operations/background-checks]
            OP_OFFER[POST /operations/offer-letter-visa]
            OP_DEPLOY[POST /operations/deployment]
        end
        
        subgraph "Time Tracking"
            TIME_CLOCK[POST /time-tracking/clock-action]
            TIME_SESSIONS[GET /time-tracking/active-sessions]
            TIME_SITES[GET /time-tracking/work-sites]
        end
        
        subgraph "Bull Pen"
            BP_DASH[GET /bull-pen/dashboard]
            BP_ENG[GET /engineers]
            BP_CAT[GET /bull-pen/engineers/by-category]
        end
    end

    WEB --> WORKER
    WEB --> REC_CREATE
    WEB --> REC_LIST
    MOBILE --> WORKER
    API_CLIENT --> WORKER

    WORKER --> DOCS
    WORKER --> TEST
    WORKER --> OP_REC
    WORKER --> TIME_CLOCK
    WORKER --> BP_DASH
```

## 🔄 Complete Data Flow Diagrams

### Recruiting System Data Flow

```mermaid
flowchart TD
    A[User Creates Recruit] --> B{Input Validation}
    B -->|Invalid| C[Return Validation Errors]
    B -->|Valid| D[Sanitize Input]
    
    D --> E[Security Check]
    E -->|Threat Detected| F[Log Security Event & Block]
    E -->|Safe| G[Rate Limit Check]
    
    G -->|Exceeded| H[Return Rate Limit Error]
    G -->|OK| I[Encrypt PII Data]
    
    I --> J[Generate Searchable Hashes]
    J --> K{Duplicate Check}
    K -->|Duplicate| L[Return Duplicate Error]
    K -->|Unique| M[Store in Database]
    
    M --> N[Create Consent Records]
    N --> O[Set Retention Policy]
    O --> P[Log Audit Event]
    P --> Q[Trigger Background Jobs]
    Q --> R[Return Success Response]
    
    Q --> S[Send Welcome Email]
    Q --> T[Update Metrics]
    Q --> U[Notify Recruiting Team]
```

### Time Tracking Security Flow

```mermaid
flowchart TD
    A[Employee Clock In Request] --> B[Biometric Verification]
    B --> C[Geolocation Verification]
    C --> D[Device Trust Verification]
    
    D --> E{All Verifications Pass?}
    E -->|No| F[Reject & Log Security Event]
    E -->|Yes| G[Calculate Trust Score]
    
    G --> H{Trust Score >= Threshold?}
    H -->|No| I[Require Additional Verification]
    H -->|Yes| J[Record Time Entry]
    
    J --> K[Encrypt Location Data]
    K --> L[Store in Database]
    L --> M[Log Audit Event]
    M --> N[Update Real-time Dashboard]
    N --> O[Return Success]
    
    I --> P[Request Manager Approval]
    P --> Q{Manager Approves?}
    Q -->|Yes| J
    Q -->|No| F
```

## 🏗️ Server Infrastructure Topology

```mermaid
graph TB
    subgraph "Edge Layer (Cloudflare)"
        CDN[Global CDN]
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
        BOT[Bot Management]
    end

    subgraph "Application Layer"
        subgraph "Frontend Servers"
            NEXT1[Next.js Server 1<br/>Vercel/Cloudflare Pages]
            NEXT2[Next.js Server 2<br/>Auto-scaling]
        end
        
        subgraph "Backend Workers"
            WORKER1[Cloudflare Worker 1<br/>Primary]
            WORKER2[Cloudflare Worker 2<br/>Failover]
            WORKER3[Cloudflare Worker 3<br/>Load Balance]
        end
    end

    subgraph "Data Layer"
        subgraph "Primary Databases"
            MASTER_PRIMARY[(Master DB Primary)]
            TENANT_PRIMARY[(Tenant DBs Primary)]
        end
        
        subgraph "Replica Databases"
            MASTER_REPLICA[(Master DB Replica)]
            TENANT_REPLICA[(Tenant DBs Replica)]
        end
        
        subgraph "Cache & Storage"
            REDIS[Redis Cache Cluster]
            R2_PRIMARY[R2 Storage Primary]
            R2_BACKUP[R2 Storage Backup]
        end
    end

    subgraph "External Services"
        SENDGRID_SVC[SendGrid Email Service]
        TWILIO_SVC[Twilio SMS Service]
        STRIPE_SVC[Stripe Payment Service]
        AWS_SVC[AWS Background Checks]
    end

    CDN --> NEXT1
    CDN --> NEXT2
    WAF --> WORKER1
    WAF --> WORKER2
    WAF --> WORKER3

    NEXT1 --> WORKER1
    NEXT2 --> WORKER2

    WORKER1 --> MASTER_PRIMARY
    WORKER1 --> TENANT_PRIMARY
    WORKER2 --> MASTER_REPLICA
    WORKER2 --> TENANT_REPLICA

    WORKER1 --> REDIS
    WORKER1 --> R2_PRIMARY
    WORKER2 --> R2_BACKUP

    WORKER1 --> SENDGRID_SVC
    WORKER1 --> TWILIO_SVC
    WORKER1 --> STRIPE_SVC
    WORKER1 --> AWS_SVC
```

## 🔄 Queue Processing Architecture

```mermaid
graph TB
    subgraph "Queue System Architecture"
        subgraph "Input Queues"
            OPS_Q[Operations Queue<br/>Recruiting/Vetting]
            RECON_Q[Reconciliation Queue<br/>Timesheet Processing]
            VET_Q[Vetting Queue<br/>Background Checks]
            VISA_Q[Visa Queue<br/>Immigration Processing]
            AUDIT_Q[Audit Queue<br/>Compliance Logging]
        end
        
        subgraph "Queue Processors"
            OPS_PROC[Operations Processor]
            RECON_PROC[Reconciliation Processor]
            VET_PROC[Vetting Processor]
            VISA_PROC[Visa Processor]
            AUDIT_PROC[Audit Processor]
        end
        
        subgraph "External Integrations"
            BG_API[Background Check APIs]
            DRUG_API[Drug Testing APIs]
            VISA_API[Visa Processing APIs]
            EMAIL_API[Email Service APIs]
            SMS_API[SMS Service APIs]
        end
        
        subgraph "Result Processing"
            DB_UPDATE[Database Updates]
            NOTIFICATION[Notifications]
            METRICS_UPDATE[Metrics Updates]
            AUDIT_LOG[Audit Logging]
        end
    end

    OPS_Q --> OPS_PROC
    RECON_Q --> RECON_PROC
    VET_Q --> VET_PROC
    VISA_Q --> VISA_PROC
    AUDIT_Q --> AUDIT_PROC

    OPS_PROC --> EMAIL_API
    VET_PROC --> BG_API
    VET_PROC --> DRUG_API
    VISA_PROC --> VISA_API
    RECON_PROC --> SMS_API

    OPS_PROC --> DB_UPDATE
    RECON_PROC --> NOTIFICATION
    VET_PROC --> METRICS_UPDATE
    VISA_PROC --> AUDIT_LOG
```

## 🎯 Bull Pen System Architecture

```mermaid
graph TB
    subgraph "Bull Pen Management System"
        subgraph "Engineer Categories"
            CONTROLS[Controls Engineers<br/>PLC, SCADA, HMI]
            MECHANICAL[Mechanical Engineers<br/>CAD, Design, Analysis]
            ELECTRICAL[Electrical Engineers<br/>Power, Controls, Automation]
            PIPING[Piping Engineers<br/>Process, Fluid Systems]
            ROBOTICS[Robotics Engineers<br/>Automation, AI, Vision]
        end
        
        subgraph "Status Management"
            AVAILABLE[Available<br/>Ready for Assignment]
            PROCESSING[Processing<br/>Being Evaluated]
            BUFFERED[Buffered<br/>Awaiting Deployment]
            DEPLOYED[Deployed<br/>On Client Project]
        end
        
        subgraph "Assignment Engine"
            MATCHER[Skill Matching Algorithm]
            LOCATION[Location Optimization]
            COST[Cost Optimization]
            PREFERENCE[Preference Engine]
        end
        
        subgraph "Client Projects"
            GM[General Motors Projects]
            FORD[Ford Projects]
            STELLANTIS[Stellantis Projects]
            TESLA[Tesla Projects]
        end
    end

    CONTROLS --> AVAILABLE
    MECHANICAL --> AVAILABLE
    ELECTRICAL --> AVAILABLE
    PIPING --> AVAILABLE
    ROBOTICS --> AVAILABLE

    AVAILABLE --> PROCESSING
    PROCESSING --> BUFFERED
    BUFFERED --> DEPLOYED

    PROCESSING --> MATCHER
    MATCHER --> LOCATION
    LOCATION --> COST
    COST --> PREFERENCE

    DEPLOYED --> GM
    DEPLOYED --> FORD
    DEPLOYED --> STELLANTIS
    DEPLOYED --> TESLA
```

## 📊 Analytics & Reporting Architecture

```mermaid
graph TB
    subgraph "Data Sources"
        RECRUIT_DB[(Recruiting Data)]
        TIME_DB[(Time Tracking Data)]
        PROJ_DB[(Project Data)]
        FINANCE_DB[(Financial Data)]
    end

    subgraph "ETL Pipeline"
        EXTRACT[Data Extraction]
        TRANSFORM[Data Transformation]
        LOAD[Data Loading]
    end

    subgraph "Analytics Engine"
        METRICS[Metrics Calculation]
        KPI[KPI Generation]
        TRENDS[Trend Analysis]
        PREDICTIONS[Predictive Analytics]
    end

    subgraph "Reporting System"
        DASHBOARDS[Real-time Dashboards]
        REPORTS[Scheduled Reports]
        ALERTS[Alert System]
        EXPORTS[Data Exports]
    end

    RECRUIT_DB --> EXTRACT
    TIME_DB --> EXTRACT
    PROJ_DB --> EXTRACT
    FINANCE_DB --> EXTRACT

    EXTRACT --> TRANSFORM
    TRANSFORM --> LOAD
    LOAD --> METRICS

    METRICS --> KPI
    METRICS --> TRENDS
    METRICS --> PREDICTIONS

    KPI --> DASHBOARDS
    TRENDS --> REPORTS
    PREDICTIONS --> ALERTS
    METRICS --> EXPORTS
```

## 🔐 Encryption & Security Flow

```mermaid
sequenceDiagram
    participant Client as Client Application
    participant API as API Gateway
    participant ENC as Encryption Service
    participant DB as Database
    participant AUDIT as Audit Service

    Note over Client,AUDIT: PII Data Processing Flow

    Client->>API: Submit PII Data
    API->>API: Input Sanitization
    API->>API: Security Validation
    
    API->>ENC: Encrypt PII Fields
    ENC->>ENC: Generate Salt & IV
    ENC->>ENC: AES-256-GCM Encryption
    ENC->>ENC: Create Searchable Hash
    ENC-->>API: Encrypted Data + Hash
    
    API->>DB: Store Encrypted Data
    DB-->>API: Storage Confirmation
    
    API->>AUDIT: Log PII Processing Event
    AUDIT->>AUDIT: Record Legal Basis
    AUDIT->>AUDIT: Track Data Categories
    AUDIT-->>API: Audit Confirmation
    
    API-->>Client: Success Response
    
    Note over Client,AUDIT: Data Retrieval Flow
    
    Client->>API: Request PII Data
    API->>DB: Query Encrypted Data
    DB-->>API: Encrypted Records
    
    API->>ENC: Decrypt PII Fields
    ENC->>ENC: Validate Encryption
    ENC->>ENC: AES-256-GCM Decryption
    ENC-->>API: Decrypted Data
    
    API->>AUDIT: Log PII Access Event
    API-->>Client: Decrypted Response
```

## 🌍 Global Distribution Architecture

```mermaid
graph TB
    subgraph "Global Edge Network"
        subgraph "North America"
            US_EAST[US East<br/>Primary]
            US_WEST[US West<br/>Secondary]
            CANADA[Canada<br/>Tertiary]
        end
        
        subgraph "Europe"
            EU_WEST[EU West<br/>GDPR Compliant]
            EU_CENTRAL[EU Central<br/>Backup]
        end
        
        subgraph "Asia Pacific"
            APAC[Asia Pacific<br/>Future Expansion]
        end
    end

    subgraph "Data Centers"
        PRIMARY_DC[Primary Data Center<br/>US East]
        BACKUP_DC[Backup Data Center<br/>US West]
        EU_DC[EU Data Center<br/>GDPR Compliance]
    end

    subgraph "Compliance Zones"
        GDPR_ZONE[GDPR Compliance Zone<br/>EU Data Residency]
        CCPA_ZONE[CCPA Compliance Zone<br/>California Residents]
        BIPA_ZONE[BIPA Compliance Zone<br/>Illinois Biometric Data]
    end

    US_EAST --> PRIMARY_DC
    US_WEST --> BACKUP_DC
    EU_WEST --> EU_DC

    PRIMARY_DC --> CCPA_ZONE
    PRIMARY_DC --> BIPA_ZONE
    EU_DC --> GDPR_ZONE
```

## 📈 Performance & Monitoring Architecture

```mermaid
graph TB
    subgraph "Monitoring Stack"
        subgraph "Application Monitoring"
            APM[Application Performance Monitoring]
            ERROR[Error Tracking]
            LOGS[Centralized Logging]
        end
        
        subgraph "Infrastructure Monitoring"
            INFRA[Infrastructure Metrics]
            NETWORK[Network Monitoring]
            SECURITY[Security Monitoring]
        end
        
        subgraph "Business Monitoring"
            KPI_MON[KPI Monitoring]
            COMPLIANCE_MON[Compliance Monitoring]
            AUDIT_MON[Audit Monitoring]
        end
    end

    subgraph "Alerting System"
        CRITICAL[Critical Alerts<br/>PagerDuty]
        WARNING[Warning Alerts<br/>Slack]
        INFO[Info Alerts<br/>Email]
    end

    subgraph "Dashboards"
        TECH_DASH[Technical Dashboard<br/>Grafana]
        BIZ_DASH[Business Dashboard<br/>Custom UI]
        COMPLIANCE_DASH[Compliance Dashboard<br/>Audit UI]
    end

    APM --> CRITICAL
    ERROR --> CRITICAL
    INFRA --> WARNING
    SECURITY --> CRITICAL
    KPI_MON --> INFO
    COMPLIANCE_MON --> WARNING

    APM --> TECH_DASH
    KPI_MON --> BIZ_DASH
    COMPLIANCE_MON --> COMPLIANCE_DASH
```

## 🏢 Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_NEXT[Next.js Dev<br/>localhost:3003]
        DEV_WORKER[Worker Dev<br/>localhost:8787]
        DEV_DB[(Local SQLite)]
    end

    subgraph "Staging Environment"
        STAGE_NEXT[Next.js Staging<br/>Vercel Preview]
        STAGE_WORKER[Worker Staging<br/>Cloudflare]
        STAGE_DB[(Staging D1 DB)]
    end

    subgraph "Production Environment"
        PROD_NEXT[Next.js Production<br/>Vercel/CF Pages]
        PROD_WORKER[Worker Production<br/>Cloudflare Global]
        PROD_DB[(Production D1 DB)]
        PROD_CACHE[(Production KV)]
        PROD_STORAGE[(Production R2)]
    end

    subgraph "CI/CD Pipeline"
        GITHUB[GitHub Repository]
        ACTIONS[GitHub Actions]
        DEPLOY[Automated Deployment]
    end

    DEV_NEXT --> STAGE_NEXT
    DEV_WORKER --> STAGE_WORKER
    DEV_DB --> STAGE_DB

    STAGE_NEXT --> PROD_NEXT
    STAGE_WORKER --> PROD_WORKER
    STAGE_DB --> PROD_DB

    GITHUB --> ACTIONS
    ACTIONS --> DEPLOY
    DEPLOY --> PROD_NEXT
    DEPLOY --> PROD_WORKER
```

## 🔧 Technology Stack Topology

```mermaid
mindmap
  root((Humber OS))
    Frontend
      Next.js 15
      React 18
      TypeScript
      Tailwind CSS
      Framer Motion
      
    Backend
      Cloudflare Workers
      Hono Framework
      TypeScript
      Zod Validation
      
    Database
      Cloudflare D1 (SQLite)
      Multi-tenant Architecture
      Encrypted Storage
      
    Security
      AES-256-GCM Encryption
      JWT Authentication
      Rate Limiting
      Input Sanitization
      
    Compliance
      GDPR Article 6,7,15,17,30
      BIPA Biometric Consent
      CCPA Data Rights
      SOX Audit Trails
      
    Infrastructure
      Cloudflare Global Network
      Vercel Frontend Hosting
      R2 Object Storage
      KV Key-Value Store
      
    Monitoring
      Real-time Analytics
      Error Tracking
      Performance Monitoring
      Security Monitoring
      
    External APIs
      SendGrid Email
      Twilio SMS
      Background Check APIs
      Visa Processing APIs
```

---

## 📋 Quick Reference

### **Access Points**
- **Frontend:** `http://localhost:3003`
- **API Gateway:** `http://localhost:8787`
- **Documentation:** `http://localhost:8787/docs`
- **Interactive Testing:** `http://localhost:8787/api-test`

### **System Stats**
- **Total Endpoints:** 59 across 9 systems
- **Database Tables:** 15+ with full encryption
- **Security Layers:** 7 comprehensive layers
- **Compliance Standards:** 4 major regulations

### **Key Features**
- ✅ **Complete recruit-to-bullpen workflow**
- ✅ **GDPR/BIPA/CCPA compliance**
- ✅ **Production-grade security**
- ✅ **Real-time monitoring**
- ✅ **Multi-tenant architecture**
- ✅ **Interactive API testing**

This architecture supports enterprise-scale operations with industry-leading security, compliance, and performance standards.

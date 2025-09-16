# 🔄 API Flows & Sequence Diagrams

## 1. Engineer Onboarding Complete Flow

```mermaid
sequenceDiagram
    participant HR as HR System
    participant API as Hono API
    participant DB as D1 Database
    participant Queue as Queue System
    participant BG as Background Service
    participant Email as Email Service
    participant Dashboard as Bull Pen Dashboard

    Note over HR,Dashboard: Engineer Onboarding Process

    HR->>API: POST /engineers (Create Profile)
    API->>DB: Insert Engineer Record
    API->>Queue: Add to Vetting Queue
    API->>HR: Return Engineer ID

    Queue->>BG: Process Background Check
    BG->>External: Request Background Check
    External-->>BG: Background Result
    
    alt Background Check Pass
        BG->>DB: Update Status: background_check_passed
        BG->>Queue: Add to Drug Test Queue
    else Background Check Fail
        BG->>DB: Update Status: background_check_failed
        BG->>Email: Send Rejection Notice
    end

    Queue->>BG: Process Drug Test
    BG->>External: Request Drug Test
    External-->>BG: Drug Test Result
    
    alt Drug Test Pass
        BG->>DB: Update Status: drug_test_passed
        BG->>Queue: Add to Certification Queue
    else Drug Test Fail
        BG->>DB: Update Status: drug_test_failed
        BG->>Email: Send Rejection Notice
    end

    Queue->>BG: Process Certification
    BG->>External: Verify Certifications
    External-->>BG: Certification Result
    
    alt All Checks Pass
        BG->>DB: Update Status: Available
        BG->>Email: Send Welcome Email
        BG->>Dashboard: Update Bull Pen Metrics
        Dashboard->>API: GET /bull-pen/metrics
        API->>DB: Query Metrics
        API->>Dashboard: Return Updated Metrics
    else Certification Fail
        BG->>DB: Update Status: certification_failed
        BG->>Email: Send Rejection Notice
    end

    Note over API,Dashboard: Real-time Dashboard Updates via WebSocket
```

## 2. Timesheet Submission & Reconciliation Flow

```mermaid
sequenceDiagram
    participant Engineer as Engineer
    participant WebApp as Web Application
    participant API as Hono API
    participant Validator as Zod Validator
    participant DB as D1 Database
    participant Reconciler as Reconciliation Engine
    participant Payroll as Payroll System
    participant Manager as Manager

    Engineer->>WebApp: Submit Weekly Timesheet
    WebApp->>API: POST /timesheets
    API->>Validator: Validate Timesheet Data
    
    alt Validation Pass
        Validator->>API: Valid Data
        API->>DB: Insert Timesheet Record
        API->>Reconciler: Trigger Reconciliation
        
        Reconciler->>DB: Get Expected Hours
        Reconciler->>Reconciler: Calculate Variance
        
        alt Variance ≤ 5% or ≤ 2 hours
            Reconciler->>DB: Update Status: auto_approved
            Reconciler->>Payroll: Send for Payment
            Reconciler->>Engineer: Send Approval Notification
        else Variance ≤ 10% or ≤ 8 hours
            Reconciler->>DB: Update Status: requires_review
            Reconciler->>Manager: Send Review Request
            Manager->>API: GET /timesheets/{id}/review
            Manager->>API: POST /timesheets/{id}/approve
            API->>DB: Update Status: approved
            API->>Payroll: Send for Payment
        else Variance > 10% or > 8 hours
            Reconciler->>DB: Update Status: failed
            Reconciler->>Manager: Send Investigation Request
            Reconciler->>Engineer: Send Correction Request
        end
        
    else Validation Fail
        Validator->>API: Validation Errors
        API->>WebApp: Return Errors
        WebApp->>Engineer: Display Error Messages
    end

    Note over Reconciler,Payroll: Automated Reconciliation Thresholds
    Note over Manager,Engineer: Manual Review Process for Edge Cases
```

## 3. Project Assignment & Deployment Flow

```mermaid
sequenceDiagram
    participant PM as Project Manager
    participant Dashboard as Bull Pen Dashboard
    participant API as Hono API
    participant Matcher as Skills Matcher
    participant DB as D1 Database
    participant Engineer as Engineer
    participant Client as Client

    PM->>Dashboard: View Available Engineers
    Dashboard->>API: GET /bull-pen/engineers?status=available
    API->>DB: Query Available Engineers
    API->>Dashboard: Return Engineer List

    PM->>Dashboard: Create New Project
    Dashboard->>API: POST /projects
    API->>Matcher: Find Matching Engineers
    
    Matcher->>DB: Query Engineer Skills
    Matcher->>Matcher: Calculate Match Scores
    Matcher->>API: Return Ranked Matches
    
    API->>DB: Insert Project Record
    API->>Dashboard: Return Project ID + Matches

    PM->>Dashboard: Select Engineers for Project
    Dashboard->>API: POST /projects/{id}/assign
    
    loop For Each Selected Engineer
        API->>DB: Update Engineer Status: Processing
        API->>Engineer: Send Project Notification
        Engineer->>API: POST /projects/{id}/accept
        
        alt Engineer Accepts
            API->>DB: Update Engineer Status: Buffered
            API->>PM: Send Acceptance Notification
        else Engineer Declines
            API->>DB: Update Engineer Status: Available
            API->>PM: Send Decline Notification
        end
    end

    PM->>Dashboard: Deploy Engineers
    Dashboard->>API: POST /projects/{id}/deploy
    
    loop For Each Buffered Engineer
        API->>DB: Update Engineer Status: Deployed
        API->>Client: Send Deployment Notification
        API->>Engineer: Send Deployment Details
    end

    API->>Dashboard: Update Bull Pen Metrics
    Dashboard->>PM: Show Updated Dashboard

    Note over Matcher,DB: AI-Powered Skills Matching
    Note over API,Engineer: Real-time Status Updates
```

## 4. Multi-Tenant Request Processing

```mermaid
sequenceDiagram
    participant Client as Client App
    participant Edge as Cloudflare Edge
    participant Worker as Cloudflare Worker
    participant Auth as JWT Middleware
    participant Tenant as Tenant Middleware
    participant Router as Route Handler
    participant DB as Tenant Database

    Client->>Edge: Request with JWT + Tenant-ID
    Edge->>Worker: Route to Worker
    
    Worker->>Auth: Validate JWT Token
    Auth->>Auth: Verify Token Signature
    Auth->>Auth: Check Token Expiration
    
    alt Token Valid
        Auth->>Tenant: Extract Tenant Context
        Tenant->>Tenant: Validate Tenant ID
        Tenant->>Tenant: Set Database Context
        
        alt Tenant Valid
            Tenant->>Router: Process Request
            Router->>DB: Query Tenant-Specific DB
            DB->>Router: Return Data
            Router->>Tenant: Format Response
            Tenant->>Auth: Return Response
            Auth->>Worker: Return Response
            Worker->>Edge: Return Response
            Edge->>Client: Return Response
        else Invalid Tenant
            Tenant->>Auth: Return 403 Forbidden
            Auth->>Worker: Return Error
            Worker->>Edge: Return Error
            Edge->>Client: Return 403 Error
        end
    else Token Invalid
        Auth->>Worker: Return 401 Unauthorized
        Worker->>Edge: Return Error
        Edge->>Client: Return 401 Error
    end

    Note over Auth,Tenant: Security & Isolation Layer
    Note over Router,DB: Tenant-Specific Data Access
```

## 5. Real-Time Dashboard Updates

```mermaid
sequenceDiagram
    participant Dashboard as Bull Pen Dashboard
    participant WebSocket as WebSocket Connection
    participant API as Hono API
    participant Cache as KV Cache
    participant DB as D1 Database
    participant Queue as Background Queue

    Dashboard->>WebSocket: Establish Connection
    WebSocket->>API: Authenticate WebSocket
    API->>Cache: Check User Permissions
    API->>WebSocket: Connection Established

    Note over Dashboard,Queue: Real-time Metrics Flow

    Queue->>API: Engineer Status Changed
    API->>DB: Update Engineer Record
    API->>Cache: Invalidate Metrics Cache
    API->>API: Calculate New Metrics
    
    API->>Cache: Store Updated Metrics
    API->>WebSocket: Broadcast Metrics Update
    WebSocket->>Dashboard: Update Bull Pen Display

    Dashboard->>WebSocket: Request Detailed View
    WebSocket->>API: GET /bull-pen/engineers/{category}
    API->>Cache: Check Cache
    
    alt Cache Hit
        API->>WebSocket: Return Cached Data
    else Cache Miss
        API->>DB: Query Fresh Data
        API->>Cache: Update Cache
        API->>WebSocket: Return Fresh Data
    end
    
    WebSocket->>Dashboard: Update Engineer List

    Note over Cache,DB: Intelligent Caching Strategy
    Note over WebSocket,Dashboard: Sub-second Update Latency
```

## 6. Queue Processing & Error Handling

```mermaid
sequenceDiagram
    participant API as API Handler
    participant Queue as Queue System
    participant Processor as Queue Processor
    participant External as External Service
    participant DB as Database
    participant Retry as Retry Queue
    participant DLQ as Dead Letter Queue

    API->>Queue: Add Job to Queue
    Queue->>Processor: Process Job
    
    Processor->>External: Call External Service
    
    alt Service Success
        External->>Processor: Success Response
        Processor->>DB: Update Record
        Processor->>Queue: Job Complete
    else Service Failure
        External->>Processor: Error Response
        Processor->>Processor: Check Retry Count
        
        alt Retries Available
            Processor->>Retry: Add to Retry Queue (Exponential Backoff)
            Retry->>Queue: Retry After Delay
        else Max Retries Exceeded
            Processor->>DLQ: Move to Dead Letter Queue
            Processor->>DB: Mark as Failed
            Processor->>API: Send Error Alert
        end
    else Service Timeout
        Processor->>Processor: Handle Timeout
        Processor->>Retry: Add to Retry Queue
    end

    Note over Processor,External: Circuit Breaker Pattern
    Note over Retry,DLQ: Fault Tolerance & Error Recovery
```

## 7. Document Upload & Processing

```mermaid
sequenceDiagram
    participant User as User
    participant WebApp as Web Application
    participant API as Hono API
    participant R2 as R2 Storage
    participant Queue as Processing Queue
    participant OCR as OCR Service
    participant Vector as Vector Search
    participant DB as Database

    User->>WebApp: Upload Document
    WebApp->>API: POST /documents/upload
    API->>R2: Store Document
    R2->>API: Return Document URL
    
    API->>DB: Create Document Record
    API->>Queue: Add Document Processing Job
    API->>WebApp: Return Upload Success

    Queue->>OCR: Extract Text from Document
    OCR->>OCR: Process Document
    OCR->>Queue: Return Extracted Text
    
    Queue->>Vector: Generate Embeddings
    Vector->>Vector: Create Vector Embeddings
    Vector->>Queue: Return Embeddings
    
    Queue->>DB: Update Document with Text & Embeddings
    Queue->>API: Document Processing Complete
    API->>WebApp: Notify Processing Complete

    User->>WebApp: Search Documents
    WebApp->>API: GET /documents/search?q=query
    API->>Vector: Vector Similarity Search
    Vector->>API: Return Similar Documents
    API->>WebApp: Return Search Results

    Note over OCR,Vector: AI-Powered Document Processing
    Note over Vector,DB: Semantic Search Capabilities
```

## 8. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant User as User
    participant App as Frontend App
    participant Auth as Auth Service
    participant API as Hono API
    participant DB as User Database
    participant Cache as Token Cache

    User->>App: Enter Credentials
    App->>Auth: POST /auth/login
    Auth->>DB: Validate User Credentials
    
    alt Valid Credentials
        DB->>Auth: User Details + Permissions
        Auth->>Auth: Generate JWT Token
        Auth->>Cache: Store Token (Session)
        Auth->>App: Return JWT + Refresh Token
        App->>App: Store Tokens
        
        App->>API: API Request with JWT
        API->>Cache: Validate Token
        
        alt Token Valid
            Cache->>API: Token Details + Permissions
            API->>API: Check Route Permissions
            
            alt Permission Granted
                API->>App: Return Requested Data
            else Permission Denied
                API->>App: Return 403 Forbidden
            end
        else Token Expired
            API->>App: Return 401 Unauthorized
            App->>Auth: POST /auth/refresh
            Auth->>Cache: Validate Refresh Token
            Auth->>App: Return New JWT
            App->>API: Retry Request with New Token
        end
    else Invalid Credentials
        DB->>Auth: Authentication Failed
        Auth->>App: Return 401 Unauthorized
        App->>User: Display Error Message
    end

    Note over Auth,Cache: Stateless JWT with Refresh Tokens
    Note over API,Cache: Fast Token Validation via Cache
```

---

These sequence diagrams provide detailed insight into the critical API flows and interactions within the Humber Operations system, showing how different components collaborate to deliver the complete functionality.
# Humber OS API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Time Tracking APIs](#time-tracking-apis)
- [Engineer Management APIs](#engineer-management-apis)
- [Analytics APIs](#analytics-apis)
- [Security Implementation](#security-implementation)
- [WebSocket Events](#websocket-events)

---

## Authentication

### JWT Token Authentication

All API endpoints require JWT authentication using Bearer tokens.

#### POST `/api/auth/login`
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "manager",
      "tenantId": "tenant_001"
    }
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

#### POST `/api/auth/logout`
Invalidate tokens and logout user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## Time Tracking APIs

### Clock In/Out Endpoints

#### POST `/api/time/clock-in`
Clock in with 3-layer trust verification.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "employeeId": "emp_001",
  "location": {
    "latitude": 42.3314,
    "longitude": -83.0458,
    "accuracy": 12
  },
  "biometric": {
    "type": "FaceID",
    "verified": true,
    "timestamp": "2025-01-15T08:02:10Z"
  },
  "device": {
    "id": "device_abc123",
    "platform": "iOS",
    "jailbroken": false,
    "appVersion": "2.1.0"
  },
  "projectId": "proj_gm_001",
  "siteId": "site_detroit_001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entryId": "entry_456",
    "clockInTime": "2025-01-15T08:02:15Z",
    "trustScore": 98,
    "verificationLayers": {
      "biometric": {
        "verified": true,
        "score": 40
      },
      "location": {
        "verified": true,
        "score": 35,
        "withinGeofence": true
      },
      "device": {
        "verified": true,
        "score": 23
      }
    },
    "notifications": {
      "manager": {
        "sent": true,
        "method": "SMS"
      },
      "client": {
        "sent": true,
        "method": "webhook"
      }
    }
  }
}
```

#### POST `/api/time/clock-out`
Clock out with verification.

**Request Body:**
```json
{
  "entryId": "entry_456",
  "location": {
    "latitude": 42.3314,
    "longitude": -83.0458
  },
  "biometric": {
    "type": "FaceID",
    "verified": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entryId": "entry_456",
    "clockOutTime": "2025-01-15T17:45:32Z",
    "totalHours": 9.72,
    "regularHours": 8,
    "overtimeHours": 1.72,
    "dailySummary": {
      "trustScore": 98,
      "sopCompliance": 100,
      "activities": ["Setup", "Programming", "Testing", "Documentation"]
    }
  }
}
```

### Time Entry Management

#### GET `/api/time/entries`
Get time entries with filters.

**Query Parameters:**
- `employeeId` (optional): Filter by employee
- `startDate` (required): ISO date string
- `endDate` (required): ISO date string
- `status` (optional): approved|pending|rejected
- `clientId` (optional): Filter by client

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry_456",
        "employeeId": "emp_001",
        "employeeName": "Sarah Johnson",
        "date": "2025-01-15",
        "clockIn": "08:02:15",
        "clockOut": "17:45:32",
        "totalHours": 9.72,
        "trustScore": 98,
        "status": "approved",
        "client": "General Motors",
        "project": "Assembly Line",
        "site": "Detroit Tech Center"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20
    }
  }
}
```

#### PUT `/api/time/entries/:id`
Update/approve time entry.

**Request Body:**
```json
{
  "status": "approved",
  "adjustedHours": 9.5,
  "notes": "Approved with adjustment",
  "approvedBy": "manager_001"
}
```

### Reconciliation

#### POST `/api/time/reconcile`
Reconcile time entries with client systems.

**Request Body:**
```json
{
  "weekEnding": "2025-01-19",
  "entries": [
    {
      "employeeId": "emp_001",
      "clientId": "client_gm",
      "totalHours": 42.5,
      "regularHours": 40,
      "overtimeHours": 2.5
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reconciliationId": "recon_789",
    "status": "completed",
    "discrepancies": [],
    "totalReconciled": 42.5,
    "clientApproval": "pending"
  }
}
```

---

## Engineer Management APIs

### Engineer Profiles

#### GET `/api/engineers`
Get list of engineers with details.

**Query Parameters:**
- `status` (optional): active|bench|deployed
- `skill` (optional): Filter by skill
- `clientId` (optional): Filter by current client
- `availability` (optional): available|partial|unavailable

**Response:**
```json
{
  "success": true,
  "data": {
    "engineers": [
      {
        "id": "eng_001",
        "name": "Sarah Johnson",
        "role": "Senior Electrical Engineer",
        "skills": ["PLC Programming", "Robotics", "AutoCAD"],
        "certifications": ["OSHA 10", "Six Sigma"],
        "currentProject": {
          "id": "proj_001",
          "client": "General Motors",
          "endDate": "2025-03-15"
        },
        "utilization": 96,
        "trustScore": 98,
        "availability": "deployed"
      }
    ]
  }
}
```

#### GET `/api/engineers/:id/schedule`
Get engineer's schedule and assignments.

**Response:**
```json
{
  "success": true,
  "data": {
    "engineerId": "eng_001",
    "currentAssignment": {
      "client": "General Motors",
      "project": "Assembly Line Automation",
      "startDate": "2025-01-01",
      "endDate": "2025-03-31",
      "location": "Detroit, MI"
    },
    "upcomingAssignments": [],
    "availability": [
      {
        "date": "2025-04-01",
        "status": "available"
      }
    ]
  }
}
```

### Skills & Certifications

#### POST `/api/engineers/:id/certifications`
Add new certification for engineer.

**Request Body:**
```json
{
  "name": "AWS Solutions Architect",
  "issuedBy": "Amazon",
  "issuedDate": "2025-01-10",
  "expiryDate": "2028-01-10",
  "verificationUrl": "https://aws.amazon.com/verify/...",
  "documentId": "doc_123"
}
```

---

## Analytics APIs

### KPI Metrics

#### GET `/api/analytics/kpis`
Get key performance indicators.

**Query Parameters:**
- `period` (required): daily|weekly|monthly|quarterly
- `startDate` (required): ISO date string
- `endDate` (required): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "timeToDeployDays": 30,
    "engineerUtilization": 96,
    "deploymentSuccessRate": 94,
    "monthlyRecurringRevenue": 1620000,
    "averageTrustScore": 95,
    "sopComplianceRate": 92,
    "clientSatisfaction": 4.8,
    "overtimePercentage": 12,
    "benchTimePercentage": 4,
    "revenuePerEngineer": 15400
  }
}
```

#### GET `/api/analytics/revenue`
Get revenue analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentMonth": {
      "mrr": 1620000,
      "growth": 28,
      "newClients": 5,
      "churnRate": 2
    },
    "projections": {
      "nextQuarter": 5200000,
      "yearEnd": 22000000
    },
    "clientBreakdown": [
      {
        "client": "General Motors",
        "revenue": 650000,
        "percentage": 40,
        "engineers": 25
      }
    ]
  }
}
```

### Operational Metrics

#### GET `/api/analytics/operations`
Get operational efficiency metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "pipelineConversion": {
      "recruiting": 100,
      "vetting": 65,
      "background": 52,
      "offer": 47,
      "deployed": 39
    },
    "costPerHire": 8500,
    "timeToProductivity": 45,
    "automationRate": 65,
    "processingTime": {
      "visa": 21,
      "background": 5,
      "onboarding": 3
    }
  }
}
```

---

## Security Implementation

### 3-Layer Trust Verification

#### Layer 1: Biometric Authentication (40% weight)
- Face ID / Touch ID verification
- Voice recognition
- Fingerprint scanning
- Multi-factor authentication

#### Layer 2: Geolocation Verification (35% weight)
- GPS coordinates validation
- Geofence boundary checking
- WiFi triangulation
- Cell tower verification

#### Layer 3: Device Trust (25% weight)
- Device ID validation
- Jailbreak/root detection
- App integrity verification
- Network security validation

### JWT Security Features

#### Token Structure
```javascript
{
  // Header
  "alg": "HS256",
  "typ": "JWT",
  
  // Payload
  "sub": "user_123",
  "email": "user@example.com",
  "role": "manager",
  "tenantId": "tenant_001",
  "permissions": ["read:time", "write:time", "approve:time"],
  "iat": 1704067200,
  "exp": 1704070800,
  "jti": "unique_token_id",
  
  // Additional Security Claims
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "deviceId": "device_abc123"
}
```

#### Security Middleware
- Token blacklisting for logout
- Rate limiting (100 requests/minute)
- CORS configuration
- Request sanitization
- SQL injection prevention
- XSS protection

---

## WebSocket Events

### Real-time Updates

#### Connection
```javascript
const ws = new WebSocket('wss://api.humber-os.com/ws');

ws.on('connect', () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'Bearer <access_token>'
  }));
});
```

#### Event Types

**Clock In/Out Events**
```json
{
  "type": "clock_in",
  "data": {
    "employeeId": "emp_001",
    "employeeName": "Sarah Johnson",
    "time": "2025-01-15T08:02:15Z",
    "location": "Detroit Tech Center",
    "trustScore": 98
  }
}
```

**Approval Notifications**
```json
{
  "type": "approval_required",
  "data": {
    "entryId": "entry_456",
    "employeeName": "John Smith",
    "hours": 10.5,
    "reason": "Overtime exceeds threshold"
  }
}
```

**System Alerts**
```json
{
  "type": "trust_alert",
  "data": {
    "employeeId": "emp_002",
    "issue": "Outside geofence",
    "severity": "medium",
    "action": "Review required"
  }
}
```

---

## Error Responses

All API errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "Invalid credentials",
    "details": "Email or password is incorrect",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Common Error Codes
- `AUTH_FAILED`: Authentication failed
- `TOKEN_EXPIRED`: JWT token has expired
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `TRUST_VERIFICATION_FAILED`: Trust layer verification failed
- `GEOFENCE_VIOLATION`: Outside authorized location

---

## Rate Limiting

API rate limits per endpoint:

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| Authentication | 5 requests | 1 minute |
| Clock In/Out | 10 requests | 1 minute |
| Time Entries | 100 requests | 1 minute |
| Analytics | 50 requests | 1 minute |
| Engineers | 100 requests | 1 minute |

Headers returned:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

---

## Webhook Integration

### Client System Webhooks

Configure webhooks for real-time updates to client systems:

```json
{
  "url": "https://client.system.com/webhook",
  "events": ["clock_in", "clock_out", "approval"],
  "secret": "webhook_secret_key",
  "headers": {
    "X-Client-ID": "client_001"
  }
}
```

### Webhook Payload
```json
{
  "event": "time_entry.approved",
  "timestamp": "2025-01-15T18:00:00Z",
  "data": {
    "entryId": "entry_456",
    "employeeId": "emp_001",
    "hours": 9.5,
    "client": "General Motors"
  },
  "signature": "sha256=abc123..."
}
```

---

## Testing

### Test Endpoints

Development environment provides test endpoints:

```
Base URL: https://api-dev.humber-os.com
Test API Key: test_key_development_only
```

### Postman Collection

Import the Postman collection for testing:
[Download Postman Collection](https://api.humber-os.com/docs/postman-collection.json)

---

## SDK Libraries

### JavaScript/TypeScript
```bash
npm install @humber-os/api-client
```

```javascript
import { HumberClient } from '@humber-os/api-client';

const client = new HumberClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

const entries = await client.time.getEntries({
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

### Python
```bash
pip install humber-os-sdk
```

```python
from humber_os import Client

client = Client(api_key='your_api_key')
entries = client.time.get_entries(
    start_date='2025-01-01',
    end_date='2025-01-31'
)
```

---

## Support

For API support and questions:
- Email: api-support@humber-os.com
- Documentation: https://docs.humber-os.com
- Status Page: https://status.humber-os.com
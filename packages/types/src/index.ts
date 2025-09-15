export * from './engineer';
export * from './operations';
export * from './timesheets';
export * from './bull-pen';
export * from './multi-tenant';
export * from './documents';

// Enhanced Environment Interface with Multi-Tenant Support
export interface Env {
  // Databases
  DB: D1Database;
  DB_MASTER: D1Database;
  DB_ENGINEER_001: D1Database;
  DB_ENGINEER_002: D1Database;
  DB_ENGINEER_003: D1Database;
  DB_ENGINEER_004: D1Database;
  DB_ENGINEER_005: D1Database;
  DB_ENGINEER_006: D1Database;
  DB_ENGINEER_007: D1Database;
  DB_ENGINEER_008: D1Database;
  DB_ENGINEER_009: D1Database;
  DB_ENGINEER_010: D1Database;
  
  // KV Namespaces
  KV_CACHE: KVNamespace;
  KV_TENANT_CACHE: KVNamespace;
  KV_SESSIONS: KVNamespace;
  
  // Queues
  OPERATIONS_QUEUE: Queue;
  RECONCILIATION_QUEUE: Queue;
  TENANT_QUEUE: Queue;
  VETTING_QUEUE: Queue;
  VISA_QUEUE: Queue;
  
  // Storage
  DOCUMENTS: R2Bucket;
  
  // Vectorize
  VECTORIZE_INDEX: VectorizeIndex;
  
  // Environment variables
  ENVIRONMENT?: string;
  API_VERSION?: string;
  LOG_LEVEL?: string;
}
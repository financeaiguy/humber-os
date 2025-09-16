// Cloudflare Workers types
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
    exec(query: string): Promise<D1ExecResult>;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = any>(colName?: string): Promise<T>;
    run(): Promise<D1Result>;
    all<T = any>(): Promise<D1Result<T>>;
  }

  interface D1Result<T = any> {
    results?: T[];
    success: boolean;
    error?: string;
    meta: {
      changes: number;
      duration: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
    };
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }

  interface KVNamespace {
    get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
    put(key: string, value: string | ArrayBuffer | ReadableStream, options?: any): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: any): Promise<any>;
  }

  interface Queue {
    send(message: any, options?: { delaySeconds?: number }): Promise<void>;
    sendBatch(messages: any[]): Promise<void>;
  }

  interface R2Bucket {
    get(key: string): Promise<R2Object | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | string): Promise<R2Object>;
    delete(key: string): Promise<void>;
    list(options?: any): Promise<R2Objects>;
  }

  interface R2Object {
    key: string;
    size: number;
    etag: string;
    httpEtag: string;
    uploaded: Date;
    body: ReadableStream;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json(): Promise<any>;
  }

  interface R2Objects {
    objects: R2Object[];
    truncated: boolean;
    cursor?: string;
  }

  interface VectorizeIndex {
    query(vector: number[], options?: any): Promise<any>;
    insert(vectors: any[]): Promise<any>;
    upsert(vectors: any[]): Promise<any>;
    deleteByIds(ids: string[]): Promise<any>;
  }
}

export * from './engineer';
export * from './operations';
export * from './timesheets';
export * from './bull-pen';
export * from './multi-tenant';
export * from './documents';
export * from './time-tracking';
export * from './auth';
export * from './onboarding';
export * from './notifications';
export * from './reports';
// export * from './tooltips'; // Temporarily disabled due to UserRole conflict

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
  
  // Third-party service keys
  SENDGRID_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_NUMBER?: string;
}
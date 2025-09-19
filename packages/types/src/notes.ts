// Note Management System Types

export type NoteAction = 'pause' | 'flag' | 'general' | 'compliance' | 'security' | 'performance';

export type NotePriority = 'low' | 'medium' | 'high' | 'critical';

export type NoteStatus = 'active' | 'resolved' | 'archived';

export interface Note {
  // Core identification
  id: string;
  action: NoteAction;
  content: string;

  // User associations
  authorId: string;
  authorName: string;
  authorRole: string;

  // Target associations
  targetId: string; // Employee/candidate ID
  targetName: string;
  targetType: 'employee' | 'candidate' | 'project' | 'task';

  // Metadata
  priority: NotePriority;
  status: NoteStatus;
  tags: string[];

  // Timestamps
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  resolvedAt?: string; // ISO 8601

  // Additional context
  relatedEntityId?: string; // Project, department, etc.
  relatedEntityType?: string;
  followUpRequired: boolean;
  followUpDate?: string; // ISO 8601

  // Audit trail
  resolvedBy?: string;
  resolvedByName?: string;
  resolutionNote?: string;
}

export interface NoteCreateRequest {
  action: NoteAction;
  content: string;
  targetId: string;
  targetName: string;
  targetType: 'employee' | 'candidate' | 'project' | 'task';
  priority?: NotePriority;
  tags?: string[];
  relatedEntityId?: string;
  relatedEntityType?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface NoteUpdateRequest {
  content?: string;
  priority?: NotePriority;
  status?: NoteStatus;
  tags?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
  resolutionNote?: string;
}

export interface NoteQuery {
  // Filters
  action?: NoteAction;
  authorId?: string;
  targetId?: string;
  targetType?: string;
  priority?: NotePriority;
  status?: NoteStatus;
  tags?: string[];

  // Date ranges
  createdAfter?: string;
  createdBefore?: string;

  // Pagination
  limit?: number;
  offset?: number;

  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface NoteResponse {
  notes: Note[];
  total: number;
  hasMore: boolean;
}

// KV Storage Keys
export interface NoteKVKeys {
  // Primary storage: note:{noteId}
  note: (noteId: string) => string;

  // Index by author: notes:author:{authorId}
  byAuthor: (authorId: string) => string;

  // Index by target: notes:target:{targetType}:{targetId}
  byTarget: (targetType: string, targetId: string) => string;

  // Index by action: notes:action:{action}
  byAction: (action: NoteAction) => string;

  // Index by priority: notes:priority:{priority}
  byPriority: (priority: NotePriority) => string;

  // Index by status: notes:status:{status}
  byStatus: (status: NoteStatus) => string;

  // Index by date: notes:date:{YYYY-MM-DD}
  byDate: (date: string) => string;

  // Analytics: notes:stats:{targetType}:{period}
  stats: (targetType: string, period: string) => string;
}

export const noteKVKeys: NoteKVKeys = {
  note: (noteId: string) => `note:${noteId}`,
  byAuthor: (authorId: string) => `notes:author:${authorId}`,
  byTarget: (targetType: string, targetId: string) => `notes:target:${targetType}:${targetId}`,
  byAction: (action: NoteAction) => `notes:action:${action}`,
  byPriority: (priority: NotePriority) => `notes:priority:${priority}`,
  byStatus: (status: NoteStatus) => `notes:status:${status}`,
  byDate: (date: string) => `notes:date:${date}`,
  stats: (targetType: string, period: string) => `notes:stats:${targetType}:${period}`
};

// Utility functions for note management
export interface NoteUtilities {
  generateNoteId: () => string;
  validateNote: (note: Partial<Note>) => boolean;
  formatNoteForDisplay: (note: Note) => string;
  calculatePriority: (action: NoteAction, content: string) => NotePriority;
  extractTags: (content: string) => string[];
  getExpirationTime: (action: NoteAction) => number; // TTL in seconds
}

// Integration with existing onboarding system
export interface OnboardingNote extends Note {
  targetType: 'employee' | 'candidate';
  onboardingPhase?: string;
  onboardingStep?: string;
  blocksProgress: boolean;
  escalationLevel: number;
}
import {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
  NoteQuery,
  NoteResponse,
  noteKVKeys,
  NoteAction,
  NotePriority,
  NoteStatus,
  OnboardingNote
} from '@humber/types';

export class NoteStorageService {
  constructor(private kvNotes: KVNamespace) {}

  /**
   * Generate a unique note ID
   */
  private generateNoteId(): string {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current timestamp in ISO format
   */
  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Calculate TTL based on note action
   */
  private getNoteTTL(action: NoteAction): number {
    const ttlMap: Record<NoteAction, number> = {
      'pause': 30 * 24 * 60 * 60, // 30 days
      'flag': 90 * 24 * 60 * 60, // 90 days
      'general': 180 * 24 * 60 * 60, // 180 days
      'compliance': 365 * 24 * 60 * 60, // 1 year
      'security': 365 * 24 * 60 * 60, // 1 year
      'performance': 90 * 24 * 60 * 60 // 90 days
    };
    return ttlMap[action] || 180 * 24 * 60 * 60; // Default 180 days
  }

  /**
   * Auto-calculate priority based on action and content
   */
  private calculatePriority(action: NoteAction, content: string): NotePriority {
    // Security and compliance are always high priority
    if (action === 'security' || action === 'compliance') {
      return 'critical';
    }

    // Flag actions are typically high priority
    if (action === 'flag') {
      return 'high';
    }

    // Pause actions are medium priority
    if (action === 'pause') {
      return 'medium';
    }

    // Content-based priority detection
    const urgentKeywords = ['urgent', 'critical', 'emergency', 'immediately', 'asap'];
    const highKeywords = ['important', 'priority', 'escalate', 'review'];

    const contentLower = content.toLowerCase();

    if (urgentKeywords.some(keyword => contentLower.includes(keyword))) {
      return 'critical';
    }

    if (highKeywords.some(keyword => contentLower.includes(keyword))) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string): string[] {
    const tagPattern = /#(\w+)/g;
    const matches = content.match(tagPattern);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  }

  /**
   * Create a new note
   */
  async createNote(
    request: NoteCreateRequest,
    authorId: string,
    authorName: string,
    authorRole: string
  ): Promise<Note> {
    const noteId = this.generateNoteId();
    const timestamp = this.getCurrentTimestamp();

    const note: Note = {
      id: noteId,
      action: request.action,
      content: request.content,
      authorId,
      authorName,
      authorRole,
      targetId: request.targetId,
      targetName: request.targetName,
      targetType: request.targetType,
      priority: request.priority || this.calculatePriority(request.action, request.content),
      status: 'active',
      tags: request.tags || this.extractTags(request.content),
      createdAt: timestamp,
      updatedAt: timestamp,
      relatedEntityId: request.relatedEntityId,
      relatedEntityType: request.relatedEntityType,
      followUpRequired: request.followUpRequired || false,
      followUpDate: request.followUpDate
    };

    // Store the note
    const ttl = this.getNoteTTL(note.action);
    await this.kvNotes.put(noteKVKeys.note(noteId), JSON.stringify(note), { expirationTtl: ttl });

    // Update indexes
    await this.updateIndexes(note, 'create');

    return note;
  }

  /**
   * Get a note by ID
   */
  async getNote(noteId: string): Promise<Note | null> {
    const noteData = await this.kvNotes.get(noteKVKeys.note(noteId));
    return noteData ? JSON.parse(noteData) : null;
  }

  /**
   * Update a note
   */
  async updateNote(noteId: string, updates: NoteUpdateRequest, updatedBy: string): Promise<Note | null> {
    const existingNote = await this.getNote(noteId);
    if (!existingNote) {
      return null;
    }

    const updatedNote: Note = {
      ...existingNote,
      ...updates,
      updatedAt: this.getCurrentTimestamp(),
      resolvedAt: updates.status === 'resolved' ? this.getCurrentTimestamp() : existingNote.resolvedAt,
      resolvedBy: updates.status === 'resolved' ? updatedBy : existingNote.resolvedBy,
      resolvedByName: updates.status === 'resolved' ? updatedBy : existingNote.resolvedByName,
      resolutionNote: updates.resolutionNote || existingNote.resolutionNote
    };

    // Store updated note
    const ttl = this.getNoteTTL(updatedNote.action);
    await this.kvNotes.put(noteKVKeys.note(noteId), JSON.stringify(updatedNote), { expirationTtl: ttl });

    // Update indexes if necessary
    if (updates.status !== existingNote.status) {
      await this.updateIndexes(updatedNote, 'update', existingNote);
    }

    return updatedNote;
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<boolean> {
    const note = await this.getNote(noteId);
    if (!note) {
      return false;
    }

    await this.kvNotes.delete(noteKVKeys.note(noteId));
    await this.updateIndexes(note, 'delete');

    return true;
  }

  /**
   * Query notes with filters
   */
  async queryNotes(query: NoteQuery = {}): Promise<NoteResponse> {
    const limit = Math.min(query.limit || 50, 100); // Max 100 results
    const offset = query.offset || 0;

    // Start with a base key for iteration
    let indexKey: string;

    // Choose the most specific index
    if (query.targetId && query.targetType) {
      indexKey = noteKVKeys.byTarget(query.targetType, query.targetId);
    } else if (query.authorId) {
      indexKey = noteKVKeys.byAuthor(query.authorId);
    } else if (query.action) {
      indexKey = noteKVKeys.byAction(query.action);
    } else if (query.status) {
      indexKey = noteKVKeys.byStatus(query.status);
    } else {
      // Default to getting all notes with a general prefix
      indexKey = 'note:';
    }

    // Get the note IDs from the index
    const noteIds = await this.getNotesFromIndex(indexKey);

    // Fetch all notes
    const notes: Note[] = [];
    for (const noteId of noteIds) {
      const note = await this.getNote(noteId);
      if (note && this.matchesQuery(note, query)) {
        notes.push(note);
      }
    }

    // Sort notes
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    notes.sort((a, b) => {
      const aValue = new Date(a[sortBy] as string).getTime();
      const bValue = new Date(b[sortBy] as string).getTime();
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Apply pagination
    const paginatedNotes = notes.slice(offset, offset + limit);

    return {
      notes: paginatedNotes,
      total: notes.length,
      hasMore: offset + limit < notes.length
    };
  }

  /**
   * Get notes for a specific target (employee/candidate)
   */
  async getNotesForTarget(targetType: string, targetId: string): Promise<Note[]> {
    return (await this.queryNotes({
      targetType,
      targetId,
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })).notes;
  }

  /**
   * Get unresolved notes for an author
   */
  async getUnresolvedNotes(authorId: string): Promise<Note[]> {
    return (await this.queryNotes({
      authorId,
      status: 'active',
      sortBy: 'priority',
      sortOrder: 'desc'
    })).notes;
  }

  /**
   * Get notes requiring follow-up
   */
  async getFollowUpNotes(beforeDate?: string): Promise<Note[]> {
    const query: NoteQuery = {
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'asc'
    };

    const allNotes = await this.queryNotes(query);

    return allNotes.notes.filter(note => {
      if (!note.followUpRequired || !note.followUpDate) return false;
      if (beforeDate) {
        return note.followUpDate <= beforeDate;
      }
      return true;
    });
  }

  /**
   * Update indexes for efficient querying
   */
  private async updateIndexes(note: Note, operation: 'create' | 'update' | 'delete', oldNote?: Note): Promise<void> {
    const noteId = note.id;
    const ttl = this.getNoteTTL(note.action);

    if (operation === 'create') {
      // Add to indexes
      await this.addToIndex(noteKVKeys.byAuthor(note.authorId), noteId, ttl);
      await this.addToIndex(noteKVKeys.byTarget(note.targetType, note.targetId), noteId, ttl);
      await this.addToIndex(noteKVKeys.byAction(note.action), noteId, ttl);
      await this.addToIndex(noteKVKeys.byStatus(note.status), noteId, ttl);
      await this.addToIndex(noteKVKeys.byDate(note.createdAt.split('T')[0]), noteId, ttl);
    } else if (operation === 'update' && oldNote) {
      // Remove from old status index, add to new
      if (oldNote.status !== note.status) {
        await this.removeFromIndex(noteKVKeys.byStatus(oldNote.status), noteId);
        await this.addToIndex(noteKVKeys.byStatus(note.status), noteId, ttl);
      }
    } else if (operation === 'delete') {
      // Remove from all indexes
      await this.removeFromIndex(noteKVKeys.byAuthor(note.authorId), noteId);
      await this.removeFromIndex(noteKVKeys.byTarget(note.targetType, note.targetId), noteId);
      await this.removeFromIndex(noteKVKeys.byAction(note.action), noteId);
      await this.removeFromIndex(noteKVKeys.byStatus(note.status), noteId);
      await this.removeFromIndex(noteKVKeys.byDate(note.createdAt.split('T')[0]), noteId);
    }
  }

  /**
   * Add note ID to an index
   */
  private async addToIndex(indexKey: string, noteId: string, ttl: number): Promise<void> {
    const existing = await this.kvNotes.get(indexKey);
    const noteIds = existing ? JSON.parse(existing) : [];
    if (!noteIds.includes(noteId)) {
      noteIds.push(noteId);
      await this.kvNotes.put(indexKey, JSON.stringify(noteIds), { expirationTtl: ttl });
    }
  }

  /**
   * Remove note ID from an index
   */
  private async removeFromIndex(indexKey: string, noteId: string): Promise<void> {
    const existing = await this.kvNotes.get(indexKey);
    if (existing) {
      const noteIds: string[] = JSON.parse(existing);
      const filtered = noteIds.filter(id => id !== noteId);
      if (filtered.length > 0) {
        await this.kvNotes.put(indexKey, JSON.stringify(filtered));
      } else {
        await this.kvNotes.delete(indexKey);
      }
    }
  }

  /**
   * Get note IDs from an index
   */
  private async getNotesFromIndex(indexKey: string): Promise<string[]> {
    const data = await this.kvNotes.get(indexKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Check if a note matches the query filters
   */
  private matchesQuery(note: Note, query: NoteQuery): boolean {
    if (query.action && note.action !== query.action) return false;
    if (query.authorId && note.authorId !== query.authorId) return false;
    if (query.targetId && note.targetId !== query.targetId) return false;
    if (query.targetType && note.targetType !== query.targetType) return false;
    if (query.priority && note.priority !== query.priority) return false;
    if (query.status && note.status !== query.status) return false;

    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some(tag => note.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    if (query.createdAfter && note.createdAt < query.createdAfter) return false;
    if (query.createdBefore && note.createdAt > query.createdBefore) return false;

    return true;
  }

  /**
   * Create an onboarding-specific note
   */
  async createOnboardingNote(
    request: NoteCreateRequest & {
      onboardingPhase?: string;
      onboardingStep?: string;
      blocksProgress?: boolean;
      escalationLevel?: number;
    },
    authorId: string,
    authorName: string,
    authorRole: string
  ): Promise<OnboardingNote> {
    const baseNote = await this.createNote(request, authorId, authorName, authorRole);

    const onboardingNote: OnboardingNote = {
      ...baseNote,
      targetType: request.targetType as 'employee' | 'candidate',
      onboardingPhase: request.onboardingPhase,
      onboardingStep: request.onboardingStep,
      blocksProgress: request.blocksProgress || false,
      escalationLevel: request.escalationLevel || 0
    };

    // Update the stored note with onboarding-specific fields
    const ttl = this.getNoteTTL(onboardingNote.action);
    await this.kvNotes.put(noteKVKeys.note(onboardingNote.id), JSON.stringify(onboardingNote), { expirationTtl: ttl });

    return onboardingNote;
  }

  /**
   * Get analytics for notes
   */
  async getNoteAnalytics(targetType: string, period: string = 'month'): Promise<any> {
    const statsKey = noteKVKeys.stats(targetType, period);
    const stats = await this.kvNotes.get(statsKey);

    if (stats) {
      return JSON.parse(stats);
    }

    // Calculate fresh stats
    const endDate = new Date();
    const startDate = new Date();

    if (period === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    const notes = await this.queryNotes({
      targetType,
      createdAfter: startDate.toISOString(),
      createdBefore: endDate.toISOString()
    });

    const analytics = {
      total: notes.total,
      byAction: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      averageResolutionTime: 0,
      period,
      generatedAt: this.getCurrentTimestamp()
    };

    // Calculate statistics
    notes.notes.forEach(note => {
      analytics.byAction[note.action] = (analytics.byAction[note.action] || 0) + 1;
      analytics.byPriority[note.priority] = (analytics.byPriority[note.priority] || 0) + 1;
      analytics.byStatus[note.status] = (analytics.byStatus[note.status] || 0) + 1;
    });

    // Cache the analytics for 1 hour
    await this.kvNotes.put(statsKey, JSON.stringify(analytics), { expirationTtl: 3600 });

    return analytics;
  }
}
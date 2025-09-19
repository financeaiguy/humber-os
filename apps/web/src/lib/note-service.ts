import {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
  NoteQuery,
  NoteResponse,
  NoteAction,
  NotePriority,
  NoteStatus
} from '@humber/types';

export class NoteService {
  private baseUrl: string;

  constructor() {
    // Use the worker API endpoint
    this.baseUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';
  }

  /**
   * Get authorization headers
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    // In a real app, you'd get the auth token from your session/auth system
    return {
      'Content-Type': 'application/json',
      // Add authorization header here when implementing actual auth
      // 'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Make an authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/api/notes${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Request failed');
    }

    return result.data;
  }

  /**
   * Create a new note
   */
  async createNote(request: NoteCreateRequest): Promise<Note> {
    return this.makeRequest<Note>('/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
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
    }
  ): Promise<Note> {
    return this.makeRequest<Note>('/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get a specific note by ID
   */
  async getNote(noteId: string): Promise<Note> {
    return this.makeRequest<Note>(`/${noteId}`);
  }

  /**
   * Update a note
   */
  async updateNote(noteId: string, updates: NoteUpdateRequest): Promise<Note> {
    return this.makeRequest<Note>(`/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    await this.makeRequest<void>(`/${noteId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Query notes with filters
   */
  async queryNotes(query: NoteQuery = {}): Promise<NoteResponse> {
    const params = new URLSearchParams();

    if (query.action) params.append('action', query.action);
    if (query.authorId) params.append('authorId', query.authorId);
    if (query.targetId) params.append('targetId', query.targetId);
    if (query.targetType) params.append('targetType', query.targetType);
    if (query.priority) params.append('priority', query.priority);
    if (query.status) params.append('status', query.status);
    if (query.tags) params.append('tags', query.tags.join(','));
    if (query.createdAfter) params.append('createdAfter', query.createdAfter);
    if (query.createdBefore) params.append('createdBefore', query.createdBefore);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';

    return this.makeRequest<NoteResponse>(endpoint);
  }

  /**
   * Get notes for a specific target (employee/candidate)
   */
  async getNotesForTarget(targetType: string, targetId: string): Promise<Note[]> {
    return this.makeRequest<Note[]>(`/target/${targetType}/${targetId}`);
  }

  /**
   * Get unresolved notes for the current user
   */
  async getUnresolvedNotes(): Promise<Note[]> {
    return this.makeRequest<Note[]>('/unresolved');
  }

  /**
   * Get notes requiring follow-up
   */
  async getFollowUpNotes(beforeDate?: string): Promise<Note[]> {
    const params = beforeDate ? `?before=${beforeDate}` : '';
    return this.makeRequest<Note[]>(`/follow-up${params}`);
  }

  /**
   * Resolve a note
   */
  async resolveNote(noteId: string, resolutionNote?: string): Promise<Note> {
    return this.makeRequest<Note>(`/${noteId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNote }),
    });
  }

  /**
   * Get note analytics
   */
  async getNoteAnalytics(targetType: string, period: string = 'month'): Promise<any> {
    return this.makeRequest<any>(`/analytics/${targetType}?period=${period}`);
  }

  /**
   * Helper method to create a pause note for onboarding
   */
  async createPauseNote(
    targetId: string,
    targetName: string,
    reason: string,
    onboardingPhase?: string,
    onboardingStep?: string
  ): Promise<Note> {
    return this.createOnboardingNote({
      action: 'pause',
      content: reason,
      targetId,
      targetName,
      targetType: 'employee',
      priority: 'medium',
      onboardingPhase,
      onboardingStep,
      blocksProgress: true,
      escalationLevel: 1,
    });
  }

  /**
   * Helper method to create a flag note for onboarding
   */
  async createFlagNote(
    targetId: string,
    targetName: string,
    issue: string,
    onboardingPhase?: string,
    onboardingStep?: string
  ): Promise<Note> {
    return this.createOnboardingNote({
      action: 'flag',
      content: issue,
      targetId,
      targetName,
      targetType: 'employee',
      priority: 'high',
      onboardingPhase,
      onboardingStep,
      blocksProgress: true,
      escalationLevel: 2,
    });
  }

  /**
   * Helper method to get all notes for an employee
   */
  async getEmployeeNotes(employeeId: string): Promise<Note[]> {
    return this.getNotesForTarget('employee', employeeId);
  }

  /**
   * Helper method to get all notes for a candidate
   */
  async getCandidateNotes(candidateId: string): Promise<Note[]> {
    return this.getNotesForTarget('candidate', candidateId);
  }

  /**
   * Helper method to get recent notes
   */
  async getRecentNotes(limit: number = 10): Promise<Note[]> {
    const response = await this.queryNotes({
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    return response.notes;
  }

  /**
   * Helper method to get high priority notes
   */
  async getHighPriorityNotes(): Promise<Note[]> {
    const response = await this.queryNotes({
      priority: 'high',
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    return response.notes;
  }

  /**
   * Helper method to get critical notes
   */
  async getCriticalNotes(): Promise<Note[]> {
    const response = await this.queryNotes({
      priority: 'critical',
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    return response.notes;
  }

  /**
   * Helper method to search notes by content
   */
  async searchNotes(searchTerm: string, filters: Partial<NoteQuery> = {}): Promise<Note[]> {
    // Note: This is a client-side search. In a real app, you'd want server-side search
    const response = await this.queryNotes({
      ...filters,
      limit: 100, // Get more results for searching
    });

    const searchLower = searchTerm.toLowerCase();
    return response.notes.filter(note =>
      note.content.toLowerCase().includes(searchLower) ||
      note.targetName.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Helper method to bulk resolve notes
   */
  async bulkResolveNotes(noteIds: string[], resolutionNote?: string): Promise<Note[]> {
    const promises = noteIds.map(id => this.resolveNote(id, resolutionNote));
    return Promise.all(promises);
  }

  /**
   * Helper method to get notes dashboard data
   */
  async getDashboardData(): Promise<{
    unresolved: Note[];
    followUp: Note[];
    critical: Note[];
    recent: Note[];
    stats: {
      total: number;
      unresolved: number;
      critical: number;
      followUp: number;
    };
  }> {
    const [unresolved, followUp, critical, recent] = await Promise.all([
      this.getUnresolvedNotes(),
      this.getFollowUpNotes(),
      this.getCriticalNotes(),
      this.getRecentNotes(5),
    ]);

    return {
      unresolved,
      followUp,
      critical,
      recent,
      stats: {
        total: recent.length, // This would be better calculated server-side
        unresolved: unresolved.length,
        critical: critical.length,
        followUp: followUp.length,
      },
    };
  }
}

// Export a singleton instance
export const noteService = new NoteService();
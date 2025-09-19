import { Hono } from 'hono';
import { Env, Note, NoteCreateRequest, NoteUpdateRequest, NoteQuery } from '@humber/types';
import { NoteStorageService } from '../lib/note-storage';
import { authenticateRequest } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limiter';

const notes = new Hono<{ Bindings: Env }>();

// Apply authentication middleware to all routes
notes.use('*', authenticateRequest);

// Apply rate limiting
notes.use('*', rateLimiter({ windowMs: 60000, maxRequests: 100 }));

/**
 * GET /notes - Query notes with filters
 */
notes.get('/', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');

    // Parse query parameters
    const query: NoteQuery = {
      action: c.req.query('action') as any,
      authorId: c.req.query('authorId'),
      targetId: c.req.query('targetId'),
      targetType: c.req.query('targetType'),
      priority: c.req.query('priority') as any,
      status: c.req.query('status') as any,
      tags: c.req.query('tags')?.split(','),
      createdAfter: c.req.query('createdAfter'),
      createdBefore: c.req.query('createdBefore'),
      limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined,
      offset: c.req.query('offset') ? parseInt(c.req.query('offset')!) : undefined,
      sortBy: c.req.query('sortBy') as any,
      sortOrder: c.req.query('sortOrder') as any
    };

    // Apply role-based access control
    // Regular users can only see their own notes unless they have admin privileges
    if (user.role !== 'PARTNER_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
      query.authorId = user.id;
    }

    const result = await noteStorage.queryNotes(query);

    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Failed to query notes:', error);
    return c.json({
      success: false,
      error: 'Failed to query notes'
    }, 500);
  }
});

/**
 * GET /notes/:id - Get a specific note
 */
notes.get('/:id', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');
    const noteId = c.req.param('id');

    const note = await noteStorage.getNote(noteId);

    if (!note) {
      return c.json({
        success: false,
        error: 'Note not found'
      }, 404);
    }

    // Check access permissions
    if (user.role !== 'PARTNER_ADMIN' && user.role !== 'SYSTEM_ADMIN' && note.authorId !== user.id) {
      return c.json({
        success: false,
        error: 'Access denied'
      }, 403);
    }

    return c.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Failed to get note:', error);
    return c.json({
      success: false,
      error: 'Failed to get note'
    }, 500);
  }
});

/**
 * POST /notes - Create a new note
 */
notes.post('/', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');
    const requestData = await c.req.json();

    // Validate required fields
    const createRequest: NoteCreateRequest = {
      action: requestData.action,
      content: requestData.content,
      targetId: requestData.targetId,
      targetName: requestData.targetName,
      targetType: requestData.targetType,
      priority: requestData.priority,
      tags: requestData.tags,
      relatedEntityId: requestData.relatedEntityId,
      relatedEntityType: requestData.relatedEntityType,
      followUpRequired: requestData.followUpRequired,
      followUpDate: requestData.followUpDate
    };

    // Validate required fields
    if (!createRequest.action || !createRequest.content || !createRequest.targetId || !createRequest.targetName || !createRequest.targetType) {
      return c.json({
        success: false,
        error: 'Missing required fields: action, content, targetId, targetName, targetType'
      }, 400);
    }

    let note: Note;

    // Check if this is an onboarding note
    if (requestData.onboardingPhase || requestData.onboardingStep || requestData.blocksProgress !== undefined) {
      note = await noteStorage.createOnboardingNote(
        {
          ...createRequest,
          onboardingPhase: requestData.onboardingPhase,
          onboardingStep: requestData.onboardingStep,
          blocksProgress: requestData.blocksProgress,
          escalationLevel: requestData.escalationLevel
        },
        user.id,
        user.name,
        user.role
      );
    } else {
      note = await noteStorage.createNote(
        createRequest,
        user.id,
        user.name,
        user.role
      );
    }

    return c.json({
      success: true,
      data: note
    }, 201);
  } catch (error) {
    console.error('Failed to create note:', error);
    return c.json({
      success: false,
      error: 'Failed to create note'
    }, 500);
  }
});

/**
 * PUT /notes/:id - Update a note
 */
notes.put('/:id', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');
    const noteId = c.req.param('id');
    const updateData = await c.req.json();

    // Check if note exists and user has permission
    const existingNote = await noteStorage.getNote(noteId);
    if (!existingNote) {
      return c.json({
        success: false,
        error: 'Note not found'
      }, 404);
    }

    // Check permissions - only author or admin can update
    if (user.role !== 'PARTNER_ADMIN' && user.role !== 'SYSTEM_ADMIN' && existingNote.authorId !== user.id) {
      return c.json({
        success: false,
        error: 'Access denied'
      }, 403);
    }

    const updateRequest: NoteUpdateRequest = {
      content: updateData.content,
      priority: updateData.priority,
      status: updateData.status,
      tags: updateData.tags,
      followUpRequired: updateData.followUpRequired,
      followUpDate: updateData.followUpDate,
      resolutionNote: updateData.resolutionNote
    };

    const updatedNote = await noteStorage.updateNote(noteId, updateRequest, user.id);

    if (!updatedNote) {
      return c.json({
        success: false,
        error: 'Failed to update note'
      }, 500);
    }

    return c.json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    console.error('Failed to update note:', error);
    return c.json({
      success: false,
      error: 'Failed to update note'
    }, 500);
  }
});

/**
 * DELETE /notes/:id - Delete a note
 */
notes.delete('/:id', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');
    const noteId = c.req.param('id');

    // Check if note exists and user has permission
    const existingNote = await noteStorage.getNote(noteId);
    if (!existingNote) {
      return c.json({
        success: false,
        error: 'Note not found'
      }, 404);
    }

    // Check permissions - only author or admin can delete
    if (user.role !== 'PARTNER_ADMIN' && user.role !== 'SYSTEM_ADMIN' && existingNote.authorId !== user.id) {
      return c.json({
        success: false,
        error: 'Access denied'
      }, 403);
    }

    const deleted = await noteStorage.deleteNote(noteId);

    if (!deleted) {
      return c.json({
        success: false,
        error: 'Failed to delete note'
      }, 500);
    }

    return c.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return c.json({
      success: false,
      error: 'Failed to delete note'
    }, 500);
  }
});

/**
 * GET /notes/target/:type/:id - Get notes for a specific target
 */
notes.get('/target/:type/:id', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');
    const targetType = c.req.param('type');
    const targetId = c.req.param('id');

    const notes = await noteStorage.getNotesForTarget(targetType, targetId);

    // Apply role-based filtering
    let filteredNotes = notes;
    if (user.role !== 'PARTNER_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
      filteredNotes = notes.filter(note => note.authorId === user.id);
    }

    return c.json({
      success: true,
      data: filteredNotes
    });
  } catch (error) {
    console.error('Failed to get notes for target:', error);
    return c.json({
      success: false,
      error: 'Failed to get notes for target'
    }, 500);
  }
});

/**
 * GET /notes/unresolved - Get unresolved notes for the current user
 */
notes.get('/unresolved', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');

    const notes = await noteStorage.getUnresolvedNotes(user.id);

    return c.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Failed to get unresolved notes:', error);
    return c.json({
      success: false,
      error: 'Failed to get unresolved notes'
    }, 500);
  }
});

/**
 * GET /notes/follow-up - Get notes requiring follow-up
 */
notes.get('/follow-up', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');
    const beforeDate = c.req.query('before'); // Optional: get follow-ups before this date

    const notes = await noteStorage.getFollowUpNotes(beforeDate);

    // Apply role-based filtering
    let filteredNotes = notes;
    if (user.role !== 'PARTNER_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
      filteredNotes = notes.filter(note => note.authorId === user.id);
    }

    return c.json({
      success: true,
      data: filteredNotes
    });
  } catch (error) {
    console.error('Failed to get follow-up notes:', error);
    return c.json({
      success: false,
      error: 'Failed to get follow-up notes'
    }, 500);
  }
});

/**
 * GET /notes/analytics/:targetType - Get note analytics
 */
notes.get('/analytics/:targetType', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');
    const targetType = c.req.param('targetType');
    const period = c.req.query('period') || 'month';

    // Only admins can view analytics
    if (user.role !== 'PARTNER_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
      return c.json({
        success: false,
        error: 'Access denied'
      }, 403);
    }

    const analytics = await noteStorage.getNoteAnalytics(targetType, period);

    return c.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Failed to get note analytics:', error);
    return c.json({
      success: false,
      error: 'Failed to get note analytics'
    }, 500);
  }
});

/**
 * POST /notes/:id/resolve - Resolve a note
 */
notes.post('/:id/resolve', async (c) => {
  try {
    const noteStorage = new NoteStorageService(c.env.KV_NOTES);
    const user = c.get('user');
    const noteId = c.req.param('id');
    const requestData = await c.req.json();

    const updateRequest: NoteUpdateRequest = {
      status: 'resolved',
      resolutionNote: requestData.resolutionNote
    };

    const updatedNote = await noteStorage.updateNote(noteId, updateRequest, user.id);

    if (!updatedNote) {
      return c.json({
        success: false,
        error: 'Note not found or failed to resolve'
      }, 404);
    }

    return c.json({
      success: true,
      data: updatedNote,
      message: 'Note resolved successfully'
    });
  } catch (error) {
    console.error('Failed to resolve note:', error);
    return c.json({
      success: false,
      error: 'Failed to resolve note'
    }, 500);
  }
});

export default notes;
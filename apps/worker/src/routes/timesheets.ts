import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, lte } from 'drizzle-orm';
import type { Env } from '@humber/types';
import {
  TimesheetReconcileSchema,
  TimesheetBatchReconcileSchema,
} from '@humber/types';
import { timesheets, candidates } from '@humber/database';
import { generateTimesheetId, Logger, parseISODate } from '@humber/utils';

const timesheetsRouter = new Hono<{ Bindings: Env }>();

timesheetsRouter.post('/reconcile', async (c) => {
  const logger = new Logger('timesheet-reconcile');
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = TimesheetReconcileSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    const timesheetId = input.timesheetId || generateTimesheetId();
    
    const candidate = await db.select()
      .from(candidates)
      .where(and(
        eq(candidates.id, input.candidateId),
        eq(candidates.tenantId, input.tenantId)
      ))
      .limit(1);
    
    if (!candidate.length) {
      return c.json({ error: 'Candidate not found' }, 404);
    }
    
    if (candidate[0].status !== 'deployed') {
      return c.json({ 
        error: 'Candidate must be deployed to submit timesheets',
        currentStatus: candidate[0].status 
      }, 400);
    }
    
    const weekStart = parseISODate(input.weekStartDate).getTime();
    const weekEnd = parseISODate(input.weekEndDate).getTime();
    
    const existingTimesheet = await db.select()
      .from(timesheets)
      .where(eq(timesheets.id, timesheetId))
      .limit(1);

    if (existingTimesheet.length > 0) {
      await db.update(timesheets)
        .set({
          hoursWorked: input.hoursWorked,
          status: 'reconciled',
          reconciledAt: Date.now(),
          updatedAt: Date.now(),
        })
        .where(eq(timesheets.id, timesheetId));
    } else {
      await db.insert(timesheets).values({
        id: timesheetId,
        tenantId: input.tenantId,
        candidateId: input.candidateId,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        hoursWorked: input.hoursWorked,
        status: 'reconciled',
        reconciledAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    const totalAmount = input.hourlyRate 
      ? input.hoursWorked * input.hourlyRate 
      : input.hoursWorked * 50;
    
    await c.env.KV_CACHE.put(
      `timesheet:${tenantId}:${timesheetId}`,
      JSON.stringify({
        ...input,
        timesheetId,
        totalAmount,
        reconciledAt: new Date().toISOString(),
      }),
      { expirationTtl: 2592000 }
    );
    
    logger.info('Timesheet reconciled', { 
      timesheetId,
      candidateId: input.candidateId,
      hoursWorked: input.hoursWorked 
    });
    
    return c.json({
      success: true,
      timesheetId,
      candidateId: input.candidateId,
      weekStartDate: input.weekStartDate,
      weekEndDate: input.weekEndDate,
      hoursWorked: input.hoursWorked,
      totalAmount,
      status: 'reconciled',
      message: 'Timesheet reconciled successfully',
    });
  } catch (error) {
    logger.error('Error reconciling timesheet', error);
    return c.json({ error: 'Failed to reconcile timesheet' }, 500);
  }
});

timesheetsRouter.post('/batch-reconcile', async (c) => {
  const logger = new Logger('batch-reconcile');
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = TimesheetBatchReconcileSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    const results = [];
    
    for (const timesheet of input.timesheets) {
      try {
        const timesheetId = timesheet.timesheetId || generateTimesheetId();
        const weekStart = parseISODate(timesheet.weekStartDate).getTime();
        const weekEnd = parseISODate(timesheet.weekEndDate).getTime();
        
        const existingTimesheet = await db.select()
          .from(timesheets)
          .where(eq(timesheets.id, timesheetId))
          .limit(1);

        if (existingTimesheet.length > 0) {
          await db.update(timesheets)
            .set({
              hoursWorked: timesheet.hoursWorked,
              status: 'reconciled',
              reconciledAt: Date.now(),
              updatedAt: Date.now(),
            })
            .where(eq(timesheets.id, timesheetId));
        } else {
          await db.insert(timesheets).values({
            id: timesheetId,
            tenantId: timesheet.tenantId,
            candidateId: timesheet.candidateId,
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            hoursWorked: timesheet.hoursWorked,
            status: 'reconciled',
            reconciledAt: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        
        results.push({
          timesheetId,
          candidateId: timesheet.candidateId,
          status: 'success',
        });
      } catch (error) {
        logger.error('Error processing timesheet in batch', error);
        results.push({
          candidateId: timesheet.candidateId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    
    logger.info('Batch reconciliation completed', { 
      total: input.timesheets.length,
      success: successCount,
      failed: failedCount 
    });
    
    return c.json({
      success: true,
      message: `Batch reconciliation completed: ${successCount} success, ${failedCount} failed`,
      results,
      summary: {
        total: input.timesheets.length,
        success: successCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    logger.error('Error in batch reconciliation', error);
    return c.json({ error: 'Failed to process batch reconciliation' }, 500);
  }
});

timesheetsRouter.get('/candidate/:candidateId', async (c) => {
  const logger = new Logger('get-candidate-timesheets');
  const tenantId = c.get('tenantId') as string;
  const candidateId = c.req.param('candidateId');
  
  try {
    const db = drizzle(c.env.DB);
    
    const candidateTimesheets = await db.select()
      .from(timesheets)
      .where(and(
        eq(timesheets.candidateId, candidateId),
        eq(timesheets.tenantId, tenantId)
      ))
      .orderBy(timesheets.weekStartDate);
    
    const totalHours = candidateTimesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0);
    
    logger.info('Retrieved candidate timesheets', { 
      candidateId,
      count: candidateTimesheets.length 
    });
    
    return c.json({
      success: true,
      candidateId,
      timesheets: candidateTimesheets,
      summary: {
        totalTimesheets: candidateTimesheets.length,
        totalHoursWorked: totalHours,
      },
    });
  } catch (error) {
    logger.error('Error retrieving candidate timesheets', error);
    return c.json({ error: 'Failed to retrieve timesheets' }, 500);
  }
});

timesheetsRouter.get('/period', async (c) => {
  const logger = new Logger('get-period-timesheets');
  const tenantId = c.get('tenantId') as string;
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  
  if (!startDate || !endDate) {
    return c.json({ error: 'startDate and endDate query parameters are required' }, 400);
  }
  
  try {
    const db = drizzle(c.env.DB);
    const start = parseISODate(startDate).getTime();
    const end = parseISODate(endDate).getTime();
    
    const periodTimesheets = await db.select()
      .from(timesheets)
      .where(and(
        eq(timesheets.tenantId, tenantId),
        gte(timesheets.weekStartDate, start),
        lte(timesheets.weekEndDate, end)
      ))
      .orderBy(timesheets.weekStartDate);
    
    const totalHours = periodTimesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0);
    const uniqueCandidates = new Set(periodTimesheets.map(ts => ts.candidateId)).size;
    
    logger.info('Retrieved period timesheets', { 
      startDate,
      endDate,
      count: periodTimesheets.length 
    });
    
    return c.json({
      success: true,
      period: {
        startDate,
        endDate,
      },
      timesheets: periodTimesheets,
      summary: {
        totalTimesheets: periodTimesheets.length,
        totalHoursWorked: totalHours,
        uniqueCandidates,
      },
    });
  } catch (error) {
    logger.error('Error retrieving period timesheets', error);
    return c.json({ error: 'Failed to retrieve timesheets' }, 500);
  }
});

export { timesheetsRouter };
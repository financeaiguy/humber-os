import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, or } from 'drizzle-orm';
import type { Env } from '@humber/types';
import {
  TimesheetSubmissionSchema,
  CustomerTimesheetSchema,
  TimesheetReconciliationSchema,
  SpreadsheetUploadSchema,
  HumanReviewSchema,
  ReconciliationRules,
} from '@humber/types';
import { 
  engineers, 
  timesheetsReconciliation,
  reconciliationAuditLog 
} from '@humber/database';
import { generateId, Logger, parseISODate } from '@humber/utils';

const reconciliationRouter = new Hono<{ Bindings: Env }>();
const logger = new Logger('timesheet-reconciliation');

/**
 * Core business problem solver:
 * "How much time did they work?" vs "How much time did customer say they work?"
 * This function automatically reconciles or flags for human review
 */
async function reconcileHours(
  engineerHours: number,
  customerHours: number
): Promise<{
  needsReview: boolean;
  reconciledHours: number;
  difference: number;
  reason?: string;
}> {
  const difference = Math.abs(engineerHours - customerHours);
  const percentDifference = (difference / engineerHours) * 100;

  // Auto-approve if within acceptable thresholds
  if (
    difference <= ReconciliationRules.AUTO_APPROVE_THRESHOLD_HOURS ||
    percentDifference <= ReconciliationRules.AUTO_APPROVE_THRESHOLD_PERCENT
  ) {
    return {
      needsReview: false,
      reconciledHours: engineerHours, // Default to engineer's hours when close
      difference,
      reason: 'Auto-approved: within threshold',
    };
  }

  // Flag for human review if difference is significant
  if (
    difference >= ReconciliationRules.REVIEW_REQUIRED_HOURS ||
    percentDifference >= ReconciliationRules.REVIEW_REQUIRED_PERCENT
  ) {
    return {
      needsReview: true,
      reconciledHours: 0, // No reconciliation until human review
      difference,
      reason: `Human review required: ${difference} hours difference (${percentDifference.toFixed(1)}%)`,
    };
  }

  // Middle ground: use average
  return {
    needsReview: false,
    reconciledHours: (engineerHours + customerHours) / 2,
    difference,
    reason: 'Auto-reconciled: averaged hours',
  };
}

// Engineer submits their timesheet
reconciliationRouter.post('/submit', async (c) => {
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = TimesheetSubmissionSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    const timesheetId = generateId('ts');
    
    // For demo purposes, simulate successful engineer lookup
    // In production, this would query the actual database
    const mockEngineer = {
      id: input.engineerId,
      name: 'Demo Engineer',
      tenantId: tenantId,
      status: 'deployed'
    };
    
    logger.info('Demo engineer timesheet submission', { 
      engineerId: input.engineerId,
      tenantId 
    });
    
    // Create or update timesheet
    const weekStart = parseISODate(input.weekStartDate).getTime();
    const weekEnd = parseISODate(input.weekEndDate).getTime();
    
    // For demo purposes, simulate successful timesheet creation
    // In production, this would check for existing and create/update database records
    logger.info('Demo timesheet creation', {
      timesheetId,
      engineerId: input.engineerId,
      weekStart: input.weekStartDate,
      weekEnd: input.weekEndDate,
      hours: input.engineerHours
    });
    
    logger.info('Engineer timesheet submitted', {
      timesheetId,
      engineerId: input.engineerId,
      hours: input.engineerHours,
    });
    
    return c.json({
      success: true,
      timesheetId,
      message: 'Timesheet submitted successfully',
      status: 'pending',
      awaitingCustomerHours: true,
    });
  } catch (error) {
    logger.error('Error submitting engineer timesheet', error);
    return c.json({ error: 'Failed to submit timesheet' }, 500);
  }
});

// Customer submits their hours (individual)
reconciliationRouter.post('/customer-hours', async (c) => {
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = CustomerTimesheetSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    
    // For demo purposes, simulate successful customer hours processing
    const engineerId = input.engineerId || 'demo_engineer_001';
    
    // Mock existing timesheet data
    const mockTimesheet = {
      id: 'ts_demo_001',
      engineerId: engineerId,
      engineerHours: 40.0, // Demo engineer hours
      tenantId: tenantId
    };
    
    // Simulate reconciliation logic
    const reconciliation = {
      needsReview: Math.abs(mockTimesheet.engineerHours - input.customerHours) > 2,
      reconciledHours: Math.abs(mockTimesheet.engineerHours - input.customerHours) <= 2 
        ? mockTimesheet.engineerHours 
        : (mockTimesheet.engineerHours + input.customerHours) / 2,
      difference: Math.abs(mockTimesheet.engineerHours - input.customerHours),
      reason: Math.abs(mockTimesheet.engineerHours - input.customerHours) <= 2 
        ? 'Auto-approved: within threshold' 
        : 'Reconciled with average hours'
    };
    
    logger.info('Demo customer hours reconciliation', {
      engineerId,
      customerHours: input.customerHours,
      engineerHours: mockTimesheet.engineerHours,
      reconciliation
    });
    
    // Update timesheet with customer hours and reconciliation
    await db.update(timesheetsReconciliation)
      .set({
        customerHours: input.customerHours,
        customerName: input.customerName,
        difference: reconciliation.difference,
        reconciledHours: reconciliation.reconciledHours,
        humanInLoop: reconciliation.needsReview,
        status: reconciliation.needsReview ? 'needs_review' : 'auto_reconciled',
        updatedAt: Date.now(),
      })
      .where(eq(timesheetsReconciliation.id, ts.id));
    
    // Log the reconciliation
    await db.insert(reconciliationAuditLog).values({
      id: generateId('audit'),
      tenantId,
      timesheetId: ts.id,
      action: reconciliation.needsReview ? 'flagged_for_review' : 'auto_reconciled',
      performedBy: 'system',
      previousEngineerHours: ts.engineerHours,
      previousCustomerHours: null,
      newEngineerHours: ts.engineerHours,
      newCustomerHours: input.customerHours,
      reason: reconciliation.reason,
      createdAt: Date.now(),
    });
    
    // If needs review, send to queue
    if (reconciliation.needsReview) {
      await c.env.RECONCILIATION_QUEUE.send({
        type: 'human_review_required',
        timesheetId: ts.id,
        engineerId,
        engineerHours: ts.engineerHours,
        customerHours: input.customerHours,
        difference: reconciliation.difference,
        tenantId,
      });
      
      logger.warn('Timesheet flagged for human review', {
        timesheetId: ts.id,
        difference: reconciliation.difference,
      });
    }
    
    return c.json({
      success: true,
      timesheetId: ts.id,
      reconciliation: {
        engineerHours: ts.engineerHours,
        customerHours: input.customerHours,
        difference: reconciliation.difference,
        reconciledHours: reconciliation.reconciledHours,
        needsHumanReview: reconciliation.needsReview,
        status: reconciliation.needsReview ? 'needs_review' : 'auto_reconciled',
        reason: reconciliation.reason,
      },
    });
  } catch (error) {
    logger.error('Error processing customer hours', error);
    return c.json({ error: 'Failed to process customer hours' }, 500);
  }
});

// Upload and parse customer spreadsheet
reconciliationRouter.post('/upload-spreadsheet', async (c) => {
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = SpreadsheetUploadSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    const weekStart = parseISODate(input.weekStartDate).getTime();
    const results = [];
    
    for (const row of input.spreadsheetData) {
      try {
        // Find engineer
        let engineerId = row.engineerId;
        if (!engineerId && row.engineerEmail) {
          const engineer = await db.select()
            .from(engineers)
            .where(and(
              eq(engineers.email, row.engineerEmail),
              eq(engineers.tenantId, tenantId)
            ))
            .limit(1);
          
          if (engineer.length > 0) {
            engineerId = engineer[0].id;
          }
        }
        
        if (!engineerId) {
          results.push({
            engineerIdentifier: row.engineerEmail || row.engineerName,
            status: 'failed',
            error: 'Engineer not found',
          });
          continue;
        }
        
        // Find or create timesheet
        const existing = await db.select()
          .from(timesheetsReconciliation)
          .where(and(
            eq(timesheetsReconciliation.engineerId, engineerId),
            eq(timesheetsReconciliation.weekStartDate, weekStart),
            eq(timesheetsReconciliation.tenantId, tenantId)
          ))
          .limit(1);
        
        if (existing.length > 0) {
          const ts = existing[0];
          
          // Reconcile if engineer hours exist
          if (ts.engineerHours !== null) {
            const reconciliation = await reconcileHours(
              ts.engineerHours,
              row.hoursWorked
            );
            
            await db.update(timesheetsReconciliation)
              .set({
                customerHours: row.hoursWorked,
                customerName: input.customerName,
                customerSpreadsheet: JSON.stringify(row),
                difference: reconciliation.difference,
                reconciledHours: reconciliation.reconciledHours,
                humanInLoop: reconciliation.needsReview,
                status: reconciliation.needsReview ? 'needs_review' : 'auto_reconciled',
                hourlyRate: row.rate,
                updatedAt: Date.now(),
              })
              .where(eq(timesheetsReconciliation.id, ts.id));
            
            if (reconciliation.needsReview) {
              await c.env.RECONCILIATION_QUEUE.send({
                type: 'human_review_required',
                timesheetId: ts.id,
                engineerId,
                engineerHours: ts.engineerHours,
                customerHours: row.hoursWorked,
                difference: reconciliation.difference,
                tenantId,
              });
            }
            
            results.push({
              engineerId,
              timesheetId: ts.id,
              status: reconciliation.needsReview ? 'needs_review' : 'reconciled',
              difference: reconciliation.difference,
            });
          } else {
            // No engineer hours yet, just store customer hours
            await db.update(timesheetsReconciliation)
              .set({
                customerHours: row.hoursWorked,
                customerName: input.customerName,
                customerSpreadsheet: JSON.stringify(row),
                hourlyRate: row.rate,
                updatedAt: Date.now(),
              })
              .where(eq(timesheetsReconciliation.id, ts.id));
            
            results.push({
              engineerId,
              timesheetId: ts.id,
              status: 'awaiting_engineer_hours',
            });
          }
        } else {
          // Create new timesheet with customer hours only
          const timesheetId = generateId('ts');
          
          await db.insert(timesheetsReconciliation).values({
            id: timesheetId,
            tenantId,
            engineerId,
            weekStartDate: weekStart,
            weekEndDate: parseISODate(input.weekEndDate).getTime(),
            engineerHours: 0, // Will be updated when engineer submits
            customerHours: row.hoursWorked,
            customerName: input.customerName,
            customerSpreadsheet: JSON.stringify(row),
            difference: null,
            reconciledHours: null,
            humanInLoop: false,
            status: 'pending',
            projectCode: row.projectCode,
            hourlyRate: row.rate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          
          results.push({
            engineerId,
            timesheetId,
            status: 'created_awaiting_engineer',
          });
        }
      } catch (error) {
        logger.error('Error processing spreadsheet row', error);
        results.push({
          engineerIdentifier: row.engineerEmail || row.engineerName,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Store the spreadsheet in R2
    const spreadsheetId = generateId('spreadsheet');
    await c.env.DOCUMENTS.put(
      `${tenantId}/spreadsheets/${spreadsheetId}.json`,
      JSON.stringify({
        uploadedAt: new Date().toISOString(),
        customerName: input.customerName,
        weekStartDate: input.weekStartDate,
        weekEndDate: input.weekEndDate,
        data: input.spreadsheetData,
        processingResults: results,
      })
    );
    
    const successCount = results.filter(r => 
      r.status === 'reconciled' || r.status === 'awaiting_engineer_hours'
    ).length;
    const reviewCount = results.filter(r => r.status === 'needs_review').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    
    logger.info('Spreadsheet processed', {
      total: results.length,
      success: successCount,
      review: reviewCount,
      failed: failedCount,
    });
    
    return c.json({
      success: true,
      message: 'Spreadsheet processed successfully',
      summary: {
        total: results.length,
        reconciled: successCount,
        needsReview: reviewCount,
        failed: failedCount,
      },
      results,
      spreadsheetId,
    });
  } catch (error) {
    logger.error('Error processing spreadsheet', error);
    return c.json({ error: 'Failed to process spreadsheet' }, 500);
  }
});

// Human review and approval
reconciliationRouter.post('/human-review', async (c) => {
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = HumanReviewSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    
    // Get the timesheet
    const timesheet = await db.select()
      .from(timesheetsReconciliation)
      .where(and(
        eq(timesheetsReconciliation.id, input.timesheetId),
        eq(timesheetsReconciliation.tenantId, tenantId)
      ))
      .limit(1);
    
    if (!timesheet.length) {
      return c.json({ error: 'Timesheet not found' }, 404);
    }
    
    const ts = timesheet[0];
    
    // Calculate final hours based on resolution
    let finalHours = input.approvedHours;
    if (input.resolution === 'approve_engineer') {
      finalHours = ts.engineerHours;
    } else if (input.resolution === 'approve_customer') {
      finalHours = ts.customerHours || 0;
    } else if (input.resolution === 'split_difference') {
      finalHours = (ts.engineerHours + (ts.customerHours || 0)) / 2;
    }
    
    // Update timesheet
    await db.update(timesheetsReconciliation)
      .set({
        reconciledHours: finalHours,
        humanInLoop: false,
        humanReviewedBy: input.reviewedBy,
        humanReviewedAt: Date.now(),
        humanReviewNotes: input.reviewNotes,
        status: 'human_approved',
        totalAmount: ts.hourlyRate ? finalHours * ts.hourlyRate : null,
        updatedAt: Date.now(),
      })
      .where(eq(timesheetsReconciliation.id, input.timesheetId));
    
    // Log the review
    await db.insert(reconciliationAuditLog).values({
      id: generateId('audit'),
      tenantId,
      timesheetId: input.timesheetId,
      action: 'human_reviewed',
      performedBy: input.reviewedBy,
      previousEngineerHours: ts.engineerHours,
      previousCustomerHours: ts.customerHours,
      newEngineerHours: ts.engineerHours,
      newCustomerHours: ts.customerHours,
      reason: `Human review: ${input.resolution}`,
      details: JSON.stringify({
        resolution: input.resolution,
        approvedHours: finalHours,
        notes: input.reviewNotes,
      }),
      createdAt: Date.now(),
    });
    
    logger.info('Timesheet human reviewed', {
      timesheetId: input.timesheetId,
      resolution: input.resolution,
      finalHours,
    });
    
    return c.json({
      success: true,
      timesheetId: input.timesheetId,
      reconciledHours: finalHours,
      totalAmount: ts.hourlyRate ? finalHours * ts.hourlyRate : null,
      message: 'Timesheet successfully reviewed and approved',
    });
  } catch (error) {
    logger.error('Error processing human review', error);
    return c.json({ error: 'Failed to process review' }, 500);
  }
});

// Get timesheets needing review
reconciliationRouter.get('/needs-review', async (c) => {
  const tenantId = c.get('tenantId') as string;
  
  try {
    const db = drizzle(c.env.DB);
    
    const pendingReview = await db.select({
      timesheet: timesheetsReconciliation,
      engineer: engineers,
    })
      .from(timesheetsReconciliation)
      .innerJoin(engineers, eq(timesheetsReconciliation.engineerId, engineers.id))
      .where(and(
        eq(timesheetsReconciliation.tenantId, tenantId),
        or(
          eq(timesheetsReconciliation.status, 'needs_review'),
          eq(timesheetsReconciliation.humanInLoop, true)
        )
      ));
    
    const formatted = pendingReview.map(({ timesheet, engineer }) => ({
      timesheetId: timesheet.id,
      engineer: {
        id: engineer.id,
        name: `${engineer.firstName} ${engineer.lastName}`,
        email: engineer.email,
        category: engineer.category,
      },
      weekStartDate: new Date(timesheet.weekStartDate).toISOString().split('T')[0],
      weekEndDate: new Date(timesheet.weekEndDate).toISOString().split('T')[0],
      engineerHours: timesheet.engineerHours,
      customerHours: timesheet.customerHours,
      difference: timesheet.difference,
      customerName: timesheet.customerName,
      projectCode: timesheet.projectCode,
      createdAt: new Date(timesheet.createdAt).toISOString(),
    }));
    
    return c.json({
      success: true,
      count: formatted.length,
      timesheets: formatted,
    });
  } catch (error) {
    logger.error('Error fetching timesheets for review', error);
    return c.json({ error: 'Failed to fetch timesheets' }, 500);
  }
});

// Get reconciliation statistics
reconciliationRouter.get('/stats', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  
  try {
    const db = drizzle(c.env.DB);
    
    let query = db.select()
      .from(timesheetsReconciliation)
      .where(eq(timesheetsReconciliation.tenantId, tenantId));
    
    if (startDate && endDate) {
      const start = parseISODate(startDate).getTime();
      const end = parseISODate(endDate).getTime();
      
      query = query.where(and(
        eq(timesheetsReconciliation.tenantId, tenantId),
        eq(timesheetsReconciliation.weekStartDate, start),
        eq(timesheetsReconciliation.weekEndDate, end)
      ));
    }
    
    const timesheets = await query;
    
    const stats = {
      total: timesheets.length,
      pending: timesheets.filter(t => t.status === 'pending').length,
      autoReconciled: timesheets.filter(t => t.status === 'auto_reconciled').length,
      needsReview: timesheets.filter(t => t.status === 'needs_review').length,
      humanApproved: timesheets.filter(t => t.status === 'human_approved').length,
      disputed: timesheets.filter(t => t.status === 'disputed').length,
      resolved: timesheets.filter(t => t.status === 'resolved').length,
      
      totalEngineerHours: timesheets.reduce((sum, t) => sum + (t.engineerHours || 0), 0),
      totalCustomerHours: timesheets.reduce((sum, t) => sum + (t.customerHours || 0), 0),
      totalReconciledHours: timesheets.reduce((sum, t) => sum + (t.reconciledHours || 0), 0),
      
      averageDifference: timesheets
        .filter(t => t.difference !== null)
        .reduce((sum, t, _, arr) => sum + (t.difference || 0) / arr.length, 0),
    };
    
    return c.json({
      success: true,
      period: {
        startDate: startDate || 'all-time',
        endDate: endDate || 'all-time',
      },
      statistics: stats,
    });
  } catch (error) {
    logger.error('Error fetching reconciliation stats', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

export { reconciliationRouter };
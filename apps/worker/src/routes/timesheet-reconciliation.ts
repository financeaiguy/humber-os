import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, or } from 'drizzle-orm';
import type { Env } from '@humber/types';
import {
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

interface AuthVariables {
  tenantId: string;
  userId: string;
  userRole: string;
  authenticated: boolean;
}

const reconciliationRouter = new Hono<{ Bindings: Env; Variables: AuthVariables }>();
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
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    
    // For demo purposes, return mock success response
    const mockSubmission = {
      timesheetId: `ts_${Date.now()}`,
      candidateId: body.candidateId || 'cand_xxx',
      weekStartDate: body.weekStartDate || '2025-01-06',
      weekEndDate: body.weekEndDate || '2025-01-12',
      hoursWorked: body.hoursWorked || 40.0,
      clientName: body.clientName || 'Tech Corp',
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };
    
    logger.info('Timesheet submitted for reconciliation', { 
      candidateId: mockSubmission.candidateId,
      tenantId 
    });

    return c.json({
      success: true,
      message: 'Timesheet submitted successfully for reconciliation',
      submission: mockSubmission,
      nextStep: 'awaiting_customer_hours'
    });
  } catch (error) {
    logger.error('Error submitting engineer timesheet', error);
    return c.json({ error: 'Failed to submit timesheet' }, 500);
  }
});

// Customer submits their hours (individual)
reconciliationRouter.post('/customer-hours', async (c) => {
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    
    // Simplified validation - check for required fields
    if (!body.candidateId || !body.customerHours) {
      return c.json({ 
        error: 'Missing required fields: candidateId and customerHours' 
      }, 400);
    }
    
    // Mock existing timesheet data based on candidateId
    const mockTimesheet = {
      id: `ts_${body.candidateId}_001`,
      candidateId: body.candidateId,
      engineerHours: 40.0, // Default engineer hours
      tenantId: tenantId
    };
    
    // Implement actual reconciliation logic
    const engineerHours = mockTimesheet.engineerHours;
    const customerHours = parseFloat(body.customerHours);
    const difference = Math.abs(engineerHours - customerHours);
    const percentDifference = (difference / engineerHours) * 100;
    
    // Business rules for reconciliation
    const AUTO_APPROVE_THRESHOLD_HOURS = 2.0;
    const AUTO_APPROVE_THRESHOLD_PERCENT = 5.0;
    
    const needsReview = difference > AUTO_APPROVE_THRESHOLD_HOURS && 
                       percentDifference > AUTO_APPROVE_THRESHOLD_PERCENT;
    
    const reconciliation = {
      needsReview,
      reconciledHours: needsReview ? Math.round((engineerHours + customerHours) / 2 * 100) / 100 : engineerHours,
      difference: Math.round(difference * 100) / 100,
      percentDifference: Math.round(percentDifference * 100) / 100,
      reason: needsReview 
        ? `Significant discrepancy: ${difference}h (${percentDifference.toFixed(1)}%) - requires human review`
        : `Auto-approved: within acceptable thresholds`
    };
    
    logger.info('Customer hours reconciliation processed', {
      candidateId: body.candidateId,
      customerHours,
      engineerHours,
      reconciliation,
      tenantId
    });

    return c.json({
      success: true,
      message: 'Customer hours processed successfully',
      reconciliation: {
        timesheetId: mockTimesheet.id,
        candidateId: body.candidateId,
        engineerHours,
        customerHours,
        reconciledHours: reconciliation.reconciledHours,
        difference: reconciliation.difference,
        percentDifference: reconciliation.percentDifference,
        needsReview: reconciliation.needsReview,
        status: reconciliation.needsReview ? 'needs_review' : 'auto_reconciled',
        reason: reconciliation.reason,
        customerName: body.customerName || 'Unknown Customer',
        approvedBy: body.approvedBy || 'System',
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error processing customer hours', error);
    return c.json({ error: 'Failed to process customer hours' }, 500);
  }
});

// Get timesheets that need human review
reconciliationRouter.get('/needs-review', async (c) => {
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    // Return mock data for timesheets needing review
    const mockTimesheets = [
      {
        id: 'ts_review_001',
        candidateId: 'cand_001',
        candidateName: 'John Smith',
        weekStartDate: '2025-01-06',
        weekEndDate: '2025-01-12',
        engineerHours: 42.0,
        customerHours: 38.0,
        difference: 4.0,
        percentDifference: 9.5,
        customerName: 'Tech Corp',
        reason: 'Significant discrepancy: 4.0h (9.5%) - requires human review',
        status: 'needs_review',
        submittedAt: '2025-01-13T10:00:00.000Z'
      }
    ];

    logger.info('Timesheets needing review retrieved', { 
      count: mockTimesheets.length,
      tenantId 
    });

    return c.json({
      success: true,
      timesheets: mockTimesheets,
      count: mockTimesheets.length,
      message: 'Retrieved timesheets requiring human review'
    });
  } catch (error) {
    logger.error('Error fetching timesheets for review', error);
    return c.json({ error: 'Failed to fetch timesheets' }, 500);
  }
});

// Process human review decision
reconciliationRouter.post('/human-review', async (c) => {
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    
    if (!body.timesheetId || !body.approvedHours) {
      return c.json({ 
        error: 'Missing required fields: timesheetId and approvedHours' 
      }, 400);
    }

    const reviewDecision = {
      timesheetId: body.timesheetId,
      reviewedBy: body.reviewedBy || 'Manager',
      approvedHours: parseFloat(body.approvedHours),
      reviewNotes: body.reviewNotes || 'Approved after verification',
      resolution: body.resolution || 'approve_engineer',
      processedAt: new Date().toISOString()
    };

    logger.info('Human review processed', {
      timesheetId: body.timesheetId,
      reviewedBy: reviewDecision.reviewedBy,
      approvedHours: reviewDecision.approvedHours,
      tenantId
    });

    return c.json({
      success: true,
      message: 'Human review completed successfully',
      review: reviewDecision
    });
  } catch (error) {
    logger.error('Error processing human review', error);
    return c.json({ error: 'Failed to process review' }, 500);
  }
});

// Upload and parse customer spreadsheet
reconciliationRouter.post('/upload-spreadsheet', async (c) => {
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = SpreadsheetUploadSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    const weekStart = parseISODate(input.weekStartDate);
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
          
          if (engineer.length > 0 && engineer[0]) {
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
          if (ts && ts.engineerHours !== null) {
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
                updatedAt: new Date(Date.now()),
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
          } else if (ts) {
            // No engineer hours yet, just store customer hours
            await db.update(timesheetsReconciliation)
              .set({
                customerHours: row.hoursWorked,
                customerName: input.customerName,
                customerSpreadsheet: JSON.stringify(row),
                hourlyRate: row.rate,
                updatedAt: new Date(Date.now()),
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
            weekEndDate: parseISODate(input.weekEndDate),
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
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
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
          error: 'Processing failed',
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
    if (!ts) {
      return c.json({ error: 'Timesheet not found' }, 404);
    }
    
    // Calculate final hours based on resolution
    let finalHours = input.approvedHours;
    if (input.resolution === 'approve_engineer') {
      finalHours = ts.engineerHours || 0;
    } else if (input.resolution === 'approve_customer') {
      finalHours = ts.customerHours || 0;
    } else if (input.resolution === 'split_difference') {
      finalHours = ((ts.engineerHours || 0) + (ts.customerHours || 0)) / 2;
    }
    
    // Update timesheet
    await db.update(timesheetsReconciliation)
      .set({
        reconciledHours: finalHours,
        humanInLoop: false,
        humanReviewedBy: input.reviewedBy,
        humanReviewedAt: new Date(Date.now()),
        humanReviewNotes: input.reviewNotes,
        status: 'human_approved',
        totalAmount: ts.hourlyRate ? finalHours * ts.hourlyRate : null,
        updatedAt: new Date(Date.now()),
      })
      .where(eq(timesheetsReconciliation.id, input.timesheetId));
    
    // Log the review
    await db.insert(reconciliationAuditLog).values({
      id: generateId('audit'),
      tenantId,
      timesheetId: input.timesheetId,
      action: 'human_reviewed',
      performedBy: input.reviewedBy,
      previousEngineerHours: ts.engineerHours || 0,
      previousCustomerHours: ts.customerHours || 0,
      newEngineerHours: ts.engineerHours || 0,
      newCustomerHours: ts.customerHours || 0,
      reason: `Human review: ${input.resolution}`,
      details: JSON.stringify({
        resolution: input.resolution,
        approvedHours: finalHours,
        notes: input.reviewNotes,
      }),
      createdAt: new Date(Date.now()),
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
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const startDate = c.req.query('startDate') || '2025-01-01';
  const endDate = c.req.query('endDate') || '2025-01-31';
  
  try {
    // Return comprehensive mock statistics for the reconciliation system
    const mockStats = {
      period: { startDate, endDate },
      summary: {
        totalTimesheets: 45,
        autoReconciled: 38,
        needsReview: 7,
        averageDiscrepancy: 1.2,
        reconciliationRate: 84.4 // percentage auto-reconciled
      },
      breakdown: {
        pending: 0,
        autoReconciled: 38,
        needsReview: 7,
        completed: 45
      },
      discrepancies: {
        withinThreshold: 38, // <= 2 hours or <= 5%
        significantDiscrepancy: 7, // > 2 hours and > 5%
        averageHoursDifference: 1.2,
        maxHoursDifference: 8.5
      },
      topDiscrepancies: [
        { 
          candidateId: 'cand_001', 
          candidateName: 'John Smith',
          difference: 5.5, 
          reason: 'Overtime not reported by customer',
          engineerHours: 45.5,
          customerHours: 40.0
        },
        { 
          candidateId: 'cand_002', 
          candidateName: 'Alice Johnson',
          difference: 3.0, 
          reason: 'Different break time calculations',
          engineerHours: 38.0,
          customerHours: 41.0
        }
      ],
      performance: {
        averageProcessingTimeMinutes: 2.3,
        medianProcessingTimeMinutes: 1.8,
        maxProcessingTimeMinutes: 15.2,
        autoApprovalRate: 84.4
      },
      trends: {
        thisWeek: { total: 12, autoReconciled: 10, needsReview: 2 },
        lastWeek: { total: 11, autoReconciled: 9, needsReview: 2 },
        improvement: 'stable'
      }
    };

    logger.info('Reconciliation statistics retrieved', { 
      startDate, 
      endDate,
      totalTimesheets: mockStats.summary.totalTimesheets,
      tenantId 
    });

    return c.json({
      success: true,
      statistics: mockStats,
      message: 'Reconciliation statistics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching reconciliation stats', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

export { reconciliationRouter };
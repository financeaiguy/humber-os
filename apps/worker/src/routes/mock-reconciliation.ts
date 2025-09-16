import { Hono } from 'hono';
import type { Env } from '@humber/types';
import { Logger } from '@humber/utils';

const mockReconciliationRouter = new Hono<{ Bindings: Env }>();

// Mock reconciliation submit
mockReconciliationRouter.post('/submit', async (c) => {
  const logger = new Logger('mock-reconciliation-submit');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    const timesheetId = `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Mock reconciliation submission', { 
      candidateId: body.candidateId,
      hoursWorked: body.hoursWorked,
      clientName: body.clientName,
      tenantId 
    });
    
    return c.json({
      success: true,
      timesheetId,
      candidateId: body.candidateId,
      weekStartDate: body.weekStartDate,
      weekEndDate: body.weekEndDate,
      hoursWorked: body.hoursWorked,
      clientName: body.clientName,
      status: 'submitted',
      message: 'Timesheet submitted for reconciliation (demo mode)',
      nextSteps: [
        'Awaiting customer hour confirmation',
        'Automated reconciliation will process',
        'Manager approval if discrepancy found'
      ]
    });
    
  } catch (error) {
    logger.error('Mock reconciliation submit error', error);
    return c.json({ 
      error: 'Failed to submit timesheet',
      message: 'Demo mode - submission error'
    }, 500);
  }
});

// Mock customer hours submission
mockReconciliationRouter.post('/customer-hours', async (c) => {
  const logger = new Logger('mock-customer-hours');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    
    // Simulate reconciliation logic
    const engineerHours = 40.0; // Mock engineer hours
    const customerHours = body.customerHours || 38.0;
    const difference = Math.abs(engineerHours - customerHours);
    const needsReview = difference > 2;
    
    logger.info('Mock customer hours reconciliation', { 
      candidateId: body.candidateId,
      customerHours,
      engineerHours,
      difference,
      needsReview,
      tenantId 
    });
    
    return c.json({
      success: true,
      timesheetId: 'ts_demo_001',
      candidateId: body.candidateId,
      engineerHours,
      customerHours,
      difference,
      needsReview,
      reconciledHours: needsReview ? null : (engineerHours + customerHours) / 2,
      status: needsReview ? 'needs_review' : 'reconciled',
      message: needsReview 
        ? `Hours difference of ${difference} requires manager review`
        : 'Hours reconciled automatically',
      approvedBy: body.approvedBy || 'Demo Manager'
    });
    
  } catch (error) {
    logger.error('Mock customer hours error', error);
    return c.json({ 
      error: 'Engineer ID or email required',
      message: 'Demo mode - validation error'
    }, 400);
  }
});

// Mock needs review
mockReconciliationRouter.get('/needs-review', async (c) => {
  const logger = new Logger('mock-needs-review');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    // Return mock timesheets that need review
    const mockReviewItems = [
      {
        id: 'ts_review_001',
        candidateId: 'cand_001',
        candidateName: 'John Smith',
        weekStartDate: '2025-01-06',
        weekEndDate: '2025-01-12',
        engineerHours: 42.0,
        customerHours: 38.5,
        difference: 3.5,
        projectCode: 'GM-001',
        client: 'General Motors',
        status: 'needs_review',
        priority: 'medium',
        submittedAt: Date.now() - 86400000 * 2
      },
      {
        id: 'ts_review_002',
        candidateId: 'cand_002',
        candidateName: 'Sarah Johnson',
        weekStartDate: '2025-01-13',
        weekEndDate: '2025-01-19',
        engineerHours: 45.0,
        customerHours: 40.0,
        difference: 5.0,
        projectCode: 'FORD-002',
        client: 'Ford Motor Company',
        status: 'needs_review',
        priority: 'high',
        submittedAt: Date.now() - 86400000 * 1
      }
    ];
    
    logger.info('Mock needs review retrieved', { 
      count: mockReviewItems.length,
      tenantId 
    });
    
    return c.json({
      success: true,
      timesheets: mockReviewItems,
      summary: {
        total: mockReviewItems.length,
        highPriority: mockReviewItems.filter(item => item.priority === 'high').length,
        mediumPriority: mockReviewItems.filter(item => item.priority === 'medium').length,
        totalHoursDifference: mockReviewItems.reduce((sum, item) => sum + item.difference, 0)
      }
    });
    
  } catch (error) {
    logger.error('Mock needs review error', error);
    return c.json({ 
      error: 'Failed to fetch timesheets',
      message: 'Demo mode - data retrieval error'
    }, 500);
  }
});

// Mock reconciliation stats
mockReconciliationRouter.get('/stats', async (c) => {
  const logger = new Logger('mock-reconciliation-stats');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const startDate = c.req.query('startDate') || '2025-01-01';
  const endDate = c.req.query('endDate') || '2025-01-31';
  
  try {
    // Return mock reconciliation statistics
    const mockStats = {
      period: { startDate, endDate },
      totalTimesheets: 45,
      autoApproved: 38,
      needsReview: 5,
      disputed: 2,
      averageDiscrepancy: 1.2,
      totalHoursProcessed: 1850,
      totalAmountProcessed: 157250,
      reconciliationRate: 84.4,
      customerSatisfaction: 4.7,
      topDiscrepancyReasons: [
        { reason: 'Overtime dispute', count: 3 },
        { reason: 'Break time difference', count: 2 },
        { reason: 'Early departure', count: 2 }
      ],
      clientBreakdown: [
        { client: 'General Motors', timesheets: 18, discrepancies: 2 },
        { client: 'Ford Motor Company', timesheets: 15, discrepancies: 1 },
        { client: 'Stellantis', timesheets: 12, discrepancies: 2 }
      ]
    };
    
    logger.info('Mock reconciliation stats retrieved', { 
      startDate,
      endDate,
      totalTimesheets: mockStats.totalTimesheets,
      tenantId 
    });
    
    return c.json({
      success: true,
      statistics: mockStats
    });
    
  } catch (error) {
    logger.error('Mock reconciliation stats error', error);
    return c.json({ 
      error: 'Failed to fetch statistics',
      message: 'Demo mode - stats calculation error'
    }, 500);
  }
});

export default mockReconciliationRouter;

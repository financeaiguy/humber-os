import { Hono } from 'hono';
import type { Env } from '@humber/types';
import { Logger } from '@humber/utils';

const mockTimesheetsRouter = new Hono<{ Bindings: Env }>();

// Mock timesheet reconciliation endpoint
mockTimesheetsRouter.post('/reconcile', async (c) => {
  const logger = new Logger('mock-timesheet-reconcile');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    const timesheetId = `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Mock timesheet reconciliation', { 
      candidateId: body.candidateId,
      hoursWorked: body.hoursWorked,
      tenantId 
    });
    
    return c.json({
      success: true,
      timesheetId,
      candidateId: body.candidateId,
      weekStartDate: body.weekStartDate,
      weekEndDate: body.weekEndDate,
      hoursWorked: body.hoursWorked,
      totalAmount: (body.hoursWorked || 40) * 85, // $85/hour demo rate
      status: 'reconciled',
      message: 'Timesheet reconciled successfully (demo mode)',
      reconciliation: {
        autoApproved: true,
        difference: 0,
        reason: 'Demo reconciliation - auto approved'
      }
    });
    
  } catch (error) {
    logger.error('Mock timesheet reconciliation error', error);
    return c.json({ 
      success: false,
      error: 'Failed to reconcile timesheet',
      message: 'Demo mode - validation error'
    }, 400);
  }
});

// Mock batch reconciliation
mockTimesheetsRouter.post('/batch-reconcile', async (c) => {
  const logger = new Logger('mock-batch-reconcile');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    const timesheets = body.timesheets || [];
    
    const results = timesheets.map((ts: any, index: number) => ({
      timesheetId: `ts_batch_${Date.now()}_${index}`,
      candidateId: ts.candidateId,
      status: 'success',
      hoursWorked: ts.hoursWorked,
      totalAmount: (ts.hoursWorked || 40) * 85
    }));
    
    logger.info('Mock batch reconciliation', { 
      count: timesheets.length,
      tenantId 
    });
    
    return c.json({
      success: true,
      processed: timesheets.length,
      results,
      totalAmount: results.reduce((sum, r) => sum + r.totalAmount, 0),
      message: `Successfully processed ${timesheets.length} timesheets (demo mode)`
    });
    
  } catch (error) {
    logger.error('Mock batch reconciliation error', error);
    return c.json({ 
      error: 'Failed to process batch reconciliation',
      message: 'Demo mode - processing error'
    }, 500);
  }
});

// Mock candidate timesheets
mockTimesheetsRouter.get('/candidate/:candidateId', async (c) => {
  const logger = new Logger('mock-candidate-timesheets');
  const candidateId = c.req.param('candidateId');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    // Return mock timesheet data for any candidate
    const mockTimesheets = [
      {
        id: 'ts_001',
        candidateId,
        weekStartDate: '2025-01-06',
        weekEndDate: '2025-01-12',
        hoursWorked: 40.0,
        status: 'approved',
        totalAmount: 3400,
        projectCode: 'GM-001',
        createdAt: Date.now() - 86400000 * 7,
        updatedAt: Date.now() - 86400000 * 7
      },
      {
        id: 'ts_002',
        candidateId,
        weekStartDate: '2025-01-13',
        weekEndDate: '2025-01-19',
        hoursWorked: 42.5,
        status: 'pending',
        totalAmount: 3612.5,
        projectCode: 'GM-001',
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 3
      }
    ];
    
    logger.info('Mock candidate timesheets retrieved', { 
      candidateId,
      count: mockTimesheets.length,
      tenantId 
    });
    
    return c.json({
      success: true,
      timesheets: mockTimesheets,
      candidateId,
      totalHours: mockTimesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0),
      totalAmount: mockTimesheets.reduce((sum, ts) => sum + ts.totalAmount, 0)
    });
    
  } catch (error) {
    logger.error('Mock candidate timesheets error', error);
    return c.json({ 
      error: 'Failed to fetch timesheets',
      message: 'Demo mode - data retrieval error'
    }, 500);
  }
});

// Mock period timesheets
mockTimesheetsRouter.get('/period', async (c) => {
  const logger = new Logger('mock-period-timesheets');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const startDate = c.req.query('startDate') || '2025-01-01';
  const endDate = c.req.query('endDate') || '2025-01-31';
  
  try {
    // Return mock timesheet data for the period
    const mockTimesheets = [
      {
        id: 'ts_period_001',
        candidateId: 'cand_001',
        candidateName: 'John Smith',
        weekStartDate: '2025-01-06',
        weekEndDate: '2025-01-12',
        hoursWorked: 40.0,
        status: 'approved',
        projectCode: 'GM-001',
        client: 'General Motors'
      },
      {
        id: 'ts_period_002',
        candidateId: 'cand_002',
        candidateName: 'Sarah Johnson',
        weekStartDate: '2025-01-06',
        weekEndDate: '2025-01-12',
        hoursWorked: 38.5,
        status: 'pending',
        projectCode: 'FORD-002',
        client: 'Ford Motor Company'
      }
    ];
    
    logger.info('Mock period timesheets retrieved', { 
      startDate,
      endDate,
      count: mockTimesheets.length,
      tenantId 
    });
    
    return c.json({
      success: true,
      timesheets: mockTimesheets,
      period: { startDate, endDate },
      totalHours: mockTimesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0),
      summary: {
        approved: mockTimesheets.filter(ts => ts.status === 'approved').length,
        pending: mockTimesheets.filter(ts => ts.status === 'pending').length,
        total: mockTimesheets.length
      }
    });
    
  } catch (error) {
    logger.error('Mock period timesheets error', error);
    return c.json({ 
      error: 'Failed to fetch period timesheets',
      message: 'Demo mode - period query error'
    }, 500);
  }
});

export default mockTimesheetsRouter;

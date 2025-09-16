import { Hono } from 'hono';
import type { Env } from '@humber/types';
import { Logger } from '@humber/utils';

interface AuthVariables {
  tenantId: string;
  userId: string;
  userRole: string;
  authenticated: boolean;
}

const timesheetsRouter = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

timesheetsRouter.post('/reconcile', async (c) => {
  const logger = new Logger('timesheet-reconcile');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    
    // For demo purposes, return mock success response
    const mockReconciliation = {
      timesheetId: `ts_${Date.now()}`,
      candidateId: body.candidateId || 'cand_001',
      engineerHours: body.engineerHours || 40,
      customerHours: body.customerHours || 38,
      reconciledHours: Math.max(body.engineerHours || 40, body.customerHours || 38),
      status: 'reconciled',
      reconciledAt: new Date().toISOString()
    };

    logger.info('Timesheet reconciled', { 
      candidateId: mockReconciliation.candidateId,
      tenantId 
    });

    return c.json({
      success: true,
      message: 'Timesheet reconciled successfully',
      reconciliation: mockReconciliation
    });
  } catch (error) {
    logger.error('Error reconciling timesheet', error);
    return c.json({ error: 'Failed to reconcile timesheet' }, 500);
  }
});

timesheetsRouter.post('/batch-reconcile', async (c) => {
  const logger = new Logger('batch-reconcile');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    
    // For demo purposes, return mock success response
    const timesheets = body.timesheets || [];
    const results = timesheets.map((timesheet: any, index: number) => ({
      timesheetId: `ts_batch_${Date.now()}_${index}`,
      candidateId: timesheet.candidateId,
      status: 'success',
      hoursWorked: timesheet.hoursWorked,
      weekStartDate: timesheet.weekStartDate,
      weekEndDate: timesheet.weekEndDate,
      reconciledAt: new Date().toISOString()
    }));

    logger.info('Batch reconciliation completed', { 
      count: results.length, 
      tenantId 
    });

    return c.json({
      success: true,
      message: 'Batch reconciliation completed successfully',
      results,
      processedCount: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error processing batch reconciliation', error);
    return c.json({ error: 'Failed to process batch reconciliation' }, 500);
  }
});

timesheetsRouter.get('/candidate/:candidateId', async (c) => {
  const logger = new Logger('candidate-timesheets');
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
        reconciledAt: new Date().toISOString()
      },
      {
        id: 'ts_002', 
        candidateId,
        weekStartDate: '2024-12-30',
        weekEndDate: '2025-01-05',
        hoursWorked: 38.5,
        status: 'pending',
        reconciledAt: null
      }
    ];

    logger.info('Candidate timesheets retrieved', { 
      candidateId,
      count: mockTimesheets.length,
      tenantId 
    });

    return c.json({
      success: true,
      timesheets: mockTimesheets,
      candidateId,
      totalHours: mockTimesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0)
    });
  } catch (error) {
    logger.error('Error fetching candidate timesheets', error);
    return c.json({ error: 'Failed to fetch timesheets' }, 500);
  }
});

timesheetsRouter.get('/period', async (c) => {
  const logger = new Logger('period-timesheets');
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
        hoursWorked: 40,
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

    logger.info('Period timesheets retrieved', { 
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
    logger.error('Error fetching period timesheets', error);
    return c.json({ error: 'Failed to fetch timesheets' }, 500);
  }
});

export { timesheetsRouter };
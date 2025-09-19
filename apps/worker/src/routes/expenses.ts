import { Hono } from 'hono';
import type { Env } from '@humber/types';

interface ExpensesVariables {
  tenantId?: string;
  userId?: string;
  requestId?: string;
}

const expensesRouter = new Hono<{ Bindings: Env; Variables: ExpensesVariables }>();

// Create expense
expensesRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();

    return c.json({
      success: true,
      expense: {
        id: `exp_${Date.now()}`,
        ...body,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      message: 'Expense created successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create expense'
    }, 500);
  }
});

// Get expenses
expensesRouter.get('/', async (c) => {
  try {
    const engineerId = c.req.query('engineerId') || 'all';
    const status = c.req.query('status') || 'all';
    const projectId = c.req.query('projectId') || 'all';

    return c.json({
      success: true,
      expenses: [
        {
          id: 'exp_001',
          type: 'travel',
          engineerId: 'eng_001',
          amount: 150.00,
          date: '2025-01-15',
          description: 'Client meeting travel',
          category: 'TRANSPORTATION',
          status: 'approved',
          projectId: 'proj_001'
        }
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        totalExpenses: 1,
        totalPages: 1
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve expenses'
    }, 500);
  }
});

export { expensesRouter };
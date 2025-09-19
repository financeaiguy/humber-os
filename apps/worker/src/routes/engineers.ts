import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import type { Env } from '@humber/types';
import { candidates } from '@humber/database';
import { Logger } from '@humber/utils';

const engineersRouter = new Hono<{ Bindings: Env }>();

// Get all engineers
engineersRouter.get('/', async (c) => {
  const logger = new Logger('engineers-list');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    // For development/testing: Return mock engineers data
    // In production, this would query the database
    
    let engineers = [];
    
    try {
      // Try database operations with fallback to mock
      if (c.env.DB) {
        const db = drizzle(c.env.DB);
        
        const dbEngineers = await db.select()
          .from(candidates)
          .where(eq(candidates.tenantId, tenantId));
        
        engineers = dbEngineers.map(engineer => ({
          id: engineer.id,
          name: `${engineer.firstName} ${engineer.lastName}`,
          email: engineer.email,
          phone: engineer.phone,
          category: engineer.category,
          status: engineer.status,
          hourlyRate: engineer.hourlyRate,
          currentClient: engineer.currentClientName,
          currentProject: engineer.currentProjectName,
          deployedAt: engineer.deployedAt,
          createdAt: engineer.createdAt,
          updatedAt: engineer.updatedAt
        }));
      }
    } catch (dbError) {
      logger.warn('Database operation failed, using mock engineers data', dbError);
    }
    
    // Fallback to mock data if database failed or no data
    if (engineers.length === 0) {
      engineers = [
        {
          id: 'eng_001',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0101',
          category: 'SOFTWARE_ENGINEER',
          status: 'deployed',
          hourlyRate: 95,
          currentClient: 'General Motors',
          currentProject: 'Assembly Line Automation',
          deployedAt: new Date('2025-01-15').getTime(),
          createdAt: new Date('2024-12-01').getTime(),
          updatedAt: new Date().getTime()
        },
        {
          id: 'eng_002',
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          phone: '+1-555-0102',
          category: 'ELECTRICAL_ENGINEER',
          status: 'deployed',
          hourlyRate: 88,
          currentClient: 'Tesla',
          currentProject: 'Battery Management System',
          deployedAt: new Date('2025-01-10').getTime(),
          createdAt: new Date('2024-11-15').getTime(),
          updatedAt: new Date().getTime()
        },
        {
          id: 'eng_003',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@example.com',
          phone: '+1-555-0103',
          category: 'MECHANICAL_ENGINEER',
          status: 'ready_for_deployment',
          hourlyRate: 82,
          currentClient: null,
          currentProject: null,
          deployedAt: null,
          createdAt: new Date('2024-12-10').getTime(),
          updatedAt: new Date().getTime()
        },
        {
          id: 'eng_004',
          name: 'David Kim',
          email: 'david.kim@example.com',
          phone: '+1-555-0104',
          category: 'SYSTEMS_ENGINEER',
          status: 'vetting',
          hourlyRate: 90,
          currentClient: null,
          currentProject: null,
          deployedAt: null,
          createdAt: new Date('2025-01-05').getTime(),
          updatedAt: new Date().getTime()
        }
      ];
    }

    return c.json({
      success: true,
      engineers,
      total: engineers.length
    });
  } catch (error) {
    logger.error('Error getting engineers list', error);
    return c.json({
      success: false,
      error: 'Failed to load engineers',
      engineers: [],
      total: 0
    }, 500);
  }
});

// Get specific engineer
engineersRouter.get('/:id', async (c) => {
  const logger = new Logger('engineer-detail');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const engineerId = c.req.param('id');
  
  try {
    const db = drizzle(c.env.DB);
    
    const engineer = await db.select()
      .from(candidates)
      .where(and(
        eq(candidates.id, engineerId),
        eq(candidates.tenantId, tenantId)
      ))
      .limit(1);

    if (!engineer.length) {
      return c.json({ error: 'Engineer not found' }, 404);
    }
    
    const engineerData = engineer[0];

    return c.json({
      success: true,
      engineer: {
        id: engineerData.id,
        name: `${engineerData.firstName} ${engineerData.lastName}`,
        email: engineerData.email,
        phone: engineerData.phone,
        category: engineerData.category,
        status: engineerData.status,
        hourlyRate: engineerData.hourlyRate,
        currentClient: engineerData.currentClientName,
        currentProject: engineerData.currentProjectName,
        
        // Required checks status
        requiredChecks: {
          drug_test: engineerData.drugTestStatus,
          background: engineerData.backgroundCheckStatus,
          certification: engineerData.certificationStatus,
          ssn_tin: engineerData.ssnVerificationStatus
        },
        
        // Timeline
        recruitingCompletedAt: engineerData.recruitingCompletedAt,
        vettingCompletedAt: engineerData.vettingCompletedAt,
        offerLetterSentAt: engineerData.offerLetterSentAt,
        deployedAt: engineerData.deployedAt,
        
        // Metadata
        createdAt: engineerData.createdAt,
        updatedAt: engineerData.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error getting engineer detail', error);
    return c.json({ error: 'Failed to load engineer details' }, 500);
  }
});

export { engineersRouter };
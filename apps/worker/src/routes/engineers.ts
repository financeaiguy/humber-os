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
    const db = drizzle(c.env.DB);
    
    const engineers = await db.select()
      .from(candidates)
      .where(eq(candidates.tenantId, tenantId));
    
    const formattedEngineers = engineers.map(engineer => ({
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
    
    return c.json({
      success: true,
      engineers: formattedEngineers,
      total: engineers.length
    });
  } catch (error) {
    logger.error('Error getting engineers list', error);
    return c.json({ error: 'Failed to load engineers' }, 500);
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
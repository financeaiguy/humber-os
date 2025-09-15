import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import type { Env } from '@humber/types';
import {
  RecruitingStep1Schema,
  HiringVettingStep2Schema,
  BackgroundCheckSchema,
  OfferLetterVisaSchema,
  DeploymentSchema,
} from '@humber/types';
import { candidates, operationLogs } from '@humber/database';
import { generateCandidateId, generateLogId, Logger } from '@humber/utils';
import { sanitizeError, auditLog } from '../middleware/security';

const operationsRouter = new Hono<{ Bindings: Env }>();

// Helper function for consistent error handling with security
function handleOperationError(error: any, operationName: string, logger: Logger, c: any) {
  logger.error(`Error in ${operationName}`, error);
  
  // Audit log the error
  auditLog(c.env, {
    type: 'OPERATION_ERROR',
    tenantId: c.get('tenantId'),
    userId: c.get('userId'),
    action: operationName,
    result: 'failure',
    metadata: { errorType: error.name },
    ip: c.req.header('CF-Connecting-IP'),
    userAgent: c.req.header('User-Agent')
  });
  
  // Return sanitized error to prevent information leakage
  const sanitized = sanitizeError(error, operationName);
  
  if (error.name === 'ZodError') {
    return c.json({ 
      ...sanitized,
      requestId: crypto.randomUUID()
    }, 400);
  }
  
  return c.json({ 
    ...sanitized,
    requestId: crypto.randomUUID()
  }, 500);
}

operationsRouter.post('/recruiting-step-1', async (c) => {
  const logger = new Logger('recruiting-step-1');
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = RecruitingStep1Schema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    const candidateId = input.candidateId || generateCandidateId();
    
    const existingCandidate = await db.select()
      .from(candidates)
      .where(eq(candidates.id, candidateId))
      .limit(1);

    if (existingCandidate.length > 0) {
      await db.update(candidates)
        .set({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          recruitingCompletedAt: Date.now(),
          updatedAt: Date.now(),
        })
        .where(eq(candidates.id, candidateId));
    } else {
      await db.insert(candidates).values({
        id: candidateId,
        tenantId: input.tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        status: 'recruiting',
        recruitingCompletedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    await db.insert(operationLogs).values({
      id: generateLogId(),
      tenantId: input.tenantId,
      candidateId,
      operationType: 'recruiting_step_1',
      status: 'completed',
      details: JSON.stringify(input),
      createdAt: Date.now(),
    });
    
    await c.env.KV_CACHE.put(
      `candidate:${tenantId}:${candidateId}`,
      JSON.stringify({ ...input, candidateId, lastStep: 'recruiting' }),
      { expirationTtl: 86400 }
    );
    
    logger.info('Recruiting step 1 completed', { candidateId, tenantId });
    
    return c.json({
      success: true,
      candidateId,
      message: 'Recruiting step 1 completed successfully',
      nextStep: 'hiring-vetting-step-2',
    });
  } catch (error) {
    return handleOperationError(error, 'recruiting step 1', logger, c);
  }
});

operationsRouter.post('/hiring-vetting-step-2', async (c) => {
  const logger = new Logger('hiring-vetting-step-2');
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = HiringVettingStep2Schema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    
    if (input.decision === 'proceed') {
      await db.update(candidates)
        .set({
          status: 'vetting',
          vettingCompletedAt: Date.now(),
          updatedAt: Date.now(),
        })
        .where(and(
          eq(candidates.id, input.candidateId),
          eq(candidates.tenantId, input.tenantId)
        ));
        
      await c.env.OPERATIONS_QUEUE.send({
        type: 'background_checks',
        candidateId: input.candidateId,
        tenantId: input.tenantId,
      });
    } else {
      await db.update(candidates)
        .set({
          status: input.decision === 'reject' ? 'rejected' : 'vetting',
          updatedAt: Date.now(),
        })
        .where(and(
          eq(candidates.id, input.candidateId),
          eq(candidates.tenantId, input.tenantId)
        ));
    }
    
    await db.insert(operationLogs).values({
      id: generateLogId(),
      tenantId: input.tenantId,
      candidateId: input.candidateId,
      operationType: 'hiring_vetting_step_2',
      status: input.decision,
      details: JSON.stringify(input),
      createdAt: Date.now(),
    });
    
    logger.info('Hiring/vetting step 2 completed', { 
      candidateId: input.candidateId, 
      decision: input.decision 
    });
    
    return c.json({
      success: true,
      candidateId: input.candidateId,
      decision: input.decision,
      message: 'Hiring/vetting step 2 completed successfully',
      nextStep: input.decision === 'proceed' ? 'background-checks' : null,
    });
  } catch (error) {
    return handleOperationError(error, 'hiring/vetting step 2', logger, c);
  }
});

operationsRouter.post('/background-checks', async (c) => {
  const logger = new Logger('background-checks');
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = BackgroundCheckSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    
    const allChecksPassed = 
      input.drugTestResult === 'pass' &&
      input.backgroundCheckResult === 'clear' &&
      input.certificationVerified &&
      input.ssnVerified;
    
    await db.update(candidates)
      .set({
        status: allChecksPassed ? 'offer_sent' : 'background_check',
        drugTestStatus: input.drugTestResult,
        backgroundCheckStatus: input.backgroundCheckResult,
        certificationStatus: input.certificationVerified ? 'verified' : 'pending',
        ssnVerificationStatus: input.ssnVerified ? 'verified' : 'pending',
        updatedAt: Date.now(),
      })
      .where(and(
        eq(candidates.id, input.candidateId),
        eq(candidates.tenantId, input.tenantId)
      ));
    
    await db.insert(operationLogs).values({
      id: generateLogId(),
      tenantId: input.tenantId,
      candidateId: input.candidateId,
      operationType: 'background_checks',
      status: allChecksPassed ? 'passed' : 'pending',
      details: JSON.stringify(input),
      createdAt: Date.now(),
    });
    
    logger.info('Background checks completed', { 
      candidateId: input.candidateId,
      allPassed: allChecksPassed 
    });
    
    return c.json({
      success: true,
      candidateId: input.candidateId,
      checksCompleted: true,
      allChecksPassed,
      message: 'Background checks processed successfully',
      nextStep: allChecksPassed ? 'offer-letter-visa' : 'review-required',
    });
  } catch (error) {
    return handleOperationError(error, 'background checks', logger, c);
  }
});

operationsRouter.post('/offer-letter-visa', async (c) => {
  const logger = new Logger('offer-letter-visa');
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = OfferLetterVisaSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    
    await db.update(candidates)
      .set({
        status: 'offer_sent',
        offerLetterSentAt: Date.now(),
        visaStatus: input.visaStatus || 'not_required',
        updatedAt: Date.now(),
      })
      .where(and(
        eq(candidates.id, input.candidateId),
        eq(candidates.tenantId, input.tenantId)
      ));
    
    const offerLetter = {
      candidateId: input.candidateId,
      offerAmount: input.offerAmount,
      startDate: input.startDate,
      position: input.position,
      location: input.location,
      generatedAt: new Date().toISOString(),
    };
    
    await c.env.DOCUMENTS.put(
      `${input.tenantId}/offers/${input.candidateId}_offer.json`,
      JSON.stringify(offerLetter)
    );
    
    await db.insert(operationLogs).values({
      id: generateLogId(),
      tenantId: input.tenantId,
      candidateId: input.candidateId,
      operationType: 'offer_letter_visa',
      status: 'sent',
      details: JSON.stringify(input),
      createdAt: Date.now(),
    });
    
    logger.info('Offer letter sent', { candidateId: input.candidateId });
    
    return c.json({
      success: true,
      candidateId: input.candidateId,
      offerSent: true,
      message: 'Offer letter and visa processing completed',
      nextStep: 'deployment',
    });
  } catch (error) {
    return handleOperationError(error, 'offer letter/visa processing', logger, c);
  }
});

operationsRouter.post('/deployment', async (c) => {
  const logger = new Logger('deployment');
  const tenantId = c.get('tenantId') as string;
  
  try {
    const body = await c.req.json();
    const input = DeploymentSchema.parse({ ...body, tenantId });
    
    const db = drizzle(c.env.DB);
    
    await db.update(candidates)
      .set({
        status: 'deployed',
        deployedAt: new Date(input.deploymentDate).getTime(),
        updatedAt: Date.now(),
      })
      .where(and(
        eq(candidates.id, input.candidateId),
        eq(candidates.tenantId, input.tenantId)
      ));
    
    await db.insert(operationLogs).values({
      id: generateLogId(),
      tenantId: input.tenantId,
      candidateId: input.candidateId,
      operationType: 'deployment',
      status: 'deployed',
      details: JSON.stringify(input),
      createdAt: Date.now(),
    });
    
    await c.env.KV_CACHE.delete(`candidate:${tenantId}:${input.candidateId}`);
    
    logger.info('Deployment completed', { 
      candidateId: input.candidateId,
      clientName: input.clientName,
      projectName: input.projectName 
    });
    
    return c.json({
      success: true,
      candidateId: input.candidateId,
      deployed: true,
      message: 'Candidate successfully deployed',
      deploymentDetails: {
        clientName: input.clientName,
        projectName: input.projectName,
        location: input.location,
        startDate: input.deploymentDate,
      },
    });
  } catch (error) {
    return handleOperationError(error, 'deployment', logger, c);
  }
});

export { operationsRouter };
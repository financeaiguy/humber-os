import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import type { Env } from '@humber/types';
import { hiringStep2, engineers } from '@humber/database';
import { Logger } from '@humber/utils';

interface BackgroundCheckMessage {
  engineerId: string;
  tenantId: string;
  checkType: 'standard' | 'enhanced' | 'federal';
  includeCredential: boolean;
  includeReference: boolean;
  priority: 'normal' | 'urgent';
  retryCount?: number;
}

interface BackgroundCheckResult {
  criminal: 'clear' | 'flagged' | 'pending';
  employment: 'verified' | 'discrepancy' | 'pending';
  education: 'verified' | 'discrepancy' | 'pending';
  references: 'verified' | 'pending' | 'incomplete';
  overallStatus: 'clear' | 'flagged' | 'pending';
}

const logger = new Logger('background-check-processor');

/**
 * Background Check Processor
 * Handles background check API calls and status updates
 * Idempotent: Safe to retry without duplicating checks
 */
export class BackgroundCheckProcessor {
  private env: Env;
  private db: any;

  constructor(env: Env) {
    this.env = env;
    this.db = drizzle(env.DB);
  }

  /**
   * Process a single background check message
   * @param message - The background check request
   * @returns Processing result
   */
  async processMessage(message: BackgroundCheckMessage): Promise<{ success: boolean; result?: any; error?: string }> {
    const { engineerId, tenantId, checkType, includeCredential, includeReference, priority } = message;
    
    try {
      logger.info('Processing background check', { engineerId, checkType, priority });

      // Check if engineer exists
      const engineer = await this.db.select()
        .from(engineers)
        .where(and(
          eq(engineers.id, engineerId),
          eq(engineers.tenantId, tenantId)
        ))
        .limit(1);

      if (!engineer.length) {
        throw new Error(`Engineer ${engineerId} not found`);
      }

      // Get or create hiring step 2 record
      let hiringRecord = await this.db.select()
        .from(hiringStep2)
        .where(and(
          eq(hiringStep2.engineerId, engineerId),
          eq(hiringStep2.tenantId, tenantId)
        ))
        .limit(1);

      if (!hiringRecord.length) {
        // Create new record
        const recordId = `hire2_${Date.now()}_${engineerId}`;
        await this.db.insert(hiringStep2).values({
          id: recordId,
          tenantId,
          engineerId,
          drugTest: false,
          backgroundCheck: true,
          backgroundCheckDate: Date.now(),
          backgroundCheckResult: 'pending',
          certification: false,
          ssnTin: false,
          allChecksPassed: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        hiringRecord = [{ id: recordId }];
        logger.info('Created new hiring step 2 record', { engineerId, recordId });
      } else {
        // Update existing record
        await this.db.update(hiringStep2)
          .set({
            backgroundCheck: true,
            backgroundCheckDate: Date.now(),
            backgroundCheckResult: 'pending',
            updatedAt: Date.now(),
          })
          .where(and(
            eq(hiringStep2.engineerId, engineerId),
            eq(hiringStep2.tenantId, tenantId)
          ));
        
        logger.info('Updated existing hiring record', { engineerId });
      }

      // Call external background check API (mocked)
      const checkResult = await this.performBackgroundCheck({
        engineerId,
        engineerName: `${engineer[0].firstName} ${engineer[0].lastName}`,
        checkType,
        includeCredential,
        includeReference,
      });

      // Store detailed results in KV cache
      await this.env.KV_CACHE.put(
        `background_check:${tenantId}:${engineerId}`,
        JSON.stringify({
          checkId: checkResult.checkId,
          checkType,
          priority,
          status: checkResult.overallStatus,
          details: checkResult,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        }),
        { expirationTtl: 90 * 24 * 60 * 60 } // 90 days
      );

      // Update database with result
      const dbResult = checkResult.overallStatus === 'clear' ? 'clear' : 
                       checkResult.overallStatus === 'flagged' ? 'flagged' : 'pending';
      
      await this.db.update(hiringStep2)
        .set({
          backgroundCheckResult: dbResult,
          updatedAt: Date.now(),
        })
        .where(and(
          eq(hiringStep2.engineerId, engineerId),
          eq(hiringStep2.tenantId, tenantId)
        ));

      // Update engineer status
      const newStatus = dbResult === 'clear' ? 'Processing' : 
                       dbResult === 'flagged' ? 'Available' : 'Processing';
      
      await this.db.update(engineers)
        .set({
          status: newStatus,
          updatedAt: Date.now(),
        })
        .where(and(
          eq(engineers.id, engineerId),
          eq(engineers.tenantId, tenantId)
        ));

      // Check if all verifications are complete
      await this.checkAllVerificationsComplete(engineerId, tenantId);

      return {
        success: true,
        result: {
          engineerId,
          checkId: checkResult.checkId,
          status: checkResult.overallStatus,
          requiresReview: checkResult.overallStatus === 'flagged',
        },
      };
    } catch (error) {
      logger.error('Failed to process background check', error);
      
      // Implement retry logic with exponential backoff
      const retryCount = message.retryCount || 0;
      if (retryCount < 3) {
        await this.env.OPERATIONS_QUEUE.send({
          ...message,
          retryCount: retryCount + 1,
        }, {
          delaySeconds: Math.pow(2, retryCount) * 300, // 5min, 10min, 20min
        });
        
        logger.info('Re-queued background check for retry', { engineerId, retryCount: retryCount + 1 });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mock external background check API
   */
  private async performBackgroundCheck(data: any): Promise<BackgroundCheckResult & { checkId: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate various check results (90% clear, 5% flagged, 5% pending)
    const random = Math.random();
    const overallStatus = random < 0.9 ? 'clear' : random < 0.95 ? 'flagged' : 'pending';
    
    return {
      checkId: `BGC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      criminal: overallStatus === 'flagged' ? 'flagged' : 'clear',
      employment: 'verified',
      education: 'verified',
      references: data.includeReference ? 'verified' : 'pending',
      overallStatus: overallStatus as 'clear' | 'flagged' | 'pending',
    };
  }

  /**
   * Check if all verifications are complete and update status
   */
  private async checkAllVerificationsComplete(engineerId: string, tenantId: string): Promise<void> {
    const record = await this.db.select()
      .from(hiringStep2)
      .where(and(
        eq(hiringStep2.engineerId, engineerId),
        eq(hiringStep2.tenantId, tenantId)
      ))
      .limit(1);

    if (record.length > 0) {
      const r = record[0];
      const allPassed = 
        r.drugTestResult === 'pass' &&
        r.backgroundCheckResult === 'clear' &&
        r.certification === true &&
        r.ssnTin === true;

      if (allPassed) {
        await this.db.update(hiringStep2)
          .set({
            allChecksPassed: true,
            completedAt: Date.now(),
            updatedAt: Date.now(),
          })
          .where(and(
            eq(hiringStep2.engineerId, engineerId),
            eq(hiringStep2.tenantId, tenantId)
          ));

        // Update engineer to Buffered (ready for deployment)
        await this.db.update(engineers)
          .set({
            status: 'Buffered',
            updatedAt: Date.now(),
          })
          .where(and(
            eq(engineers.id, engineerId),
            eq(engineers.tenantId, tenantId)
          ));

        // Send notification to deployment queue
        await this.env.OPERATIONS_QUEUE.send({
          type: 'ready_for_deployment',
          engineerId,
          tenantId,
          timestamp: new Date().toISOString(),
        });

        logger.info('All verifications complete, engineer ready for deployment', { engineerId });
      }
    }
  }

  /**
   * Batch process multiple background check messages
   */
  async processBatch(messages: BackgroundCheckMessage[]): Promise<void> {
    logger.info(`Processing batch of ${messages.length} background checks`);
    
    // Process with concurrency limit to avoid overwhelming external API
    const concurrencyLimit = 5;
    const results = [];
    
    for (let i = 0; i < messages.length; i += concurrencyLimit) {
      const batch = messages.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.allSettled(
        batch.map(message => this.processMessage(message))
      );
      results.push(...batchResults);
    }

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    logger.info('Batch processing complete', { total: messages.length, successful, failed });
  }
}

/**
 * Queue handler for Cloudflare Workers
 */
export async function handleBackgroundCheckQueue(batch: MessageBatch<BackgroundCheckMessage>, env: Env): Promise<void> {
  const processor = new BackgroundCheckProcessor(env);
  const messages = batch.messages.map(m => m.body);
  
  await processor.processBatch(messages);
  
  // Acknowledge all messages
  batch.messages.forEach(message => message.ack());
}
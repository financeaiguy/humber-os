import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import type { Env } from '@humber/types';
import { hiringStep2, engineers } from '@humber/database';
import { Logger } from '@humber/utils';

interface DrugTestMessage {
  engineerId: string;
  tenantId: string;
  testType: 'standard' | 'dot' | 'comprehensive';
  scheduledDate: string;
  labLocation?: string;
  retryCount?: number;
}

const logger = new Logger('drug-test-processor');

/**
 * Drug Test Processor
 * Handles drug test scheduling and result processing
 * Idempotent: Can be safely retried without duplicating tests
 */
export class DrugTestProcessor {
  private env: Env;
  private db: any;

  constructor(env: Env) {
    this.env = env;
    this.db = drizzle(env.DB);
  }

  /**
   * Process a single drug test message
   * @param message - The drug test scheduling request
   * @returns Processing result
   */
  async processMessage(message: DrugTestMessage): Promise<{ success: boolean; result?: any; error?: string }> {
    const { engineerId, tenantId, testType, scheduledDate, labLocation } = message;
    
    try {
      logger.info('Processing drug test', { engineerId, testType, scheduledDate });

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

      // Check if hiring step 2 record exists
      const existingRecord = await this.db.select()
        .from(hiringStep2)
        .where(and(
          eq(hiringStep2.engineerId, engineerId),
          eq(hiringStep2.tenantId, tenantId)
        ))
        .limit(1);

      const scheduledTimestamp = new Date(scheduledDate).getTime();

      if (existingRecord.length > 0) {
        // Update existing record - idempotent operation
        await this.db.update(hiringStep2)
          .set({
            drugTest: true,
            drugTestDate: scheduledTimestamp,
            drugTestResult: 'pending',
            updatedAt: Date.now(),
          })
          .where(and(
            eq(hiringStep2.engineerId, engineerId),
            eq(hiringStep2.tenantId, tenantId)
          ));

        logger.info('Updated drug test schedule', { engineerId, existingRecordId: existingRecord[0].id });
      } else {
        // Create new hiring step 2 record
        await this.db.insert(hiringStep2).values({
          id: `hire2_${Date.now()}_${engineerId}`,
          tenantId,
          engineerId,
          drugTest: true,
          drugTestDate: scheduledTimestamp,
          drugTestResult: 'pending',
          backgroundCheck: false,
          certification: false,
          ssnTin: false,
          allChecksPassed: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        logger.info('Created new hiring step 2 record with drug test', { engineerId });
      }

      // Schedule lab appointment (mock external API call)
      const appointmentResult = await this.scheduleLabAppointment({
        engineerId,
        testType,
        scheduledDate,
        labLocation: labLocation || 'Default Lab Location',
      });

      // Update engineer status to Processing
      await this.db.update(engineers)
        .set({
          status: 'Processing',
          updatedAt: Date.now(),
        })
        .where(and(
          eq(engineers.id, engineerId),
          eq(engineers.tenantId, tenantId)
        ));

      // Store appointment details in KV cache
      await this.env.KV_CACHE.put(
        `drug_test:${tenantId}:${engineerId}`,
        JSON.stringify({
          appointmentId: appointmentResult.appointmentId,
          scheduledDate,
          testType,
          labLocation,
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        }),
        { expirationTtl: 30 * 24 * 60 * 60 } // 30 days
      );

      return {
        success: true,
        result: {
          engineerId,
          appointmentId: appointmentResult.appointmentId,
          scheduledDate,
          status: 'scheduled',
        },
      };
    } catch (error) {
      logger.error('Failed to process drug test', error);
      
      // Implement retry logic
      const retryCount = message.retryCount || 0;
      if (retryCount < 3) {
        // Re-queue with incremented retry count
        await this.env.OPERATIONS_QUEUE.send({
          ...message,
          retryCount: retryCount + 1,
        }, {
          delaySeconds: Math.pow(2, retryCount) * 60, // Exponential backoff
        });
        
        logger.info('Re-queued drug test for retry', { engineerId, retryCount: retryCount + 1 });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process drug test results
   * @param engineerId - Engineer ID
   * @param result - Test result (pass/fail)
   */
  async processTestResult(engineerId: string, tenantId: string, result: 'pass' | 'fail'): Promise<void> {
    try {
      logger.info('Processing drug test result', { engineerId, result });

      // Update hiring step 2 record
      await this.db.update(hiringStep2)
        .set({
          drugTestResult: result,
          updatedAt: Date.now(),
        })
        .where(and(
          eq(hiringStep2.engineerId, engineerId),
          eq(hiringStep2.tenantId, tenantId)
        ));

      // Check if all tests are complete
      const record = await this.db.select()
        .from(hiringStep2)
        .where(and(
          eq(hiringStep2.engineerId, engineerId),
          eq(hiringStep2.tenantId, tenantId)
        ))
        .limit(1);

      if (record.length > 0) {
        const allPassed = 
          record[0].drugTestResult === 'pass' &&
          record[0].backgroundCheckResult === 'clear' &&
          record[0].certification === true &&
          record[0].ssnTin === true;

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

          // Update engineer status to Buffered (ready for deployment)
          await this.db.update(engineers)
            .set({
              status: 'Buffered',
              updatedAt: Date.now(),
            })
            .where(and(
              eq(engineers.id, engineerId),
              eq(engineers.tenantId, tenantId)
            ));

          logger.info('All checks passed, engineer ready for deployment', { engineerId });
        }
      }

      // Clear cache
      await this.env.KV_CACHE.delete(`drug_test:${tenantId}:${engineerId}`);

    } catch (error) {
      logger.error('Failed to process drug test result', error);
      throw error;
    }
  }

  /**
   * Mock external lab appointment scheduling
   */
  private async scheduleLabAppointment(data: any): Promise<{ appointmentId: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock appointment ID
    return {
      appointmentId: `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * Batch process multiple drug test messages
   * @param messages - Array of drug test messages
   */
  async processBatch(messages: DrugTestMessage[]): Promise<void> {
    logger.info(`Processing batch of ${messages.length} drug tests`);
    
    const results = await Promise.allSettled(
      messages.map(message => this.processMessage(message))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    logger.info('Batch processing complete', { total: messages.length, successful, failed });
  }
}

/**
 * Queue handler for Cloudflare Workers
 */
export async function handleDrugTestQueue(batch: MessageBatch<DrugTestMessage>, env: Env): Promise<void> {
  const processor = new DrugTestProcessor(env);
  const messages = batch.messages.map(m => m.body);
  
  await processor.processBatch(messages);
  
  // Acknowledge all messages
  batch.messages.forEach(message => message.ack());
}
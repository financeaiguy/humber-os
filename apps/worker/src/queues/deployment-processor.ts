import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import type { Env } from '@humber/types';
import { engineers, deployments, operationLogs } from '@humber/database';
import { Logger, generateId } from '@humber/utils';

interface DeploymentMessage {
  engineerId: string;
  tenantId: string;
  action: 'deploy' | 'complete' | 'terminate' | 'update_status';
  deploymentData?: {
    clientName: string;
    projectName: string;
    location: string;
    startDate: string;
    endDate?: string;
    jobsCount?: number;
  };
  outcome?: 'pass' | 'fail';
  reason?: string;
  metrics?: {
    tasksCompleted?: number;
    qualityScore?: number;
    clientSatisfaction?: number;
  };
  retryCount?: number;
}

interface DeploymentMetrics {
  totalDeployments: number;
  activeDeployments: number;
  passedDeployments: number;
  failedDeployments: number;
  successRate: number;
  averageJobsPerDeployment: number;
}

const logger = new Logger('deployment-processor');

/**
 * Deployment Processor
 * Handles deployment state changes, availability updates, and pass/fail metrics
 * Idempotent: Safe to retry without creating duplicate deployments
 */
export class DeploymentProcessor {
  private env: Env;
  private db: any;

  constructor(env: Env) {
    this.env = env;
    this.db = drizzle(env.DB);
  }

  /**
   * Process a single deployment message
   * @param message - The deployment message
   * @returns Processing result
   */
  async processMessage(message: DeploymentMessage): Promise<{ success: boolean; result?: any; error?: string }> {
    const { engineerId, tenantId, action } = message;
    
    try {
      logger.info('Processing deployment action', { engineerId, action });

      // Verify engineer exists
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

      let result;
      switch (action) {
        case 'deploy':
          result = await this.handleDeploy(engineerId, tenantId, message.deploymentData!);
          break;
        case 'complete':
          result = await this.handleComplete(engineerId, tenantId, message.outcome!, message.reason);
          break;
        case 'terminate':
          result = await this.handleTerminate(engineerId, tenantId, message.reason);
          break;
        case 'update_status':
          result = await this.handleStatusUpdate(engineerId, tenantId, message.metrics);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Update metrics cache
      await this.updateMetricsCache(engineerId, tenantId);

      return {
        success: true,
        result,
      };
    } catch (error) {
      logger.error('Failed to process deployment', error);
      
      // Retry logic for transient failures
      const retryCount = message.retryCount || 0;
      if (retryCount < 3) {
        await this.env.OPERATIONS_QUEUE.send({
          ...message,
          retryCount: retryCount + 1,
        }, {
          delaySeconds: Math.pow(2, retryCount) * 60, // Exponential backoff
        });
        
        logger.info('Re-queued deployment for retry', { engineerId, retryCount: retryCount + 1 });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle new deployment
   */
  private async handleDeploy(engineerId: string, tenantId: string, deploymentData: any): Promise<any> {
    logger.info('Creating new deployment', { engineerId, clientName: deploymentData.clientName });

    // Check if engineer is available for deployment
    const engineer = await this.db.select()
      .from(engineers)
      .where(and(
        eq(engineers.id, engineerId),
        eq(engineers.tenantId, tenantId)
      ))
      .limit(1);

    if (engineer[0].status !== 'Buffered' && engineer[0].status !== 'Available') {
      throw new Error(`Engineer ${engineerId} is not available for deployment. Current status: ${engineer[0].status}`);
    }

    // Check for existing active deployment
    const activeDeployment = await this.db.select()
      .from(deployments)
      .where(and(
        eq(deployments.engineerId, engineerId),
        eq(deployments.tenantId, tenantId),
        eq(deployments.status, 'active')
      ))
      .limit(1);

    if (activeDeployment.length > 0) {
      logger.warn('Engineer already has active deployment', { engineerId, deploymentId: activeDeployment[0].id });
      return {
        deploymentId: activeDeployment[0].id,
        status: 'already_deployed',
        message: 'Engineer already has an active deployment',
      };
    }

    // Create new deployment
    const deploymentId = generateId('deploy');
    const startDate = new Date(deploymentData.startDate).getTime();
    const endDate = deploymentData.endDate ? new Date(deploymentData.endDate).getTime() : null;

    await this.db.insert(deployments).values({
      id: deploymentId,
      tenantId,
      engineerId,
      clientName: deploymentData.clientName,
      projectName: deploymentData.projectName,
      location: deploymentData.location,
      startDate,
      endDate,
      jobsCount: deploymentData.jobsCount || 0,
      passed: 0,
      failed: 0,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update engineer status to Deployed
    await this.db.update(engineers)
      .set({
        status: 'Deployed',
        updatedAt: Date.now(),
      })
      .where(and(
        eq(engineers.id, engineerId),
        eq(engineers.tenantId, tenantId)
      ));

    // Create operation log
    await this.db.insert(operationLogs).values({
      id: generateId('log'),
      tenantId,
      candidateId: engineerId,
      operationType: 'deployment_started',
      status: 'success',
      details: JSON.stringify(deploymentData),
      createdAt: Date.now(),
    });

    // Store deployment details in KV cache
    await this.env.KV_CACHE.put(
      `deployment:${tenantId}:${deploymentId}`,
      JSON.stringify({
        deploymentId,
        engineerId,
        clientName: deploymentData.clientName,
        projectName: deploymentData.projectName,
        startDate: deploymentData.startDate,
        status: 'active',
        createdAt: new Date().toISOString(),
      }),
      { expirationTtl: 365 * 24 * 60 * 60 } // 1 year
    );

    logger.info('Deployment created successfully', { deploymentId, engineerId });

    return {
      deploymentId,
      engineerId,
      status: 'deployed',
      startDate: deploymentData.startDate,
      clientName: deploymentData.clientName,
    };
  }

  /**
   * Handle deployment completion
   */
  private async handleComplete(engineerId: string, tenantId: string, outcome: 'pass' | 'fail', reason?: string): Promise<any> {
    logger.info('Completing deployment', { engineerId, outcome });

    // Get active deployment
    const deployment = await this.db.select()
      .from(deployments)
      .where(and(
        eq(deployments.engineerId, engineerId),
        eq(deployments.tenantId, tenantId),
        eq(deployments.status, 'active')
      ))
      .limit(1);

    if (!deployment.length) {
      throw new Error(`No active deployment found for engineer ${engineerId}`);
    }

    const deploymentRecord = deployment[0];

    // Update deployment with outcome
    const updates: any = {
      status: 'completed',
      endDate: Date.now(),
      updatedAt: Date.now(),
    };

    if (outcome === 'pass') {
      updates.passed = deploymentRecord.passed + 1;
    } else {
      updates.failed = deploymentRecord.failed + 1;
    }

    await this.db.update(deployments)
      .set(updates)
      .where(eq(deployments.id, deploymentRecord.id));

    // Update engineer status back to Available or Buffered
    const newStatus = outcome === 'pass' ? 'Buffered' : 'Available';
    await this.db.update(engineers)
      .set({
        status: newStatus,
        updatedAt: Date.now(),
      })
      .where(and(
        eq(engineers.id, engineerId),
        eq(engineers.tenantId, tenantId)
      ));

    // Create operation log
    await this.db.insert(operationLogs).values({
      id: generateId('log'),
      tenantId,
      candidateId: engineerId,
      operationType: 'deployment_completed',
      status: outcome,
      details: JSON.stringify({
        deploymentId: deploymentRecord.id,
        outcome,
        reason,
        duration: Date.now() - deploymentRecord.startDate,
      }),
      createdAt: Date.now(),
    });

    // Update metrics
    const metrics = await this.calculateEngineerMetrics(engineerId, tenantId);

    logger.info('Deployment completed', { 
      deploymentId: deploymentRecord.id, 
      outcome,
      newStatus,
      metrics 
    });

    return {
      deploymentId: deploymentRecord.id,
      outcome,
      newEngineerStatus: newStatus,
      metrics,
    };
  }

  /**
   * Handle deployment termination
   */
  private async handleTerminate(engineerId: string, tenantId: string, reason?: string): Promise<any> {
    logger.info('Terminating deployment', { engineerId, reason });

    // Get active deployment
    const deployment = await this.db.select()
      .from(deployments)
      .where(and(
        eq(deployments.engineerId, engineerId),
        eq(deployments.tenantId, tenantId),
        eq(deployments.status, 'active')
      ))
      .limit(1);

    if (!deployment.length) {
      logger.warn('No active deployment to terminate', { engineerId });
      return {
        status: 'no_active_deployment',
        message: 'No active deployment found',
      };
    }

    const deploymentRecord = deployment[0];

    // Update deployment status
    await this.db.update(deployments)
      .set({
        status: 'terminated',
        endDate: Date.now(),
        clientFeedback: reason,
        updatedAt: Date.now(),
      })
      .where(eq(deployments.id, deploymentRecord.id));

    // Update engineer status to Available
    await this.db.update(engineers)
      .set({
        status: 'Available',
        updatedAt: Date.now(),
      })
      .where(and(
        eq(engineers.id, engineerId),
        eq(engineers.tenantId, tenantId)
      ));

    // Create operation log
    await this.db.insert(operationLogs).values({
      id: generateId('log'),
      tenantId,
      candidateId: engineerId,
      operationType: 'deployment_terminated',
      status: 'terminated',
      details: JSON.stringify({
        deploymentId: deploymentRecord.id,
        reason,
        duration: Date.now() - deploymentRecord.startDate,
      }),
      createdAt: Date.now(),
    });

    logger.info('Deployment terminated', { deploymentId: deploymentRecord.id });

    return {
      deploymentId: deploymentRecord.id,
      status: 'terminated',
      reason,
    };
  }

  /**
   * Handle status update with metrics
   */
  private async handleStatusUpdate(engineerId: string, tenantId: string, metrics?: any): Promise<any> {
    logger.info('Updating deployment status', { engineerId, metrics });

    // Get active deployment
    const deployment = await this.db.select()
      .from(deployments)
      .where(and(
        eq(deployments.engineerId, engineerId),
        eq(deployments.tenantId, tenantId),
        eq(deployments.status, 'active')
      ))
      .limit(1);

    if (!deployment.length) {
      throw new Error(`No active deployment found for engineer ${engineerId}`);
    }

    const deploymentRecord = deployment[0];

    // Update deployment metrics
    if (metrics) {
      const updates: any = {
        updatedAt: Date.now(),
      };

      if (metrics.tasksCompleted !== undefined) {
        updates.jobsCount = deploymentRecord.jobsCount + metrics.tasksCompleted;
      }

      if (metrics.qualityScore !== undefined) {
        updates.performanceRating = metrics.qualityScore;
      }

      await this.db.update(deployments)
        .set(updates)
        .where(eq(deployments.id, deploymentRecord.id));
    }

    return {
      deploymentId: deploymentRecord.id,
      metricsUpdated: true,
      currentMetrics: {
        jobsCount: deploymentRecord.jobsCount + (metrics?.tasksCompleted || 0),
        performanceRating: metrics?.qualityScore || deploymentRecord.performanceRating,
      },
    };
  }

  /**
   * Calculate engineer metrics
   */
  private async calculateEngineerMetrics(engineerId: string, tenantId: string): Promise<DeploymentMetrics> {
    const allDeployments = await this.db.select()
      .from(deployments)
      .where(and(
        eq(deployments.engineerId, engineerId),
        eq(deployments.tenantId, tenantId)
      ));

    const totalDeployments = allDeployments.length;
    const activeDeployments = allDeployments.filter(d => d.status === 'active').length;
    const completedDeployments = allDeployments.filter(d => d.status === 'completed');
    
    const passedDeployments = completedDeployments.reduce((sum, d) => sum + d.passed, 0);
    const failedDeployments = completedDeployments.reduce((sum, d) => sum + d.failed, 0);
    const totalJobs = allDeployments.reduce((sum, d) => sum + d.jobsCount, 0);

    const successRate = (passedDeployments + failedDeployments) > 0 
      ? (passedDeployments / (passedDeployments + failedDeployments)) * 100 
      : 0;

    const averageJobsPerDeployment = totalDeployments > 0 
      ? totalJobs / totalDeployments 
      : 0;

    return {
      totalDeployments,
      activeDeployments,
      passedDeployments,
      failedDeployments,
      successRate,
      averageJobsPerDeployment,
    };
  }

  /**
   * Update metrics cache
   */
  private async updateMetricsCache(engineerId: string, tenantId: string): Promise<void> {
    const metrics = await this.calculateEngineerMetrics(engineerId, tenantId);
    
    await this.env.KV_CACHE.put(
      `engineer_metrics:${tenantId}:${engineerId}`,
      JSON.stringify({
        ...metrics,
        lastUpdated: new Date().toISOString(),
      }),
      { expirationTtl: 24 * 60 * 60 } // 24 hours
    );
  }

  /**
   * Batch process multiple deployment messages
   */
  async processBatch(messages: DeploymentMessage[]): Promise<void> {
    logger.info(`Processing batch of ${messages.length} deployment actions`);
    
    // Group by action type for optimized processing
    const grouped = messages.reduce((acc, msg) => {
      if (!acc[msg.action]) acc[msg.action] = [];
      acc[msg.action].push(msg);
      return acc;
    }, {} as Record<string, DeploymentMessage[]>);

    // Process each action type
    for (const [action, actionMessages] of Object.entries(grouped)) {
      logger.info(`Processing ${actionMessages.length} ${action} actions`);
      
      const results = await Promise.allSettled(
        actionMessages.map(message => this.processMessage(message))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
      
      logger.info(`${action} processing complete`, { successful, failed });
    }
  }
}

/**
 * Queue handler for Cloudflare Workers
 */
export async function handleDeploymentQueue(batch: MessageBatch<DeploymentMessage>, env: Env): Promise<void> {
  const processor = new DeploymentProcessor(env);
  const messages = batch.messages.map(m => m.body);
  
  await processor.processBatch(messages);
  
  // Acknowledge all messages
  batch.messages.forEach(message => message.ack());
}
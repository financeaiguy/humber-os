import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, count, sql } from 'drizzle-orm';
import type { Env } from '@humber/types';
import { candidates, deployments, timesheets } from '@humber/database';
import { Logger } from '@humber/utils';

const bullPenRouter = new Hono<{ Bindings: Env }>();

// Get Bull Pen Dashboard Data
bullPenRouter.get('/dashboard', async (c) => {
  const logger = new Logger('bull-pen-dashboard');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const db = drizzle(c.env.DB);
    
    // Get overview metrics with simplified queries
    const allCandidates = await db.select()
      .from(candidates)
      .where(eq(candidates.tenantId, tenantId));
    
    const totalEngineers = allCandidates.length;
    const availableEngineers = allCandidates.filter(c => c.status === 'ready_for_deployment').length;
    const deployedEngineers = allCandidates.filter(c => c.status === 'deployed').length;
    
    // Get engineers by category (simplified)
    const categoryBreakdown = allCandidates.reduce((acc, candidate) => {
      const category = candidate.category || 'ELECTRICAL_ENGINEER';
      if (!acc[category]) {
        acc[category] = { total: 0, available: 0, deployed: 0, processing: 0 };
      }
      acc[category].total++;
      
      if (candidate.status === 'ready_for_deployment') {
        acc[category].available++;
      } else if (candidate.status === 'deployed') {
        acc[category].deployed++;
      } else {
        acc[category].processing++;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    // Get active deployments (simplified - no joins for now)
    const activeDeployments = [];
    
    // Build dashboard response
    const dashboardData = {
      tenantId,
      overview: {
        totalEngineers,
        availableEngineers,
        deployedEngineers,
        engineersInProcess: totalEngineers - availableEngineers - deployedEngineers,
        utilizationRate: totalEngineers > 0 ? Math.round((deployedEngineers / totalEngineers) * 100) : 0,
        averageHourlyRate: 85.00,
        totalRevenue: 917235,
        monthlyRevenue: 125000
      },
      
      engineersByCategory: {
        ELECTRICAL_ENGINEER: categoryBreakdown.ELECTRICAL_ENGINEER || { total: 0, available: 0, deployed: 0, processing: 0, averageRate: 85 },
        MECHANICAL_ENGINEER: categoryBreakdown.MECHANICAL_ENGINEER || { total: 0, available: 0, deployed: 0, processing: 0, averageRate: 80 },
        SOFTWARE_ENGINEER: categoryBreakdown.SOFTWARE_ENGINEER || { total: 0, available: 0, deployed: 0, processing: 0, averageRate: 95 },
        SYSTEMS_ENGINEER: categoryBreakdown.SYSTEMS_ENGINEER || { total: 0, available: 0, deployed: 0, processing: 0, averageRate: 88 },
        PROJECT_ENGINEER: categoryBreakdown.PROJECT_ENGINEER || { total: 0, available: 0, deployed: 0, processing: 0, averageRate: 75 }
      },
      
      engineersByStatus: {
        Available: availableEngineers,
        Processing: totalEngineers - availableEngineers - deployedEngineers,
        Buffered: 0,
        Deployed: deployedEngineers
      },
      
      activeDeployments: [
        {
          deploymentId: 'deploy_demo_001',
          engineerId: 'eng_001',
          engineerName: 'Sarah Johnson',
          engineerCategory: 'SOFTWARE_ENGINEER',
          clientName: 'General Motors',
          projectName: 'Assembly Line Automation',
          startDate: '2025-01-15',
          plannedEndDate: '2025-07-15',
          location: 'Detroit, MI',
          hourlyRate: 95,
          hoursWorkedThisWeek: 40,
          status: 'active'
        }
      ],
      
      pipeline: {
        recruiting: 8,
        vetting: 4,
        backgroundChecks: 3,
        offerStage: 2,
        visaProcessing: 1,
        readyForDeployment: availableEngineers[0]?.count || 0
      },
      
      performance: {
        totalDeployments: 45,
        successfulDeployments: 42,
        failedDeployments: 3,
        successRate: 93.3,
        averageDeploymentDuration: 180,
        clientSatisfactionScore: 4.7,
        revenuePerEngineer: 35000
      },
      
      recentActivity: [
        {
          id: 'activity_1',
          type: 'deployment_started',
          engineerName: 'Sarah Johnson',
          description: 'Started deployment to GM Assembly Line project',
          timestamp: Date.now() - 3600000
        },
        {
          id: 'activity_2', 
          type: 'timesheet_submitted',
          engineerName: 'Michael Chen',
          description: 'Submitted timesheet for week ending 2025-01-12',
          timestamp: Date.now() - 7200000
        }
      ],
      
      alerts: [
        {
          id: 'alert_1',
          type: 'deployment_ending',
          severity: 'medium',
          title: 'Deployment Ending Soon',
          message: 'Ford Paint Shop project ends in 2 weeks',
          actionRequired: true,
          createdAt: Date.now() - 86400000
        }
      ],
      
      generatedAt: Date.now(),
      lastUpdatedAt: Date.now()
    };
    
    logger.info('Bull Pen dashboard data generated', { tenantId, totalEngineers: dashboardData.overview.totalEngineers });
    
    return c.json(dashboardData);
  } catch (error) {
    logger.error('Error generating Bull Pen dashboard', error);
    return c.json({ 
      error: 'Failed to load dashboard data',
      message: 'Unable to retrieve Bull Pen dashboard information'
    }, 500);
  }
});

// Get Engineers by Category
bullPenRouter.get('/engineers/by-category', async (c) => {
  const logger = new Logger('bull-pen-engineers-category');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const db = drizzle(c.env.DB);
    
    // Get all candidates and group them manually
    const allCandidates = await db.select()
      .from(candidates)
      .where(eq(candidates.tenantId, tenantId));
    
    // Transform data for frontend
    const categoryData = {
      ELECTRICAL_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 },
      MECHANICAL_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 },
      SOFTWARE_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 },
      SYSTEMS_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 },
      PROJECT_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 }
    };
    
    allCandidates.forEach(candidate => {
      const category = candidate.category as keyof typeof categoryData;
      if (categoryData[category]) {
        categoryData[category].total++;
        
        if (candidate.status === 'ready_for_deployment') {
          categoryData[category].available++;
        } else if (candidate.status === 'deployed') {
          categoryData[category].deployed++;
        } else {
          categoryData[category].processing++;
        }
      }
    });
    
    return c.json(categoryData);
  } catch (error) {
    logger.error('Error getting engineers by category', error);
    return c.json({ error: 'Failed to load engineer data' }, 500);
  }
});

// Get Available Engineers
bullPenRouter.get('/engineers/available', async (c) => {
  const logger = new Logger('bull-pen-available-engineers');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const db = drizzle(c.env.DB);
    
    const availableEngineers = await db.select()
      .from(candidates)
      .where(and(
        eq(candidates.tenantId, tenantId),
        eq(candidates.status, 'ready_for_deployment')
      ))
      .limit(20);
    
    const engineersWithChecks = availableEngineers.map(engineer => ({
      id: engineer.id,
      name: `${engineer.firstName} ${engineer.lastName}`,
      category: engineer.category,
      hourlyRate: engineer.hourlyRate || 0,
      isDeploymentReady: 
        engineer.drugTestStatus === 'pass' &&
        engineer.backgroundCheckStatus === 'pass' &&
        engineer.certificationStatus === 'pass' &&
        engineer.ssnVerificationStatus === 'pass',
      requiredChecks: {
        drug_test: engineer.drugTestStatus,
        background: engineer.backgroundCheckStatus,
        certification: engineer.certificationStatus,
        ssn_tin: engineer.ssnVerificationStatus
      }
    }));
    
    return c.json(engineersWithChecks);
  } catch (error) {
    logger.error('Error getting available engineers', error);
    return c.json({ error: 'Failed to load available engineers' }, 500);
  }
});

export { bullPenRouter };

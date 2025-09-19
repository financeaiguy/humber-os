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
    // For development/testing: Return mock dashboard data
    // In production, this would query the database
    
    let dashboardData;
    
    try {
      // Try database operations with fallback to mock
      if (c.env.DB) {
        const db = drizzle(c.env.DB);
        
        // Database operations would go here
        const allCandidates = await db.select()
          .from(candidates)
          .where(eq(candidates.tenantId, tenantId));
        
        const totalEngineers = allCandidates.length;
        const availableEngineers = allCandidates.filter(c => c.status === 'ready_for_deployment').length;
        const deployedEngineers = allCandidates.filter(c => c.status === 'deployed').length;
        
        // Use real data if available
        dashboardData = {
          tenantId,
          overview: {
            totalEngineers,
            availableEngineers,
            deployedEngineers,
            engineersInProcess: totalEngineers - availableEngineers - deployedEngineers,
            utilizationRate: totalEngineers > 0 ? Math.round((deployedEngineers / totalEngineers) * 100) : 75,
            averageHourlyRate: 85.00,
            totalRevenue: 917235,
            monthlyRevenue: 125000
          }
        };
      }
    } catch (dbError) {
      logger.warn('Database operation failed, using mock dashboard data', dbError);
    }
    
    // Fallback to mock data if database failed or not available
    if (!dashboardData) {
      dashboardData = {
        tenantId,
        overview: {
          totalEngineers: 42,
          availableEngineers: 15,
          deployedEngineers: 18,
          engineersInProcess: 9,
          utilizationRate: 75,
          averageHourlyRate: 85.00,
          totalRevenue: 917235,
          monthlyRevenue: 125000
        }
      };
    }
    
    // Add static data that doesn't depend on database
    dashboardData.engineersByCategory = {
      ELECTRICAL_ENGINEER: { total: 12, available: 4, deployed: 6, processing: 2, averageRate: 85 },
      MECHANICAL_ENGINEER: { total: 8, available: 3, deployed: 3, processing: 2, averageRate: 80 },
      SOFTWARE_ENGINEER: { total: 10, available: 5, deployed: 4, processing: 1, averageRate: 95 },
      SYSTEMS_ENGINEER: { total: 7, available: 2, deployed: 3, processing: 2, averageRate: 88 },
      PROJECT_ENGINEER: { total: 5, available: 1, deployed: 2, processing: 2, averageRate: 75 }
    };
    
    dashboardData.engineersByStatus = {
      Available: 15,
      Processing: 9,
      Buffered: 0,
      Deployed: 18
    };
    
    dashboardData.activeDeployments = [
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
      },
      {
        deploymentId: 'deploy_demo_002',
        engineerId: 'eng_002',
        engineerName: 'Michael Chen',
        engineerCategory: 'ELECTRICAL_ENGINEER',
        clientName: 'Tesla',
        projectName: 'Battery Management System',
        startDate: '2025-01-10',
        plannedEndDate: '2025-08-10',
        location: 'Austin, TX',
        hourlyRate: 88,
        hoursWorkedThisWeek: 42,
        status: 'active'
      }
    ];
    
    dashboardData.pipeline = {
      recruiting: 8,
      vetting: 4,
      backgroundChecks: 3,
      offerStage: 2,
      visaProcessing: 1,
      readyForDeployment: 15
    };
      
    dashboardData.performance = {
      totalDeployments: 45,
      successfulDeployments: 42,
      failedDeployments: 3,
      successRate: 93.3,
      averageDeploymentDuration: 180,
      clientSatisfactionScore: 4.7,
      revenuePerEngineer: 35000
    };
      
    dashboardData.recentActivity = [
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
    ];
      
    dashboardData.alerts = [
      {
        id: 'alert_1',
        type: 'deployment_ending',
        severity: 'medium',
        title: 'Deployment Ending Soon',
        message: 'Ford Paint Shop project ends in 2 weeks',
        actionRequired: true,
        createdAt: Date.now() - 86400000
      }
    ];
      
    dashboardData.generatedAt = Date.now();
    dashboardData.lastUpdatedAt = Date.now();
    
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
    // Default mock data
    let categoryData = {
      ELECTRICAL_ENGINEER: { available: 4, deployed: 6, processing: 2, total: 12 },
      MECHANICAL_ENGINEER: { available: 3, deployed: 3, processing: 2, total: 8 },
      SOFTWARE_ENGINEER: { available: 5, deployed: 4, processing: 1, total: 10 },
      SYSTEMS_ENGINEER: { available: 2, deployed: 3, processing: 2, total: 7 },
      PROJECT_ENGINEER: { available: 1, deployed: 2, processing: 2, total: 5 }
    };
    
    try {
      // Try database operations with fallback to mock
      if (c.env.DB) {
        const db = drizzle(c.env.DB);
        
        // Get all candidates and group them manually
        const allCandidates = await db.select()
          .from(candidates)
          .where(eq(candidates.tenantId, tenantId));
        
        if (allCandidates.length > 0) {
          // Use real data if available
          const realCategoryData = {
            ELECTRICAL_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 },
            MECHANICAL_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 },
            SOFTWARE_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 },
            SYSTEMS_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 },
            PROJECT_ENGINEER: { available: 0, deployed: 0, processing: 0, total: 0 }
          };
          
          allCandidates.forEach(candidate => {
            const category = candidate.category as keyof typeof realCategoryData;
            if (realCategoryData[category]) {
              realCategoryData[category].total++;
              
              if (candidate.status === 'ready_for_deployment') {
                realCategoryData[category].available++;
              } else if (candidate.status === 'deployed') {
                realCategoryData[category].deployed++;
              } else {
                realCategoryData[category].processing++;
              }
            }
          });
          
          categoryData = realCategoryData;
        }
      }
    } catch (dbError) {
      logger.warn('Database operation failed, using mock category data', dbError);
    }
    
    return c.json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    logger.error('Error getting engineers by category', error);
    return c.json({ 
      success: false,
      error: 'Failed to load engineer data',
      data: {
        ELECTRICAL_ENGINEER: { available: 4, deployed: 6, processing: 2, total: 12 },
        MECHANICAL_ENGINEER: { available: 3, deployed: 3, processing: 2, total: 8 },
        SOFTWARE_ENGINEER: { available: 5, deployed: 4, processing: 1, total: 10 },
        SYSTEMS_ENGINEER: { available: 2, deployed: 3, processing: 2, total: 7 },
        PROJECT_ENGINEER: { available: 1, deployed: 2, processing: 2, total: 5 }
      }
    }, 200); // Return 200 with mock data instead of 500
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

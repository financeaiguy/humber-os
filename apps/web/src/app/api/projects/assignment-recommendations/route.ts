import { NextRequest, NextResponse } from 'next/server';
import { projectAssignmentService } from '@/lib/project-assignment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { engineerId, tenantId } = body;

    if (!engineerId || !tenantId) {
      return NextResponse.json(
        { error: 'Engineer ID and Tenant ID are required' },
        { status: 400 }
      );
    }

    // TODO: In a real implementation, you would:
    // 1. Fetch engineer data from database using engineerId and tenantId
    // 2. Fetch available projects from database for the tenant
    // 3. Apply any additional filtering based on engineer permissions/clearances

    // Mock data for demonstration
    const mockEngineer = {
      id: engineerId,
      name: 'John Doe',
      category: 'MECHANICAL_ENGINEER' as const,
      location: 'Detroit, MI',
      coordinates: { lat: 42.3314, lng: -83.0458 },
      hourlyRate: 115,
      skills: ['AutoCAD', 'SolidWorks', 'FEA Analysis'],
      availability: 'Available',
      experience: 6,
      rating: 4.7,
      travelPreferences: {
        maxTravelDistance: 800,
        willingToRelocate: true,
        hasValidPassport: true,
        preferredProjects: ['domestic', 'international'],
        maxTravelDuration: 90
      },
      workAuthorization: {
        countries: ['US', 'CA', 'MX'],
        restrictions: [],
        expirationDate: 'permanent'
      }
    };

    const mockProjects = [
      {
        id: 'proj-001',
        name: 'Tesla Model Y Line Expansion',
        client: 'Tesla Motors',
        location: 'Austin, TX',
        coordinates: { lat: 30.2672, lng: -97.7431 },
        startDate: '2024-02-01',
        endDate: '2024-08-15',
        engineersNeeded: { 'MECHANICAL_ENGINEER': 2, 'ELECTRICAL_ENGINEER': 1 },
        skills: ['AutoCAD', 'Manufacturing'],
        urgency: 'High' as const,
        budget: 2500000,
        travelRequired: true,
        housingProvided: true,
        preferredExperience: 5,
        workCountry: 'US'
      },
      {
        id: 'proj-002',
        name: 'Ford F-150 Lightning Assembly',
        client: 'Ford Motor Company',
        location: 'Dearborn, MI',
        coordinates: { lat: 42.3223, lng: -83.1763 },
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        engineersNeeded: { 'MECHANICAL_ENGINEER': 3, 'ELECTRICAL_ENGINEER': 2 },
        skills: ['SolidWorks', 'Automotive'],
        urgency: 'Medium' as const,
        budget: 4200000,
        travelRequired: false,
        housingProvided: false,
        preferredExperience: 4,
        workCountry: 'US'
      }
    ];

    const recommendations = projectAssignmentService.generateAssignmentRecommendations(
      mockEngineer,
      mockProjects
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        tenantId,
        engineerId
      }
    });

  } catch (error) {
    console.error('Error generating project recommendations:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate project recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const tenantId = searchParams.get('tenantId');

  if (!projectId || !tenantId) {
    return NextResponse.json(
      { error: 'Project ID and Tenant ID are required' },
      { status: 400 }
    );
  }

  try {
    // TODO: Fetch project and available engineers from database
    
    // Mock data for demonstration
    const mockProject = {
      id: projectId,
      name: 'Sample Project',
      client: 'Sample Client',
      location: 'Austin, TX',
      startDate: '2024-02-01',
      endDate: '2024-08-15',
      engineersNeeded: { 'MECHANICAL_ENGINEER': 2, 'ELECTRICAL_ENGINEER': 1 },
      skills: ['AutoCAD', 'Manufacturing'],
      urgency: 'High' as const,
      budget: 2500000,
      travelRequired: true,
      housingProvided: true,
      preferredExperience: 5,
      workCountry: 'US'
    };

    const mockEngineers = [
      {
        id: 'eng-001',
        name: 'Sarah Chen',
        category: 'MECHANICAL_ENGINEER' as const,
        location: 'Austin, TX',
        coordinates: { lat: 30.2672, lng: -97.7431 },
        hourlyRate: 125,
        skills: ['AutoCAD', 'Manufacturing', 'Quality Control'],
        availability: 'Available',
        experience: 8,
        rating: 4.9,
        travelPreferences: {
          maxTravelDistance: 500,
          willingToRelocate: false,
          hasValidPassport: true,
          preferredProjects: ['domestic'],
          maxTravelDuration: 30
        },
        workAuthorization: {
          countries: ['US'],
          restrictions: ['H1-B sponsor required'],
          expirationDate: '2025-12-31'
        }
      }
    ];

    const teamRecommendations = projectAssignmentService.calculateOptimalTeam(
      mockProject,
      mockEngineers
    );

    return NextResponse.json({
      success: true,
      data: teamRecommendations,
      project: mockProject,
      metadata: {
        generatedAt: new Date().toISOString(),
        tenantId,
        projectId
      }
    });

  } catch (error) {
    console.error('Error generating team recommendations:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate team recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
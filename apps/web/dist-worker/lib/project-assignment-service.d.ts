import { EngineerCategory, ProjectAssignmentResult } from '@humber/types';
interface Engineer {
    id: string;
    name: string;
    category: EngineerCategory;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    hourlyRate: number;
    skills: string[];
    availability: string;
    experience: number;
    rating: number;
    travelPreferences: {
        maxTravelDistance: number;
        willingToRelocate: boolean;
        hasValidPassport: boolean;
        preferredProjects: string[];
        maxTravelDuration: number;
    };
    workAuthorization: {
        countries: string[];
        restrictions: string[];
        expirationDate: string;
    };
}
interface Project {
    id: string;
    name: string;
    client: string;
    location: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    startDate: string;
    endDate: string;
    engineersNeeded: Record<string, number>;
    skills: string[];
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    budget: number;
    travelRequired: boolean;
    housingProvided: boolean;
    preferredExperience: number;
    workCountry: string;
}
export declare class ProjectAssignmentService {
    private calculateDistance;
    private deg2rad;
    private estimateTravelTime;
    private calculateSkillMatch;
    private calculateMatchScore;
    findSuitableEngineers(project: Project, availableEngineers: Engineer[], requiredCategory?: EngineerCategory): Array<{
        engineer: Engineer;
        distance: number;
        travelTime: number;
        matchScore: number;
        matchReasons: string[];
    }>;
    generateAssignmentRecommendations(engineer: Engineer, availableProjects: Project[]): ProjectAssignmentResult;
    private getLocationCoordinates;
    calculateOptimalTeam(project: Project, availableEngineers: Engineer[]): {
        recommendations: Array<{
            category: EngineerCategory;
            needed: number;
            candidates: Array<{
                engineer: Engineer;
                matchScore: number;
                distance: number;
                travelTime: number;
            }>;
        }>;
        totalEstimatedCost: number;
        averageTravelTime: number;
    };
    private calculateProjectDuration;
}
export declare const projectAssignmentService: ProjectAssignmentService;
export {};
//# sourceMappingURL=project-assignment-service.d.ts.map
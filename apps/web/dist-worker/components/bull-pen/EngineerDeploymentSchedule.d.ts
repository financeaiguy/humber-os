interface WeekSchedule {
    weekStarting: string;
    assignments: {
        day: string;
        client: string;
        location: string;
        project: string;
        hours: number;
        travelRequired: boolean;
        status: 'confirmed' | 'tentative' | 'pending';
    }[];
}
interface DeploymentRequirement {
    id: string;
    requirement: string;
    status: 'complete' | 'in-progress' | 'pending' | 'blocked';
    priority: 'critical' | 'high' | 'medium' | 'low';
    dueDate?: string;
}
interface EngineerDeploymentScheduleProps {
    engineer: {
        id: string;
        name: string;
        role: string;
        hourlyRate: number;
        location: string;
    };
    currentWeek?: WeekSchedule;
    upcomingWeeks?: WeekSchedule[];
    deploymentRequirements?: DeploymentRequirement[];
}
export default function EngineerDeploymentSchedule({ engineer, currentWeek, upcomingWeeks, deploymentRequirements }: EngineerDeploymentScheduleProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=EngineerDeploymentSchedule.d.ts.map
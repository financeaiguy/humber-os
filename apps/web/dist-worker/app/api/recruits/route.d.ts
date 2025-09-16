import { NextRequest, NextResponse } from 'next/server';
export declare const runtime = "edge";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        recruits: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            currentLocation: string;
            jobTitle: string;
            yearsExperience: number;
            currentCompany: string;
            desiredSalary: string;
            skills: string[];
            education: string;
            certifications: string[];
            availableStartDate: string;
            workAuthorization: string;
            willingToRelocate: boolean;
            travelWillingness: string;
            source: string;
            recruiterName: string;
            recruiterAgency: string;
            status: string;
            createdAt: string;
            updatedAt: string;
            notes: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}> | NextResponse<{
    success: boolean;
    error: string;
    message: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        recruitId: string;
        status: string;
        message: string;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
    message: string;
}>>;
//# sourceMappingURL=route.d.ts.map
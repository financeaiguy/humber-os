export interface WorkSite {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    address?: string;
    timezone: string;
}
export interface GeolocationResult {
    success: boolean;
    location?: {
        latitude: number;
        longitude: number;
        accuracy: number;
        altitude?: number;
        heading?: number;
        speed?: number;
        timestamp: number;
    };
    verification?: {
        isWithinWorkSite: boolean;
        distanceFromWorkSite: number;
        nearestWorkSite?: WorkSite;
        accuracyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    };
    error?: string;
}
export declare class GeolocationService {
    private static instance;
    private watchId;
    private currentPosition;
    private workSites;
    static getInstance(): GeolocationService;
    isSupported(): boolean;
    getCurrentLocation(highAccuracy?: boolean): Promise<GeolocationResult>;
    startLocationTracking(callback: (result: GeolocationResult) => void): void;
    stopLocationTracking(): void;
    private verifyWorkSiteLocation;
    private calculateDistance;
    getWorkSites(): WorkSite[];
    addWorkSite(site: Omit<WorkSite, 'id'>): WorkSite;
    requestPermission(): Promise<boolean>;
    getAccuracyDescription(accuracy: number): string;
    checkLocationServices(): Promise<{
        enabled: boolean;
        permission: string;
    }>;
}
export declare class DeviceInfoService {
    getDeviceInfo(): Promise<{
        deviceId: string;
        deviceType: string;
        platform: string;
        browser: string;
        capabilities: {
            biometric: boolean;
            geolocation: boolean;
            camera: boolean;
            microphone: boolean;
            notifications: boolean;
        };
        security: {
            isSecureContext: boolean;
            hasSecureElement: boolean;
            supportsTrustedExecution: boolean;
        };
        network: {
            type: string;
            effectiveType: string;
            downlink: number;
            rtt: number;
        };
    }>;
    private generateDeviceId;
    private detectDeviceType;
    private getBrowserInfo;
    private checkDeviceCapabilities;
    private getSecurityFeatures;
    private getNetworkInfo;
}
export declare const geolocationService: GeolocationService;
export declare const deviceInfoService: DeviceInfoService;
//# sourceMappingURL=geolocation-service.d.ts.map
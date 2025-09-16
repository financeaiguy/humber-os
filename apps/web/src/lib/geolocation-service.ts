// Geolocation Tracking Service for Time Tracking
// Open source implementation using Web Geolocation API

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

export class GeolocationService {
  private static instance: GeolocationService;
  private watchId: number | null = null;
  private currentPosition: GeolocationPosition | null = null;
  
  // Mock work sites for demo
  private workSites: WorkSite[] = [
    {
      id: 'site_001',
      name: 'GM Assembly Plant - Detroit',
      latitude: 42.3314,
      longitude: -83.0458,
      radiusMeters: 500,
      address: '100 Renaissance Center, Detroit, MI',
      timezone: 'America/Detroit'
    },
    {
      id: 'site_002', 
      name: 'Ford Dearborn Campus',
      latitude: 42.3223,
      longitude: -83.1763,
      radiusMeters: 300,
      address: '1 American Rd, Dearborn, MI',
      timezone: 'America/Detroit'
    },
    {
      id: 'site_003',
      name: 'Remote Work (Approved)',
      latitude: 42.3314, // Flexible location
      longitude: -83.0458,
      radiusMeters: 50000, // Large radius for remote work
      address: 'Remote Location',
      timezone: 'America/Detroit'
    }
  ];

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  // Check if geolocation is supported
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  // Get current location with high accuracy
  async getCurrentLocation(highAccuracy = true): Promise<GeolocationResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: 'Geolocation not supported by this device'
      };
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: highAccuracy,
            timeout: 15000,
            maximumAge: 60000 // Cache for 1 minute
          }
        );
      });

      this.currentPosition = position;

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp
      };

      // Verify location against work sites
      const verification = this.verifyWorkSiteLocation(location);

      return {
        success: true,
        location,
        verification
      };

    } catch (error) {
      let errorMessage = 'Location access failed';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case GeolocationPositionError.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Start continuous location tracking
  startLocationTracking(callback: (result: GeolocationResult) => void): void {
    if (!this.isSupported()) {
      callback({
        success: false,
        error: 'Geolocation not supported'
      });
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = position;
        
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp
        };

        const verification = this.verifyWorkSiteLocation(location);

        callback({
          success: true,
          location,
          verification
        });
      },
      (error) => {
        callback({
          success: false,
          error: error.message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Update every 30 seconds
      }
    );
  }

  // Stop location tracking
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Verify if location is within approved work sites
  private verifyWorkSiteLocation(location: { latitude: number; longitude: number; accuracy: number }) {
    let nearestSite: WorkSite | undefined;
    let minDistance = Infinity;

    // Check each work site
    for (const site of this.workSites) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        site.latitude,
        site.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestSite = site;
      }
    }

    const isWithinWorkSite = nearestSite ? minDistance <= nearestSite.radiusMeters : false;
    
    // Determine accuracy level based on GPS accuracy
    let accuracyLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (location.accuracy <= 10) accuracyLevel = 'HIGH';
    else if (location.accuracy <= 50) accuracyLevel = 'MEDIUM';

    return {
      isWithinWorkSite,
      distanceFromWorkSite: minDistance,
      nearestWorkSite: nearestSite,
      accuracyLevel
    };
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Get work sites
  getWorkSites(): WorkSite[] {
    return this.workSites;
  }

  // Add new work site
  addWorkSite(site: Omit<WorkSite, 'id'>): WorkSite {
    const newSite: WorkSite = {
      id: `site_${Date.now()}`,
      ...site
    };
    this.workSites.push(newSite);
    return newSite;
  }

  // Request location permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      // Test location access
      await this.getCurrentLocation(false);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get location accuracy description
  getAccuracyDescription(accuracy: number): string {
    if (accuracy <= 5) return 'Very High (±5m)';
    if (accuracy <= 10) return 'High (±10m)';
    if (accuracy <= 50) return 'Medium (±50m)';
    if (accuracy <= 100) return 'Low (±100m)';
    return 'Very Low (±100m+)';
  }

  // Check if location services are enabled
  async checkLocationServices(): Promise<{ enabled: boolean; permission: string }> {
    if (!this.isSupported()) {
      return { enabled: false, permission: 'not_supported' };
    }

    try {
      // Check permission status
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      return {
        enabled: permission.state === 'granted',
        permission: permission.state
      };
    } catch (error) {
      return { enabled: false, permission: 'unknown' };
    }
  }
}

// Device Information Service
export class DeviceInfoService {
  
  // Get comprehensive device information
  async getDeviceInfo(): Promise<{
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
  }> {
    
    const deviceId = await this.generateDeviceId();
    
    // Detect device type
    const deviceType = this.detectDeviceType();
    
    // Get browser info
    const browser = this.getBrowserInfo();
    
    // Check capabilities
    const capabilities = await this.checkDeviceCapabilities();
    
    // Security features
    const security = this.getSecurityFeatures();
    
    // Network information
    const network = this.getNetworkInfo();

    return {
      deviceId,
      deviceType,
      platform: navigator.platform,
      browser,
      capabilities,
      security,
      network
    };
  }

  private async generateDeviceId(): Promise<string> {
    // Create persistent device ID using multiple factors
    const factors = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      navigator.deviceMemory || 0
    ];

    const fingerprint = factors.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }

  private detectDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(userAgent)) {
      return 'MOBILE';
    }
    if (/tablet|ipad/.test(userAgent)) {
      return 'TABLET';
    }
    return 'DESKTOP';
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private async checkDeviceCapabilities() {
    return {
      biometric: 'credentials' in navigator,
      geolocation: 'geolocation' in navigator,
      camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      microphone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      notifications: 'Notification' in window
    };
  }

  private getSecurityFeatures() {
    return {
      isSecureContext: window.isSecureContext,
      hasSecureElement: 'credentials' in navigator,
      supportsTrustedExecution: 'trustedTypes' in window
    };
  }

  private getNetworkInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      type: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0
    };
  }
}

// Export singleton
export const geolocationService = GeolocationService.getInstance();
export const deviceInfoService = new DeviceInfoService();

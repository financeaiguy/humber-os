export class GeolocationService {
    constructor() {
        this.watchId = null;
        this.currentPosition = null;
        this.workSites = [
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
                latitude: 42.3314,
                longitude: -83.0458,
                radiusMeters: 50000,
                address: 'Remote Location',
                timezone: 'America/Detroit'
            }
        ];
    }
    static getInstance() {
        if (!GeolocationService.instance) {
            GeolocationService.instance = new GeolocationService();
        }
        return GeolocationService.instance;
    }
    isSupported() {
        return typeof navigator !== 'undefined' && 'geolocation' in navigator;
    }
    async getCurrentLocation(highAccuracy = true) {
        if (!this.isSupported()) {
            return {
                success: false,
                error: 'Geolocation not supported by this device'
            };
        }
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: highAccuracy,
                    timeout: 15000,
                    maximumAge: 60000
                });
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
            const verification = this.verifyWorkSiteLocation(location);
            return {
                success: true,
                location,
                verification
            };
        }
        catch (error) {
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
    startLocationTracking(callback) {
        if (!this.isSupported()) {
            callback({
                success: false,
                error: 'Geolocation not supported'
            });
            return;
        }
        this.watchId = navigator.geolocation.watchPosition((position) => {
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
        }, (error) => {
            callback({
                success: false,
                error: error.message
            });
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
        });
    }
    stopLocationTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
    verifyWorkSiteLocation(location) {
        let nearestSite;
        let minDistance = Infinity;
        for (const site of this.workSites) {
            const distance = this.calculateDistance(location.latitude, location.longitude, site.latitude, site.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearestSite = site;
            }
        }
        const isWithinWorkSite = nearestSite ? minDistance <= nearestSite.radiusMeters : false;
        let accuracyLevel = 'LOW';
        if (location.accuracy <= 10)
            accuracyLevel = 'HIGH';
        else if (location.accuracy <= 50)
            accuracyLevel = 'MEDIUM';
        return {
            isWithinWorkSite,
            distanceFromWorkSite: minDistance,
            nearestWorkSite: nearestSite,
            accuracyLevel
        };
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    getWorkSites() {
        return this.workSites;
    }
    addWorkSite(site) {
        const newSite = {
            id: `site_${Date.now()}`,
            ...site
        };
        this.workSites.push(newSite);
        return newSite;
    }
    async requestPermission() {
        if (!this.isSupported()) {
            return false;
        }
        try {
            await this.getCurrentLocation(false);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    getAccuracyDescription(accuracy) {
        if (accuracy <= 5)
            return 'Very High (±5m)';
        if (accuracy <= 10)
            return 'High (±10m)';
        if (accuracy <= 50)
            return 'Medium (±50m)';
        if (accuracy <= 100)
            return 'Low (±100m)';
        return 'Very Low (±100m+)';
    }
    async checkLocationServices() {
        if (!this.isSupported()) {
            return { enabled: false, permission: 'not_supported' };
        }
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            return {
                enabled: permission.state === 'granted',
                permission: permission.state
            };
        }
        catch (error) {
            return { enabled: false, permission: 'unknown' };
        }
    }
}
export class DeviceInfoService {
    async getDeviceInfo() {
        const deviceId = await this.generateDeviceId();
        const deviceType = this.detectDeviceType();
        const browser = this.getBrowserInfo();
        const capabilities = await this.checkDeviceCapabilities();
        const security = this.getSecurityFeatures();
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
    async generateDeviceId() {
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
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(userAgent)) {
            return 'MOBILE';
        }
        if (/tablet|ipad/.test(userAgent)) {
            return 'TABLET';
        }
        return 'DESKTOP';
    }
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome'))
            return 'Chrome';
        if (userAgent.includes('Firefox'))
            return 'Firefox';
        if (userAgent.includes('Safari'))
            return 'Safari';
        if (userAgent.includes('Edge'))
            return 'Edge';
        return 'Unknown';
    }
    async checkDeviceCapabilities() {
        return {
            biometric: 'credentials' in navigator,
            geolocation: 'geolocation' in navigator,
            camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            microphone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            notifications: 'Notification' in window
        };
    }
    getSecurityFeatures() {
        return {
            isSecureContext: window.isSecureContext,
            hasSecureElement: 'credentials' in navigator,
            supportsTrustedExecution: 'trustedTypes' in window
        };
    }
    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return {
            type: connection?.type || 'unknown',
            effectiveType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 0,
            rtt: connection?.rtt || 0
        };
    }
}
export const geolocationService = GeolocationService.getInstance();
export const deviceInfoService = new DeviceInfoService();
//# sourceMappingURL=geolocation-service.js.map
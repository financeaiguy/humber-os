export interface BiometricCapabilities {
    webAuthn: boolean;
    fingerprint: boolean;
    faceId: boolean;
    voice: boolean;
    camera: boolean;
    microphone: boolean;
}
export interface BiometricResult {
    success: boolean;
    type: string;
    confidence: number;
    data?: any;
    error?: string;
}
export declare class BiometricAuthService {
    private static instance;
    static getInstance(): BiometricAuthService;
    checkCapabilities(): Promise<BiometricCapabilities>;
    registerBiometric(userId: string, username: string): Promise<BiometricResult>;
    authenticateBiometric(credentialId: string): Promise<BiometricResult>;
    authenticateFace(): Promise<BiometricResult>;
    authenticateVoice(): Promise<BiometricResult>;
    getDeviceFingerprint(): Promise<string>;
    private detectFace;
    private hashImageData;
    private analyzeVoice;
    private getCanvasFingerprint;
    private getWebGLFingerprint;
    private getAudioFingerprint;
}
export declare class LivenessDetectionService {
    detectLiveness(): Promise<{
        isLive: boolean;
        confidence: number;
        challenges: string[];
    }>;
    private performLivenessChallenge;
}
export declare class FaceRecognitionService {
    private model;
    loadModel(): Promise<void>;
    recognizeFace(imageData: ImageData): Promise<BiometricResult>;
    private mockFaceLandmarks;
    private mockFaceEmbedding;
}
export declare const biometricAuth: BiometricAuthService;
export declare const livenessDetection: LivenessDetectionService;
export declare const faceRecognition: FaceRecognitionService;
//# sourceMappingURL=biometric-auth.d.ts.map
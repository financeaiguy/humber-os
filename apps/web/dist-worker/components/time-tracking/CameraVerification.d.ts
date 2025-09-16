interface CameraVerificationProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageData: string, metadata: CaptureMetadata) => Promise<void>;
    purpose: 'clock-in' | 'clock-out';
    employeeId: string;
}
interface CaptureMetadata {
    timestamp: string;
    purpose: 'clock-in' | 'clock-out';
    employeeId: string;
    location?: {
        lat: number;
        lng: number;
        accuracy: number;
    };
    deviceInfo: {
        userAgent: string;
        screenResolution: string;
        timezone: string;
        language: string;
    };
    cameraInfo?: {
        width: number;
        height: number;
        facingMode?: string;
    };
}
export default function CameraVerification({ isOpen, onClose, onCapture, purpose, employeeId }: CameraVerificationProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=CameraVerification.d.ts.map
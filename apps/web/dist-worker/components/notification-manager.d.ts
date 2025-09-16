export interface Notification {
    id: string;
    type: 'onboarding' | 'task' | 'system' | 'alert' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    actionUrl?: string;
    actionLabel?: string;
    metadata?: any;
}
interface NotificationManagerProps {
    isOpen: boolean;
    onClose: () => void;
    position?: 'left' | 'right';
}
export declare function NotificationManager({ isOpen, onClose, position }: NotificationManagerProps): import("react/jsx-runtime").JSX.Element;
export declare function NotificationBadge({ count }: {
    count: number;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=notification-manager.d.ts.map
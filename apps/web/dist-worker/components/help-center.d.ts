import { UserRole } from '@humber/types';
interface HelpCenterProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: UserRole;
    currentPage: string;
}
export declare function HelpCenter({ isOpen, onClose, userRole, currentPage }: HelpCenterProps): import("react/jsx-runtime").JSX.Element | null;
export declare function GlobalHelpTrigger(): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=help-center.d.ts.map
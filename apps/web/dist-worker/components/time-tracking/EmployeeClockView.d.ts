interface EmployeeClockViewProps {
    employeeData?: {
        id: string;
        name: string;
        role: string;
        project: string;
        avatar?: string;
    };
    onClose?: () => void;
}
export default function EmployeeClockView({ employeeData, onClose }: EmployeeClockViewProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=EmployeeClockView.d.ts.map
import React from 'react';
interface ChartWrapperProps {
    children: React.ReactNode;
    width?: string | number;
    height?: string | number;
    className?: string;
}
export declare function ChartWrapper({ children, width, height, className }: ChartWrapperProps): import("react/jsx-runtime").JSX.Element;
export declare const ENHANCED_TOOLTIP_PROPS: {
    contentStyle: {
        backgroundColor: string;
        background: string;
        border: string;
        borderRadius: string;
        color: string;
        zIndex: number;
        position: "relative";
        boxShadow: string;
        backdropFilter: string;
        WebkitBackdropFilter: string;
        padding: string;
    };
    itemStyle: {
        color: string;
    };
    labelStyle: {
        color: string;
        fontWeight: number;
    };
    wrapperStyle: {
        zIndex: number;
        position: "relative";
        outline: string;
    };
    cursor: {
        stroke: string;
        strokeWidth: number;
        strokeDasharray: string;
    };
    allowEscapeViewBox: {
        x: boolean;
        y: boolean;
    };
    animationDuration: number;
};
export declare const ENHANCED_LEGEND_PROPS: {
    wrapperStyle: {
        color: string;
        fontSize: string;
        paddingTop: string;
    };
};
export declare const AXIS_STYLE: {
    stroke: string;
    fontSize: number;
    fill: string;
};
export declare const GRID_STYLE: {
    stroke: string;
    strokeDasharray: string;
};
export {};
//# sourceMappingURL=chart-wrapper.d.ts.map
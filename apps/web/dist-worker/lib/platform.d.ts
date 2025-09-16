export declare const detectPlatform: () => "server" | "ios" | "android" | "macos" | "windows" | "linux" | "unknown";
export declare const isMobile: () => boolean;
export declare const isIOS: () => boolean;
export declare const isAndroid: () => boolean;
export declare const isSafari: () => boolean;
export declare const isChrome: () => boolean;
export declare const supportsBackdropFilter: () => boolean;
export declare const getPlatformClasses: () => string;
export declare const getViewportHeight: () => string;
export declare const getSafeAreaInsets: () => {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
//# sourceMappingURL=platform.d.ts.map
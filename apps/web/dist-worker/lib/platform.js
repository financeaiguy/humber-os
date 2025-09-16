export const detectPlatform = () => {
    if (typeof window === 'undefined')
        return 'server';
    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform.toLowerCase();
    if (/ipad|iphone|ipod/.test(userAgent) || (platform === 'macintel' && 'ontouchend' in document)) {
        return 'ios';
    }
    if (/android/.test(userAgent)) {
        return 'android';
    }
    if (/mac/.test(platform)) {
        return 'macos';
    }
    if (/win/.test(platform)) {
        return 'windows';
    }
    if (/linux/.test(platform)) {
        return 'linux';
    }
    return 'unknown';
};
export const isMobile = () => {
    if (typeof window === 'undefined')
        return false;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(window.navigator.userAgent);
};
export const isIOS = () => {
    return detectPlatform() === 'ios';
};
export const isAndroid = () => {
    return detectPlatform() === 'android';
};
export const isSafari = () => {
    if (typeof window === 'undefined')
        return false;
    return /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
};
export const isChrome = () => {
    if (typeof window === 'undefined')
        return false;
    return /chrome|chromium|crios/i.test(window.navigator.userAgent) && !/edge|opr/i.test(window.navigator.userAgent);
};
export const supportsBackdropFilter = () => {
    if (typeof window === 'undefined')
        return false;
    return CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
};
export const getPlatformClasses = () => {
    const platform = detectPlatform();
    const classes = ['platform-' + platform];
    if (isMobile())
        classes.push('platform-mobile');
    if (isSafari())
        classes.push('platform-safari');
    if (isChrome())
        classes.push('platform-chrome');
    return classes.join(' ');
};
export const getViewportHeight = () => {
    if (typeof window === 'undefined')
        return '100vh';
    if (isMobile()) {
        return `${window.innerHeight}px`;
    }
    return '100vh';
};
export const getSafeAreaInsets = () => {
    if (typeof window === 'undefined')
        return { top: 0, bottom: 0, left: 0, right: 0 };
    const style = getComputedStyle(document.documentElement);
    return {
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    };
};
//# sourceMappingURL=platform.js.map
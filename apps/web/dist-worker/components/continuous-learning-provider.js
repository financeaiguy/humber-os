'use client';
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { continuousLearning } from '@/lib/continuous-learning';
import { useSession } from '@/components/session-context';
import { usePathname } from 'next/navigation';
export function ContinuousLearningProvider({ children }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    useEffect(() => {
        return;
        console.log('🚀 Initializing Continuous Learning System');
        continuousLearning.learn({
            type: 'navigation',
            path: pathname,
            timestamp: new Date().toISOString(),
            userId: session?.user?.id,
            userRole: session?.user?.role
        }, 'interaction');
        if (session) {
            continuousLearning.learn({
                type: 'session_start',
                userId: session.user?.id,
                userRole: session.user?.role,
                partnerName: session.user?.partnerName,
                timestamp: new Date().toISOString()
            }, 'interaction');
        }
        const handleFormSubmit = (e) => {
            const form = e.target;
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            continuousLearning.learn({
                type: 'form_submission',
                formId: form.id || 'unknown',
                action: form.action,
                method: form.method,
                fields: Object.keys(data),
                timestamp: new Date().toISOString(),
                userId: session?.user?.id
            }, 'interaction', { formData: data });
        };
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node;
                            if (element.textContent && element.textContent.length > 50) {
                                continuousLearning.learn({
                                    type: 'content_added',
                                    tagName: element.tagName,
                                    className: element.className,
                                    contentLength: element.textContent.length,
                                    timestamp: new Date().toISOString()
                                }, 'document');
                            }
                        }
                    });
                }
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        document.addEventListener('submit', handleFormSubmit);
        return () => {
            window.fetch = originalFetch;
            observer.disconnect();
            document.removeEventListener('submit', handleFormSubmit);
        };
    }, [session, pathname]);
    useEffect(() => {
        continuousLearning.learn({
            type: 'route_change',
            path: pathname,
            timestamp: new Date().toISOString(),
            userId: session?.user?.id
        }, 'interaction');
    }, [pathname, session]);
    return _jsx(_Fragment, { children: children });
}
//# sourceMappingURL=continuous-learning-provider.js.map
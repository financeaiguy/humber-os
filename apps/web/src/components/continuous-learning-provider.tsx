'use client';

import { useEffect, ReactNode } from 'react';
import { continuousLearning } from '@/lib/continuous-learning';
import { useSession } from '@/components/session-context';
import { usePathname } from 'next/navigation';

interface ContinuousLearningProviderProps {
  children: ReactNode;
}

export function ContinuousLearningProvider({ children }: ContinuousLearningProviderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // TEMPORARILY DISABLED - Continuous learning system
    // This was causing too many console messages and intercepting fetch calls
    return;
    
    // Start learning when component mounts
    // SECURITY: console statement removed: console.log('🚀 Initializing Continuous Learning System');

    // Learn from page navigation
    continuousLearning.learn({
      type: 'navigation',
      path: pathname,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
      userRole: session?.user?.role
    }, 'interaction');

    // Learn from session data
    if (session) {
      continuousLearning.learn({
        type: 'session_start',
        userId: session.user?.id,
        userRole: session.user?.role,
        partnerName: session.user?.partnerName,
        timestamp: new Date().toISOString()
      }, 'interaction');
    }

    // Capture form data automatically
    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data: Record<string, any> = {};
      
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

    // Capture API calls - DISABLED to avoid intercepting all fetches
    /*
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const [url, options] = args;
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        // Only learn from successful API interactions to avoid recursion
        if (response.ok) {
          continuousLearning.learn({
            type: 'api_call',
            url: url.toString(),
            method: options?.method || 'GET',
            status: response.status,
            duration,
            timestamp: new Date().toISOString(),
            userId: session?.user?.id
          }, 'performance').catch(() => {
            // Silently ignore learning errors to prevent recursion
          });

          // Learn from slow API calls
          if (duration > 1000) {
            continuousLearning.learn({
              type: 'slow_api',
              url: url.toString(),
              duration,
              threshold: 1000
            }, 'performance', { slow: true }).catch(() => {
              // Silently ignore learning errors
            });
          }
        }

        return response;
      } catch (error) {
        // Don't learn from errors to avoid fetch recursion issues
        // SECURITY: console statement removeddebug('Fetch error (not learning):', error);
        throw error;
      }
    };
    */

    // Capture document changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Learn from new content
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

    // Start observing document changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Add form submit listener
    document.addEventListener('submit', handleFormSubmit);

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      observer.disconnect();
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, [session, pathname]);

  // Learn from route changes
  useEffect(() => {
    continuousLearning.learn({
      type: 'route_change',
      path: pathname,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id
    }, 'interaction');
  }, [pathname, session]);

  return <>{children}</>;
}
export async function onRequest(context: any) {
  // Handle Next.js routing
  const url = new URL(context.request.url);
  
  // Let static assets pass through
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.startsWith('/static/') ||
      url.pathname.includes('.')) {
    return context.next();
  }
  
  // For all other routes, serve the Next.js app
  return context.next();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle static assets
    if (url.pathname.startsWith('/_next/static/') || 
        url.pathname.startsWith('/static/') ||
        url.pathname.includes('.')) {
      return env.ASSETS.fetch(request);
    }
    
    // For all other routes, serve index.html (SPA routing)
    const indexRequest = new Request(url.origin + '/index.html', request);
    return env.ASSETS.fetch(indexRequest);
  }
}

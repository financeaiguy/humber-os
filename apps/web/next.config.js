/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@humber/types', '@humber/utils'],
  
  // Fix for Next.js 15.5.3 clientReferenceManifest bug
  experimental: {
    // Disable problematic optimizations that cause the bug
    optimizePackageImports: false,
    // Removed serverComponentsExternalPackages to avoid conflict with transpilePackages
  },
  
  // Webpack optimizations with clientReferenceManifest fix
  webpack: (config, { dev, isServer }) => {
    // Fix for clientReferenceManifest bug in Next.js 15.5.3
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    if (dev && !isServer) {
      // Faster builds in development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
  
  // Compress responses
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig
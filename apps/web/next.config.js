/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@humber/types', '@humber/utils'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
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
        crypto: false,
        buffer: false,
        util: false,
        stream: false,
        path: false,
        os: false,
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
            recharts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: 'recharts',
              chunks: 'all',
            },
          },
        },
      }
    }
    
    // Optimize for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      }
    }
    
    return config
  },
  
  // Compress responses
  compress: true,

  // Add headers to allow camera and geolocation with ALL origins
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, geolocation=*, microphone=*'
          }
        ],
      },
    ]
  },

}

module.exports = nextConfig
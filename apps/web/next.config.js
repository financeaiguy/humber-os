/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@humber/types', '@humber/utils'],
}

module.exports = nextConfig
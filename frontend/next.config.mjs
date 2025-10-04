/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mmi-fl6u.onrender.com', 
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
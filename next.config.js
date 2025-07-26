/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['dashboard.iftinhotel.com'], // Add your domain
      // or if using external images
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'dashboard.iftinhotel.com',
        },
      ],
    },
  }
  
  module.exports = nextConfig
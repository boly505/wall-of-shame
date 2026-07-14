/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  // In Next.js 15, serverComponentsExternalPackages moved to top-level
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

module.exports = nextConfig;

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {(phase: string) => import('next').NextConfig} */
module.exports = (phase) => ({
  distDir: process.env.NEXT_DIST_DIR || (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next'),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ['@stylemate/shared'],
});


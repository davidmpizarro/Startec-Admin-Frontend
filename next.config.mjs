/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'http://3.147.70.11/:path*',
      },
    ];
  },
};

export default nextConfig;
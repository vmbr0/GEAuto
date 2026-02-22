/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ["images.unsplash.com", "mobile.de", "allegro.pl"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: "/api/serve-upload/:path*" },
    ];
  },
};

module.exports = nextConfig;

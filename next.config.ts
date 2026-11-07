import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.105", "192.168.1.99"],
  experimental: {
    agentFeedback: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wadibck.demotempwebsite.co.in",
      },
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "*",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/collection/:path*",
        destination: "/fabrics",
        permanent: true,
      },
      {
        source: "/product/:path*",
        destination: "/fabrics",
        permanent: true,
      },
      {
        source: "/fabric",
        destination: "/fabrics",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

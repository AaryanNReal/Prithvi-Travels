/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
      },
    ],
      domains: ['images.pexels.com', 'www.pexels.com','google.com','facebook.com','cdn.sanity.io','firebasestorage.googleapis.com'],
  },  
  async rewrites() {
    return [
      {
        source: '/Blog/:blogId', // Custom URL pattern
        destination: '/blog/:blogId', // Actual route
      },
    ];
  },
};

module.exports = nextConfig;
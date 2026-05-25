/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Helps catch bugs during development
  output: "standalone", // Optimizes the build for deployment
  /* Only include the below if you absolutely need them */
  // typescript: { ignoreBuildErrors: false }, 
  // images: { unoptimized: false },
  async rewrites() {
    return [
      {
        source: '/node/:path*',
        destination: 'http://localhost:8080/:path*',
      },
      {
        source: '/torrent/:path*',
        destination: 'http://localhost:8081/:path*',
      },
    ];
  },
};

export default nextConfig;

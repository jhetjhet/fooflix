/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Helps catch bugs during development
  output: "standalone", // Optimizes the build for deployment
  /* Only include the below if you absolutely need them */
  // typescript: { ignoreBuildErrors: false }, 
  // images: { unoptimized: false },
};

export default nextConfig;

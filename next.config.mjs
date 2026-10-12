/** @type {import('next').NextConfig} */
const nextConfig = {
  // Uploaded documents are served through an authenticated route, not statically.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

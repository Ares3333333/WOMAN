/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_USE_BROWSER_TTS: process.env.NEXT_PUBLIC_USE_BROWSER_TTS ?? "true",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

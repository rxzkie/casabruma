import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "casabruma-phi.vercel.app",
      },
      {
        protocol: "https",
        hostname: "casabrumabackend1.onrender.com",
      },
    ],
  },
};

export default nextConfig;

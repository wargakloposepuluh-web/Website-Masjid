/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@whiskeysockets/baileys", "qrcode", "pino"],
  },
};

module.exports = nextConfig;

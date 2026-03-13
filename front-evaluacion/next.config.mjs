/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Output standalone para que Electron pueda servir la app en producción
  output: 'standalone',
};

export default nextConfig;

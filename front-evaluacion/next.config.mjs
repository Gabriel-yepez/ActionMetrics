/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Output standalone para que Electron pueda servir la app en producción
  output: 'standalone',
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
};

export default nextConfig;

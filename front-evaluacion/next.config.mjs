import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Output standalone para que Electron pueda servir la app en producción
  output: 'standalone',
  // Fijar la raíz del proyecto para que server.js quede en .next/standalone/
  // (evita que Next infiera la raíz del monorepo por el package-lock.json raíz)
  outputFileTracingRoot: __dirname,
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
};

export default nextConfig;

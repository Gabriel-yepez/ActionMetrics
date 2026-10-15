import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV !== 'production';

// Origen del backend (API, documentos y reportes PDF que se muestran en iframes)
const backendOrigin = new URL(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001').origin;

// Content Security Policy: limita de dónde se cargan scripts, estilos, iframes, etc.
// (mitiga XSS e inyección de contenido). En desarrollo Next necesita eval para el hot reload.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self'${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${backendOrigin}`,
  `connect-src 'self' ${backendOrigin}${isDev ? ' ws: wss:' : ''}`,
  `frame-src 'self' blob: ${backendOrigin}`,
  `object-src 'self' blob: ${backendOrigin}`,
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // No anunciar la tecnología del servidor
  poweredByHeader: false,
  // Output standalone para que Electron pueda servir la app en producción
  output: 'standalone',
  // Fijar la raíz del proyecto para que server.js quede en .next/standalone/
  // (evita que Next infiera la raíz del monorepo por el package-lock.json raíz)
  outputFileTracingRoot: __dirname,
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

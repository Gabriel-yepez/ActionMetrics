# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.23.3

# ---------- Dependencias (incluye devDependencies necesarias para el build) ----------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
# Electron solo se usa en la app de escritorio: no descargar su binario (~100 MB)
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ---------- Build de Next.js (output standalone) ----------
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

# URL pública del backend que usará el navegador (se incrusta en el bundle)
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# La caché de Next se conserva entre builds para acelerar recompilaciones
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ---------- Imagen final: solo el servidor standalone ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Next escribe la caché de imágenes optimizadas en .next/cache
RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]

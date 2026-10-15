# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.23.3

# ---------- Dependencias de producción ----------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
ENV NODE_ENV=production

# Solo los manifiestos: esta capa se reutiliza mientras no cambien las dependencias
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

# ---------- Imagen final ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4001

# Código y dependencias propiedad de root (solo lectura para la app)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Única carpeta escribible: documentos subidos y reportes generados
RUN mkdir -p public/document public/reports \
    && chown -R node:node public

USER node

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:4001/api/health || exit 1

CMD ["node", "index.js"]

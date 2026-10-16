#!/usr/bin/env bash
# Despliegue en el VPS (lo ejecuta GitHub Actions por SSH en cada push a main).
#
#   ./deploy.sh <image_prefix> <image_tag>
#   ej.: ./deploy.sh ghcr.io/gabriel-yepez/actionmetrics 3f2a1c9e...
#
# Descarga las imágenes, reinicia los servicios y espera a que estén "healthy".
# Si algo falla, vuelve a la versión desplegada anteriormente.
#
# Requiere en el directorio de la app: compose.yaml, compose.prod.yaml y el .env de producción.
# El login a ghcr.io (si las imágenes son privadas) lo hace el workflow antes de llamar al script.

set -euo pipefail

IMAGE_PREFIX="${1:?Uso: deploy.sh <image_prefix> <image_tag>}"
IMAGE_TAG="${2:?Uso: deploy.sh <image_prefix> <image_tag>}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-180}"

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "ERROR: falta el archivo .env de producción en $(pwd)" >&2
  exit 1
fi

# Versión actualmente desplegada (para volver a ella si el despliegue falla)
STATE_FILE=.deploy.env
PREVIOUS_TAG=""
if [ -f "$STATE_FILE" ]; then
  PREVIOUS_TAG="$(sed -n 's/^IMAGE_TAG=//p' "$STATE_FILE")"
fi

compose() {
  docker compose -f compose.yaml -f compose.prod.yaml --env-file .env --env-file "$STATE_FILE" "$@"
}

write_state() {
  printf 'IMAGE_PREFIX=%s\nIMAGE_TAG=%s\n' "$IMAGE_PREFIX" "$1" > "$STATE_FILE"
}

start() {
  compose up -d --no-build --remove-orphans --wait --wait-timeout "$WAIT_TIMEOUT"
}

echo "==> Desplegando $IMAGE_PREFIX-{backend,frontend}:$IMAGE_TAG (anterior: ${PREVIOUS_TAG:-ninguna})"
write_state "$IMAGE_TAG"

if compose pull backend frontend && start; then
  echo "==> Despliegue correcto: todos los servicios healthy"
  compose ps
  # Liberar espacio: imágenes que ya no usa ningún contenedor
  docker image prune -f >/dev/null
  exit 0
fi

echo "ERROR: el despliegue de $IMAGE_TAG falló" >&2
compose ps || true
compose logs --tail=50 backend frontend || true

if [ -n "$PREVIOUS_TAG" ] && [ "$PREVIOUS_TAG" != "$IMAGE_TAG" ]; then
  echo "==> Volviendo a la versión anterior: $PREVIOUS_TAG" >&2
  write_state "$PREVIOUS_TAG"
  if start; then
    echo "==> Rollback completado: sigue en servicio la versión $PREVIOUS_TAG" >&2
  else
    echo "ERROR: el rollback también falló; revisa el servidor" >&2
  fi
fi
exit 1

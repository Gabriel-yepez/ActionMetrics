# Despliegue en un VPS (Docker + Nginx + HTTPS + CD)

```
git push main ─▶ GitHub Actions: CI ─▶ build de imágenes ─▶ GHCR ─▶ SSH al VPS ─▶ deploy.sh

Internet ──HTTPS──▶ Nginx (VPS) ──▶ 127.0.0.1:3000  frontend (contenedor)
                                 └─▶ 127.0.0.1:4001  backend  (contenedor) ──▶ PostgreSQL (contenedor)
```

- Frontend: `https://tudominio.com` · API: `https://api.tudominio.com`
- Deben ser **subdominios del mismo dominio**: la cookie de sesión es `SameSite=Strict` y los PDFs se muestran en iframes desde la API.
- Los contenedores solo escuchan en `127.0.0.1`; el único acceso público es por Nginx.
- Las imágenes se construyen en GitHub Actions y se publican en GitHub Container Registry (`ghcr.io`): el VPS no compila nada ni necesita el código fuente.

| Archivo | Uso |
|---|---|
| `.github/workflows/deploy.yml` | CD: cada push a `main` → CI → imágenes → despliegue |
| `deploy/deploy.sh` | Script que el CD ejecuta en el VPS (con rollback automático) |
| `compose.prod.yaml` | Usa las imágenes de GHCR en lugar de construirlas |
| `nginx/actionmetrics-*.conf` | Sitios de Nginx → `/etc/nginx/sites-available/` |
| `nginx/snippets/*.conf` | Configuración común → `/etc/nginx/snippets/` |

## 1. Preparar el VPS (una sola vez)

Requisitos: Ubuntu 22.04/24.04 (o Debian 12) y DNS con registros `A` (y `AAAA` si hay IPv6) de
`tudominio.com`, `www.tudominio.com` y `api.tudominio.com` apuntando a la IP del VPS.

```bash
# Docker, Nginx y Certbot
curl -fsSL https://get.docker.com | sudo sh
sudo apt update && sudo apt install -y nginx certbot

# Firewall: solo SSH, HTTP y HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Usuario para los despliegues (pertenecer al grupo docker equivale a ser root:
# úsalo solo para desplegar)
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy

# Directorio de la aplicación con el .env de producción (solo legible por "deploy")
sudo mkdir -p /opt/actionmetrics
sudo chown deploy:deploy /opt/actionmetrics
sudo -u deploy nano /opt/actionmetrics/.env
sudo chmod 600 /opt/actionmetrics/.env
```

Contenido de `/opt/actionmetrics/.env`:

```bash
DB_PASSWORD=<contraseña larga y aleatoria>
JWT_SECRET=<salida de: openssl rand -hex 32>
COOKIE_SECURE=true                 # la cookie solo viaja por HTTPS
TRUST_PROXY=1                      # IP real del usuario detrás de Nginx (rate limiting)
CORS_ORIGINS=https://tudominio.com
BIND_ADDRESS=127.0.0.1             # contenedores accesibles solo desde el propio VPS
# IA (opcional): varias claves y proveedores; se rotan y si una falla se usa otra
DEEPSEEK_API_KEYS=<clave1>,<clave2>
# GROQ_API_KEYS=<clave>        GROQ_MODEL=<modelo>   (ver .env.example para más proveedores)
```

Estado de las claves de IA (cuáles están en pausa y por qué, sin mostrar las claves):
`GET https://api.tudominio.com/api/ia/estado` con sesión de super admin.

`NEXT_PUBLIC_BACKEND_URL` no va aquí: se incrusta al compilar el frontend en GitHub Actions
(variable del repositorio, ver paso 2).

### Clave SSH para GitHub Actions

En tu computadora (no en el VPS):

```bash
ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f actionmetrics_deploy
ssh-copy-id -i actionmetrics_deploy.pub deploy@IP_DEL_VPS     # autoriza la clave para el usuario deploy
ssh-keyscan -t ed25519 IP_DEL_VPS > known_hosts_vps           # huella del servidor
ssh-keygen -lf known_hosts_vps                                 # compárala con la del VPS: sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

## 2. Configurar GitHub (una sola vez)

En el repositorio → **Settings → Environments → New environment** → `production`.
Opcional: en *Deployment protection rules* activa **Required reviewers** para aprobar cada despliegue a mano.

**Secretos del environment `production`:**

| Secreto | Valor |
|---|---|
| `VPS_HOST` | IP o nombre del VPS |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | contenido de `actionmetrics_deploy` (la clave **privada**) |
| `VPS_KNOWN_HOSTS` | contenido de `known_hosts_vps` |

**Variables** (Settings → Secrets and variables → Actions → *Variables*):

| Variable | Valor | |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://api.tudominio.com` | obligatoria |
| `VPS_APP_DIR` | `/opt/actionmetrics` | opcional (es el valor por defecto) |
| `VPS_PORT` | `22` | opcional |
| `DOCKER_PLATFORMS` | `linux/arm64` | solo si el VPS es ARM (por defecto `linux/amd64`) |

Después borra de tu computadora la clave privada `actionmetrics_deploy` (ya está en GitHub).

## 3. Primer despliegue

Haz merge de `dev` a `main` (o ejecuta el workflow **CD** a mano desde la pestaña *Actions*).
El workflow pasa la CI, publica las imágenes y las arranca en el VPS. Luego, una sola vez,
crea las tablas y el primer super admin:

```bash
ssh deploy@IP_DEL_VPS
cd /opt/actionmetrics
alias dc='docker compose -f compose.yaml -f compose.prod.yaml --env-file .env --env-file .deploy.env'
dc run --rm backend node db/setup.js
dc run --rm -e SUPERADMIN_PASSWORD='<clave segura>' backend \
  node db/crear-superadmin.js admin admin@tudominio.com Nombre Apellido 12345678
```

## 4. HTTPS y Nginx (una sola vez)

```bash
# Certificado para los tres nombres (Certbot detiene Nginx un momento; los hooks
# quedan guardados para las renovaciones automáticas)
sudo certbot certonly --standalone \
  -d tudominio.com -d www.tudominio.com -d api.tudominio.com \
  --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
sudo certbot renew --dry-run

# Configuración de Nginx con tu dominio (desde una copia del repositorio)
sed -i 's/tudominio\.com/midominio.com/g' deploy/nginx/*.conf
sudo cp deploy/nginx/snippets/*.conf /etc/nginx/snippets/
sudo cp deploy/nginx/actionmetrics-*.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/actionmetrics-frontend.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/actionmetrics-backend.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Comprobar: `https://midominio.com` (login) y `https://api.midominio.com/api/health` ("Api is Healthy!!!").

## Despliegues siguientes

Automáticos: **cada push a `main`** (normalmente un merge desde `dev`) ejecuta:

1. **CI** completa (pruebas de seguridad, lint, build). Si falla, no se despliega nada.
2. **Imágenes** `ghcr.io/<usuario>/actionmetrics-{backend,frontend}` etiquetadas con el commit y `latest`.
3. **Despliegue** por SSH con `deploy.sh`: descarga las imágenes, reinicia y espera a que los
   servicios estén *healthy*. **Si fallan, vuelve automáticamente a la versión anterior** y el
   workflow termina en rojo.
4. Comprueba `https://api.tudominio.com/api/health` a través de Nginx.

Dos despliegues nunca se ejecutan a la vez. Los datos (volúmenes `db-data` y `uploads`) se conservan.

**Volver a una versión anterior:** en *Actions → CD*, abre la ejecución de ese commit y pulsa
**Re-run all jobs**.

**Cambios en el modelo de datos:** `db/setup.js` no se ejecuta en cada despliegue; si un cambio
añade tablas o columnas, ejecútalo a mano en el VPS (`dc run --rm backend node db/setup.js`).

## Operación

```bash
cd /opt/actionmetrics
alias dc='docker compose -f compose.yaml -f compose.prod.yaml --env-file .env --env-file .deploy.env'

dc ps                     # estado y versión desplegada (también en .deploy.env)
dc logs -f backend        # logs de la API
sudo tail -f /var/log/nginx/error.log

# Copia de seguridad de la base de datos
dc exec -T db pg_dump -U postgres evaluacion | gzip > backup-$(date +%F).sql.gz

# Copia de seguridad de documentos y reportes subidos (volumen "uploads")
docker run --rm -v actionmetrics_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

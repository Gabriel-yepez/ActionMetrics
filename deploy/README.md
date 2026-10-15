# Despliegue en un VPS (Docker + Nginx + HTTPS)

```
Internet ──HTTPS──▶ Nginx (VPS) ──▶ 127.0.0.1:3000  frontend (contenedor)
                                 └─▶ 127.0.0.1:4001  backend  (contenedor) ──▶ PostgreSQL (contenedor)
```

- Frontend: `https://tudominio.com` · API: `https://api.tudominio.com`
- Deben ser **subdominios del mismo dominio**: la cookie de sesión es `SameSite=Strict` y los PDFs se muestran en iframes desde la API.
- Los contenedores solo escuchan en `127.0.0.1`; el único acceso público es por Nginx.

Archivos:

| Archivo | Destino en el VPS |
|---|---|
| `nginx/actionmetrics-frontend.conf` | `/etc/nginx/sites-available/` |
| `nginx/actionmetrics-backend.conf` | `/etc/nginx/sites-available/` |
| `nginx/snippets/*.conf` | `/etc/nginx/snippets/` |

## 1. Requisitos

- VPS con Ubuntu 22.04/24.04 (o Debian 12) y acceso `sudo`.
- DNS: registros `A` (y `AAAA` si hay IPv6) de `tudominio.com`, `www.tudominio.com` y `api.tudominio.com` apuntando a la IP del VPS.

```bash
# Docker + Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # cerrar sesión y volver a entrar

# Nginx y Certbot
sudo apt update && sudo apt install -y nginx certbot

# Firewall: solo SSH, HTTP y HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Aplicación

```bash
git clone https://github.com/Gabriel-yepez/ActionMetrics.git
cd ActionMetrics
cp .env.example .env
nano .env
```

Valores de producción en `.env`:

```bash
DB_PASSWORD=<contraseña larga y aleatoria>
JWT_SECRET=<salida de: openssl rand -hex 32>
COOKIE_SECURE=true                 # la cookie solo viaja por HTTPS
TRUST_PROXY=1                      # IP real del usuario detrás de Nginx (rate limiting)
CORS_ORIGINS=https://tudominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.tudominio.com
BIND_ADDRESS=127.0.0.1             # contenedores accesibles solo desde el propio VPS
DEEPSEEK_API_KEY=<opcional>
```

```bash
docker compose up -d --build
docker compose run --rm backend node db/setup.js        # solo la primera vez
docker compose run --rm -e SUPERADMIN_PASSWORD='<clave segura>' backend \
  node db/crear-superadmin.js admin admin@tudominio.com Nombre Apellido 12345678
docker compose ps                                        # los 3 servicios en "healthy"
```

## 3. Certificado HTTPS (Let's Encrypt)

Un solo certificado para los tres nombres. Certbot detiene Nginx un momento para validar
el dominio y lo vuelve a arrancar; los hooks quedan guardados para las renovaciones automáticas.

```bash
sudo certbot certonly --standalone \
  -d tudominio.com -d www.tudominio.com -d api.tudominio.com \
  --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"

sudo certbot renew --dry-run   # comprobar que la renovación funcionará
```

## 4. Nginx

```bash
# Poner tu dominio en las configuraciones
sed -i 's/tudominio\.com/midominio.com/g' deploy/nginx/*.conf

sudo cp deploy/nginx/snippets/*.conf /etc/nginx/snippets/
sudo cp deploy/nginx/actionmetrics-*.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/actionmetrics-frontend.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/actionmetrics-backend.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl reload nginx
```

Comprobar: `https://midominio.com` (login) y `https://api.midominio.com/api/health` ("Api is Healthy!!!").

## Operación

```bash
# Actualizar a la última versión
git pull && docker compose up -d --build

# Logs
docker compose logs -f backend
sudo tail -f /var/log/nginx/error.log

# Copia de seguridad de la base de datos
docker compose exec -T db pg_dump -U postgres evaluacion | gzip > backup-$(date +%F).sql.gz

# Copia de seguridad de documentos y reportes subidos (volumen "uploads")
docker run --rm -v actionmetrics_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

Si cambia `NEXT_PUBLIC_BACKEND_URL`, hay que reconstruir el frontend (`docker compose build frontend`):
la URL se incrusta al compilar.

require('dotenv').config();
const express = require('express');
const {sequelize} = require('./db/sequelize');
const routes = require('./routes/routes');
const filesRouter = require('./routes/files');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 4001;

// Detrás de un proxy inverso (Nginx): número de proxies de confianza. Sin esto, todas las
// peticiones parecen venir del proxy y el rate limiting se compartiría entre todos los usuarios.
const trustProxyHops = parseInt(process.env.TRUST_PROXY, 10);
if (trustProxyHops > 0) {
  app.set('trust proxy', trustProxyHops);
}

// Headers de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
}));

// CORS configurado (permitir solo orígenes conocidos)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  exposedHeaders: ['X-Report-ID'],
}));

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intente de nuevo más tarde.' },
});
app.use(globalLimiter);

// Rate limiting estricto para auth (prevenir fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos de login/registro por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de autenticación, intente de nuevo en 15 minutos.' },
});
// Solo login y registro: /api/auth/me se consulta al navegar y no debe agotar el límite
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);

// Rate limiting para la generación con IA (consume la API de pago de DeepSeek)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, data: null, message: 'Demasiadas solicitudes de reportes con IA, intente de nuevo más tarde.' },
});
app.use('/api/reportes/ai', aiLimiter);

// Middlewares
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan("dev"))

// Documentos y reportes PDF: solo con sesión y permiso sobre el recurso
app.use(filesRouter(allowedOrigins));

// Rutas
app.use("/api", routes);

// Manejador de errores global
app.use((err, req, res, next) => {
  // Errores del cliente (archivo no permitido o demasiado grande, JSON inválido, etc.)
  const status = err.status || err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  if (status < 500) {
    return res.status(status).json({ ok: false, data: null, message: err.expose === false ? 'Solicitud inválida' : err.message });
  }
  console.error('Error no manejado:', err);
  res.status(500).json({
    ok: false,
    data: null,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// Probar la conexión a la base de datos y arrancar el servidor
sequelize.authenticate()
  .then(() => {
    const dbType = process.env.DATABASE_URL ? 'remota (Neon)' : 'local';
    console.log(`Conexión a la base de datos ${dbType} establecida con éxito.`);
    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });

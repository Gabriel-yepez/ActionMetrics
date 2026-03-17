require('dotenv').config();
const express = require('express');
const {sequelize} = require('./db/sequelize');
const routes = require('./routes/routes');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 4001;

// Headers de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
}));

// CORS configurado (permitir solo orígenes conocidos)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
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
app.use('/api/auth', authLimiter);

// Middlewares
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan("dev"))

// Configuración para servir archivos estáticos
app.use(express.static('public'));

// Rutas
app.use("/api", routes);

// Manejador de errores global
app.use((err, req, res, next) => {
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

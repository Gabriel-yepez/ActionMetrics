require('dotenv').config();
const express = require('express');
const {sequelize} = require('./db/sequelize');
const routes = require('./routes/routes');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4001;

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors())
app.use(morgan("dev"))

// Configuración para servir archivos estáticos
app.use(express.static('public'));

// Rutas
app.use("/api", routes);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Probar la conexión a la base de datos y arrancar el servidor
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida con éxito.');
    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });

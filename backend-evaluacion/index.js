const express = require('express');
const {sequelize} = require('./db/sequelize');
const routes = require('./routes/routes');
const morgan = require('morgan');
const app = express();
const port = 4001;
const cors = require('cors');

app.use(express.json());
app.use(cors())
app.use(morgan("dev")) 

// Configuración para servir archivos estáticos
app.use(express.static('public'));

app.use("/api", routes);

// Probar la conexión a la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida con éxito.');
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
  });


app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

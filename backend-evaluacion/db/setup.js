/**
 * Script de configuración inicial de base de datos.
 * Crea todas las tablas y ejecuta migraciones.
 *
 * Ejecutar una sola vez para bases de datos nuevas (ej: Neon):
 *   node db/setup.js
 */

require('dotenv').config();
const { sequelize, Rol } = require('./sequelize');

async function setup() {
  try {
    await sequelize.authenticate();
    const dbType = process.env.DATABASE_URL ? 'remota (Neon)' : 'local';
    console.log(`Conexión a la base de datos ${dbType} establecida.\n`);

    // Crear todas las tablas según los modelos definidos
    await sequelize.sync({ alter: true });
    console.log('Todas las tablas sincronizadas correctamente.\n');

    // Insertar roles iniciales si no existen
    const rolesIniciales = [
      { id: 1, nombre: 'admin' },
      { id: 2, nombre: 'empleado' },
      { id: 3, nombre: 'super_admin' },
    ];

    for (const rol of rolesIniciales) {
      const [, created] = await Rol.findOrCreate({
        where: { id: rol.id },
        defaults: rol,
      });
      if (created) {
        console.log(`Rol "${rol.nombre}" (id=${rol.id}) creado.`);
      } else {
        console.log(`Rol "${rol.nombre}" (id=${rol.id}) ya existe, omitiendo.`);
      }
    }

    console.log('\nConfiguración inicial completada exitosamente.');
  } catch (error) {
    console.error('Error durante la configuración:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setup();

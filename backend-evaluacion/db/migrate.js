/**
 * Script de migración para sistema multidepartamental.
 *
 * Ejecutar una sola vez:
 *   node db/migrate.js
 *
 * Qué hace:
 *   1. Crea la tabla "departamento" si no existe
 *   2. Agrega la columna "id_departamento" a "usuario" si no existe
 *   3. Inserta el rol "super_admin" (id=3) si no existe
 */

require('dotenv').config();
const { sequelize } = require('./sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();

  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos OK.\n');

    // 1. Crear tabla departamento
    const tables = await qi.showAllTables();
    if (!tables.includes('departamento')) {
      await sequelize.query(`
        CREATE TABLE departamento (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion VARCHAR(255)
        );
      `);
      console.log('Tabla "departamento" creada.');
    } else {
      console.log('Tabla "departamento" ya existe, omitiendo.');
    }

    // 2. Agregar columna id_departamento a usuario
    const columns = await qi.describeTable('usuario');
    if (!columns.id_departamento) {
      await sequelize.query(`
        ALTER TABLE usuario
        ADD COLUMN id_departamento INTEGER REFERENCES departamento(id);
      `);
      console.log('Columna "id_departamento" agregada a "usuario".');
    } else {
      console.log('Columna "id_departamento" ya existe en "usuario", omitiendo.');
    }

    // 3. Insertar rol super_admin (id=3)
    const [roles] = await sequelize.query(
      `SELECT id FROM roles WHERE id = 3;`
    );
    if (roles.length === 0) {
      await sequelize.query(
        `INSERT INTO roles (id, nombre) VALUES (3, 'super_admin');`
      );
      console.log('Rol "super_admin" (id=3) insertado.');
    } else {
      console.log('Rol "super_admin" ya existe, omitiendo.');
    }

    console.log('\nMigración completada exitosamente.');
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();

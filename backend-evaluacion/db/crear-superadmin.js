/**
 * Crea un super admin o asciende a super admin a un usuario existente.
 * El registro público solo crea empleados, así que el primer super admin se crea aquí.
 *
 * Ascender un usuario existente:
 *   node db/crear-superadmin.js <nombre_usuario>
 *
 * Crear uno nuevo (la contraseña va en variable de entorno, no en el historial de la terminal):
 *   SUPERADMIN_PASSWORD='...' node db/crear-superadmin.js <nombre_usuario> <email> <nombre> <apellido> <cedula>
 *
 * Con Docker:
 *   docker compose run --rm -e SUPERADMIN_PASSWORD='...' backend node db/crear-superadmin.js admin admin@empresa.com Ana Pérez 12345678
 */

require('dotenv').config();
const { sequelize, Usuario } = require('./sequelize');

const SUPER_ADMIN = 3;

async function main() {
  const [nombre_usuario, email, nombre, apellido, ci] = process.argv.slice(2);
  if (!nombre_usuario) {
    console.error('Uso: node db/crear-superadmin.js <nombre_usuario> [email nombre apellido cedula]');
    process.exit(1);
  }

  try {
    const existente = await Usuario.findOne({ where: { nombre_usuario } });

    if (existente) {
      await existente.update({ id_rol: SUPER_ADMIN });
      console.log(`Usuario "${nombre_usuario}" ascendido a super admin.`);
      return;
    }

    const password = process.env.SUPERADMIN_PASSWORD;
    if (!email || !nombre || !apellido || !ci || !password) {
      console.error('El usuario no existe. Para crearlo indica email, nombre, apellido y cédula, y la contraseña en SUPERADMIN_PASSWORD.');
      process.exit(1);
    }
    if (password.length < 8) {
      console.error('SUPERADMIN_PASSWORD debe tener al menos 8 caracteres.');
      process.exit(1);
    }

    await Usuario.create({
      nombre_usuario, email, nombre, apellido,
      ci: parseInt(ci, 10),
      password,
      id_rol: SUPER_ADMIN,
      id_departamento: null,
    });
    console.log(`Super admin "${nombre_usuario}" creado.`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();

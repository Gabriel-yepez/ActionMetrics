/**
 * Cifra los datos sensibles que aún están en texto normal y vuelve a cifrar con la clave
 * actual los que usan una clave anterior (rotación). Se puede ejecutar las veces que haga
 * falta: lo que ya está cifrado con la clave actual no se toca.
 *
 *   node db/cifrar-datos.js
 *
 * Lo ejecutan también db/setup.js y deploy/deploy.sh en cada despliegue.
 * Cambiar la clave: poner la nueva en DATA_ENCRYPTION_KEY, la anterior en
 * DATA_ENCRYPTION_OLD_KEYS, ejecutar este script y después quitar la anterior.
 */
require('dotenv').config();
const {
  ENCRYPTED_FIELDS, encrypt, decrypt, isEncrypted, isEncryptedWithCurrentKey,
} = require('../services/dataEncryption');

const BATCH = 500;

async function cifrarDatos(sequelize, log = console.log) {
  const qi = sequelize.getQueryInterface();
  const tables = await qi.showAllTables();
  let total = 0;

  for (const [table, fields] of Object.entries(ENCRYPTED_FIELDS)) {
    if (!tables.includes(table)) continue; // base de datos nueva: la crea db/setup.js

    // El valor cifrado es más largo que el original y es texto (ej. la cédula era INTEGER)
    const columns = await qi.describeTable(table);
    for (const field of fields) {
      if (columns[field] && columns[field].type !== 'TEXT') {
        await sequelize.query(`ALTER TABLE "${table}" ALTER COLUMN "${field}" TYPE TEXT USING "${field}"::text`);
        log(`${table}.${field}: columna cambiada a TEXT`);
      }
    }

    const cols = fields.map(f => `"${f}"`).join(', ');
    let lastId = 0;
    let updated = 0;
    for (;;) {
      const [rows] = await sequelize.query(
        `SELECT id, ${cols} FROM "${table}" WHERE id > :lastId ORDER BY id LIMIT ${BATCH}`,
        { replacements: { lastId } },
      );
      if (rows.length === 0) break;
      lastId = rows[rows.length - 1].id;

      await sequelize.transaction(async (transaction) => {
        for (const row of rows) {
          const changes = {};
          for (const field of fields) {
            const value = row[field];
            if (value === null || value === undefined || isEncryptedWithCurrentKey(value)) continue;
            const context = `${table}.${field}`;
            const plain = isEncrypted(value) ? decrypt(value, context) : String(value);
            changes[field] = encrypt(plain, context);
          }
          const keys = Object.keys(changes);
          if (keys.length === 0) continue;
          await sequelize.query(
            `UPDATE "${table}" SET ${keys.map(k => `"${k}" = :${k}`).join(', ')} WHERE id = :id`,
            { replacements: { ...changes, id: row.id }, transaction },
          );
          updated++;
        }
      });
    }
    if (updated) log(`${table}: ${updated} registro(s) cifrado(s)`);
    total += updated;
  }

  log(total ? `Datos sensibles cifrados: ${total} registro(s) actualizados.` : 'Datos sensibles: todo cifrado con la clave actual.');
  return total;
}

if (require.main === module) {
  const { sequelize } = require('./sequelize');
  (async () => {
    try {
      await sequelize.authenticate();
      await cifrarDatos(sequelize);
    } catch (error) {
      console.error('Error al cifrar los datos:', error.message);
      process.exitCode = 1;
    } finally {
      await sequelize.close();
    }
  })();
}

module.exports = { cifrarDatos };

/**
 * Comprueba en la base de datos que ningún campo sensible está guardado en texto normal.
 * Se ejecuta en la CI después de las pruebas de seguridad (que crean usuarios, objetivos,
 * evaluaciones y comentarios a través de la API).
 *
 *   node tests/datos-cifrados.check.js
 */
require('dotenv').config();
const { sequelize } = require('../db/sequelize');
const { ENCRYPTED_FIELDS } = require('../services/dataEncryption');

(async () => {
  let fallos = 0;
  let total = 0;
  try {
    for (const [table, fields] of Object.entries(ENCRYPTED_FIELDS)) {
      for (const field of fields) {
        const [[{ cifrados, sin_cifrar }]] = await sequelize.query(
          `SELECT count(*) FILTER (WHERE "${field}" LIKE 'enc:v1:%')::int AS cifrados,
                  count(*) FILTER (WHERE "${field}" NOT LIKE 'enc:v1:%')::int AS sin_cifrar
           FROM "${table}"`,
        );
        total += cifrados;
        if (sin_cifrar > 0) fallos++;
        const estado = sin_cifrar > 0 ? 'FAIL' : cifrados > 0 ? 'OK  ' : '--  ';
        console.log(`${estado} ${table}.${field}: ${cifrados} cifrados, ${sin_cifrar} en texto normal`);
      }
    }
  } finally {
    await sequelize.close();
  }
  if (fallos || total === 0) {
    console.error(fallos ? `\n${fallos} campo(s) con datos sin cifrar` : '\nNo hay datos que comprobar');
    process.exit(1);
  }
  console.log('\nTodos los campos sensibles están cifrados en la base de datos.');
})();

/**
 * Pruebas del cifrado de datos sensibles (services/dataEncryption.js) y de su uso en los
 * modelos. No necesitan base de datos.
 *
 *   node --test tests/dataEncryption.test.js
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const KEY_A = crypto.randomBytes(32).toString('base64');
const KEY_B = crypto.randomBytes(32).toString('hex');
process.env.DATA_ENCRYPTION_KEY = KEY_A;

const { Sequelize } = require('sequelize');
const enc = require('../services/dataEncryption');
const UsuarioModel = require('../models/usuario');

const useKeys = (current, old) => enc._setKeysFromEnv({ DATA_ENCRYPTION_KEY: current, DATA_ENCRYPTION_OLD_KEYS: old });

test('cifra y descifra; el texto no aparece en el valor guardado y cada cifrado es distinto', () => {
  useKeys(KEY_A);
  const texto = 'María José Pérez <maria@empresa.com> 🙂';
  const a = enc.encrypt(texto, 'usuario.email');
  const b = enc.encrypt(texto, 'usuario.email');
  assert.ok(a.startsWith('enc:v1:'));
  assert.notEqual(a, b);                       // IV aleatorio
  assert.ok(!a.includes('maria') && !a.includes('empresa'));
  assert.equal(enc.decrypt(a, 'usuario.email'), texto);
  assert.equal(enc.decrypt(b, 'usuario.email'), texto);
});

test('null y los datos anteriores al cifrado (sin prefijo) se devuelven tal cual', () => {
  assert.equal(enc.encrypt(null, 'x.y'), null);
  assert.equal(enc.encrypt(undefined, 'x.y'), undefined);
  assert.equal(enc.decrypt(null, 'x.y'), null);
  assert.equal(enc.decrypt('texto antiguo', 'x.y'), 'texto antiguo');
  assert.equal(enc.decrypt(12345, 'x.y'), 12345);
});

test('un valor modificado o copiado a otra columna no se descifra', () => {
  const valor = enc.encrypt('secreto', 'usuario.email');
  const partes = valor.split(':');
  const datos = Buffer.from(partes[5], 'base64url');
  datos[0] ^= 1;
  partes[5] = datos.toString('base64url');
  assert.throws(() => enc.decrypt(partes.join(':'), 'usuario.email'), enc.DecryptionError);
  assert.throws(() => enc.decrypt(valor, 'usuario.nombre'), enc.DecryptionError);
});

test('rotación: con la clave anterior en DATA_ENCRYPTION_OLD_KEYS se siguen leyendo los datos', () => {
  useKeys(KEY_A);
  const antiguo = enc.encrypt('dato', 'evaluacion.comentario');
  useKeys(KEY_B, KEY_A);
  assert.equal(enc.decrypt(antiguo, 'evaluacion.comentario'), 'dato');
  assert.equal(enc.isEncryptedWithCurrentKey(antiguo), false);  // db/cifrar-datos.js lo vuelve a cifrar
  assert.equal(enc.isEncryptedWithCurrentKey(enc.encrypt('dato', 'evaluacion.comentario')), true);
  useKeys(KEY_B);
  assert.throws(() => enc.decrypt(antiguo, 'evaluacion.comentario'), /clave desconocida/);
  useKeys(KEY_A);
});

test('la clave es obligatoria y debe tener 32 bytes', () => {
  assert.throws(() => enc._setKeysFromEnv({}), /DATA_ENCRYPTION_KEY no está definido/);
  assert.throws(() => useKeys('corta'), /32 bytes/);
  assert.throws(() => useKeys(crypto.randomBytes(16).toString('base64')), /32 bytes/);
  assert.throws(() => useKeys(KEY_A, 'mala'), /DATA_ENCRYPTION_OLD_KEYS/);
  useKeys(KEY_A);
});

// --- Modelos ---

const sequelize = new Sequelize('postgres://u:p@127.0.0.1:1/db', { logging: false }); // no se conecta
const Usuario = UsuarioModel(sequelize);
const datos = { nombre_usuario: 'ana', password: 'x', nombre: 'Ana', apellido: 'Pérez', email: 'ana@empresa.com', ci: 12345678 };

test('modelo: al asignar se cifra (lo que se guarda) y al leer se descifra (lo que va al frontend)', () => {
  const user = Usuario.build(datos);
  for (const campo of ['nombre', 'apellido', 'email', 'ci']) {
    assert.ok(enc.isEncrypted(user.getDataValue(campo)), `${campo} no está cifrado`);
  }
  assert.equal(user.getDataValue('nombre_usuario'), 'ana');  // se usa para el login: sin cifrar
  assert.equal(user.nombre, 'Ana');
  assert.equal(user.ci, 12345678);                           // vuelve a ser número
  const json = JSON.parse(JSON.stringify(user));
  assert.deepEqual(
    { nombre: json.nombre, apellido: json.apellido, email: json.email, ci: json.ci },
    { nombre: 'Ana', apellido: 'Pérez', email: 'ana@empresa.com', ci: 12345678 },
  );
  assert.ok(!JSON.stringify(json).includes('enc:v1:'));
  assert.ok(!('password' in json));
});

test('modelo: lee filas de la base de datos cifradas y también las antiguas sin cifrar', () => {
  const cifrada = Usuario.build({
    id: 1, nombre_usuario: 'ana',
    nombre: enc.encrypt('Ana', 'usuario.nombre'),
    email: enc.encrypt('ana@empresa.com', 'usuario.email'),
    ci: enc.encrypt('12345678', 'usuario.ci'),
  }, { raw: true, isNewRecord: false });
  assert.equal(cifrada.nombre, 'Ana');
  assert.equal(cifrada.email, 'ana@empresa.com');
  assert.equal(cifrada.ci, 12345678);

  const antigua = Usuario.build({ id: 2, nombre: 'Luis', ci: 999 }, { raw: true, isNewRecord: false });
  assert.equal(antigua.nombre, 'Luis');
  assert.equal(antigua.ci, 999);
});

test('modelo: actualizar un campo lo vuelve a cifrar', () => {
  const user = Usuario.build({ id: 1, nombre: enc.encrypt('Ana', 'usuario.nombre') }, { raw: true, isNewRecord: false });
  user.set({ nombre: 'Ana María' });
  assert.ok(user.changed('nombre'));
  assert.ok(enc.isEncrypted(user.getDataValue('nombre')));
  assert.equal(user.nombre, 'Ana María');
});

test('todos los campos sensibles quedan registrados para db/cifrar-datos.js', () => {
  require('../db/sequelize'); // define todos los modelos (no se conecta hasta la primera consulta)
  assert.deepEqual(
    Object.fromEntries(Object.entries(enc.ENCRYPTED_FIELDS).map(([t, f]) => [t, [...f].sort()])),
    {
      usuario: ['apellido', 'ci', 'email', 'nombre'],
      evaluacion: ['comentario'],
      objetivos: ['descripcion', 'estado_deseado'],
      plan_mejora: ['detalles'],
      resultado_habilidad: ['comentario'],
      retroalimentacion: ['comentario'],
    },
  );
});

/**
 * Cifrado de datos sensibles en la base de datos (AES-256-GCM, a nivel de campo).
 *
 * - Los modelos declaran los campos sensibles con `encryptedAttribute()`: el valor se cifra
 *   al asignarlo (antes de guardarlo) y se descifra al leerlo, así que el resto del código
 *   y las respuestas de la API trabajan con el texto normal.
 * - Formato guardado: enc:v1:<id de clave>:<iv>:<tag>:<datos>  (base64url).
 *   Cada valor usa un IV aleatorio y va ligado a su tabla y columna (AAD): un valor
 *   copiado a otra columna o modificado en la base de datos no se descifra.
 * - Clave: DATA_ENCRYPTION_KEY (32 bytes en base64 o hex: `openssl rand -base64 32`).
 *   Para cambiarla, la anterior se deja en DATA_ENCRYPTION_OLD_KEYS y se ejecuta
 *   `node db/cifrar-datos.js`, que vuelve a cifrar todo con la nueva.
 * - Los valores sin el prefijo (datos anteriores al cifrado) se leen tal cual hasta que
 *   `db/cifrar-datos.js` los cifra.
 */
const crypto = require('crypto');
const { DataTypes } = require('sequelize');

const PREFIX = 'enc:v1:';
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

class DecryptionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DecryptionError';
  }
}

function parseKey(value, name) {
  const text = String(value).trim();
  let key = null;
  if (/^[0-9a-f]{64}$/i.test(text)) key = Buffer.from(text, 'hex');
  else if (/^[A-Za-z0-9+/_-]{43}=?$/.test(text)) key = Buffer.from(text, 'base64');
  if (!key || key.length !== 32) {
    throw new Error(`${name} debe ser una clave de 32 bytes en base64 o hex (genérala con: openssl rand -base64 32).`);
  }
  return key;
}

const keyId = (key) => crypto.createHash('sha256').update(key).digest('hex').slice(0, 8);

/** Lee la clave actual y las anteriores del entorno. */
function loadKeys(env = process.env) {
  if (!env.DATA_ENCRYPTION_KEY) {
    throw new Error('DATA_ENCRYPTION_KEY no está definido. Configúralo en el archivo .env (genéralo con: openssl rand -base64 32) y guarda una copia segura: sin ella los datos cifrados no se pueden recuperar.');
  }
  const current = parseKey(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  const keys = new Map([[keyId(current), current]]);
  for (const old of (env.DATA_ENCRYPTION_OLD_KEYS || '').split(/[\s,;]+/).filter(Boolean)) {
    const key = parseKey(old, 'DATA_ENCRYPTION_OLD_KEYS');
    keys.set(keyId(key), key);
  }
  return { currentId: keyId(current), keys };
}

let keyring = loadKeys();

/** Solo para pruebas: recarga las claves desde otro entorno. */
function _setKeysFromEnv(env) {
  keyring = loadKeys(env);
}

const isEncrypted = (value) => typeof value === 'string' && value.startsWith(PREFIX);

/** true si el valor está cifrado con la clave actual (no hace falta volver a cifrarlo). */
const isEncryptedWithCurrentKey = (value) => isEncrypted(value) && value.startsWith(`${PREFIX}${keyring.currentId}:`);

function encrypt(value, context) {
  if (value === null || value === undefined) return value;
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, keyring.keys.get(keyring.currentId), iv);
  cipher.setAAD(Buffer.from(context));
  const data = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${keyring.currentId}:${iv.toString('base64url')}:${tag.toString('base64url')}:${data.toString('base64url')}`;
}

function decrypt(value, context) {
  if (!isEncrypted(value)) return value; // dato anterior al cifrado
  const [kid, iv, tag, data] = value.slice(PREFIX.length).split(':');
  const key = keyring.keys.get(kid);
  if (!key) {
    throw new DecryptionError(`Dato de ${context} cifrado con una clave desconocida (${kid}): falta en DATA_ENCRYPTION_KEY o DATA_ENCRYPTION_OLD_KEYS.`);
  }
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64url'));
    decipher.setAAD(Buffer.from(context));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    throw new DecryptionError(`No se pudo descifrar un dato de ${context}: fue modificado o la clave no corresponde.`);
  }
}

/** Campos cifrados por tabla (los usa db/cifrar-datos.js). */
const ENCRYPTED_FIELDS = {};

/**
 * Definición de atributo de Sequelize para un campo cifrado. La columna es TEXT porque
 * el valor cifrado es más largo que el original; los límites de longitud se validan
 * antes (validations/schemas.js) sobre el texto normal.
 *   parse: convierte el texto descifrado al tipo original (ej. Number para la cédula).
 */
function encryptedAttribute(table, field, { allowNull = false, parse } = {}) {
  const context = `${table}.${field}`;
  const fields = (ENCRYPTED_FIELDS[table] ||= []);
  if (!fields.includes(field)) fields.push(field);
  return {
    type: DataTypes.TEXT,
    allowNull,
    get() {
      const value = decrypt(this.getDataValue(field), context);
      return parse && value !== null && value !== undefined ? parse(value) : value;
    },
    set(value) {
      this.setDataValue(field, encrypt(value, context));
    },
  };
}

module.exports = {
  encrypt,
  decrypt,
  encryptedAttribute,
  isEncrypted,
  isEncryptedWithCurrentKey,
  ENCRYPTED_FIELDS,
  DecryptionError,
  _setKeysFromEnv,
};

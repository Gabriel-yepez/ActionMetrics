const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'actionmetrics_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Genera un token JWT para un usuario
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    nombre_usuario: user.nombre_usuario,
    id_rol: user.id_rol,
    id_departamento: user.id_departamento,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Setea el token JWT como cookie httpOnly en la respuesta.
 */
const setTokenCookie = (res, token) => {
  // Parsear duración del JWT para maxAge de la cookie
  const maxAgeMs = parseExpiry(JWT_EXPIRES_IN);

  res.cookie('token', token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'strict' : 'lax',
    maxAge: maxAgeMs,
    path: '/',
  });
};

/**
 * Limpia la cookie del token (para logout).
 */
const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
  });
};

/**
 * Middleware que verifica el token JWT.
 * Busca primero en la cookie httpOnly, luego en el header Authorization como fallback.
 */
const verifyToken = (req, res, next) => {
  // 1. Intentar leer de cookie httpOnly
  let token = req.cookies?.token;

  // 2. Fallback: header Authorization (para compatibilidad)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ ok: false, data: null, message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Si el token es inválido/expirado, limpiar la cookie
    clearTokenCookie(res);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, data: null, message: 'Token expirado. Inicie sesión nuevamente.' });
    }
    return res.status(401).json({ ok: false, data: null, message: 'Token inválido.' });
  }
};

/**
 * Middleware que verifica si el usuario es admin de departamento (id_rol === 1) o super admin (id_rol === 3)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.id_rol !== 1 && req.user.id_rol !== 3)) {
    return res.status(403).json({ ok: false, data: null, message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

/**
 * Middleware que verifica si el usuario es super admin (id_rol === 3)
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.id_rol !== 3) {
    return res.status(403).json({ ok: false, data: null, message: 'Acceso denegado. Se requieren permisos de super administrador.' });
  }
  next();
};

/**
 * Convierte strings tipo "8h", "30m", "7d" a milisegundos.
 */
function parseExpiry(expiry) {
  const match = expiry.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 8 * 60 * 60 * 1000; // fallback 8h
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * (multipliers[unit] || 3600000);
}

module.exports = { generateToken, setTokenCookie, clearTokenCookie, verifyToken, requireAdmin, requireSuperAdmin, JWT_SECRET };

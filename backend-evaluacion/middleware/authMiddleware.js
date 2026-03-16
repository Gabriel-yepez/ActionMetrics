const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'actionmetrics_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

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
 * Middleware que verifica el token JWT en el header Authorization
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, data: null, message: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
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

module.exports = { generateToken, verifyToken, requireAdmin, requireSuperAdmin, JWT_SECRET };

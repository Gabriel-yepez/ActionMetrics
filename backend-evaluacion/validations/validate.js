/**
 * Middleware factory que valida req.body contra un schema Zod.
 * Devuelve 400 con los errores formateados si falla.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      ok: false,
      data: null,
      message: errors[0].message,
      errors,
    });
  }

  req.body = result.data;
  next();
};

/**
 * Middleware que valida req.params contra un schema Zod.
 */
const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      ok: false,
      data: null,
      message: 'Parámetros inválidos',
    });
  }

  req.params = result.data;
  next();
};

module.exports = { validate, validateParams };

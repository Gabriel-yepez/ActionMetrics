/**
 * Valida un objeto de datos contra un schema Zod.
 * Retorna un objeto { field: errorKey } para mostrar errores por input.
 * Los errorKeys son claves de i18n (ej: 'required', 'invalidEmail').
 */
export const validateWithSchema = (schema, data) => {
  const result = schema.safeParse(data);

  if (result.success) return {};

  const errors = {};
  result.error.errors.forEach((err) => {
    const field = err.path[0];
    if (field && !errors[field]) {
      errors[field] = err.message;
    }
  });

  return errors;
};

/**
 * Verifica si el objeto de errores tiene algún error.
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

// Mantener retrocompatibilidad con el validateForm existente
export const validateForm = (fields) => {
  const errors = {};
  Object.keys(fields).forEach(fieldName => {
    if (!fields[fieldName] || String(fields[fieldName]).trim() === '') {
      errors[fieldName] = 'required';
    }
  });
  return errors;
};

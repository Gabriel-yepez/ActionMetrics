export const validateForm = (fields) => {
  const errors = {};
  
  Object.keys(fields).forEach(fieldName => {
    if (!fields[fieldName] || fields[fieldName].trim() === '') {
      errors[fieldName] = `El campo ${fieldName} es requerido`;
    }
  });
  
  return errors;
};

export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

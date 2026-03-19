/**
 * Calcula el porcentaje de objetivos completados.
 * @param {Array} objetivos - Lista de objetivos
 * @returns {number} Porcentaje de completados (0-100)
 */
export function getProgresoGlobal(objetivos) {
  if (!objetivos || objetivos.length === 0) return 0;
  const completados = objetivos.filter(obj => obj.estado_actual === 'completado').length;
  return parseFloat(((completados / objetivos.length) * 100).toFixed(2));
}

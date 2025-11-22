// Función auxiliar para formatear fechas correctamente
export const formatearFecha = (fecha) => {
  if (!fecha) return 'No definida';
  
  try {
    // Si la fecha viene en formato ISO string (yyyy-mm-dd) o timestamp
    let fechaObj;
    
    // Solución para el problema del día menos por timezone
    if (typeof fecha === 'string' && fecha.includes('T')) {
      // Si es un ISO string completo con tiempo (como '2023-05-25T00:00:00.000Z')
      fechaObj = new Date(fecha);
    } else if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Si es solo una fecha sin tiempo (como '2023-05-25')
      // Parseamos manualmente para evitar la conversión de zona horaria
      const [year, month, day] = fecha.split('-').map(Number);
      fechaObj = new Date(year, month - 1, day, 12, 0, 0);
    } else {
      // Para otros formatos
      fechaObj = new Date(fecha);
    }
    
    // Verificar si es una fecha válida
    if (isNaN(fechaObj.getTime())) {
      return 'Fecha inválida';
    }
    
    // Formatear como dd/mm/yyyy
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error en fecha';
  }
};
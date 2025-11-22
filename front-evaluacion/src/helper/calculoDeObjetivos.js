export const calculoDeObjetivos = (objetivosUsuarios) => {
    
    let puntuacionTotalObjetivos = 0;
    let totalResponsesObjetivos = 0;
    
    // Contar objetivos completados y no completados
    const objetivosCompletados = objetivosUsuarios.filter(
      objetivo => objetivo.estado_actual === 'completado'
    ).length;
    
    const objetivosTotal = objetivosUsuarios.length;
    
    console.log(`Objetivos completados: ${objetivosCompletados} de ${objetivosTotal}`);
    
    // Para objetivos completados, asignar valor en escala 1-5
    if (objetivosTotal > 0) {
      // Cada objetivo completado vale 5 puntos (máximo puntaje)
      puntuacionTotalObjetivos = objetivosCompletados * 5;
      // Contar todos los objetivos para el denominador, también en escala 5
      totalResponsesObjetivos = objetivosTotal;
    }
    
    return {puntuacionTotalObjetivos, totalResponsesObjetivos};
}
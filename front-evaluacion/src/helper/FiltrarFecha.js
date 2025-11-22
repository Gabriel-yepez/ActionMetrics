
export const ordenarPorFechaMasReciente = (datos, campoFecha = 'fecha') => {
    if (!Array.isArray(datos) || datos.length === 0) {
        return [];
    }

    // Crear una copia para no modificar el array original
    return [...datos].sort((a, b) => {
        // Convertir las cadenas de fecha a objetos Date para comparación
        const fechaA = new Date(a[campoFecha]);
        const fechaB = new Date(b[campoFecha]);
        
        // Orden descendente (de más reciente a más antigua)
        return fechaB - fechaA;
    });
}

export const ordenarObjetivosPorFecha = (objetivos, criterio = 'inicio') => {
    if (!Array.isArray(objetivos) || objetivos.length === 0) {
        return [];
    }

    // Crear una copia para no modificar el array original
    return [...objetivos].sort((a, b) => {
        // Manejar los diferentes nombres de campos (fechaInicio/fecha_inicio y fechaFin/fecha_fin)
        const fechaInicioA = new Date(a.fechaInicio || a.fecha_inicio);
        const fechaInicioB = new Date(b.fechaInicio || b.fecha_inicio);
        const fechaFinA = new Date(a.fechaFin || a.fecha_fin);
        const fechaFinB = new Date(b.fechaFin || b.fecha_fin);
        
        // Ordenar según el criterio especificado
        if (criterio === 'inicio') {
            // Ordenar por fecha de inicio (más reciente primero)
            return fechaInicioB - fechaInicioA;
        } else if (criterio === 'fin') {
            // Ordenar por fecha de fin (más reciente primero)
            return fechaFinB - fechaFinA;
        } else {
            // Criterio 'ambas': considerar ambas fechas
            // Primero intentamos ordenar por fecha de fin, si son iguales, ordenamos por fecha de inicio
            const diffFin = fechaFinB - fechaFinA;
            if (diffFin !== 0) {
                return diffFin; // Ordenar por fecha fin cuando son diferentes
            }
            return fechaInicioB - fechaInicioA; // Si fechas fin son iguales, ordenar por fecha inicio
        }
    });
}

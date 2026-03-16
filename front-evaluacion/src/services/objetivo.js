import { authFetch } from "@/services/authFetch"

export const fetchObjetivos = async (departamento = null) => {
    let url = '/objetivos'
    if (departamento) url += `?departamento=${departamento}`
    const res = await authFetch(url)
    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'No se pudieron obtener los objetivos.')
    }

    return result.data || []
}

export const crearObjetivo = async (objetivoData) => {
    const res = await authFetch('/objetivos', {
        method: 'POST',
        body: JSON.stringify({
            descripcion: objetivoData.descripcion,
            fecha_inicio: objetivoData.fechaInicio,
            fecha_fin: objetivoData.fechaFin,
            estado_actual: 'no completado',
            estado_deseado: 'completado',
            id_usuario: objetivoData.userId,
            id_tipo_objetivo: objetivoData.tipo === 'general' ? 1 : 2
        })
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'No se pudo crear el objetivo.')
    }

    return result.data
}

export const actualizarObjetivo = async (id) =>{
    const res = await authFetch(`/objetivos/${id}`,{
        method: 'PUT',
        body: JSON.stringify({
            estado_actual: 'completado'
        })
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'No se pudo actualizar el objetivo.')
    }

    return result.data
}

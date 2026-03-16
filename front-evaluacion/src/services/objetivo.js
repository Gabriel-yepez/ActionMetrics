import { authFetch } from "@/services/authFetch"

export const fetchObjetivos = async (departamento = null) => {

    try {
        let url = '/objetivos'
        if (departamento) url += `?departamento=${departamento}`
        const res = await authFetch(url)
        const result = await res.json()

        if (res.ok) {
            return result.data || []
        }
        return []

    } catch (error) {
        console.log("Error al buscar objetivos", error )
    }
}

export const crearObjetivo = async (objetivoData) => {
    try {
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
            throw new Error(result.message || `Error al crear objetivo: ${res.status}`)
        }

        return result.data
    } catch (error) {
        console.error("Error al crear objetivo:", error)
        throw error
    }
}

export const actualizarObjetivo = async (id) =>{
    try {

        const res = await authFetch(`/objetivos/${id}`,{
            method: 'PUT',
            body: JSON.stringify({
                estado_actual: 'completado'
            })
        })

        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.message || `Error al actualizar objetivo: ${res.status}`)
        }

        return result.data
    } catch (error) {
        console.error("Error al actualizar objetivo:", error)
    }
}

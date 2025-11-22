import { urlApi } from "@/config/config"

export const fetchObjetivos = async () => { 

    try {
        const res = await fetch(`${urlApi}/objetivos`)
        if (res.ok) {
            const data = await res.json()
            return data
        }
        
    } catch (error) {
        console.log("Error al buscar objetivos", error )
    }
}

export const crearObjetivo = async (objetivoData) => { 
    try {
        const res = await fetch(`${urlApi}/objetivos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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

        if (!res.ok) {
            throw new Error(`Error al crear objetivo: ${res.status}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        console.error("Error al crear objetivo:", error)
        throw error
    }
}

export const actualizarObjetivo = async (id) =>{
    try {

        const res = await fetch(`${urlApi}/objetivos/${id}`,{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado_actual: 'completado'
            })
        })

        if (!res.ok) {
            throw new Error(`Error al actualizar objetivo: ${res.status}`)
        }
        
    } catch (error) {
        console.error("Error al actualizar objetivo:", error)
    }
}
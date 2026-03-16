import { authFetch } from "@/services/authFetch"

export const createEvaluacion = async(data) =>{
    const response = await authFetch('/evaluaciones', {
        method: 'POST',
        body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'No se pudo crear la evaluación.')
    }

    return result.data
}

export const getEvaluaciones = async(departamento = null) =>{
    let url = '/evaluaciones'
    if (departamento) url += `?departamento=${departamento}`
    const response = await authFetch(url)
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'No se pudieron obtener las evaluaciones.')
    }

    return result.data || []
}

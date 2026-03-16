import { authFetch } from "@/services/authFetch"

export const fetchData = async(departamento = null) =>{
    let url = '/usuarios/count'
    if (departamento) url += `?departamento=${departamento}`
    const response = await authFetch(url)
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'No se pudo obtener el conteo de usuarios.')
    }

    return result.data
}

export const fetchEvaluaciones = async(departamento = null) =>{
    let url = '/evaluaciones/count'
    if (departamento) url += `?departamento=${departamento}`
    const response = await authFetch(url)
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'No se pudo obtener el conteo de evaluaciones.')
    }

    return result.data
}

export const fetchEvaluacionesByUser = async(userId) =>{
    const response = await authFetch(`/evaluaciones/count/${userId}`)
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'No se pudo obtener el conteo de evaluaciones del usuario.')
    }

    return result.data
}

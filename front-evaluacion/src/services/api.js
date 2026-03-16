import { authFetch } from "@/services/authFetch"


export const fetchData= async(departamento = null) =>{

    try {
        let url = '/usuarios/count'
        if (departamento) url += `?departamento=${departamento}`
        const response = await authFetch(url)
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error("Error data:", error)
    }
}

export const fetchEvaluaciones = async(departamento = null) =>{
    try {
        let url = '/evaluaciones/count'
        if (departamento) url += `?departamento=${departamento}`
        const response = await authFetch(url)
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error("Error data:", error)
    }
}

export const fetchEvaluacionesByUser = async(userId) =>{
    try {
        const response = await authFetch(`/evaluaciones/count/${userId}`)
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error("Error al obtener evaluaciones por usuario:", error)
        return 0
    }
}

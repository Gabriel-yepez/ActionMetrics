import { authFetch } from "@/services/authFetch"


export const fetchData= async() =>{

    try {
        const response = await authFetch('/usuarios/count')
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error("Error data:", error)
    }
}

export const fetchEvaluaciones = async() =>{
    try {
        const response = await authFetch('/evaluaciones/count')
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

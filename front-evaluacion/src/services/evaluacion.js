import { authFetch } from "@/services/authFetch"

export const createEvaluacion = async(data) =>{
    try {
        const response = await authFetch('/evaluaciones', {
            method: 'POST',
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            console.log(`Error al crear evaluacion: ${response.status}`)
        }
        const result = await response.json()
        return result
    } catch (error) {
        console.error("Error data:", error)
    }
}

export const getEvaluaciones = async() =>{
    try {
        const response = await authFetch('/evaluaciones')
        if (!response.ok) {
            console.log(`Error al obtener evaluaciones: ${response.status}`)
        }
        const result = await response.json()
        return result
    } catch (error) {
        console.error("Error data:", error)
    }
}

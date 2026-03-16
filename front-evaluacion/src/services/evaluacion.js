import { authFetch } from "@/services/authFetch"

export const createEvaluacion = async(data) =>{
    try {
        const response = await authFetch('/evaluaciones', {
            method: 'POST',
            body: JSON.stringify(data)
        })

        const result = await response.json()

        if (!response.ok) {
            console.log(`Error al crear evaluacion: ${result.message}`)
        }

        return result.data
    } catch (error) {
        console.error("Error data:", error)
    }
}

export const getEvaluaciones = async(departamento = null) =>{
    try {
        let url = '/evaluaciones'
        if (departamento) url += `?departamento=${departamento}`
        const response = await authFetch(url)
        const result = await response.json()

        if (!response.ok) {
            console.log(`Error al obtener evaluaciones: ${result.message}`)
        }

        return result.data || []
    } catch (error) {
        console.error("Error data:", error)
    }
}

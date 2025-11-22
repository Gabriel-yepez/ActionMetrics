import { urlApi } from "@/config/config"

export const createEvaluacion = async(data) =>{
    try {
        const getEvaluacion = await fetch(`${urlApi}/evaluaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!getEvaluacion.ok) {
            console.log(`Error al crear evaluacion: ${getEvaluacion.status}`)
        }
        const result = await getEvaluacion.json()
        return result
    } catch (error) {
        console.error("Error data:", error)
    }
}

export const getEvaluaciones = async() =>{
    try {
        const getEvaluaciones = await fetch(`${urlApi}/evaluaciones`)
        if (!getEvaluaciones.ok) {
            console.log(`Error al obtener evaluaciones: ${getEvaluaciones.status}`)
        }
        const result = await getEvaluaciones.json()
        return result
    } catch (error) {
        console.error("Error data:", error)
    }
}
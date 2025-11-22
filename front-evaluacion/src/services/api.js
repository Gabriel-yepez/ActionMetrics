import { urlApi } from "@/config/config"


export const fetchData= async() =>{

    try {
        const getusuarioscount = await fetch(`${urlApi}/usuarios/count`)
        const result = await getusuarioscount.json()
        return result
    } catch (error) {
        console.error("Error data:", error)
    }
}

export const fetchEvaluaciones = async() =>{
    try {
        const getevaluacionescount = await fetch(`${urlApi}/evaluaciones/count`)
        const result = await getevaluacionescount.json()
        return result
    } catch (error) {
        console.error("Error data:", error)
    }
}

export const fetchEvaluacionesByUser = async(userId) =>{
    try {
        const getevaluacionescount = await fetch(`${urlApi}/evaluaciones/count/${userId}`)
        const result = await getevaluacionescount.json()
        return result
    } catch (error) {
        console.error("Error al obtener evaluaciones por usuario:", error)
        return 0 // Retorna 0 en caso de error
    }
}
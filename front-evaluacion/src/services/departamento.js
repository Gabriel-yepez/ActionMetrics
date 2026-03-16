import { authFetch } from "@/services/authFetch"

export const fetchDepartamentos = async () => {
    try {
        const res = await authFetch('/departamentos')
        const result = await res.json()

        if (res.ok) {
            return result.data || []
        }
        return []
    } catch (error) {
        console.error("Error al obtener departamentos:", error)
        return []
    }
}

export const crearDepartamento = async (data) => {
    try {
        const res = await authFetch('/departamentos', {
            method: 'POST',
            body: JSON.stringify(data)
        })

        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.message || `Error al crear departamento: ${res.status}`)
        }

        return result.data
    } catch (error) {
        console.error("Error al crear departamento:", error)
        throw error
    }
}

export const actualizarDepartamento = async (id, data) => {
    try {
        const res = await authFetch(`/departamentos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        })

        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.message || `Error al actualizar departamento: ${res.status}`)
        }

        return result.data
    } catch (error) {
        console.error("Error al actualizar departamento:", error)
        throw error
    }
}

export const eliminarDepartamento = async (id) => {
    try {
        const res = await authFetch(`/departamentos/${id}`, {
            method: 'DELETE'
        })

        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.message || `Error al eliminar departamento: ${res.status}`)
        }

        return result.data
    } catch (error) {
        console.error("Error al eliminar departamento:", error)
        throw error
    }
}

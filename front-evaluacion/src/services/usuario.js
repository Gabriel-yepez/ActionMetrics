import { authFetch } from "@/services/authFetch"

/**
 * Crea un nuevo usuario
 * @param {object} userData - Datos del usuario a crear
 * @returns {Promise<object>} - Usuario creado
 */
export const crearUsuario = async (userData) => {
  try {
    const res = await authFetch('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Error al crear usuario')
    }
    return result.data
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw error
  }
}

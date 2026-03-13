import { authFetch } from "@/services/authFetch"

/**
 * Deletes a user by ID
 * @param {number} id - ID of the user to delete
 * @returns {Promise} - Promise that resolves when the user is deleted
 */
export const deleteUser = async (id) => {
  try {
    const res = await authFetch(`/usuarios/${id}`, { method: 'DELETE' })
    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || `Error al eliminar usuario: ${res.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
}

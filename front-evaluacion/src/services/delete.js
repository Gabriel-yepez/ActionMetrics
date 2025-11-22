import { urlApi } from "@/config/config"

/**
 * Deletes a user by ID
 * @param {number} id - ID of the user to delete
 * @returns {Promise} - Promise that resolves when the user is deleted
 */
export const deleteUser = async (id) => {
  try {
    const res = await fetch(`${urlApi}/usuarios/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al eliminar usuario: ${res.status} ${res.statusText}`);
    }
    return true;
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error; // Re-lanzar el error para que sea capturado por la mutación
  }
}


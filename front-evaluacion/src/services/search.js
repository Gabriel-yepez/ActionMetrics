import { urlApi } from "@/config/config"

/**
 * Fetches users based on search query
 * @param {string} query - Search term to filter users
 * @returns {Promise<{users: Array, notFound: boolean}>} - Object containing users array and notFound status
 */
export const fetchUsers = async (query = "") => {
  try {
    const res = await fetch(`${urlApi}/usuarios?search=${query}`)
    
    if (res.status === 404) {
      // Si es 404, activa el estado de "no encontrado"
      return { 
        users: [], 
        notFound: true 
      }
    }
    
    if (res.ok) {
      const data = await res.json()
      return { 
        users: data, 
        notFound: false 
      }
    }
    
    // Default fallback for other non-OK responses
    return { 
      users: [], 
      notFound: true 
    }
    
  } catch (error) {
    console.error("Error fetching users:", error)
    // Maneja errores de red como si no se encontraran usuarios
    return { 
      users: [], 
      notFound: true 
    }
  }
}
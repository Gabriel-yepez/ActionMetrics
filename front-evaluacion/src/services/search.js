import { authFetch } from "@/services/authFetch"

/**
 * Fetches users based on search query
 * @param {string} query - Search term to filter users
 * @returns {Promise<{users: Array, notFound: boolean}>} - Object containing users array and notFound status
 */
export const fetchUsers = async (query = "") => {
  try {
    const res = await authFetch(`/usuarios?search=${query}`)

    if (res.status === 404) {
      return {
        users: [],
        notFound: true
      }
    }

    if (res.ok) {
      const result = await res.json()
      return {
        users: result.data || [],
        notFound: false
      }
    }

    return {
      users: [],
      notFound: true
    }

  } catch (error) {
    console.error("Error fetching users:", error)
    return {
      users: [],
      notFound: true
    }
  }
}

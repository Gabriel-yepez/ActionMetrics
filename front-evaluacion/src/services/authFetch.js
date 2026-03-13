import { urlApi } from '@/config/config'
import { useSesionStore } from '@/store/sesionStore'

/**
 * Fetch wrapper que inyecta automáticamente el token JWT
 * y maneja respuestas 401 (sesión expirada)
 */
export async function authFetch(endpoint, options = {}) {
  const token = useSesionStore.getState().token

  const headers = { ...options.headers }

  // Agregar token si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // No establecer Content-Type si es FormData (el browser lo maneja)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${urlApi}${endpoint}`, {
    ...options,
    headers,
  })

  // Si el token expiró o es inválido, cerrar sesión
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}))

    // Limpiar sesión y redirigir al login
    useSesionStore.getState().logout()

    // Solo redirigir si estamos en el browser
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }

    throw new Error(data.message || 'Sesión expirada')
  }

  return response
}

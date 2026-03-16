import { urlApi } from '@/config/config'
import { useSesionStore } from '@/store/sesionStore'

/**
 * Fetch wrapper que envía cookies httpOnly automáticamente
 * y maneja respuestas 401 (sesión expirada)
 */
export async function authFetch(endpoint, options = {}) {
  const headers = { ...options.headers }

  // No establecer Content-Type si es FormData (el browser lo maneja)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${urlApi}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Envía la cookie httpOnly automáticamente
  })

  // Si el token expiró o es inválido, cerrar sesión
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}))

    // Limpiar sesión local
    useSesionStore.getState().logout()

    // Solo redirigir si estamos en el browser
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }

    throw new Error(data.message || 'Sesión expirada')
  }

  return response
}

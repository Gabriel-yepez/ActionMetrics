import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSesionStore } from '@/store/sesionStore'
import { authFetch } from '@/services/authFetch'

// Páginas que NO requieren autenticación
const PUBLIC_ROUTES = ['/', '/registro']

export default function AuthGuard({ children }) {
  const router = useRouter()
  const isAuthenticated = useSesionStore(state => state.isAuthenticated)
  const usuario = useSesionStore(state => state.usuario)
  const login = useSesionStore(state => state.login)
  const logout = useSesionStore(state => state.logout)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // No verificar en rutas públicas
    if (PUBLIC_ROUTES.includes(router.pathname)) {
      setIsVerifying(false)
      return
    }

    // Si el store ya tiene sesión (hidratación de localStorage completó), confiar en él
    if (isAuthenticated && usuario) {
      setIsVerifying(false)
      return
    }

    // Si no hay sesión en el store, verificar con el backend (la cookie httpOnly puede seguir válida)
    authFetch('/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) {
          login(data)
        } else {
          logout()
          router.replace('/')
        }
      })
      .catch(() => {
        // authFetch ya maneja el 401 y hace logout/redirect
      })
      .finally(() => setIsVerifying(false))
  }, [router.pathname])

  // En rutas públicas, renderizar siempre
  if (PUBLIC_ROUTES.includes(router.pathname)) {
    return children
  }

  // Mientras se verifica la sesión, no renderizar nada
  if (isVerifying) {
    return null
  }

  // En rutas protegidas, solo renderizar si está autenticado
  if (!isAuthenticated || !usuario) {
    return null
  }

  return children
}

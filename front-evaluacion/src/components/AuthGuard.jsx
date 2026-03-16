import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSesionStore } from '@/store/sesionStore'

// Páginas que NO requieren autenticación
const PUBLIC_ROUTES = ['/', '/registro']

export default function AuthGuard({ children }) {
  const router = useRouter()
  const isAuthenticated = useSesionStore(state => state.isAuthenticated)
  const usuario = useSesionStore(state => state.usuario)

  useEffect(() => {
    // No hacer nada en rutas públicas
    if (PUBLIC_ROUTES.includes(router.pathname)) return

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !usuario) {
      router.replace('/')
    }
  }, [isAuthenticated, usuario, router.pathname])

  // En rutas públicas, renderizar siempre
  if (PUBLIC_ROUTES.includes(router.pathname)) {
    return children
  }

  // En rutas protegidas, solo renderizar si está autenticado
  if (!isAuthenticated || !usuario) {
    return null
  }

  return children
}

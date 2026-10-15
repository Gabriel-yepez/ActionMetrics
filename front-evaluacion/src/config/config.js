// URL pública del backend (la usa el navegador). Se fija en tiempo de build
// con NEXT_PUBLIC_BACKEND_URL; por defecto apunta al backend local.
export const urlBackend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001"
export const urlApi = `${urlBackend}/api`

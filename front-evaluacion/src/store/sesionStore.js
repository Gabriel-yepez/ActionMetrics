import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Store para manejar la sesión de usuario con persistencia
export const useSesionStore = create(
  persist(
    (set, get) => ({
      // Datos iniciales
      usuario: null,
      token: null,
      isAuthenticated: false,

      // Método para iniciar sesión
      login: (response) => {
        // La respuesta tiene formato: { message: string, data: {...userData}, token: string }
        const userData = response.data;
        const token = response.token;

        set({
          usuario: userData,
          token: token,
          isAuthenticated: true
        });
      },

      // Método para cerrar sesión
      logout: () => set({
        usuario: null,
        token: null,
        isAuthenticated: false,
      }),

      // Método para actualizar datos del usuario
      updateUsuario: (userData) => set({
        usuario: {
          ...get().usuario,
          ...userData
        }
      }),

      // Método para verificar si el usuario está autenticado
      checkAuth: () => {
        return get().isAuthenticated && get().token !== null;
      },

      // Método para obtener información del usuario
      getUsuario: () => get().usuario,

    }),
    {
      name: 'sesion-storage', // Nombre para el localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Store para manejar la sesión de usuario con persistencia
// El token JWT se guarda en cookie httpOnly (no accesible desde JS).
// Solo se persiste la info del usuario para la UI.
export const useSesionStore = create(
  persist(
    (set, get) => ({
      // Datos iniciales
      usuario: null,
      isAuthenticated: false,

      // Método para iniciar sesión (ya no recibe token, viene en cookie)
      login: (response) => {
        const userData = response.data;

        set({
          usuario: userData,
          isAuthenticated: true
        });
      },

      // Método para cerrar sesión
      logout: () => set({
        usuario: null,
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
        return get().isAuthenticated && get().usuario !== null;
      },

      // Método para obtener información del usuario
      getUsuario: () => get().usuario,

    }),
    {
      name: 'sesion-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)

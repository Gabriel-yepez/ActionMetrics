import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Store para manejar la sesión de usuario con persistencia
export const useSesionStore = create(
  persist(
    (set, get) => ({
      // Datos iniciales
      usuario: null, 
      isAuthenticated: false,

      // Método para iniciar sesión
      login: (response) => {
        // La respuesta tiene formato: { message: string, data: {...userData} }
        const userData = response.data ;
        
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
        return get().isAuthenticated;
      },

      // Método para obtener información del usuario
      getUsuario: () => get().usuario,

      // Método para obtener el token
      
    }),
    {
      name: 'sesion-storage', // Nombre para el localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        usuario: state.usuario, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
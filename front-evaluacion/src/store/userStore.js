import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchUsers } from '@/services/search';
// Store para usuarios usando Zustand
export const useUserStore = create(
  // Usar el middleware persist para mantener el estado entre recargas
  persist(
    (set, get) => ({
      // Estado
      search: '',
      users: [],
      loading: false,
      error: null,
      
      // Acciones
      setSearch: (value) => {
        set({ search: value });
      },
      
      // Resetear la búsqueda
      resetSearch: () => {
        set({ search: '' });
      },
      
      // Cargar usuarios desde la API con verificación de caché
      conseguirUsers: async ( forceRefresh = false) => {
        try {
          // Si ya tenemos usuarios y no se fuerza actualización ni hay término de búsqueda, devolver los que tenemos
          const currentUsers = get().users;
          if (!forceRefresh && currentUsers.length > 0) {
            return currentUsers;
          }
          
          // Actualizar estado de carga
          set({ loading: true, error: null });
          
          // Llamar a la función de servicio para obtener usuarios
          const result = await fetchUsers();
          
          // Guardar usuarios en el estado global
          set({ 
            users: result.users || [], 
            loading: false,
            error: result.notFound ? 'No se encontraron usuarios' : null
          });
          
          return result.users || [];
        } catch (error) {
          // Manejar errores
          console.error('Error al cargar usuarios:', error);
          set({ 
            error: error.message || 'Error al cargar usuarios', 
            loading: false 
          });
          return [];
        }
      },
      
      // Sincronizar eliminación de usuarios (para mantener el estado coherente)
      syncDeletedUser: (userId) => {
        // Actualizar el estado local cuando se elimina un usuario
        const currentUsers = get().users;
        if (currentUsers.length > 0) {
          set({
            users: currentUsers.filter(user => user.id !== userId)
          });
        }
      },
      
      // Obtener un usuario por ID
      getUserById: (id) => {
        return get().users.find(user => user.id === id);
      },
      
      //borrar usuario
      delete: (id)=>{
        set((state)=>({
            users: state.users.filter(user=> user.id !==id)
        }))
      },

      //limpiar usuarios
      clearUsers:()=>{
        set({users:[]})
      }

    }),
    {
      name: 'user-storage', // nombre para localStorage
      partialize: (state) => ({ search: state.search, users: state.users }), // solo persistir la búsqueda
    }
  )
);

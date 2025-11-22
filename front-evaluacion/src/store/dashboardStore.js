import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store para el dashboard usando Zustand
export const useDashboardStore = create(
  // Usar el middleware persist para mantener el estado entre recargas
  persist(
    (set, get) => ({
      // Estado
      objetivos: [],
      
      // Acciones
      addObjetivo: (objetivo) => {
        set((state) => ({
          objetivos: [...state.objetivos, objetivo]
        }));
      },
      
      updateObjetivo: (id, updatedData) => {
        set((state) => ({
          objetivos: state.objetivos.map(obj => 
            obj.id === id ? { ...obj, ...updatedData } : obj
          )
        }));
      },
      
      updateObjetivoProgreso: (id, progreso) => {
        set((state) => ({
          objetivos: state.objetivos.map(obj => 
            obj.id === id ? { ...obj, progreso } : obj
          )
        }));
      },
      
      deleteObjetivo: (id) => {
        set((state) => ({
          objetivos: state.objetivos.filter(obj => obj.id !== id)
        }));
      },
      
      getObjetivosByTipo: (tipo) => {
        return get().objetivos.filter(obj => obj.id_tipo_objetivo === tipo);
      },
      
      getProgresoGlobal: () => {
        const objetivos = get().objetivos;
        if (objetivos.length === 0) return 0;
        
        // Obtiene el total de objetivos
        const totalObjetivos = objetivos.length;
        if (totalObjetivos === 0) return 0;
        
        // Contar objetivos con estado_actual "completado"
        const objetivosCompletados = objetivos.filter(obj => obj.estado_actual === "completado").length;
        
        // Calcular el porcentaje de objetivos completados
        // Convertir a número: parseFloat para garantizar un valor numérico
        return totalObjetivos > 0 ? parseFloat(((objetivosCompletados / totalObjetivos) * 100).toFixed(2)) : 0;
      },
      
      resetObjetivos: () => {
        set({ objetivos: [] });
      }
    }),
    {
      name: 'dashboard-storage', // nombre para localStorage
      partialize: (state) => ({ objetivos: state.objetivos }), // solo persistir objetivos
    }
  )
);

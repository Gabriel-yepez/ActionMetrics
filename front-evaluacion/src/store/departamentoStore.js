import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useDepartamentoStore = create(
  persist(
    (set) => ({
      selectedDepartamento: null,

      setSelectedDepartamento: (id) => set({ selectedDepartamento: id }),

      clearDepartamento: () => set({ selectedDepartamento: null }),
    }),
    {
      name: 'departamento-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedDepartamento: state.selectedDepartamento
      }),
    }
  )
)

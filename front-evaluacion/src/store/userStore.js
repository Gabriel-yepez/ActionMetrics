import { create } from 'zustand';

// Store solo para estado de UI (búsqueda).
// Los datos de usuarios vienen de TanStack Query (useUsers).
export const useUserStore = create((set) => ({
  search: '',

  setSearch: (value) => set({ search: value }),

  resetSearch: () => set({ search: '' }),
}));

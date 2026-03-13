import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers } from '@/services/search';
import { fetchData, fetchEvaluaciones, fetchEvaluacionesByUser } from '@/services/api';
import { deleteUser } from '@/services/delete';
import { fetchObjetivos, crearObjetivo, actualizarObjetivo } from '@/services/objetivo';
import { getReport,getReportIA } from '@/services/reporte';
import { createEvaluacion, getEvaluaciones } from '@/services/evaluacion';
import { graficaGeneral, graficaUsuario } from '@/services/datosChart';
import { guardarRetroalimentacion, getAllRetroalimentacion } from '@/services/retroalimentacion';
import { uploadDocument, getDocument } from '@/services/documento';

// Claves de consulta para referencia
export const queryKeys = {
  users: 'users',
  evaluaciones: 'evaluaciones',
  usuariosCount: 'usuariosCount',
  evaluacionesCount: 'evaluacionesCount',
  evaluacionesCountByUser: 'evaluacionesCountByUser',
  objetivos: 'objetivos',
  reportes: 'reportes',
  reportesia: 'reportesia',
  documentos: 'documentos',
  evaluacionesCrear: 'evaluacionesCrear',
  graficaGeneral: 'graficaGeneral',
  graficaUsuario: 'graficaUsuario',
  retroalimentacion: 'retroalimentacion',
  retroalimentacionAll: 'retroalimentacionAll'
};

// Hook para obtener usuarios con búsqueda
export function useUsers(searchTerm = '') {
  return useQuery({
    queryKey: [queryKeys.users, searchTerm],
    queryFn: () => fetchUsers(searchTerm),
    select: (data) => ({
      users: data.users || [],
      notFound: data.notFound || false
    })
  });
}

// Hook para obtener conteo de evaluaciones
export function useEvaluacionesCount() {
  return useQuery({
    queryKey: [queryKeys.evaluacionesCount],
    queryFn: fetchEvaluaciones,
    select: (data) => data || 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para obtener conteo de evaluaciones de un usuario específico
export function useEvaluacionesCountByUser(userId) {
  return useQuery({
    queryKey: [queryKeys.evaluacionesCountByUser, userId],
    queryFn: () => fetchEvaluacionesByUser(userId),
    select: (data) => data || 0,
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
}

// Hook para obtener conteo de usuarios
export function useUsuariosCount() {
  return useQuery({
    queryKey: [queryKeys.usuariosCount],
    queryFn: fetchData,
    select: (data) => data || 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para eliminar un usuario
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.usuariosCount] });
    }
  });
}

// Hook para obtener todos los objetivos
export function useObjetivos() {
  return useQuery({
    queryKey: [queryKeys.objetivos],
    queryFn: fetchObjetivos,
    select: (data) => data || [],
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para crear un objetivo
export function useCreateObjetivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objetivoData) => crearObjetivo(objetivoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.objetivos] });
    },
  });
}

// Hook para obtener el reporte en formato PDF usando mutación
export function useGetReport() {
  return useMutation({
    mutationFn: (data) => getReport(data),
  });
}

//hook de reporte con ia
export function useGetReportIA(){
  return useMutation({
    mutationFn: (data) =>getReportIA(data),
  })
}

// Hook para actualizar un objetivo
export function useUpdateObjetivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => actualizarObjetivo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.objetivos] });
    },
  });
}

// Hook para subir documentos
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.documentos] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.objetivos] });
    }
  });
}

// Hook para obtener documentos
export function useGetDocuments() {
  return useQuery({
    queryKey: [queryKeys.documentos],
    queryFn: getDocument,
  });
}

export function useCreateEvaluacion(){
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createEvaluacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluaciones] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluacionesCount] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluacionesCountByUser] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.graficaGeneral] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.graficaUsuario] });
    },
  });
}

// Hook para obtener todas las evaluaciones
export function useEvaluaciones() {
  return useQuery({
    queryKey: [queryKeys.evaluaciones],
    queryFn: getEvaluaciones,
    select: (data) => data || [],
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para obtener datos de gráfica general
export function useGraficaGeneral() {
  return useQuery({
    queryKey: [queryKeys.graficaGeneral],
    queryFn: graficaGeneral,
    select: (data) => data || [],
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Hook para obtener datos de gráfica por usuario
export function useGraficaUsuario(userId) {
  return useQuery({
    queryKey: [queryKeys.graficaUsuario, userId],
    queryFn: () => graficaUsuario(userId),
    select: (data) => {
      // data ya viene como el objeto directo del backend: {"userId": [...]}
      if (data && data[userId]) {
        return data[userId];
      }

      // Si es un array directo
      if (Array.isArray(data)) {
        return data;
      }

      return [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
    retry: 2,
  });
}

// Hook para guardar retroalimentación
export function useGuardarRetroalimentacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => guardarRetroalimentacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluaciones] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluacionesCount] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluacionesCountByUser] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.retroalimentacionAll] });
    },
  });
}

export function useGetAllRetroalimentacion() {
  return useQuery({
    queryKey: [queryKeys.retroalimentacionAll],
    queryFn: getAllRetroalimentacion,
    select: (data) => data || [],
    staleTime: 5 * 60 * 1000,
  });
}

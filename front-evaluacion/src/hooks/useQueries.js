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
  evaluacionesCount: 'evaluacionesCount', // Clave específica para el conteo de evaluaciones
  evaluacionesCountByUser: 'evaluacionesCountByUser', // Nueva clave para el conteo de evaluaciones por usuario
  objetivos: 'objetivos',
  reportes: 'reportes',
  reportesia: 'reportesia',
  documentos: 'documentos', // Nueva clave para documentos
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
    queryKey: [queryKeys.evaluacionesCount], // Usar la clave específica para el conteo
    queryFn: fetchEvaluaciones,
    select: (data) => data || 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener conteo de evaluaciones de un usuario específico
export function useEvaluacionesCountByUser(userId) {
  return useQuery({
    queryKey: [queryKeys.evaluacionesCountByUser, userId],
    queryFn: () => fetchEvaluacionesByUser(userId),
    select: (data) => data || 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!userId, // Solo se ejecuta si hay un userId válido
  });
}

// Hook para obtener conteo de usuarios
export function useUsuariosCount() {
  return useQuery({
    queryKey: [queryKeys.usuariosCount],
    queryFn: fetchData,
    select: (data) => data || 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para eliminar un usuario
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      // Invalidar consultas relacionadas para actualizar la UI
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
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para crear un objetivo
export function useCreateObjetivo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (objetivoData) => crearObjetivo(objetivoData),
    onSuccess: () => {
      // Invalidar consultas relacionadas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: [queryKeys.objetivos] });
    },
  });
}

// Hook para obtener el reporte en formato PDF usando mutación
export function useGetReport() {
  return useMutation({
    mutationFn: (data) => getReport(data),
    // Las mutaciones no requieren staleTime o enabled ya que se ejecutan solo cuando se llaman
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
      // Invalidar consultas relacionadas para actualizar la UI
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
      // Invalidar consultas relacionadas para actualizar la UI
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
      // Invalidar todas las consultas relacionadas con evaluaciones para actualizar la UI
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluaciones] });
      
      // Invalidar específicamente el conteo de evaluaciones
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluacionesCount] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluacionesCountByUser] });
      
      // Invalidar las consultas de gráficas para que se actualicen con los nuevos datos
      queryClient.invalidateQueries({ queryKey: [queryKeys.graficaGeneral] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.graficaUsuario] });
      
      // Forzar una actualización de los datos después de 500ms para asegurar que el backend ha procesado la nueva evaluación
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: [queryKeys.evaluaciones] });
        queryClient.refetchQueries({ queryKey: [queryKeys.evaluacionesCount] });
        queryClient.refetchQueries({ queryKey: [queryKeys.evaluacionesCountByUser] });
        queryClient.refetchQueries({ queryKey: [queryKeys.graficaGeneral] });
        // No refrescamos automáticamente graficaUsuario ya que depende del userId específico
        // y podría causar solicitudes innecesarias para todos los usuarios
      }, 500);
    },
  });
}

// Hook para obtener todas las evaluaciones
export function useEvaluaciones() {
  return useQuery({
    queryKey: [queryKeys.evaluaciones],
    queryFn: getEvaluaciones,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener datos de gráfica general
export function useGraficaGeneral() {
  return useQuery({
    queryKey: [queryKeys.graficaGeneral],
    queryFn: graficaGeneral,
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    onError: (error) => {
      console.error("Error al obtener datos para la gráfica general:", error);
    }
  });
}

// Hook para obtener datos de gráfica por usuario
export function useGraficaUsuario(userId) {
  return useQuery({
    queryKey: [queryKeys.graficaUsuario, userId],
    queryFn: () => graficaUsuario(userId),
    select: (response) => {      
      // Verificamos si es el formato específico para usuario: {success: true, data: {"userId": [...] }}
      if (response && response.success && response.data && response.data[userId]) {
        return response.data[userId];
      }
      
      // Si no tiene la estructura específica para usuario, intentamos con la estructura general
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si todo lo anterior falla, devolvemos un array vacío
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!userId, // Solo se ejecuta si hay un userId válido
    retry: 2,
    onError: (error) => {
      console.error("Error al obtener datos para la gráfica del usuario:", error);
    }
  });
}

// Hook para guardar retroalimentación
export function useGuardarRetroalimentacion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => guardarRetroalimentacion(data),
    onSuccess: () => {
      // Invalidar todas las consultas relacionadas con evaluaciones para actualizar la UI
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluaciones] });
      
      // Invalidar específicamente el conteo de evaluaciones
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluacionesCount] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluacionesCountByUser] });
      
      // Invalidar las consultas de gráficas para que se actualicen con los nuevos datos
      queryClient.invalidateQueries({ queryKey: [queryKeys.graficaGeneral] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.graficaUsuario] });
      
      // Invalidar la consulta de retroalimentación para que se actualice con los nuevos datos
      queryClient.invalidateQueries({ queryKey: [queryKeys.retroalimentacionAll] });
      
      // Forzar una actualización de los datos después de 500ms para asegurar que el backend ha procesado la nueva evaluación
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: [queryKeys.evaluaciones] });
        queryClient.refetchQueries({ queryKey: [queryKeys.evaluacionesCount] });
        queryClient.refetchQueries({ queryKey: [queryKeys.evaluacionesCountByUser] });
        queryClient.refetchQueries({ queryKey: [queryKeys.graficaGeneral] });
        // No refrescamos automáticamente graficaUsuario ya que depende del userId específico
        // y podría causar solicitudes innecesarias para todos los usuarios
      }, 500);
    },
  });
}

export function useGetAllRetroalimentacion() {
  return useQuery({
    queryKey: [queryKeys.retroalimentacionAll],
    queryFn: getAllRetroalimentacion,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
  
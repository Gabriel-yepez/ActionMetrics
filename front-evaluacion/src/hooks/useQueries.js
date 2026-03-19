import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers } from '@/services/search';
import { fetchData, fetchEvaluaciones, fetchEvaluacionesByUser } from '@/services/api';
import { deleteUser } from '@/services/delete';
import { crearUsuario } from '@/services/usuario';
import { fetchObjetivos, crearObjetivo, actualizarObjetivo } from '@/services/objetivo';
import { getReport,getReportIA } from '@/services/reporte';
import { createEvaluacion, getEvaluaciones } from '@/services/evaluacion';
import { graficaGeneral, graficaUsuario } from '@/services/datosChart';
import { guardarRetroalimentacion, getAllRetroalimentacion } from '@/services/retroalimentacion';
import { uploadDocument, getDocument } from '@/services/documento';
import { fetchDepartamentos, crearDepartamento, actualizarDepartamento, eliminarDepartamento } from '@/services/departamento';
import { useDepartamentoStore } from '@/store/departamentoStore';
import { useSesionStore } from '@/store/sesionStore';

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
  retroalimentacionAll: 'retroalimentacionAll',
  departamentos: 'departamentos'
};

/**
 * Obtiene el filtro de departamento activo según el rol:
 * - Super Admin (id_rol=3): usa el selector global (puede ver todo o filtrar)
 * - Admin de departamento (id_rol=1): siempre su departamento
 * - Empleado (id_rol=2): siempre su departamento
 */
function useDeptFilter() {
  const selectedDepartamento = useDepartamentoStore(state => state.selectedDepartamento);
  const usuario = useSesionStore(state => state.usuario);
  const isSuperAdmin = usuario && usuario.id_rol === 3;
  return isSuperAdmin ? selectedDepartamento : (usuario?.id_departamento || null);
}

// Hook para obtener usuarios con búsqueda
export function useUsers(searchTerm = '') {
  const deptFilter = useDeptFilter();
  return useQuery({
    queryKey: [queryKeys.users, searchTerm, deptFilter],
    queryFn: () => fetchUsers(searchTerm, deptFilter),
    select: (data) => ({
      users: data.users || [],
      notFound: data.notFound || false
    })
  });
}

// Hook para obtener conteo de evaluaciones
export function useEvaluacionesCount() {
  const deptFilter = useDeptFilter();
  return useQuery({
    queryKey: [queryKeys.evaluacionesCount, deptFilter],
    queryFn: () => fetchEvaluaciones(deptFilter),
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
  const deptFilter = useDeptFilter();
  return useQuery({
    queryKey: [queryKeys.usuariosCount, deptFilter],
    queryFn: () => fetchData(deptFilter),
    select: (data) => data || 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para obtener todos los usuarios (sin búsqueda, para dropdowns y listas)
export function useAllUsers() {
  const deptFilter = useDeptFilter();
  return useQuery({
    queryKey: [queryKeys.users, '', deptFilter],
    queryFn: () => fetchUsers('', deptFilter),
    select: (data) => data.users || [],
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para crear un usuario
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => crearUsuario(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.usuariosCount] });
    }
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
  const deptFilter = useDeptFilter();
  return useQuery({
    queryKey: [queryKeys.objetivos, deptFilter],
    queryFn: () => fetchObjetivos(deptFilter),
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
  const deptFilter = useDeptFilter();
  return useQuery({
    queryKey: [queryKeys.evaluaciones, deptFilter],
    queryFn: () => getEvaluaciones(deptFilter),
    select: (data) => data || [],
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para obtener datos de gráfica general
export function useGraficaGeneral() {
  const deptFilter = useDeptFilter();
  return useQuery({
    queryKey: [queryKeys.graficaGeneral, deptFilter],
    queryFn: () => graficaGeneral(deptFilter),
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
  const deptFilter = useDeptFilter();
  return useQuery({
    queryKey: [queryKeys.retroalimentacionAll, deptFilter],
    queryFn: () => getAllRetroalimentacion(deptFilter),
    select: (data) => data || [],
    staleTime: 5 * 60 * 1000,
  });
}

// --- Hooks de departamentos ---

export function useDepartamentos() {
  return useQuery({
    queryKey: [queryKeys.departamentos],
    queryFn: fetchDepartamentos,
    select: (data) => data || [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDepartamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => crearDepartamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.departamentos] });
    },
  });
}

export function useUpdateDepartamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => actualizarDepartamento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.departamentos] });
    },
  });
}

export function useDeleteDepartamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => eliminarDepartamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.departamentos] });
    },
  });
}

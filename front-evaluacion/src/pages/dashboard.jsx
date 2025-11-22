import Layout from "@/components/dashboard/layout"
import UsuariosCount from "@/components/dashboard/UsuariosCount"
import EvaluacionCount from "@/components/dashboard/EvaluacionCount"
import ObjetivoResult from "@/components/dashboard/ObjetivoResult"
import CrearObjetivo from "@/components/dashboard/CrearObjetivo"
import Chart from "@/components/dashboard/Chart"
import Cargando from "@/components/Cargando"
import { useDashboardStore } from "@/store/dashboardStore"
import { useEvaluacionesCount, useEvaluacionesCountByUser, useUsuariosCount, useCreateObjetivo, useObjetivos } from "@/hooks/useQueries"
import Alert from "@mui/material/Alert"
import { useEffect, useRef } from "react"
import { useSesionStore } from "@/store/sesionStore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function Dashboard() {
  // Estado global con Zustand
  const { 
    objetivos,
    addObjetivo,
    resetObjetivos,
    getProgresoGlobal,
  } = useDashboardStore();

  const { usuario } = useSesionStore();
  
  // Referencia para controlar que las notificaciones solo se muestren una vez
  const notificacionesMostradas = useRef(false);
  
  // Seleccionar el hook correcto según el rol del usuario
  const isAdmin = usuario && usuario.id_rol === 1;
  const evaluacionesCountGeneralQuery = useEvaluacionesCount();
  const evaluacionesCountUserQuery = useEvaluacionesCountByUser(usuario?.id);
  
  // Usar la consulta adecuada según el rol
  const evaluacionesQuery = isAdmin ? evaluacionesCountGeneralQuery : evaluacionesCountUserQuery;
  
  const usuariosQuery = useUsuariosCount();
  const objetivosQuery = useObjetivos();
  const createObjetivoMutation = useCreateObjetivo();
  // Sincronizar los objetivos de la API con el estado global
  useEffect(() => {
    if (objetivosQuery.data && objetivosQuery.data.length > 0) {
      // Primero reseteamos los objetivos para evitar duplicados
      resetObjetivos();
      
      // Luego agregamos cada objetivo de la API al estado global
      objetivosQuery.data.forEach(objetivo => {
        addObjetivo(objetivo);
      });
    }
  }, [objetivosQuery.data, addObjetivo, resetObjetivos]);
  
  // Mostrar notificaciones de objetivos urgentes al cargar la página
  useEffect(() => {
    // Solo mostrar notificaciones si no se han mostrado antes y hay usuario y objetivos
    if (!usuario || objetivos.length === 0 || notificacionesMostradas.current) return;
    
    // Marcar que las notificaciones ya fueron mostradas
    notificacionesMostradas.current = true;
    
    // Función para determinar la urgencia de un objetivo
    const getUrgencyLevel = (fechaFin) => {
      if (!fechaFin) return 'normal';
      
      const hoy = new Date();
      const fechaObj = new Date(fechaFin);
      fechaObj.setDate(fechaObj.getDate() + 1);
      const diferenciaDias = Math.ceil((fechaObj - hoy) / (1000 * 60 * 60 * 24));
      
      if (diferenciaDias < 0) return 'retrasado'; // Vencido
      if (diferenciaDias <= 3) return 'Pocos dias para que termine el objetivo'; // A punto de vencer
      if (diferenciaDias <= 7) return 'Te queda un plazo de 7 dias para terminar los objetivos'; // Próximo a vencer
      return 'normal'; // Tiempo suficiente
    };
    
    // Filtrar objetivos según el usuario
    const objetivosFiltrados = objetivos.filter(obj => {
      // Solo mostrar notificaciones de objetivos no completados
      const estaNoCompletado = obj.estado_actual === 'no completado';
      
      // Si el usuario es regular, mostrar solo sus objetivos
      if (usuario.id_rol === 2) {
        return estaNoCompletado && obj.id_usuario === usuario.id;
      }
      
      // Para administradores, mostrar todos los objetivos no completados
      return estaNoCompletado;
    });
    
    // Agrupar objetivos por nivel de urgencia
    const objetivosVencidos = [];
    const objetivosUrgentes = [];
    const objetivosProximos = [];
    
    objetivosFiltrados.forEach(obj => {
      const urgencia = getUrgencyLevel(obj.fecha_fin);
      
      if (urgencia === 'retrasado') objetivosVencidos.push(obj);
      else if (urgencia === 'Pocos dias para que termine el objetivo') objetivosUrgentes.push(obj);
      else if (urgencia === 'Te queda un plazo de 7 dias para terminar los objetivos') objetivosProximos.push(obj);
    });
    
    // Mostrar notificaciones toast según urgencia
    if (objetivosVencidos.length > 0) {
      toast.error(
        <div className="flex items-center">
          <NotificationsIcon className="mr-2" />
          <div>
            <strong>¡Atención!</strong> {usuario.id_rol === 2 ? 'Tienes' : 'Hay'} {objetivosVencidos.length} {objetivosVencidos.length === 1 ? 'objetivo retrasado' : 'objetivos retrasados'}
            <div className="mt-1">
              <a href="/notificaciones" className="text-white underline">Ver notificaciones</a>
            </div>
          </div>
        </div>, 
        { autoClose: false }
      );
    }
    
    if (objetivosUrgentes.length > 0) {
      setTimeout(() => {
        toast.warning(
          <div className="flex items-center">
            <NotificationsIcon className="mr-2" />
            <div>
              <strong>¡Urgente!</strong> {usuario.id_rol === 2 ? 'Tienes' : 'Hay'} {objetivosUrgentes.length} {objetivosUrgentes.length === 1 ? 'objetivo' : 'objetivos'} a punto de terminar
              <div className="mt-1">
                <a href="/notificaciones" className="text-yellow-900 underline">Ver notificaciones</a>
              </div>
            </div>
          </div>,
          { autoClose: 10000 }
        );
      }, 1000); // Retraso para no mostrar todos los toasts a la vez
    }
    
    if (objetivosProximos.length > 0) {
      setTimeout(() => {
        toast.info(
          <div className="flex items-center">
            <NotificationsIcon className="mr-2" />
            <div>
              <strong>Recordatorio:</strong> {usuario.id_rol === 2 ? 'Tienes' : 'Hay'} {objetivosProximos.length} {objetivosProximos.length === 1 ? 'objetivo próximo' : 'objetivos próximos'} que {objetivosProximos.length === 1 ? 'tiene' : 'tienen'} un plazo de 7 dias para terminar los objetivos
              <div className="mt-1">
                <a href="/notificaciones" className="text-blue-900 underline">Ver notificaciones</a>
              </div>
            </div>
          </div>,
          { autoClose: 8000 }
        );
      }, 2000); // Retraso para no mostrar todos los toasts a la vez
    }
  }, [objetivos, usuario]);

  // Verificar si hay errores o está cargando
  const isLoading = evaluacionesQuery.isLoading || usuariosQuery.isLoading;
  const hasErrors = evaluacionesQuery.isError || usuariosQuery.isError;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex-grow h-full flex items-center justify-center">
          <Cargando/>
        </div>
      </Layout>
    );
  }

  if (hasErrors) {
    return (
      <Layout>
        <div className="flex-grow h-full flex flex-col items-center justify-center p-4">
          <Alert severity="error" className="mb-4 w-full max-w-md">
            {evaluacionesQuery.error?.message || usuariosQuery.error?.message || "Error al cargar datos"}
          </Alert>
          <button 
            onClick={() => {
              evaluacionesQuery.refetch();
              usuariosQuery.refetch();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  // Extraer datos de las consultas
  const evaluacionCount = evaluacionesQuery.data || 0;
  const usuariosCount = usuariosQuery.data || 0;

  return (   
    <Layout>    
      <ToastContainer />
      <div className="flex-grow h-full">
        {createObjetivoMutation.isError && (
          <Alert severity="error" className="m-4">
            Error al crear objetivo: {createObjetivoMutation.error?.message || "No se pudo crear el objetivo"}
          </Alert>
        )}
        
        <div className="grid grid-cols-3 grid-rows-5 gap-4 h-full p-4">
          <div className="border border-gray-300 rounded-lg shadow-md p-2">
            <ObjetivoResult 
              porcentaje={getProgresoGlobal()} 
              peso={100} 
              titulo="Resultado global" 
              descripcion="Porcentaje de cumplimiento de los objetivos asignados" 
            />
          </div>
          <div className="border border-gray-300 rounded-lg shadow-md p-2">
            <EvaluacionCount 
              evaluacionCount={evaluacionCount} 
            />
            {evaluacionesQuery.isFetching && <Cargando />}
          </div>
          <div className="border border-gray-300 rounded-lg shadow-md p-2">
            <UsuariosCount usuariosCount={usuariosCount}/>
            {usuariosQuery.isFetching && <Cargando />}
          </div>
          <div className="col-span-3 border border-gray-300 rounded-lg shadow-md p-2">
            <CrearObjetivo 
              titulo="Objetivos generales" 
              descripcion="Crea objetivos generales para el equipo de trabajo"
              tipo="general"
              objetivos={objetivos.filter(obj => obj.id_tipo_objetivo === 1 && obj.estado_actual === 'no completado')}
              isLoading={createObjetivoMutation.isPending}
            />
          </div>
          <div className="col-span-3 row-start-3 border border-gray-300 rounded-lg shadow-md p-2">
            <CrearObjetivo 
              titulo="Objetivos individuales" 
              descripcion="Crea objetivos individuales y monitoriza el estado de su cumplimiento"
              tipo="individual"
              objetivos={objetivos.filter(obj => {
                // Filtrar por tipo de objetivo (individual)
                const esTipoIndividual = obj.id_tipo_objetivo === 2;
                
                // Si el usuario es regular (rol 2), mostrar solo sus objetivos
                if (usuario && usuario.id_rol === 2) {
                  return esTipoIndividual && obj.id_usuario === usuario.id && obj.estado_actual === 'no completado';
                }
                
                // Para administradores (rol 1), mostrar todos los objetivos individuales
                return esTipoIndividual && obj.estado_actual === 'no completado';
              })}
              isLoading={createObjetivoMutation.isPending}
            />
          </div>
          <div className="col-span-3 row-span-2 row-start-4 border border-gray-300 rounded-lg shadow-md p-2">
            <Chart />
          </div>
        </div>
      </div>
    </Layout> 
  )
}
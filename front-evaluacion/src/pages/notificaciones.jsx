import Layout from "@/components/dashboard/layout"
import NotificacionesObjetivos from "@/components/notificaciones/NotificacionesObjetivos"
import Cargando from "@/components/Cargando"
import { useSesionStore } from "@/store/sesionStore"
import { useDashboardStore } from "@/store/dashboardStore"
import { useObjetivos } from "@/hooks/useQueries"
import { useEffect } from "react"
import Alert from "@mui/material/Alert"
import { ToastContainer } from "react-toastify"
import { ordenarObjetivosPorFecha } from "@/helper/FiltrarFecha"

export default function Notificaciones() {
  // Estado global con Zustand
  const { 
    objetivos,
    addObjetivo,
    resetObjetivos,
  } = useDashboardStore();

  const { usuario } = useSesionStore();
  
  // Consulta de objetivos
  const objetivosQuery = useObjetivos();
  
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

  // Verificar si hay errores o está cargando
  const isLoading = objetivosQuery.isLoading;
  const hasErrors = objetivosQuery.isError;
  
  // Filtrar objetivos no completados según el rol del usuario
  const objetivosFiltrados = objetivos.filter(obj => {
    // Filtrar solo objetivos no completados
    const estaNoCompletado = obj.estado_actual === 'no completado' && obj.id_tipo_objetivo === 2;
    
    // Si el usuario es regular (rol 2), mostrar solo sus objetivos
    if (usuario && usuario.id_rol === 2) {
      return estaNoCompletado && obj.id_usuario === usuario.id;
    }
    
    // Para administradores (rol 1), mostrar todos los objetivos no completados
    return estaNoCompletado;
  });
  
  // Ordenar objetivos del más próximo a vencer al más lejano (orden ascendente por fecha_fin)
  const objetivosNoCompletados = ordenarObjetivosPorFecha(objetivosFiltrados, 'fin').reverse();

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
            {objetivosQuery.error?.message || "Error al cargar datos"}
          </Alert>
          <button 
            onClick={() => objetivosQuery.refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  return (   
    <Layout>    
      <ToastContainer />
      <div className="flex-grow h-full p-4">
        <h1 className="text-2xl font-bold mb-4">Notificaciones de Objetivos Pendientes</h1>
        
        {objetivosNoCompletados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-lg text-gray-500">No hay objetivos pendientes</p>
          </div>
        ) : (
          <NotificacionesObjetivos 
            objetivos={objetivosNoCompletados}
          />
        )}
      </div>
    </Layout> 
  )
}
